import { describe, it, expect } from "vitest";
import { buildPrompt, aiResponseSchema } from "./ai-prompt";
import type { ExtractedFont } from "@/types/font";

describe("buildPrompt", () => {
  it("includes font names and domain", () => {
    const fonts: ExtractedFont[] = [
      {
        name: "Inter",
        role: "body",
        source: "google",
        weights: ["400", "700"],
        selectors: ["body"],
      },
    ];
    const prompt = buildPrompt(fonts, "example.com");
    expect(prompt).toContain("Inter");
    expect(prompt).toContain("example.com");
  });

  it("includes multiple fonts", () => {
    const fonts: ExtractedFont[] = [
      {
        name: "Inter",
        role: "body",
        source: "google",
        weights: ["400"],
        selectors: [],
      },
      {
        name: "GT Walsheim",
        role: "heading",
        source: "custom",
        weights: ["500", "700"],
        selectors: [],
      },
    ];
    const prompt = buildPrompt(fonts, "stripe.com");
    expect(prompt).toContain("Inter");
    expect(prompt).toContain("GT Walsheim");
  });
});

describe("aiResponseSchema", () => {
  it("validates a well-formed response", () => {
    const mockResponse = [
      {
        role: "body",
        originalName: "Inter",
        isFree: true,
        alternativeName: "Inter",
        googleFontsUrl:
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
        fallback: "sans-serif",
        similarity: "Same font - already free",
        similarityScore: 100,
        notes: "Use variable font for best performance",
        weights: ["400", "700"],
        premiumUrl: null,
        premiumPrice: null,
      },
    ];
    const parsed = aiResponseSchema.parse(mockResponse);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].originalName).toBe("Inter");
  });

  it("rejects invalid data", () => {
    expect(() => aiResponseSchema.parse([{ invalid: true }])).toThrow();
  });
});
