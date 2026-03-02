import { z } from "zod";
import type { ExtractedFont } from "@/types/font";

export const aiMatchedFontSchema = z.object({
  originalName: z.string(),
  alternativeName: z.string(),
  similarity: z.string(),
  similarityScore: z.number(),
});

export const aiResponseSchema = z.array(aiMatchedFontSchema);

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
1. The proper display name (normalize CSS identifiers, e.g. "sohne-var" → "Söhne", "SourceCodePro" → "Source Code Pro", "Inter Variable" → "Inter")
2. The best FREE alternative from Google Fonts that visually matches the original
3. A brief explanation (1 sentence) of why this alternative is similar
4. A visual similarity score (0-100) based on classification, proportions, stroke weight, and overall visual impression

IMPORTANT RULES:
- If the original IS already a free Google Font, use the original as the alternative and set similarityScore to 100
- All descriptions should be in English
- Return ONLY valid JSON array, no markdown

Respond with a JSON array where each element has these fields:
originalName, alternativeName, similarity, similarityScore`;
}
