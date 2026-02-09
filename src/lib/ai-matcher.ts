import { GoogleGenerativeAI } from "@google/generative-ai";
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
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = gemini.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
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
