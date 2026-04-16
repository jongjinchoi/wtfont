import {
  getAllGoogleFonts,
  getGoogleFontCategory,
  isGoogleFont,
} from "./google-fonts-db.ts";

export interface PairSuggestion {
  name: string;
  category: string;
  rationale: string;
}

export interface PairResult {
  input: {
    name: string;
    category: string | null;
    isGoogleFont: boolean;
  };
  suggestions: PairSuggestion[];
  note: string;
}

/**
 * Suggest candidate fonts to pair with the given body font.
 * Returns a shortlist of Google Fonts candidates — the actual
 * aesthetic judgement is intended to be made by the caller
 * (either the user visually, or Claude via MCP using the
 * server's instructions).
 */
export function pairFonts(
  bodyFont: string,
  targetRole: "heading" | "display" = "heading",
): PairResult {
  const inputCategory = getGoogleFontCategory(bodyFont);

  const all = getAllGoogleFonts();

  // Strategy:
  //  • If body is sans-serif → suggest serif + a bolder sans + a display
  //  • If body is serif → suggest sans-serif + display + another serif
  //  • If body is monospace → suggest sans-serif for body/heading contrast
  //  • Otherwise → default mix
  const buckets: Record<string, string[]> = {};
  for (const [name, category] of all) {
    (buckets[category] ??= []).push(name);
  }

  const popular = (category: string): string[] => {
    // Use a curated shortlist of well-known Google Fonts per category
    // so we don't need popularity data embedded in the DB.
    const curated: Record<string, string[]> = {
      "sans-serif": [
        "Inter",
        "Plus Jakarta Sans",
        "Manrope",
        "Work Sans",
        "DM Sans",
        "Outfit",
        "Space Grotesk",
        "Geist",
      ],
      serif: [
        "Fraunces",
        "Playfair Display",
        "DM Serif Display",
        "Source Serif 4",
        "Lora",
        "Cormorant Garamond",
      ],
      display: [
        "Abril Fatface",
        "Bricolage Grotesque",
        "Unbounded",
        "Syne",
        "Alfa Slab One",
      ],
      monospace: ["JetBrains Mono", "Fira Code", "Space Mono", "IBM Plex Mono"],
    };
    const list = curated[category] ?? [];
    return list.filter((n) => (buckets[category] ?? []).includes(n.toLowerCase()));
  };

  const suggestions: PairSuggestion[] = [];
  const seen = new Set<string>([bodyFont.toLowerCase()]);

  const push = (name: string, rationale: string) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    const category = getGoogleFontCategory(name) ?? "sans-serif";
    suggestions.push({ name, category, rationale });
    seen.add(key);
  };

  if (inputCategory === "sans-serif") {
    for (const n of popular("serif").slice(0, 2))
      push(n, "Classic pairing: serif heading over sans-serif body.");
    for (const n of popular("display").slice(0, 1))
      push(n, "High-contrast display for impact.");
    for (const n of popular("sans-serif").slice(0, 1))
      push(n, "Same family type, heavier weight for subtle hierarchy.");
  } else if (inputCategory === "serif") {
    for (const n of popular("sans-serif").slice(0, 2))
      push(n, "Modernist contrast against serif body.");
    for (const n of popular("display").slice(0, 1))
      push(n, "Editorial display for statement headings.");
    for (const n of popular("serif").slice(0, 1))
      push(n, "Same family; use a display-weight serif for heading.");
  } else if (inputCategory === "monospace") {
    for (const n of popular("sans-serif").slice(0, 3))
      push(n, "Clean sans-serif to balance monospace body.");
  } else {
    for (const n of popular("sans-serif").slice(0, 2))
      push(n, "Neutral sans-serif heading.");
    for (const n of popular("serif").slice(0, 2))
      push(n, "Serif for warmth and editorial tone.");
  }

  const note =
    targetRole === "display"
      ? "Display pairings favor bolder contrast. Verify visually with `wtfont preview`."
      : "Always verify the pairing visually — use `wtfont preview <body> <heading> --compare`.";

  return {
    input: {
      name: bodyFont,
      category: inputCategory,
      isGoogleFont: isGoogleFont(bodyFont),
    },
    suggestions,
    note,
  };
}
