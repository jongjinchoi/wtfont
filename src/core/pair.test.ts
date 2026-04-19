import { describe, it, expect } from "vitest";
import { pairFonts } from "./pair.ts";
import { isGoogleFont } from "./google-fonts-db.ts";

describe("pairFonts", () => {
  it("returns non-empty suggestions for a sans-serif body font", () => {
    const r = pairFonts("Inter", "heading");
    expect(r.suggestions.length).toBeGreaterThan(0);
    for (const s of r.suggestions) {
      expect(isGoogleFont(s.name)).toBe(true);
    }
    expect(
      r.suggestions.some((s) => s.name.toLowerCase() === "inter"),
    ).toBe(false);
    expect(r.input.category).toBe("sans-serif");
    expect(r.input.isGoogleFont).toBe(true);
  });

  it("returns non-empty suggestions for a serif body font", () => {
    const r = pairFonts("Source Serif 4", "heading");
    expect(r.suggestions.length).toBeGreaterThan(0);
    for (const s of r.suggestions) {
      expect(isGoogleFont(s.name)).toBe(true);
    }
    expect(
      r.suggestions.some((s) => s.name.toLowerCase() === "source serif 4"),
    ).toBe(false);
    expect(r.input.category).toBe("serif");
  });

  it("returns non-empty sans-serif suggestions for a monospace body font", () => {
    const r = pairFonts("JetBrains Mono", "heading");
    expect(r.suggestions.length).toBeGreaterThan(0);
    for (const s of r.suggestions) {
      expect(isGoogleFont(s.name)).toBe(true);
      expect(s.category).toBe("sans-serif");
    }
    expect(r.input.category).toBe("monospace");
  });

  it("falls back to default mix for an unrecognised font", () => {
    const r = pairFonts("Proxima Nova", "heading");
    expect(r.input.category).toBeNull();
    expect(r.input.isGoogleFont).toBe(false);
    expect(r.suggestions.length).toBeGreaterThan(0);
    for (const s of r.suggestions) {
      expect(isGoogleFont(s.name)).toBe(true);
    }
  });

  it("does not return duplicate suggestions", () => {
    const r = pairFonts("Inter", "heading");
    const names = r.suggestions.map((s) => s.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("regression guard: suggestions must not be empty for any known body category", () => {
    for (const name of [
      "Inter",
      "Source Serif 4",
      "JetBrains Mono",
      "Proxima Nova",
    ]) {
      const r = pairFonts(name, "heading");
      expect(
        r.suggestions.length,
        `pairFonts("${name}") returned no suggestions`,
      ).toBeGreaterThan(0);
    }
  });

  it("note reflects the targetRole", () => {
    const heading = pairFonts("Inter", "heading");
    const display = pairFonts("Inter", "display");
    expect(heading.note).toMatch(/verify the pairing visually/i);
    expect(display.note).toMatch(/^Display pairings/);
  });
});
