import { describe, it, expect } from "vitest";
import {
  parseFontFamily,
  parseFontFromShorthand,
  extractGoogleFontsFromLink,
  extractFontsFromHtml,
  inferRole,
} from "./font-parser";

describe("parseFontFamily", () => {
  it("parses comma-separated font families", () => {
    const result = parseFontFamily("'Inter', 'Helvetica Neue', sans-serif");
    expect(result).toEqual(["Inter"]);
  });

  it("handles quotes and no quotes", () => {
    const result = parseFontFamily('Inter, "GT Walsheim", sans-serif');
    expect(result).toEqual(["Inter", "GT Walsheim"]);
  });

  it("filters out system fonts", () => {
    const result = parseFontFamily("Arial, Helvetica, sans-serif");
    expect(result).toEqual([]);
  });
});

describe("parseFontFromShorthand", () => {
  it("extracts font-family from basic shorthand", () => {
    const result = parseFontFromShorthand('16px "Inter", sans-serif');
    expect(result).toEqual(["Inter"]);
  });

  it("extracts font-family with style and weight", () => {
    const result = parseFontFromShorthand(
      'italic bold 1.2em "GT Walsheim", sans-serif'
    );
    expect(result).toEqual(["GT Walsheim"]);
  });

  it("handles font-size/line-height syntax", () => {
    const result = parseFontFromShorthand(
      '16px/1.5 "GT Walsheim", "Helvetica Neue", sans-serif'
    );
    expect(result).toEqual(["GT Walsheim"]);
  });

  it("returns empty for system font keywords", () => {
    expect(parseFontFromShorthand("caption")).toEqual([]);
    expect(parseFontFromShorthand("icon")).toEqual([]);
    expect(parseFontFromShorthand("menu")).toEqual([]);
  });

  it("handles percentage font-size", () => {
    const result = parseFontFromShorthand('120% "Custom Font"');
    expect(result).toEqual(["Custom Font"]);
  });

  it("returns empty when no size found", () => {
    expect(parseFontFromShorthand("bold italic")).toEqual([]);
  });
});

describe("extractGoogleFontsFromLink", () => {
  it("extracts family from Google Fonts CSS2 URL", () => {
    const url =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap";
    const result = extractGoogleFontsFromLink(url);
    expect(result).toEqual([
      { name: "Inter", weights: ["400", "500", "700"], source: "google" },
    ]);
  });

  it("extracts multiple families", () => {
    const url =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Fira+Code:wght@400;700&display=swap";
    const result = extractGoogleFontsFromLink(url);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Inter");
    expect(result[1].name).toBe("Fira Code");
  });

  it("defaults to weight 400 when no weights specified", () => {
    const url =
      "https://fonts.googleapis.com/css2?family=Roboto&display=swap";
    const result = extractGoogleFontsFromLink(url);
    expect(result[0].weights).toEqual(["400"]);
  });
});

describe("extractFontsFromHtml", () => {
  it("detects @import Google Fonts in <style> tags", async () => {
    const html = `<html><head>
      <style>
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap");
        body { font-family: 'Poppins', sans-serif; }
      </style>
    </head><body></body></html>`;
    const fonts = await extractFontsFromHtml(html, "https://example.com");
    const poppins = fonts.find((f) => f.name === "Poppins");
    expect(poppins).toBeDefined();
    expect(poppins!.source).toBe("google");
    expect(poppins!.weights).toContain("400");
    expect(poppins!.weights).toContain("700");
  });

  it("detects font shorthand in CSS rules", async () => {
    const html = `<html><head>
      <style>
        h1 { font: bold 24px/1.2 "Custom Display", serif; }
      </style>
    </head><body></body></html>`;
    const fonts = await extractFontsFromHtml(html, "https://example.com");
    const custom = fonts.find((f) => f.name === "Custom Display");
    expect(custom).toBeDefined();
    expect(custom!.selectors).toContain("h1");
  });

  it("detects @import with string syntax (no url())", async () => {
    const html = `<html><head>
      <style>
        @import "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400&display=swap";
      </style>
    </head><body></body></html>`;
    const fonts = await extractFontsFromHtml(html, "https://example.com");
    const mono = fonts.find((f) => f.name === "Roboto Mono");
    expect(mono).toBeDefined();
    expect(mono!.source).toBe("google");
  });
});

describe("inferRole", () => {
  it("infers heading role", () => {
    expect(inferRole(["h1", "h2", ".heading"])).toBe("heading");
  });
  it("infers body role", () => {
    expect(inferRole(["body", "p", ".text"])).toBe("body");
  });
  it("infers monospace role", () => {
    expect(inferRole(["code", "pre"])).toBe("monospace");
  });
  it("defaults to body", () => {
    expect(inferRole([".custom-class"])).toBe("body");
  });
});
