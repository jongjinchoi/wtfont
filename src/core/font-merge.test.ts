import { describe, it, expect } from "vitest";
import { mergeFontResults } from "./font-merge.ts";
import type { ExtractedFont } from "../types/font.ts";

function makeFont(overrides: Partial<ExtractedFont> & { name: string }): ExtractedFont {
  return {
    role: "body",
    source: "custom",
    weights: [],
    selectors: [],
    ...overrides,
  };
}

describe("mergeFontResults", () => {
  it("merges same font by name (case-insensitive)", () => {
    const staticFonts = [makeFont({ name: "Inter", weights: ["400"], selectors: ["body"] })];
    const dynamicFonts = [makeFont({ name: "inter", weights: ["700"], selectors: ["h1"] })];

    const result = mergeFontResults(staticFonts, dynamicFonts);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Inter");
    expect(result[0].weights).toEqual(expect.arrayContaining(["400", "700"]));
    expect(result[0].selectors).toEqual(expect.arrayContaining(["body", "h1"]));
  });

  it("appends Playwright-only fonts", () => {
    const staticFonts = [makeFont({ name: "Inter" })];
    const dynamicFonts = [makeFont({ name: "Geist" })];

    const result = mergeFontResults(staticFonts, dynamicFonts);
    expect(result).toHaveLength(2);
    const names = result.map((f) => f.name);
    expect(names).toContain("Inter");
    expect(names).toContain("Geist");
  });

  it("upgrades source (google > custom)", () => {
    const staticFonts = [makeFont({ name: "Roboto", source: "custom" })];
    const dynamicFonts = [makeFont({ name: "Roboto", source: "google" })];

    const result = mergeFontResults(staticFonts, dynamicFonts);
    expect(result[0].source).toBe("google");
  });

  it("upgrades role (heading > body)", () => {
    const staticFonts = [makeFont({ name: "Poppins", role: "body" })];
    const dynamicFonts = [makeFont({ name: "Poppins", role: "heading" })];

    const result = mergeFontResults(staticFonts, dynamicFonts);
    expect(result[0].role).toBe("heading");
  });

  it("does not downgrade source", () => {
    const staticFonts = [makeFont({ name: "Lato", source: "google" })];
    const dynamicFonts = [makeFont({ name: "Lato", source: "custom" })];

    const result = mergeFontResults(staticFonts, dynamicFonts);
    expect(result[0].source).toBe("google");
  });

  it("sorts: fonts with selectors first, then by role priority", () => {
    const staticFonts = [
      makeFont({ name: "Mono", role: "monospace", selectors: [] }),
      makeFont({ name: "Heading", role: "heading", selectors: ["h1"] }),
      makeFont({ name: "Body", role: "body", selectors: ["p"] }),
    ];

    const result = mergeFontResults(staticFonts, []);
    expect(result[0].name).toBe("Heading");
    expect(result[1].name).toBe("Body");
    expect(result[2].name).toBe("Mono");
  });

  it("returns empty array when both inputs are empty", () => {
    expect(mergeFontResults([], [])).toEqual([]);
  });

  it("deduplicates weights and selectors", () => {
    const staticFonts = [makeFont({ name: "Inter", weights: ["400", "700"], selectors: ["body"] })];
    const dynamicFonts = [makeFont({ name: "Inter", weights: ["400", "900"], selectors: ["body", "p"] })];

    const result = mergeFontResults(staticFonts, dynamicFonts);
    expect(result[0].weights).toHaveLength(3);
    expect(result[0].selectors).toHaveLength(2);
  });
});
