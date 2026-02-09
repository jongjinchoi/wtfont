import * as cheerio from "cheerio";
import * as cssTree from "css-tree";
import { isSystemFont } from "./system-fonts";
import type { ExtractedFont, FontRole, FontSource } from "@/types/font";

interface RawFontEntry {
  name: string;
  source: FontSource;
  weights: Set<string>;
  selectors: Set<string>;
}

export async function extractFontsFromUrl(
  url: string
): Promise<ExtractedFont[]> {
  const response = await fetch(url, {
    headers: { "User-Agent": "WTFontBot/1.0 (+https://wtfont.wtf)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const html = await response.text();
  return extractFontsFromHtml(html, url);
}

export async function extractFontsFromHtml(
  html: string,
  baseUrl: string
): Promise<ExtractedFont[]> {
  const $ = cheerio.load(html);
  const fontMap = new Map<string, RawFontEntry>();

  // Set of font names declared in @font-face (canonical reference)
  const fontFaceNames = new Set<string>();

  const addFont = (
    name: string,
    source: FontSource,
    weight?: string,
    selector?: string
  ) => {
    const cleanName = name.replace(/['"]/g, "").trim();
    if (!cleanName || isSystemFont(cleanName) || !isValidFontName(cleanName))
      return;

    const key = cleanName.toLowerCase();
    const existing = fontMap.get(key);
    if (existing) {
      if (weight) existing.weights.add(weight);
      if (selector) existing.selectors.add(selector);
      // Upgrade source priority: google > adobe > custom > system
      if (source === "google" || (source === "adobe" && existing.source === "custom")) {
        existing.source = source;
      }
    } else {
      fontMap.set(key, {
        name: cleanName,
        source,
        weights: new Set(weight ? [weight] : []),
        selectors: new Set(selector ? [selector] : []),
      });
    }
  };

  // 1. Google Fonts <link> tags
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const fonts = extractGoogleFontsFromLink(href);
      for (const f of fonts) {
        for (const w of f.weights) {
          addFont(f.name, "google", w);
        }
      }
    }
  });

  // 2. Adobe Fonts (Typekit)
  $('link[href*="use.typekit.net"]').each(() => {
    addFont("Adobe Fonts (Typekit)", "adobe");
  });

  // 3. Collect CSS sources
  const cssTexts: string[] = [];

  $("style").each((_, el) => {
    cssTexts.push($(el).html() || "");
  });

  const stylesheetUrls: string[] = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.includes("fonts.googleapis.com")) {
      try {
        stylesheetUrls.push(new URL(href, baseUrl).toString());
      } catch {
        /* skip */
      }
    }
  });

  const cssResults = await Promise.allSettled(
    stylesheetUrls.map((cssUrl) =>
      fetch(cssUrl, {
        headers: { "User-Agent": "WTFontBot/1.0" },
        signal: AbortSignal.timeout(5000),
      }).then((r) => (r.ok ? r.text() : ""))
    )
  );
  for (const result of cssResults) {
    if (result.status === "fulfilled" && result.value) {
      cssTexts.push(result.value);
    }
  }

  // 4. Parse CSS — Two passes:
  //    Pass 1: Collect @font-face declarations (font names + weights)
  //    Pass 2: Collect font-family usages with selectors, link to @font-face fonts
  for (const cssText of cssTexts) {
    try {
      const ast = cssTree.parse(cssText, { parseCustomProperty: false });

      // Pass 0.5: @import rules — detect Google Fonts imports
      cssTree.walk(ast, {
        visit: "Atrule",
        enter(node) {
          if (node.name === "import" && node.prelude) {
            const importValue = cssTree.generate(node.prelude).trim();
            // Extract URL from url("...") or "..." or '...'
            const urlMatch = importValue.match(
              /url\(\s*['"]?([^'")\s]+)['"]?\s*\)|^['"]([^'"]+)['"]/
            );
            const importUrl = urlMatch?.[1] || urlMatch?.[2];
            if (importUrl?.includes("fonts.googleapis.com")) {
              const fonts = extractGoogleFontsFromLink(importUrl);
              for (const f of fonts) {
                for (const w of f.weights) {
                  addFont(f.name, "google", w);
                }
              }
            }
          }
        },
      });

      // Pass 1: @font-face rules
      cssTree.walk(ast, {
        visit: "Atrule",
        enter(node) {
          if (node.name === "font-face" && node.block) {
            let familyName = "";
            let weight = "";
            cssTree.walk(node.block, {
              visit: "Declaration",
              enter(decl) {
                if (decl.property === "font-family") {
                  familyName = cssTree
                    .generate(decl.value)
                    .replace(/['"]/g, "")
                    .trim();
                }
                if (decl.property === "font-weight") {
                  weight = cssTree.generate(decl.value).trim();
                }
              },
            });
            if (familyName && isValidFontName(familyName) && !isSystemFont(familyName)) {
              fontFaceNames.add(familyName.toLowerCase());
              addFont(familyName, "custom", weight || "400");
            }
          }
        },
      });

      // Pass 2: font-family usage in rules — attach selectors
      cssTree.walk(ast, {
        visit: "Rule",
        enter(rule) {
          const selector = cssTree.generate(rule.prelude);
          cssTree.walk(rule.block, {
            visit: "Declaration",
            enter(decl) {
              if (decl.property === "font-family") {
                const value = cssTree.generate(decl.value);
                const families = parseFontFamily(value);
                for (const name of families) {
                  addFont(name, "custom", undefined, selector);
                }
              } else if (decl.property === "font") {
                const value = cssTree.generate(decl.value);
                const families = parseFontFromShorthand(value);
                for (const name of families) {
                  addFont(name, "custom", undefined, selector);
                }
              }
            },
          });
        },
      });
    } catch {
      /* skip CSS that fails to parse */
    }
  }

  // 5. Inline styles — use tag name as selector hint
  $('[style*="font-family"]').each((_, el) => {
    const style = $(el).attr("style") || "";
    const match = style.match(/font-family:\s*([^;]+)/i);
    if (match) {
      const tagName = ($(el).prop("tagName") || "").toLowerCase();
      const className = $(el).attr("class") || "";
      const selector = className
        ? `${tagName}.${className.split(/\s+/)[0]}`
        : tagName;
      const families = parseFontFamily(match[1]);
      for (const name of families) {
        addFont(name, "custom", undefined, selector);
      }
    }
  });

  // 6. Convert to ExtractedFont[] — use selector-based role, fall back to name-based
  const results = Array.from(fontMap.values()).map((entry) => {
    const selectors = Array.from(entry.selectors);
    let role = inferRole(selectors);
    // If role is default "body" and no selectors, try inferring from font name
    if (role === "body" && selectors.length === 0) {
      role = inferRoleFromName(entry.name) || "body";
    }
    return {
      name: entry.name,
      role,
      source: entry.source,
      weights: entry.weights.size > 0 ? Array.from(entry.weights).sort() : ["400"],
      selectors,
    };
  });

  // 7. Sort: fonts with selectors first (higher confidence), then by role importance
  const roleOrder: Record<FontRole, number> = {
    heading: 0,
    display: 1,
    body: 2,
    monospace: 3,
  };
  results.sort((a, b) => {
    // Fonts with selectors = actually used in page → higher priority
    const aUsed = a.selectors.length > 0 ? 0 : 1;
    const bUsed = b.selectors.length > 0 ? 0 : 1;
    if (aUsed !== bUsed) return aUsed - bUsed;
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return results;
}

/** Filter out CSS variables, functions, keywords, and other non-font values */
function isValidFontName(name: string): boolean {
  if (/^var\s*\(/.test(name)) return false;
  if (/^\w+\s*\(/.test(name)) return false;
  if (/^(inherit|initial|unset|revert|none|normal|auto)$/i.test(name))
    return false;
  if (/^\d+$/.test(name) || name.length < 3) return false;
  if (/[{}();]/.test(name)) return false;
  // Special-purpose fonts that aren't relevant to users
  if (/^katex[_ ]/i.test(name)) return false;
  if (/^fontawesome/i.test(name)) return false;
  if (/^material[- ]?(icons|symbols)/i.test(name)) return false;
  if (/^icon/i.test(name) && name.length < 10) return false;
  return true;
}

/** Infer role from font name when selectors aren't available */
function inferRoleFromName(name: string): FontRole | null {
  const lower = name.toLowerCase();
  if (/headline|heading|display|title|header/i.test(lower)) return "heading";
  if (/\bmono\b|code|console|terminal/i.test(lower)) return "monospace";
  return null;
}

/** System font keywords for `font` shorthand — these are not font-family values */
const FONT_SYSTEM_KEYWORDS = new Set([
  "caption", "icon", "menu", "message-box", "small-caption", "status-bar",
]);

/**
 * Extract font-family from CSS `font` shorthand.
 * Per W3C spec, font-family is always the last value after font-size[/line-height].
 * Returns empty array for system font keywords (caption, icon, etc.)
 */
export function parseFontFromShorthand(value: string): string[] {
  const trimmed = value.trim();

  // System font keywords: `font: caption` — no font-family to extract
  if (FONT_SYSTEM_KEYWORDS.has(trimmed.toLowerCase())) return [];

  // Match font-size (number+unit or keyword) optionally followed by /line-height,
  // then everything after is font-family.
  // Size patterns: 16px, 1.2em, 100%, .8rem, 2vw, etc.
  const sizePattern =
    /(?:^|\s)(\d*\.?\d+(?:px|em|rem|%|pt|ex|ch|vw|vh|vmin|vmax|cm|mm|in|pc|q|cap|ic|lh|rlh|svw|svh|lvw|lvh|dvw|dvh|cqw|cqh))(\s*\/\s*[\d.]+(?:px|em|rem|%)?)?/i;

  const match = trimmed.match(sizePattern);
  if (!match) return [];

  // Everything after the size+line-height is font-family
  const afterSize = trimmed.slice(
    (match.index || 0) + match[0].length
  ).trim();

  if (!afterSize) return [];
  return parseFontFamily(afterSize);
}

export function parseFontFamily(value: string): string[] {
  return value
    .split(",")
    .map((f) => f.trim().replace(/^['"]|['"]$/g, ""))
    .filter((f) => f && !isSystemFont(f) && isValidFontName(f));
}

export function extractGoogleFontsFromLink(
  href: string
): Array<{ name: string; weights: string[]; source: "google" }> {
  const results: Array<{ name: string; weights: string[]; source: "google" }> =
    [];
  try {
    const url = new URL(href);
    const families = url.searchParams.getAll("family");
    for (const family of families) {
      const [namePart, ...rest] = family.split(":");
      const name = namePart.replace(/\+/g, " ");
      const weights: string[] = [];
      const weightMatch = rest.join(":").match(/wght@([\d;]+)/);
      if (weightMatch) {
        weights.push(...weightMatch[1].split(";"));
      }
      results.push({
        name,
        weights: weights.length > 0 ? weights : ["400"],
        source: "google",
      });
    }
  } catch {
    /* skip */
  }
  return results;
}

export function inferRole(selectors: string[]): FontRole {
  const joined = selectors.join(" ").toLowerCase();
  if (/\bh[1-6]\b|\.heading|\.title|\.hero|\.header/.test(joined))
    return "heading";
  if (/\bcode\b|\bpre\b|\.mono|\.code|\.monospace/.test(joined))
    return "monospace";
  if (/\.display|\.banner|\.splash/.test(joined)) return "display";
  // If used on body/html/* (broad selectors), it's a body font
  return "body";
}
