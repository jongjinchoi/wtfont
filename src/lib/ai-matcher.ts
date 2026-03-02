import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import type { ExtractedFont, AiMatchedFont } from "@/types/font";
import { buildPrompt, aiResponseSchema } from "./ai-prompt";

export async function matchFonts(
  fonts: ExtractedFont[],
  domain: string
): Promise<AiMatchedFont[]> {
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

async function matchWithGemini(prompt: string): Promise<AiMatchedFont[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey: key });

  const fontSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        originalName: { type: Type.STRING },
        alternativeName: { type: Type.STRING },
        similarity: { type: Type.STRING },
        similarityScore: { type: Type.NUMBER },
      },
      required: [
        "originalName", "alternativeName", "similarity", "similarityScore",
      ],
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: fontSchema,
    },
  });

  const text = response.text ?? "[]";
  const parsed = JSON.parse(text);
  return aiResponseSchema.parse(parsed);
}

async function matchWithOpenAI(prompt: string): Promise<AiMatchedFont[]> {
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
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content || "[]";
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed)
    ? parsed
    : parsed.fonts || parsed.results || [];
  return aiResponseSchema.parse(arr);
}
