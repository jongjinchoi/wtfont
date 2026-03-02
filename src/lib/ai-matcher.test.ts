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
        originalName: "Inter",
        alternativeName: "Inter",
        similarity: "Same font - already free",
        similarityScore: 100,
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
