import { describe, it, expect } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanProject } from "./scan-project.ts";

function withTmpDir(fn: (dir: string) => Promise<void>): () => Promise<void> {
  return async () => {
    const dir = mkdtempSync(join(tmpdir(), "wtfont-scan-"));
    try {
      await fn(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };
}

describe("scanProject", () => {
  it(
    "detects clean Google Fonts from CSS files",
    withTmpDir(async (dir) => {
      writeFileSync(
        join(dir, "globals.css"),
        `body { font-family: 'Inter', sans-serif; }`,
      );
      writeFileSync(
        join(dir, "code.css"),
        `pre { font-family: 'JetBrains Mono', monospace; }`,
      );

      const r = await scanProject(dir);
      const names = r.fonts.map((f) => f.name);
      expect(names).toContain("Inter");
      expect(names).toContain("JetBrains Mono");
      expect(r.fonts.every((f) => f.isFree)).toBe(true);
    }),
  );

  it(
    "rejects template-literal artifacts",
    withTmpDir(async (dir) => {
      writeFileSync(
        join(dir, "templates.ts"),
        "const css = `font-family: '${font.originalName}', sans-serif;`;",
      );
      const r = await scanProject(dir);
      expect(r.fonts.find((f) => f.name.includes("$"))).toBeUndefined();
      expect(r.fonts.find((f) => f.name.includes("{"))).toBeUndefined();
    }),
  );

  it(
    "rejects regex pattern fragments",
    withTmpDir(async (dir) => {
      writeFileSync(
        join(dir, "scan.ts"),
        "const re = /font-family\\s*[:=]\\s*([^;,}\\n)]+)/g;",
      );
      const r = await scanProject(dir);
      expect(r.fonts.find((f) => f.name.includes("\\"))).toBeUndefined();
      expect(r.fonts.find((f) => f.name.includes("("))).toBeUndefined();
    }),
  );

  it(
    "rejects TS primitive type annotations",
    withTmpDir(async (dir) => {
      writeFileSync(
        join(dir, "types.ts"),
        "interface Style { fontFamily: string; fontSize: number; }",
      );
      const r = await scanProject(dir);
      expect(r.fonts.find((f) => f.name === "string")).toBeUndefined();
    }),
  );

  it(
    "rejects property accessors",
    withTmpDir(async (dir) => {
      writeFileSync(
        join(dir, "view.ts"),
        "out.push({ fontFamily: style.fontFamily });",
      );
      const r = await scanProject(dir);
      expect(r.fonts.find((f) => f.name === "style.fontFamily")).toBeUndefined();
    }),
  );

  it(
    "strips nested quotes in CSS-in-JS values",
    withTmpDir(async (dir) => {
      writeFileSync(
        join(dir, "Button.tsx"),
        `export const s = { fontFamily: "'Poppins', sans-serif" };`,
      );
      const r = await scanProject(dir);
      const names = r.fonts.map((f) => f.name);
      expect(names).toContain("Poppins");
      expect(names.find((n) => n.includes("'"))).toBeUndefined();
      expect(r.fonts.find((f) => f.name === "Poppins")?.isFree).toBe(true);
    }),
  );

  it(
    "skips hidden dot directories",
    withTmpDir(async (dir) => {
      mkdirSync(join(dir, ".hidden"));
      mkdirSync(join(dir, "src"));
      writeFileSync(
        join(dir, ".hidden", "hidden.css"),
        `.x { font-family: "Hidden Font", sans-serif; }`,
      );
      writeFileSync(
        join(dir, "src", "visible.css"),
        `.x { font-family: "Visible Font", sans-serif; }`,
      );

      const r = await scanProject(dir);
      const names = r.fonts.map((f) => f.name);
      expect(names).toContain("Visible Font");
      expect(names).not.toContain("Hidden Font");
    }),
  );

  it(
    "detects all font families in JS inline style fallback lists",
    withTmpDir(async (dir) => {
      writeFileSync(
        join(dir, "Button.tsx"),
        `export const style = { fontFamily: "Inter, Fira Code, sans-serif" };`,
      );

      const r = await scanProject(dir);
      const names = r.fonts.map((f) => f.name);
      expect(names).toContain("Inter");
      expect(names).toContain("Fira Code");
    }),
  );

  it(
    "does not scan past unquoted JS fontFamily values into sibling properties",
    withTmpDir(async (dir) => {
      writeFileSync(
        join(dir, "Button.tsx"),
        `export const style = { fontFamily: vars.body, fontSize: 12 };`,
      );

      const r = await scanProject(dir);
      expect(r.fonts.find((f) => f.name === "fontSize: 12")).toBeUndefined();
      expect(r.fonts.find((f) => f.name.includes(":"))).toBeUndefined();
    }),
  );
});
