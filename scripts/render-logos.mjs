#!/usr/bin/env node
// Render logo SVGs to PNG/ICO using headless Chrome (system ui-monospace = SF Mono).

import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO = join(ROOT, "assets/logo");
const WEB_APP = join(ROOT, "web/app");

async function renderSvg(page, svgPath, size) {
  const svg = readFileSync(svgPath, "utf8");
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    body{width:${size}px;height:${size}px;overflow:hidden}
    svg{display:block;width:${size}px;height:${size}px}
  </style></head><body>${svg}</body></html>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ omitBackground: true, type: "png" });
}

(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--font-render-hinting=none"],
  });
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  // 1) apple-icon.png — app-icon-512-dark.svg @ 512
  const apple = await renderSvg(page, join(LOGO, "app-icon-512-dark.svg"), 512);
  writeFileSync(join(LOGO, "apple-icon.png"), apple);
  writeFileSync(join(WEB_APP, "apple-icon.png"), apple);
  console.log(`apple-icon.png: ${apple.length} bytes`);

  // 2) icon.png — icon-128-dark.svg @ 512 (square, vector scaled)
  const icon = await renderSvg(page, join(LOGO, "icon-128-dark.svg"), 512);
  writeFileSync(join(LOGO, "icon.png"), icon);
  writeFileSync(join(WEB_APP, "icon.png"), icon);
  console.log(`icon.png: ${icon.length} bytes`);

  // 3) favicon frames — render each native size to /tmp, Python packs as RGBA ICO
  const sizes = [16, 32, 48, 64, 128];
  for (const s of sizes) {
    const png = await renderSvg(page, join(LOGO, `icon-${s}-dark.svg`), s);
    writeFileSync(`/tmp/wtfont-fav-${s}.png`, png);
    console.log(`  frame ${s}: ${png.length} bytes (temp)`);
  }

  // 4) opengraph-image.png / twitter-image.png — og-1200x630-dark.svg @ 1200x630
  const ogSvg = readFileSync(join(LOGO, "og-1200x630-dark.svg"), "utf8");
  const ogHtml = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    body{width:1200px;height:630px;overflow:hidden}
    svg{display:block;width:1200px;height:630px}
  </style></head><body>${ogSvg}</body></html>`;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(ogHtml, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const og = await page.screenshot({ omitBackground: true, type: "png" });
  writeFileSync(join(LOGO, "opengraph-image.png"), og);
  writeFileSync(join(LOGO, "twitter-image.png"), og);
  writeFileSync(join(WEB_APP, "opengraph-image.png"), og);
  writeFileSync(join(WEB_APP, "twitter-image.png"), og);
  console.log(`opengraph-image.png / twitter-image.png: ${og.length} bytes`);

  await browser.close();

  // 5) Post-process: force RGBA on every PNG + pack favicon.ico from temp frames.
  // Next.js turbopack rejects non-RGBA PNGs (incl. those embedded in ICO).
  console.log("---\npost-processing via PIL…");
  execFileSync("python3", [join(ROOT, "scripts/pack-rasters.py")], {
    stdio: "inherit",
  });
})();
