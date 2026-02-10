import { describe, it, expect } from "vitest";
import {
  toFileName,
  toVarName,
  generateFreeImportCode,
  generatePremiumCode,
} from "./code-templates";
import type { MatchedFont } from "@/types/font";

const mockFont: MatchedFont = {
  role: "heading",
  originalName: "GT Walsheim",
  isFree: false,
  alternativeName: "Plus Jakarta Sans",
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700&display=swap",
  fallback: "sans-serif",
  similarity: "Rounded geometric sans-serif",
  similarityScore: 82,
  notes: "Use Display weight for headings",
  weights: ["500", "700"],
  premiumUrl: "https://fontspring.com/fonts/gt-walsheim",
  premiumPrice: "$39+",
};

describe("toFileName", () => {
  it("removes spaces", () => {
    expect(toFileName("GT Walsheim")).toBe("GTWalsheim");
  });
});

describe("toVarName", () => {
  it("converts to camelCase", () => {
    expect(toVarName("GT Walsheim")).toBe("gtWalsheim");
  });
  it("handles single word", () => {
    expect(toVarName("Inter")).toBe("inter");
  });
});

describe("generateFreeImportCode", () => {
  it("generates Google Fonts import code", () => {
    const code = generateFreeImportCode(mockFont);
    expect(code).toContain("Plus+Jakarta+Sans");
    expect(code).toContain("font-family");
  });

  it("returns empty string when no Google Fonts URL", () => {
    const font = { ...mockFont, googleFontsUrl: null };
    expect(generateFreeImportCode(font)).toBe("");
  });
});

describe("generatePremiumCode", () => {
  it("generates Next.js code", () => {
    const code = generatePremiumCode(mockFont, "nextjs");
    expect(code).toContain("import localFont from 'next/font/local'");
    expect(code).toContain("gtWalsheim");
  });

  it("generates HTML code", () => {
    const code = generatePremiumCode(mockFont, "html");
    expect(code).toContain("@font-face");
    expect(code).toContain("GTWalsheim");
  });

  it("generates Nuxt code", () => {
    const code = generatePremiumCode(mockFont, "nuxt");
    expect(code).toContain("nuxt.config.ts");
    expect(code).toContain("@font-face");
  });

  it("generates React code", () => {
    const code = generatePremiumCode(mockFont, "react");
    expect(code).toContain("import './fonts.css'");
    expect(code).toContain("@font-face");
  });
});
