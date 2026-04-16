import type {
  ExtractedFont,
  FontRole,
  FontSource,
} from "../types/font.ts";
import { isSystemFont } from "./system-fonts.ts";

/**
 * Locally-executed Playwright font extraction.
 *
 * Ported from the original `services/playwright/src/extract-fonts.ts`
 * but without the Fastify service / browser pool — the CLI launches
 * a single browser per invocation and tears it down afterwards.
 *
 * `playwright-core` is an OPTIONAL peer dependency. If not installed,
 * this function returns `null` and the caller falls back to static parsing.
 */
export async function extractFontsLocal(
  url: string,
  timeoutMs = 15000,
): Promise<ExtractedFont[] | null> {
  let playwright: typeof import("playwright-core") | null = null;
  try {
    playwright = await import("playwright-core");
  } catch {
    return null;
  }

  let browser: Awaited<ReturnType<typeof playwright.chromium.launch>> | null =
    null;

  try {
    browser = await playwright.chromium.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--disable-extensions",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.fonts.ready.then(() => {}));

    // Method 1: document.fonts — only genuine loaded fonts
    const documentFonts = await page.evaluate(() => {
      const out: Array<{ family: string; weight: string; style: string }> = [];
      document.fonts.forEach((face) => {
        if (face.status === "loaded") {
          out.push({
            family: face.family,
            weight: face.weight,
            style: face.style,
          });
        }
      });
      return out;
    });

    // Method 2: getComputedStyle on key elements
    const SELECTORS = [
      "body",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "a",
      "span",
      "code",
      "pre",
      "li",
      "button",
      "input",
      "textarea",
      "[class*='heading']",
      "[class*='title']",
      "[class*='hero']",
      "[class*='nav']",
      "[class*='footer']",
      "main",
      "article",
      "section",
      "header",
      "footer",
      "nav",
    ];

    const computedFonts = await page.evaluate((selectors: string[]) => {
      const out: Array<{ selector: string; fontFamily: string }> = [];
      for (const sel of selectors) {
        try {
          const els = document.querySelectorAll(sel);
          const limit = Math.min(els.length, 3);
          for (let i = 0; i < limit; i++) {
            const style = window.getComputedStyle(els[i]);
            if (style.fontFamily) {
              out.push({ selector: sel, fontFamily: style.fontFamily });
            }
          }
        } catch {
          /* invalid selector */
        }
      }
      return out;
    }, SELECTORS);

    // Method 3: Resource Timing — font file URLs
    const resources = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .filter((e) => /\.(woff2?|ttf|otf|eot)(\?|$)/i.test(e.name))
        .map((e) => e.name);
    });

    // Additional: stylesheet hrefs for Google Fonts
    const stylesheetUrls = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map((l) => l.getAttribute("href") || "")
        .filter(Boolean);
    });

    await context.close();

    return mergeAndClassify(
      documentFonts,
      computedFonts,
      resources,
      stylesheetUrls,
    );
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

interface DocFont {
  family: string;
  weight: string;
  style: string;
}
interface ComputedFont {
  selector: string;
  fontFamily: string;
}

function mergeAndClassify(
  documentFonts: DocFont[],
  computedFonts: ComputedFont[],
  resources: string[],
  stylesheetUrls: string[],
): ExtractedFont[] {
  const fontMap = new Map<
    string,
    {
      name: string;
      weights: Set<string>;
      selectors: Set<string>;
      resourceUrls: Set<string>;
      methods: Set<string>;
    }
  >();

  const addFont = (
    rawName: string,
    method: string,
    opts: { weight?: string; selector?: string; resourceUrl?: string } = {},
  ) => {
    const name = cleanFontName(rawName);
    if (!name) return;
    if (method !== "document.fonts" && isSystemFont(name)) return;
    const key = name.toLowerCase().replace(/\s/g, "");
    let entry = fontMap.get(key);
    if (!entry) {
      entry = {
        name,
        weights: new Set(),
        selectors: new Set(),
        resourceUrls: new Set(),
        methods: new Set(),
      };
      fontMap.set(key, entry);
    }
    entry.methods.add(method);
    if (opts.weight) entry.weights.add(opts.weight);
    if (opts.selector) entry.selectors.add(opts.selector);
    if (opts.resourceUrl) entry.resourceUrls.add(opts.resourceUrl);
  };

  for (const f of documentFonts) {
    addFont(f.family, "document.fonts", { weight: f.weight });
  }

  const loadedNames = new Set(
    documentFonts.map((f) => cleanFontName(f.family).toLowerCase()),
  );

  // Cross-validate: only keep computedStyle fonts that are actually loaded
  for (const { selector, fontFamily } of computedFonts) {
    const families = fontFamily.split(",").map((f) => f.trim());
    for (const family of families) {
      const clean = cleanFontName(family).toLowerCase();
      if (loadedNames.has(clean)) {
        addFont(family, "computedStyle", { selector });
      }
    }
  }

  for (const url of resources) {
    const match = url.match(/\/([^/]+)\.(woff2?|ttf|otf|eot)/i);
    if (match) {
      const raw = match[1]
        .replace(/[-_]/g, " ")
        .replace(
          /\b(regular|bold|italic|light|medium|semibold|thin|black|variable)\b/gi,
          "",
        )
        .replace(/\s+/g, " ")
        .trim();
      if (raw) addFont(raw, "resource", { resourceUrl: url });
    }
  }

  for (const href of stylesheetUrls) {
    if (href.includes("fonts.googleapis.com/css")) {
      const familyMatch = href.match(/family=([^&]+)/);
      if (familyMatch) {
        const families = decodeURIComponent(familyMatch[1]).split("|");
        for (const fam of families) {
          const name = fam.split(":")[0].replace(/\+/g, " ");
          addFont(name, "resource", { resourceUrl: href });
        }
      }
    }
  }

  const results: ExtractedFont[] = Array.from(fontMap.values()).map((entry) => {
    const selectors = Array.from(entry.selectors).slice(0, 20);
    const resourceUrl = entry.resourceUrls.values().next().value as
      | string
      | undefined;
    return {
      name: entry.name,
      source: inferSource(entry.name, resourceUrl),
      role: selectors.length > 0 ? inferRole(selectors) : "body",
      weights:
        entry.weights.size > 0 ? Array.from(entry.weights).sort() : ["400"],
      selectors,
    };
  });

  return deduplicateLocaleVariants(results);
}

function inferSource(name: string, resourceUrl?: string): FontSource {
  const url = resourceUrl?.toLowerCase() ?? "";
  if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com"))
    return "google";
  if (url.includes("use.typekit.net") || url.includes("p.typekit.net"))
    return "adobe";
  const lower = name.toLowerCase();
  if (lower.includes("typekit") || lower.includes("adobe")) return "adobe";
  return "custom";
}

function inferRole(selectors: string[]): FontRole {
  const joined = selectors.join(" ").toLowerCase();
  if (/\bh[1-6]\b/.test(joined) || /heading|title|hero/.test(joined))
    return "heading";
  if (/\bcode\b|\bpre\b|mono|\.code/.test(joined)) return "monospace";
  if (/\.display|\.banner|\.splash/.test(joined)) return "display";
  return "body";
}

function cleanFontName(name: string): string {
  return name
    .replace(/['"]/g, "")
    .replace(/\.[0-9a-f]{8,}$/i, "")
    .replace(/\s+(W\s+)?Wght$/i, "")
    .trim();
}

const LOCALE_SUFFIX = /\s+(SC|TC|HK|JP|KR|AR|TH|HE|GB)$/i;
const STYLE_SUFFIX = /\s+(Text|Display|Rounded)$/i;

function deduplicateLocaleVariants(fonts: ExtractedFont[]): ExtractedFont[] {
  const groups = new Map<string, ExtractedFont[]>();
  for (const font of fonts) {
    const base = font.name
      .replace(LOCALE_SUFFIX, "")
      .replace(STYLE_SUFFIX, "")
      .trim()
      .toLowerCase();
    const group = groups.get(base) || [];
    group.push(font);
    groups.set(base, group);
  }
  return Array.from(groups.values()).map((group) => {
    if (group.length === 1) return group[0];
    const merged = { ...group[0] };
    for (const variant of group.slice(1)) {
      merged.weights = [...new Set([...merged.weights, ...variant.weights])];
      merged.selectors = [
        ...new Set([...merged.selectors, ...variant.selectors]),
      ].slice(0, 20);
    }
    merged.name = merged.name
      .replace(LOCALE_SUFFIX, "")
      .replace(STYLE_SUFFIX, "")
      .trim();
    return merged;
  });
}
