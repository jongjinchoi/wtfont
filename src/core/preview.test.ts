import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { generateComparePage } from "./preview.ts";

describe("generateComparePage", () => {
  it("escapes font names inside inline style attributes", async () => {
    const path = await generateComparePage([
      "Inter",
      `" autofocus onfocus=alert(1) x="`,
    ]);
    const html = await readFile(path, "utf-8");

    expect(html).not.toContain(`style="font-family: '" autofocus`);
    expect(html).not.toContain(`x="', sans-serif;`);
    expect(html).toContain("&quot; autofocus onfocus=alert(1) x=&quot;");
  });

  it("requests preview weights for Google Fonts CSS2 URLs", async () => {
    const path = await generateComparePage(["Inter", "Homemade Apple"]);
    const html = await readFile(path, "utf-8");

    expect(html).toContain("https://fonts.googleapis.com/css2?");
    expect(html).toContain("family=Inter%3Awght%40400%3B500%3B700");
    expect(html).toContain(
      "family=Homemade+Apple%3Awght%40400%3B500%3B700",
    );
  });
});
