import type { AnalysisResult, EnrichedFont, ExtractedFont } from "../types/font.ts";
import { extractFontsFromUrl } from "./font-parser.ts";
import { mergeFontResults } from "./font-merge.ts";
import { extractFontsLocal } from "./playwright-extract.ts";
import { extractDomainAndPath, normalizeUrl, validateUrl } from "./url-utils.ts";
import { SsrfBlockedError, safeFetch } from "./url-guard.ts";
import {
  getGoogleFontCategory,
  getGoogleFontsUrl,
  isGoogleFont,
} from "./google-fonts-db.ts";
import { specimenUrl as buildSpecimenUrl } from "./preview.ts";

export interface AnalyzeOptions {
  dynamic?: boolean;
  timeoutMs?: number;
  /**
   * If true, skip the HEAD request that validates Google Fonts URLs
   * are real (e.g. for offline or speed-critical paths).
   */
  skipUrlValidation?: boolean;
}

export class AnalyzeError extends Error {
  constructor(
    message: string,
    public code:
      | "INVALID_URL"
      | "FETCH_FAILED"
      | "PARSE_FAILED"
      | "DYNAMIC_UNAVAILABLE"
      | "SSRF_BLOCKED",
  ) {
    super(message);
    this.name = "AnalyzeError";
  }
}

export async function analyze(
  rawUrl: string,
  opts: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  if (!validateUrl(rawUrl)) {
    throw new AnalyzeError(`Invalid URL: ${rawUrl}`, "INVALID_URL");
  }
  const normalizedUrl = normalizeUrl(rawUrl);
  const { domain } = extractDomainAndPath(normalizedUrl);

  const [staticResult, dynamicRaw] = await Promise.allSettled([
    extractFontsFromUrl(normalizedUrl),
    opts.dynamic
      ? extractFontsLocal(normalizedUrl, opts.timeoutMs)
      : Promise.resolve(null),
  ]);

  // Surface SSRF blocks as a specific error (not swallowed into "FETCH_FAILED")
  // so users/clients understand they've hit the guard, not a network issue.
  if (
    staticResult.status === "rejected" &&
    staticResult.reason instanceof SsrfBlockedError
  ) {
    throw new AnalyzeError(staticResult.reason.message, "SSRF_BLOCKED");
  }
  if (
    dynamicRaw.status === "rejected" &&
    dynamicRaw.reason instanceof SsrfBlockedError
  ) {
    throw new AnalyzeError(dynamicRaw.reason.message, "SSRF_BLOCKED");
  }

  const staticFonts =
    staticResult.status === "fulfilled" ? staticResult.value : null;

  // Unpack PlaywrightResult
  const pwResult =
    dynamicRaw.status === "fulfilled" ? dynamicRaw.value : null;
  const dynamicFonts = pwResult?.fonts ?? null;

  let dynamicStatus: AnalysisResult["dynamicStatus"] = opts.dynamic
    ? (pwResult?.status ?? "error")
    : "skipped";
  const dynamicError = pwResult?.error;

  let extracted: ExtractedFont[];
  let detection: AnalysisResult["detection"];
  if (staticFonts && dynamicFonts) {
    extracted = mergeFontResults(staticFonts, dynamicFonts);
    detection = "merged";
  } else if (staticFonts) {
    extracted = staticFonts;
    detection = "static";
  } else if (dynamicFonts) {
    extracted = dynamicFonts;
    detection = "dynamic";
  } else {
    throw new AnalyzeError(
      `Could not detect fonts on ${domain}. The site may block automated requests.`,
      "FETCH_FAILED",
    );
  }

  if (extracted.length === 0) {
    throw new AnalyzeError(
      `No fonts detected on ${domain}.`,
      "PARSE_FAILED",
    );
  }

  const enriched: EnrichedFont[] = extracted.map((f) => {
    const isFree = f.source === "google" || isGoogleFont(f.name);
    const category =
      getGoogleFontCategory(f.name) ?? inferFallbackCategory(f.name, f.role);
    return {
      ...f,
      isFree,
      category,
      googleFontsUrl: isFree ? getGoogleFontsUrl(f.name, f.weights) : null,
      specimenUrl: isFree ? buildSpecimenUrl(f.name) : null,
    };
  });

  const finalFonts = opts.skipUrlValidation
    ? enriched
    : await Promise.all(
        enriched.map(async (f) => ({
          ...f,
          googleFontsUrl: await checkUrlExists(f.googleFontsUrl),
        })),
      );

  return {
    url: normalizedUrl,
    domain,
    fonts: finalFonts,
    analyzedAt: new Date().toISOString(),
    detection,
    dynamicStatus,
    dynamicError,
  };
}

/** Verify a URL exists (returns 2xx). Returns the URL or null. */
async function checkUrlExists(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await safeFetch(url, { method: "HEAD" }, { timeoutMs: 5000 });
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
