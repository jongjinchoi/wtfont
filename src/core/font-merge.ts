import type { ExtractedFont, FontRole, FontSource } from "../types/font.ts";

const SOURCE_PRIORITY: Record<FontSource, number> = {
  google: 3,
  adobe: 2,
  custom: 1,
  system: 0,
};

const ROLE_PRIORITY: Record<FontRole, number> = {
  heading: 3,
  display: 2,
  body: 1,
  monospace: 0,
};

/**
 * Merge static (CSS-parsed) and dynamic (Playwright) font results.
 * Same font name (case-insensitive) → merge weights/selectors/source.
 * Playwright-only fonts are appended after static results.
 */
export function mergeFontResults(
  staticFonts: ExtractedFont[],
  dynamicFonts: ExtractedFont[]
): ExtractedFont[] {
  const merged = new Map<string, ExtractedFont>();

  // Add static fonts first
  for (const font of staticFonts) {
    const key = font.name.toLowerCase().replace(/\s/g, "");
    merged.set(key, {
      ...font,
      weights: [...font.weights],
      selectors: [...font.selectors],
    });
  }

  // Merge dynamic fonts
  for (const font of dynamicFonts) {
    const key = font.name.toLowerCase().replace(/\s/g, "");
    const existing = merged.get(key);

    if (existing) {
      // Union weights
      const weightSet = new Set([...existing.weights, ...font.weights]);
      existing.weights = Array.from(weightSet);

      // Union selectors
      const selectorSet = new Set([...existing.selectors, ...font.selectors]);
      existing.selectors = Array.from(selectorSet);

      // Upgrade source (higher priority wins)
      if (SOURCE_PRIORITY[font.source] > SOURCE_PRIORITY[existing.source]) {
        existing.source = font.source;
      }

      // Upgrade role (heading > display > body > monospace)
      if (ROLE_PRIORITY[font.role] > ROLE_PRIORITY[existing.role]) {
        existing.role = font.role;
      }
    } else {
      // New font from Playwright only
      merged.set(key, {
        ...font,
        weights: [...font.weights],
        selectors: [...font.selectors],
      });
    }
  }

  // Sort: fonts with selectors first, then by role priority
  return Array.from(merged.values()).sort((a, b) => {
    const aHasSelectors = a.selectors.length > 0 ? 1 : 0;
    const bHasSelectors = b.selectors.length > 0 ? 1 : 0;
    if (aHasSelectors !== bHasSelectors) return bHasSelectors - aHasSelectors;
    return ROLE_PRIORITY[b.role] - ROLE_PRIORITY[a.role];
  });
}
