import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import type { ExtractedFont, MatchedFont } from "@/types/font";
import { buildPrompt, aiResponseSchema } from "./ai-prompt";

export async function matchFonts(
  fonts: ExtractedFont[],
  domain: string
): Promise<MatchedFont[]> {
  if (fonts.length === 0) return [];

  const prompt = buildPrompt(fonts, domain);

  try {
    return await matchWithGemini(prompt);
  } catch (geminiError) {
    console.warn("Gemini failed, falling back to GPT-4o mini:", geminiError);
    try {
      return await matchWithOpenAI(prompt);
    } catch (openaiError) {
      console.error("Both AI providers failed:", openaiError);
      throw new Error("AI font matching failed. Please try again later.");
    }
  }
}

async function matchWithGemini(prompt: string): Promise<MatchedFont[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey: key });

  const fontSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING },
        originalName: { type: Type.STRING },
        isFree: { type: Type.BOOLEAN },
        alternativeName: { type: Type.STRING },
        googleFontsUrl: { type: Type.STRING, nullable: true },
        fallback: { type: Type.STRING },
        similarity: { type: Type.STRING },
        notes: { type: Type.STRING },
        weights: { type: Type.ARRAY, items: { type: Type.STRING } },
        premiumUrl: { type: Type.STRING, nullable: true },
        premiumPrice: { type: Type.STRING, nullable: true },
      },
      required: [
        "role", "originalName", "isFree", "alternativeName",
        "googleFontsUrl", "fallback", "similarity", "notes",
        "weights", "premiumUrl", "premiumPrice",
      ],
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
      responseSchema: fontSchema,
    },
  });

  const text = response.text ?? "[]";
  const parsed = JSON.parse(text);
  return aiResponseSchema.parse(parsed);
}

async function matchWithOpenAI(prompt: string): Promise<MatchedFont[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a font expert. Respond only with valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content || "[]";
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed)
    ? parsed
    : parsed.fonts || parsed.results || [];
  return aiResponseSchema.parse(arr);
}
