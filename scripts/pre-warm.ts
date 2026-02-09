/**
 * Cache pre-warming script for WTFont.
 * Analyzes popular websites ahead of time so users get instant results.
 *
 * Usage:
 *   npx tsx scripts/pre-warm.ts
 *   BASE_URL=https://wtfont.wtf npx tsx scripts/pre-warm.ts
 */

import { PRE_WARM_URLS } from "./pre-warm-urls.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3100";
const CONCURRENCY = 3;
const REQUEST_TIMEOUT = 30_000;

interface Result {
  url: string;
  status: "success" | "cached" | "failed";
  fonts?: number;
  error?: string;
  ms: number;
}

async function analyzeUrl(url: string): Promise<Result> {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });

    const ms = Date.now() - start;
    const data = await res.json();

    if (!data.success) {
      return { url, status: "failed", error: data.error, ms };
    }

    const fonts = data.data?.matchedFonts?.length ?? 0;
    // If response was very fast (<500ms), it was likely a cache hit
    const status = ms < 500 ? "cached" : "success";
    return { url, status, fonts, ms };
  } catch (err) {
    const ms = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);
    return { url, status: "failed", error, ms };
  }
}

async function runBatch(urls: string[], concurrency: number): Promise<Result[]> {
  const results: Result[] = [];
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift()!;
      const result = await analyzeUrl(url);
      results.push(result);

      const icon =
        result.status === "success" ? "+" :
        result.status === "cached" ? "=" :
        "x";
      const detail =
        result.status === "failed"
          ? result.error
          : `${result.fonts} fonts`;

      console.log(
        `  [${icon}] ${url} (${result.ms}ms) — ${detail}`
      );
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`\nWTFont Pre-warm Cache`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`URLs: ${PRE_WARM_URLS.length}\n`);

  const results = await runBatch(PRE_WARM_URLS, CONCURRENCY);

  const success = results.filter((r) => r.status === "success").length;
  const cached = results.filter((r) => r.status === "cached").length;
  const failed = results.filter((r) => r.status === "failed").length;

  console.log(`\n--- Summary ---`);
  console.log(`  New:    ${success}`);
  console.log(`  Cached: ${cached}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total:  ${results.length}\n`);

  if (failed > 0) {
    console.log("Failed URLs:");
    for (const r of results.filter((r) => r.status === "failed")) {
      console.log(`  ${r.url} — ${r.error}`);
    }
    console.log();
  }

  process.exit(failed > results.length / 2 ? 1 : 0);
}

main();
