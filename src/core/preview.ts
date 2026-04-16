import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isGoogleFont } from "./google-fonts-db.ts";

const DEFAULT_SAMPLE =
  "The quick brown fox jumps over the lazy dog. 1234567890";

/** Return the Google Fonts specimen URL (or a marketplace search URL as fallback). */
export function specimenUrl(name: string): string {
  if (isGoogleFont(name)) {
    return `https://fonts.google.com/specimen/${encodeURIComponent(name.replace(/\s+/g, "+"))}`;
  }
  return `https://www.myfonts.com/search?query=${encodeURIComponent(name)}`;
}

/**
 * Generate a local HTML page that renders the given fonts side-by-side
 * using Google Fonts where available. Returns the file path.
 *
 * Non-Google fonts are still displayed — they'll render with the
 * browser's fallback, which at least shows the name/category context.
 */
export async function generateComparePage(
  names: string[],
  sampleText: string = DEFAULT_SAMPLE,
): Promise<string> {
  const googleFonts = names.filter(isGoogleFont);
  const linkTag =
    googleFonts.length > 0
      ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${googleFonts
          .map(
            (n) =>
              `family=${encodeURIComponent(n.replace(/\s+/g, "+"))}:wght@400;500;700`,
          )
          .join("&")}&display=swap">`
      : "";

  const columns = names
    .map((name) => {
      const isGoogle = isGoogleFont(name);
      const badge = isGoogle
        ? `<span class="badge free">FREE · Google Fonts</span>`
        : `<span class="badge commercial">Commercial / not on Google Fonts</span>`;
      return `
        <section class="col" style="font-family: '${name}', sans-serif;">
          <header>
            <h2>${escapeHtml(name)}</h2>
            ${badge}
          </header>
          <div class="samples">
            <p class="size-64">${escapeHtml(sampleText.slice(0, 24))}</p>
            <p class="size-32" style="font-weight:700">${escapeHtml(sampleText.slice(0, 48))}</p>
            <p class="size-20">${escapeHtml(sampleText)}</p>
            <p class="size-14">${escapeHtml(sampleText)} ${escapeHtml(sampleText)}</p>
            <pre class="size-12">const greet = (name) =&gt; \`Hello, \${name}!\`;</pre>
          </div>
        </section>
      `;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>wtfont compare — ${escapeHtml(names.join(" · "))}</title>
  ${linkTag}
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #0b0b0c;
      color: #e8e8e8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .wrap { max-width: 1400px; margin: 0 auto; padding: 32px; }
    h1 { font-size: 18px; color: #9aa0a6; margin: 0 0 24px; letter-spacing: 0.02em; }
    .grid {
      display: grid;
      grid-template-columns: repeat(${names.length}, minmax(0, 1fr));
      gap: 24px;
    }
    .col { background: #15161a; border: 1px solid #2a2b32; border-radius: 8px; padding: 24px; overflow: hidden; }
    .col header { border-bottom: 1px solid #2a2b32; padding-bottom: 12px; margin-bottom: 16px; }
    .col h2 { font-size: 14px; color: #e8e8e8; margin: 0 0 6px; font-family: ui-monospace, monospace; }
    .badge { font-size: 11px; font-family: ui-monospace, monospace; }
    .badge.free { color: #6bdc99; }
    .badge.commercial { color: #f0a060; }
    .samples p, .samples pre { margin: 0 0 18px; line-height: 1.3; }
    .size-64 { font-size: 64px; }
    .size-32 { font-size: 32px; }
    .size-20 { font-size: 20px; }
    .size-14 { font-size: 14px; line-height: 1.6; }
    .size-12 { font-size: 12px; font-family: ui-monospace, monospace; color: #9aa0a6; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>wtfont compare — ${escapeHtml(names.join(" · "))}</h1>
    <div class="grid">${columns}</div>
  </div>
</body>
</html>`;

  const hash = createHash("sha1").update(names.join("|")).digest("hex").slice(0, 8);
  const path = join(tmpdir(), `wtfont-compare-${hash}.html`);
  await writeFile(path, html, "utf-8");
  return path;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
