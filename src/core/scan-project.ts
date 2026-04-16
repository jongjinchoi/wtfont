import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import * as cssTree from "css-tree";
import { isSystemFont } from "./system-fonts.ts";
import { isGoogleFont } from "./google-fonts-db.ts";

export interface FontUsage {
  name: string;
  isFree: boolean;
  files: string[];
  occurrences: number;
}

export interface ScanResult {
  rootPath: string;
  filesScanned: number;
  fonts: FontUsage[];
}

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".nuxt",
  "dist",
  "build",
  "out",
  ".git",
  ".cache",
  "coverage",
  ".turbo",
]);

const SCAN_EXT = /\.(css|scss|sass|less|styl|js|jsx|ts|tsx|vue|svelte|astro|html)$/i;

export async function scanProject(rootPath: string): Promise<ScanResult> {
  const byName = new Map<
    string,
    { files: Set<string>; occurrences: number }
  >();
  let filesScanned = 0;

  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".") {
        // skip dotfiles/directories except the root itself
        if (SKIP_DIRS.has(entry.name)) continue;
      }
      if (SKIP_DIRS.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && SCAN_EXT.test(entry.name)) {
        try {
          const s = await stat(full);
          if (s.size > 2_000_000) continue; // skip >2MB
          const text = await readFile(full, "utf-8");
          filesScanned++;
          for (const name of extractFontFamilies(text)) {
            let entry = byName.get(name);
            if (!entry) {
              entry = { files: new Set(), occurrences: 0 };
              byName.set(name, entry);
            }
            entry.files.add(relative(rootPath, full));
            entry.occurrences++;
          }
        } catch {
          /* unreadable — skip */
        }
      }
    }
  }

  await walk(rootPath);

  const fonts: FontUsage[] = Array.from(byName.entries())
    .map(([name, { files, occurrences }]) => ({
      name,
      isFree: isGoogleFont(name),
      files: Array.from(files).sort(),
      occurrences,
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  return { rootPath, filesScanned, fonts };
}

/**
 * Pull `font-family` candidate values from the given source text.
 * Uses css-tree on bare CSS, plus a light regex sweep to catch
 * font-family inside JS/TSX template literals and inline styles.
 */
function extractFontFamilies(text: string): string[] {
  const found = new Set<string>();

  // Regex pass — catches: font-family: "X", fontFamily: 'X'
  const regex = /font[-]?[fF]amily\s*[:=]\s*([^;,}\n)]+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const value = m[1];
    for (const name of splitFontFamilyValue(value)) {
      if (isValidCandidate(name)) found.add(name);
    }
  }

  // css-tree pass on anything that parses as CSS
  try {
    const ast = cssTree.parse(text, { parseCustomProperty: false });
    cssTree.walk(ast, {
      visit: "Declaration",
      enter(decl) {
        if (decl.property === "font-family" || decl.property === "font") {
          const raw = cssTree.generate(decl.value);
          for (const name of splitFontFamilyValue(raw)) {
            if (isValidCandidate(name)) found.add(name);
          }
        }
      },
    });
  } catch {
    /* not valid CSS — regex pass already covered */
  }

  return Array.from(found);
}

function splitFontFamilyValue(value: string): string[] {
  return value
    .split(",")
    .map((v) =>
      v
        .trim()
        .replace(/^['"`]|['"`]$/g, "")
        .trim(),
    )
    .filter(Boolean);
}

function isValidCandidate(name: string): boolean {
  if (!name || name.length < 3) return false;
  if (isSystemFont(name)) return false;
  if (/^var\s*\(|^\w+\s*\(/.test(name)) return false;
  if (/^(inherit|initial|unset|revert|none|normal|auto)$/i.test(name)) return false;
  if (/^[${}\[\]()]/.test(name)) return false;
  return true;
}
