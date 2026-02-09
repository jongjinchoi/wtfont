import type { Page } from "playwright-core";

export interface ExtractedFont {
  name: string;
  source: "google" | "adobe" | "custom";
  weight?: string;
  style?: string;
  role: "heading" | "body" | "monospace" | "unknown";
  selectors: string[];
  resourceUrl?: string;
  detectionMethod: "document.fonts" | "computedStyle" | "resource";
}

const SYSTEM_FONTS = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy",
  "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded",
  "emoji", "math", "fangsong",
  "arial", "helvetica", "helvetica neue", "times", "times new roman",
  "courier", "courier new", "georgia", "verdana", "tahoma",
  "trebuchet ms", "lucida sans", "lucida console", "lucida grande",
  "lucida sans unicode", "impact", "comic sans ms",
  "segoe ui", "segoe ui emoji", "segoe ui symbol", "microsoft sans serif",
  "ms gothic", "ms pgothic", "meiryo", "yu gothic",
  "-apple-system", "blinkmacsystemfont", "apple color emoji", "noto color emoji",
  "sf pro", "sf pro display", "sf pro text", "sf pro rounded", "sf mono",
  "sfmono-regular", "new york", "menlo", "monaco",
  "apple sd gothic neo", "pingfang sc", "pingfang tc",
  "hiragino sans", "hiragino kaku gothic pro",
  "liberation sans", "liberation serif", "liberation mono",
  "dejavu sans", "dejavu sans mono", "dejavu serif",
  "noto sans", "noto serif", "ubuntu", "cantarell",
  "droid sans", "droid serif", "roboto",
  "consolas", "andale mono", "source code pro",
  "noto sans cjk", "noto serif cjk", "malgun gothic",
  "microsoft yahei", "simsun", "simhei",
  "inherit", "initial", "unset", "revert",
]);

function isSystemFont(name: string): boolean {
  return SYSTEM_FONTS.has(name.toLowerCase().trim().replace(/['"]/g, ""));
}

function inferSource(
  name: string,
  resourceUrl?: string
): "google" | "adobe" | "custom" {
  const url = resourceUrl?.toLowerCase() ?? "";
  if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com"))
    return "google";
  if (url.includes("use.typekit.net") || url.includes("p.typekit.net"))
    return "adobe";

  const lower = name.toLowerCase();
  if (lower.includes("typekit") || lower.includes("adobe")) return "adobe";

  return "custom";
}

function inferRole(
  selectors: string[]
): "heading" | "body" | "monospace" | "unknown" {
  const joined = selectors.join(" ").toLowerCase();
  if (/\bh[1-6]\b/.test(joined) || /heading|title|hero/.test(joined))
    return "heading";
  if (/\bbody\b|\bp\b|\.text|\.content|\.description/.test(joined))
    return "body";
  if (/\bcode\b|\bpre\b|mono|\.code/.test(joined)) return "monospace";
  return "unknown";
}

function cleanFontName(name: string): string {
  return name.replace(/['"]/g, "").trim();
}

export async function extractFonts(
  page: Page,
  timeout: number
): Promise<ExtractedFont[]> {
  const fontMap = new Map<
    string,
    {
      name: string;
      weights: Set<string>;
      styles: Set<string>;
      selectors: Set<string>;
      resourceUrls: Set<string>;
      methods: Set<string>;
    }
  >();

  function addFont(
    rawName: string,
    method: string,
    opts?: {
      weight?: string;
      style?: string;
      selector?: string;
      resourceUrl?: string;
    }
  ) {
    const name = cleanFontName(rawName);
    if (!name || isSystemFont(name)) return;

    const key = name.toLowerCase();
    let entry = fontMap.get(key);
    if (!entry) {
      entry = {
        name,
        weights: new Set(),
        styles: new Set(),
        selectors: new Set(),
        resourceUrls: new Set(),
        methods: new Set(),
      };
      fontMap.set(key, entry);
    }

    entry.methods.add(method);
    if (opts?.weight) entry.weights.add(opts.weight);
    if (opts?.style) entry.styles.add(opts.style);
    if (opts?.selector) entry.selectors.add(opts.selector);
    if (opts?.resourceUrl) entry.resourceUrls.add(opts.resourceUrl);
  }

  // Method 1: document.fonts API
  const documentFonts = await page.evaluate(() => {
    const fonts: Array<{
      family: string;
      weight: string;
      style: string;
    }> = [];
    document.fonts.forEach((face) => {
      fonts.push({
        family: face.family,
        weight: face.weight,
        style: face.style,
      });
    });
    return fonts;
  });

  for (const f of documentFonts) {
    addFont(f.family, "document.fonts", {
      weight: f.weight,
      style: f.style,
    });
  }

  // Method 2: getComputedStyle on key elements
  const SELECTORS = [
    "body", "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "a", "span", "code", "pre", "li",
    "button", "input", "textarea",
    "[class*='heading']", "[class*='title']", "[class*='hero']",
    "[class*='nav']", "[class*='footer']",
    "main", "article", "section", "header", "footer", "nav",
  ];

  const computedFonts = await page.evaluate((selectors: string[]) => {
    const results: Array<{ selector: string; fontFamily: string }> = [];
    for (const sel of selectors) {
      try {
        const els = document.querySelectorAll(sel);
        // Check up to 3 elements per selector
        const limit = Math.min(els.length, 3);
        for (let i = 0; i < limit; i++) {
          const style = window.getComputedStyle(els[i]);
          if (style.fontFamily) {
            results.push({ selector: sel, fontFamily: style.fontFamily });
          }
        }
      } catch {
        // invalid selector
      }
    }
    return results;
  }, SELECTORS);

  for (const { selector, fontFamily } of computedFonts) {
    const families = fontFamily.split(",").map((f) => f.trim());
    for (const family of families) {
      addFont(family, "computedStyle", { selector });
    }
  }

  // Method 3: Resource Timing API (font file URLs)
  const resources = await page.evaluate(() => {
    return performance
      .getEntriesByType("resource")
      .filter((e) => /\.(woff2?|ttf|otf|eot)(\?|$)/i.test(e.name))
      .map((e) => e.name);
  });

  for (const url of resources) {
    // Try to extract font name from URL
    const match = url.match(/\/([^/]+)\.(woff2?|ttf|otf|eot)/i);
    if (match) {
      const raw = match[1]
        .replace(/[-_]/g, " ")
        .replace(/\b(regular|bold|italic|light|medium|semibold|thin|black|variable)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      if (raw) {
        addFont(raw, "resource", { resourceUrl: url });
      }
    }
  }

  // Also check stylesheet links for Google Fonts / Typekit
  const stylesheetUrls = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    );
    return links.map((l) => l.getAttribute("href") || "").filter(Boolean);
  });

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

  // Build results
  const results: ExtractedFont[] = [];
  for (const entry of fontMap.values()) {
    const resourceUrl = entry.resourceUrls.values().next().value as
      | string
      | undefined;
    const selectors = Array.from(entry.selectors);
    const source = inferSource(entry.name, resourceUrl);
    const role = selectors.length > 0 ? inferRole(selectors) : "unknown";

    // Pick primary detection method
    let method: ExtractedFont["detectionMethod"] = "computedStyle";
    if (entry.methods.has("document.fonts")) method = "document.fonts";
    else if (entry.methods.has("resource")) method = "resource";

    results.push({
      name: entry.name,
      source,
      weight: Array.from(entry.weights).join(", ") || undefined,
      style: Array.from(entry.styles).join(", ") || undefined,
      role,
      selectors,
      resourceUrl,
      detectionMethod: method,
    });
  }

  return results;
}
