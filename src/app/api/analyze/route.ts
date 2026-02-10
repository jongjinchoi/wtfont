import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { extractFontsFromUrl } from "@/lib/font-parser";
import { matchFonts } from "@/lib/ai-matcher";
import { getCachedResult, setCachedResult } from "@/lib/cache";
import { checkRateLimit } from "@/lib/rate-limiter";
import {
  normalizeUrl,
  validateUrl,
  urlToSlug,
  extractDomainAndPath,
} from "@/lib/url-utils";
import { extractFontsWithPlaywright } from "@/lib/playwright-client";
import { mergeFontResults } from "@/lib/font-merge";
import type { AnalysisResult, MatchedFont } from "@/types/font";
import type { AnalyzeResponse, AnalyzeErrorResponse } from "@/types/api";
import {
  isGoogleFont,
  getGoogleFontsUrl,
  getGoogleFontCategory,
} from "@/lib/google-fonts-db";
import { buildAffiliateUrl } from "@/lib/affiliate";

const requestSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url: rawUrl } = requestSchema.parse(body);

    if (!validateUrl(rawUrl)) {
      return NextResponse.json<AnalyzeErrorResponse>(
        { success: false, error: "Invalid URL format", code: "INVALID_URL" },
        { status: 400 }
      );
    }

    // Skip rate limit for pre-warm requests with valid secret
    const preWarmSecret = request.headers.get("x-prewarm-secret");
    const isPreWarm =
      preWarmSecret && preWarmSecret === process.env.PREWARM_SECRET;

    const { allowed, remaining, reset } = isPreWarm
      ? { allowed: true, remaining: 999, reset: Date.now() }
      : await checkRateLimit();
    if (!allowed) {
      return NextResponse.json<AnalyzeErrorResponse>(
        {
          success: false,
          error: `Rate limit exceeded. Resets in ${Math.ceil((reset - Date.now()) / 1000 / 60)} minutes.`,
          code: "RATE_LIMITED",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }

    const normalizedUrl = normalizeUrl(rawUrl);
    const { domain } = extractDomainAndPath(normalizedUrl);
    const slug = urlToSlug(normalizedUrl);

    const cached = await getCachedResult(normalizedUrl);
    if (cached) {
      return NextResponse.json<AnalyzeResponse>({
        success: true,
        data: cached,
      });
    }

    // Run static extraction and Playwright extraction in parallel
    const [staticResult, dynamicResult] = await Promise.allSettled([
      extractFontsFromUrl(normalizedUrl),
      extractFontsWithPlaywright(normalizedUrl),
    ]);
    const staticFonts =
      staticResult.status === "fulfilled" ? staticResult.value : null;
    const dynamicFonts =
      dynamicResult.status === "fulfilled" ? dynamicResult.value : null;

    // Merge results (either or both may be available)
    let extractedFonts;
    if (staticFonts && dynamicFonts) {
      extractedFonts = mergeFontResults(staticFonts, dynamicFonts);
    } else if (staticFonts) {
      extractedFonts = staticFonts;
    } else if (dynamicFonts) {
      extractedFonts = dynamicFonts;
    } else {
      return NextResponse.json<AnalyzeErrorResponse>(
        {
          success: false,
          error: `Could not detect fonts on ${domain}. The site may block automated requests.`,
          code: "FETCH_FAILED",
        },
        { status: 422 }
      );
    }

    if (extractedFonts.length === 0) {
      return NextResponse.json<AnalyzeErrorResponse>(
        {
          success: false,
          error:
            "No fonts detected on this page.",
          code: "PARSE_FAILED",
        },
        { status: 422 }
      );
    }

    let matchedFonts: MatchedFont[];
    let aiFailed = false;
    try {
      matchedFonts = await matchFonts(extractedFonts, domain);
    } catch {
      aiFailed = true;
      // Fallback: return extracted fonts without AI matching
      // Use Google Fonts DB to identify free fonts even without AI
      matchedFonts = extractedFonts.map((f) => {
        const knownGoogle = f.source === "google" || isGoogleFont(f.name);
        const category = getGoogleFontCategory(f.name);
        const fallback = category || inferFallbackCategory(f.name, f.role);
        return {
          role: f.role,
          originalName: f.name,
          isFree: knownGoogle,
          alternativeName: f.name,
          googleFontsUrl: knownGoogle
            ? getGoogleFontsUrl(f.name, f.weights)
            : null,
          fallback,
          similarity: knownGoogle
            ? "This is a free Google Font — use it directly!"
            : "Detected font — enable AI matching for free alternatives",
          similarityScore: knownGoogle ? 100 : 0,
          notes: knownGoogle
            ? "Available on Google Fonts. Import it with the code below."
            : "Set GEMINI_API_KEY or OPENAI_API_KEY for AI-powered free alternative suggestions.",
          weights: f.weights,
          premiumUrl: null,
          premiumPrice: null,
        };
      });
    }

    // Validate all AI-generated URLs before caching
    matchedFonts = await Promise.all(
      matchedFonts.map(async (f) => {
        const [checkedGoogle, checkedPremium] = await Promise.all([
          checkUrlExists(f.googleFontsUrl),
          checkUrlExists(f.premiumUrl),
        ]);
        return {
          ...f,
          googleFontsUrl: checkedGoogle,
          premiumUrl: buildAffiliateUrl(
            checkedPremium,
            checkedPremium?.includes("myfonts.com") ? "myfonts" : undefined
          ),
          premiumPrice: checkedPremium ? f.premiumPrice : null,
        };
      })
    );

    const result: AnalysisResult = {
      url: normalizedUrl,
      domain,
      slug,
      extractedFonts,
      matchedFonts,
      analyzedAt: new Date().toISOString(),
    };

    // Only cache successful AI matches — don't cache fallback results
    if (!aiFailed) {
      after(() => setCachedResult(normalizedUrl, result).catch(console.warn));
    }

    return NextResponse.json<AnalyzeResponse>({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<AnalyzeErrorResponse>(
        {
          success: false,
          error: error.errors[0].message,
          code: "INVALID_URL",
        },
        { status: 400 }
      );
    }
    console.error("Analyze error:", error);
    return NextResponse.json<AnalyzeErrorResponse>(
      { success: false, error: "An unexpected error occurred", code: "UNKNOWN" },
      { status: 500 }
    );
  }
}

/** Verify URL exists (returns 2xx). Returns the URL or null. */
async function checkUrlExists(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });
    return res.ok ? url : null;
  } catch {
    return null;
  }
}

function inferFallbackCategory(name: string, role: string): string {
  if (role === "monospace") return "monospace";
  const lower = name.toLowerCase();
  if (/serif/i.test(lower) && !/sans/i.test(lower)) return "serif";
  if (/mono|code|console/i.test(lower)) return "monospace";
  return "sans-serif";
}
