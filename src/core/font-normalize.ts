import { isGoogleFont } from "./google-fonts-db.ts";
import type { ExtractedFont } from "../types/font.ts";

const LOCALE_SUFFIX = /\s+(SC|TC|HK|JP|KR|AR|TH|HE|GB)$/i;
const STYLE_SUFFIX = /\s+(Text|Display|Rounded)$/i;

export function cleanFontName(name: string): string {
  return name
    .replace(/['"]/g, "")
    .replace(/\.[0-9a-f]{8,}$/i, "")
    .replace(/\s+(W\s+)?Wght$/i, "")
    .trim();
}

export function normalizeFontKey(name: string): string {
  return name.toLowerCase().replace(/\s/g, "");
}

export function sortWeights(weights: Iterable<string>): string[] {
  return Array.from(new Set(weights)).sort((a, b) => {
    const an = Number(a);
    const bn = Number(b);
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    return a.localeCompare(b);
  });
}

export function deduplicateFontVariants(fonts: ExtractedFont[]): ExtractedFont[] {
  const groups = new Map<string, ExtractedFont[]>();

  for (const font of fonts) {
    const key = dedupeKey(font.name);
    const group = groups.get(key) || [];
    group.push(font);
    groups.set(key, group);
  }

  return Array.from(groups.values()).map((group) => {
    if (group.length === 1) return group[0];

    const merged = { ...group[0] };
    for (const variant of group.slice(1)) {
      merged.weights = sortWeights([...merged.weights, ...variant.weights]);
      merged.selectors = [
        ...new Set([...merged.selectors, ...variant.selectors]),
      ].slice(0, 20);
    }
    merged.name = displayNameForGroup(group);
    return merged;
  });
}

function dedupeKey(name: string): string {
  let base = name.replace(LOCALE_SUFFIX, "").trim();
  const styleBase = base.replace(STYLE_SUFFIX, "").trim();
  if (styleBase !== base && shouldMergeStyleVariant(name, styleBase)) {
    base = styleBase;
  }
  return base.toLowerCase();
}

function displayNameForGroup(group: ExtractedFont[]): string {
  const first = group[0].name.replace(LOCALE_SUFFIX, "").trim();
  const styleBase = first.replace(STYLE_SUFFIX, "").trim();
  return styleBase !== first && shouldMergeStyleVariant(first, styleBase)
    ? styleBase
    : first;
}

function shouldMergeStyleVariant(name: string, base: string): boolean {
  return !isGoogleFont(name) && !isGoogleFont(base);
}
