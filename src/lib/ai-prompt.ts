import { z } from "zod";
import type { ExtractedFont } from "@/types/font";

export const matchedFontSchema = z.object({
  role: z.enum(["heading", "body", "display", "monospace"]),
  originalName: z.string(),
  isFree: z.boolean(),
  alternativeName: z.string(),
  googleFontsUrl: z.string().nullable(),
  fallback: z.string(),
  similarity: z.string(),
  similarityScore: z.number(),
  notes: z.string(),
  weights: z.array(z.string()),
  premiumUrl: z.string().nullable(),
  premiumPrice: z.string().nullable(),
});

export const aiResponseSchema = z.array(matchedFontSchema);

export function buildPrompt(fonts: ExtractedFont[], domain: string): string {
  const fontList = fonts
    .map(
      (f) =>
        `- ${f.name} (role: ${f.role}, source: ${f.source}, weights: ${f.weights.join(",")})`
    )
    .join("\n");

  return `You are a font expert. A user analyzed the website "${domain}" and found these fonts:

${fontList}

For EACH font, provide:
1. Whether the original font is free (available on Google Fonts or similar)
2. The best FREE alternative from Google Fonts that visually matches the original
3. The Google Fonts CSS import URL for the alternative (use css2 API format)
4. A generic CSS fallback category (sans-serif, serif, or monospace)
5. A brief explanation (1-2 sentences) of why this alternative is similar
6. A visual similarity score (0-100) comparing the alternative to the original font, based on classification, proportions, stroke weight, and overall visual impression
7. A practical usage tip
8. The recommended font weights for the alternative
9. If the original is a PAID/commercial font: provide the purchase URL from Fontspring or MyFonts, and the approximate starting price

IMPORTANT RULES:
- For originalName, normalize CSS identifiers to proper font names (e.g. "sohne-var" → "Söhne", "SourceCodePro" → "Source Code Pro", "Inter Variable" → "Inter")
- If the original IS already a free Google Font, set isFree: true, use the original as the alternative, and set similarityScore to 100
- For Google Fonts URLs, use this exact format: https://fonts.googleapis.com/css2?family=Font+Name:wght@400;500;700&display=swap
- For premiumUrl, ONLY provide URLs you are confident exist on Fontspring (fontspring.com/fonts/...) or MyFonts (myfonts.com/fonts/...). If unsure or the font is platform-exclusive (e.g. SF Pro, Segoe UI), set premiumUrl to null
- If the font is free or platform-bundled, set premiumUrl to null and premiumPrice to null
- All descriptions should be in English
- Return ONLY valid JSON array, no markdown

Respond with a JSON array where each element has these fields:
role, originalName, isFree, alternativeName, googleFontsUrl, fallback, similarity, similarityScore, notes, weights, premiumUrl, premiumPrice`;
}
