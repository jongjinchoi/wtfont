#!/usr/bin/env node
import { Command } from "commander";
import { loadConfig, saveConfig } from "./config/config.ts";
import { setTheme, THEME_NAMES } from "./tui/theme.ts";
import type { Framework } from "./core/code-templates.ts";
import type { AnalysisResult, MatchedFont } from "./types/font.ts";
import type { PairResult } from "./core/pair.ts";
import type { ScanResult } from "./core/scan-project.ts";

declare const PKG_VERSION: string;
const VERSION = typeof PKG_VERSION !== "undefined" ? PKG_VERSION : "0.1.0";

const program = new Command();

program
  .name("wtfont")
  .description("Identify web fonts and find free Google Fonts alternatives.")
  .version(VERSION);

// --- analyze ---
program
  .command("analyze")
  .argument("<url>", "URL to analyze")
  .option("--dynamic", "Use Playwright for JS-rendered sites (opt-in)")
  .option("-f, --format <format>", "Output format (tui, text, json)", "tui")
  .option("-t, --timeout <seconds>", "Timeout in seconds", "15")
  .description("Detect fonts used on a website")
  .action(async (url: string, opts) => {
    const config = await loadConfig();
    setTheme(config.theme);
    const timeoutMs = Math.max(1, parseInt(opts.timeout, 10) || 15) * 1000;
    const format = resolveOutputFormat(opts.format, ["tui", "text", "json"]);

    if (format !== "tui") {
      const { analyze } = await import("./core/analyze.ts");
      const { addHistory } = await import("./config/history.ts");
      try {
        const r = await analyze(url, { dynamic: opts.dynamic, timeoutMs });
        await addHistory({
          url: r.url,
          domain: r.domain,
          fontNames: r.fonts.map((f) => f.name),
          detection: r.detection,
          at: r.analyzedAt,
        });
        process.stdout.write(
          format === "json"
            ? JSON.stringify(r, null, 2) + "\n"
            : formatAnalysisText(r),
        );
      } catch (err) {
        process.stderr.write(
          `${err instanceof Error ? err.message : String(err)}\n`,
        );
        process.exit(1);
      }
      return;
    }

    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: AnalyzeView } = await import("./tui/AnalyzeView.tsx");
    const instance = render(
      React.createElement(AnalyzeView, {
        url,
        dynamic: opts.dynamic,
        timeoutMs,
      }),
    );
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- lookup ---
program
  .command("lookup")
  .argument("<name>", "Font name")
  .option("-f, --format <format>", "Output format (tui, text, json)", "tui")
  .description("Check whether a font is on Google Fonts")
  .action(async (name: string, opts) => {
    const config = await loadConfig();
    setTheme(config.theme);
    const format = resolveOutputFormat(opts.format, ["tui", "text", "json"]);
    if (format !== "tui") {
      const {
        getGoogleFontCategory,
        getGoogleFontCount,
        getGoogleFontsUrl,
        isGoogleFont,
      } = await import("./core/google-fonts-db.ts");
      const { specimenUrl } = await import("./core/preview.ts");
      const found = isGoogleFont(name);
      const payload = {
        name,
        isGoogleFont: found,
        category: found ? getGoogleFontCategory(name) : null,
        cssUrl: found ? getGoogleFontsUrl(name) : null,
        specimenUrl: found ? specimenUrl(name) : null,
        googleFontCount: getGoogleFontCount(),
      };
      process.stdout.write(
        format === "json"
          ? JSON.stringify(payload, null, 2) + "\n"
          : formatLookupText(payload),
      );
      return;
    }
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: LookupView } = await import("./tui/LookupView.tsx");
    const instance = render(React.createElement(LookupView, { name }));
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- code ---
program
  .command("code")
  .argument("<name>", "Font name")
  .option(
    "-f, --framework <fw>",
    "html | nextjs | nuxt | react",
    "nextjs",
  )
  .option("-w, --weights <weights>", "Comma-separated weights", "400,500,700")
  .option(
    "-r, --role <role>",
    "heading | body | display | monospace",
    "body",
  )
  .option("--alt <name>", "Use this Google Fonts name as the alternative")
  .option("-o, --format <format>", "Output format (tui, text, json)", "tui")
  .description("Generate copy-paste code for using a font")
  .action(async (name: string, opts) => {
    const config = await loadConfig();
    setTheme(config.theme);

    const framework = opts.framework as "html" | "nextjs" | "nuxt" | "react";
    if (!["html", "nextjs", "nuxt", "react"].includes(framework)) {
      process.stderr.write(
        `Unknown framework: ${framework}. Use html, nextjs, nuxt, or react.\n`,
      );
      process.exit(1);
    }
    const role = opts.role as "heading" | "body" | "display" | "monospace";
    if (!["heading", "body", "display", "monospace"].includes(role)) {
      process.stderr.write(`Unknown role: ${role}.\n`);
      process.exit(1);
    }
    const weights = String(opts.weights)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const format = resolveOutputFormat(opts.format, ["tui", "text", "json"]);

    if (format !== "tui") {
      const {
        generateCssUsageCode,
        generateFreeImportCode,
        generatePremiumCode,
      } = await import("./core/code-templates.ts");
      const {
        getGoogleFontCategory,
        getGoogleFontsUrl,
        isGoogleFont,
      } = await import("./core/google-fonts-db.ts");
      const alternativeName = opts.alt ?? name;
      const isFree = isGoogleFont(alternativeName);
      const category =
        getGoogleFontCategory(alternativeName) ??
        getGoogleFontCategory(name) ??
        "sans-serif";
      const googleFontsUrl = isFree
        ? getGoogleFontsUrl(alternativeName, weights)
        : null;
      const font: MatchedFont = {
        role,
        originalName: name,
        isFree,
        alternativeName,
        googleFontsUrl,
        fallback: category,
        weights,
      };
      const code = googleFontsUrl
        ? generateFreeImportCode(font, framework)
        : generatePremiumCode(font, framework);
      const cssUsage = googleFontsUrl ? null : generateCssUsageCode(font);
      const payload = {
        fontName: name,
        alternativeName,
        isFree,
        framework,
        role,
        weights,
        googleFontsUrl,
        code,
        cssUsage,
      };
      process.stdout.write(
        format === "json"
          ? JSON.stringify(payload, null, 2) + "\n"
          : formatCodeText(payload),
      );
      return;
    }

    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: CodeView } = await import("./tui/CodeView.tsx");

    const instance = render(
      React.createElement(CodeView, {
        name,
        framework,
        weights,
        role,
        alternative: opts.alt,
      }),
    );
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- preview ---
program
  .command("preview")
  .argument("<names...>", "One or more font names")
  .option("--compare", "Generate a local comparison page even for 1 name")
  .option("--sample <text>", "Sample text for the compare page")
  .description("Open a specimen/compare page in your browser")
  .action(async (names: string[], opts) => {
    const { openBrowser } = await import("./utils/browser.ts");
    const { specimenUrl, generateComparePage } = await import(
      "./core/preview.ts"
    );

    if (names.length === 1 && !opts.compare) {
      const url = specimenUrl(names[0]);
      openBrowser(url);
      process.stdout.write(`Opened ${url}\n`);
      return;
    }

    const path = await generateComparePage(names, opts.sample);
    openBrowser(`file://${path}`);
    process.stdout.write(`Generated ${path}\nOpened in browser.\n`);
  });

// --- pair ---
program
  .command("pair")
  .argument("<name>", "Body font name")
  .option(
    "-r, --role <role>",
    "Target role for the partner font (heading | display)",
    "heading",
  )
  .option("-f, --format <format>", "Output format (tui, text, json)", "tui")
  .description("Suggest candidate fonts to pair with the given body font")
  .action(async (name: string, opts) => {
    const config = await loadConfig();
    setTheme(config.theme);
    const role = opts.role === "display" ? "display" : "heading";
    const format = resolveOutputFormat(opts.format, ["tui", "text", "json"]);
    if (format !== "tui") {
      const { pairFonts } = await import("./core/pair.ts");
      const result = pairFonts(name, role);
      process.stdout.write(
        format === "json"
          ? JSON.stringify(result, null, 2) + "\n"
          : formatPairText(result),
      );
      return;
    }
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: PairView } = await import("./tui/PairView.tsx");
    const instance = render(
      React.createElement(PairView, { name, targetRole: role }),
    );
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- scan ---
program
  .command("scan")
  .argument("[path]", "Directory to scan (default: current)", ".")
  .option("-f, --format <format>", "Output format (tui, text, json)", "tui")
  .description("Audit font-family usage in a local project")
  .action(async (path: string, opts) => {
    const config = await loadConfig();
    setTheme(config.theme);
    const format = resolveOutputFormat(opts.format, ["tui", "text", "json"]);
    const resolved = await import("node:path").then((p) => p.resolve(path));
    if (format !== "tui") {
      const { scanProject } = await import("./core/scan-project.ts");
      const result = await scanProject(resolved);
      process.stdout.write(
        format === "json"
          ? JSON.stringify(result, null, 2) + "\n"
          : formatScanText(result),
      );
      return;
    }
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: ScanView } = await import("./tui/ScanView.tsx");
    const instance = render(React.createElement(ScanView, { path: resolved }));
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- browse ---
program
  .command("browse")
  .argument("<category>", "sans-serif | serif | display | handwriting | monospace")
  .option("--limit <n>", "Max results to show", "60")
  .option("-f, --format <format>", "Output format (tui, text, json)", "tui")
  .description("Browse Google Fonts by category")
  .action(async (category: string, opts) => {
    const config = await loadConfig();
    setTheme(config.theme);
    const format = resolveOutputFormat(opts.format, ["tui", "text", "json"]);
    if (format !== "tui") {
      const {
        getGoogleFontCount,
        getGoogleFontsByCategory,
      } = await import("./core/google-fonts-db.ts");
      const limit = parseInt(opts.limit, 10) || 60;
      const all = getGoogleFontsByCategory(category);
      const payload = {
        category,
        limit,
        totalInCategory: all.length,
        totalGoogleFonts: getGoogleFontCount(),
        fonts: all.slice(0, limit),
      };
      process.stdout.write(
        format === "json"
          ? JSON.stringify(payload, null, 2) + "\n"
          : formatBrowseText(payload),
      );
      return;
    }
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: BrowseView } = await import("./tui/BrowseView.tsx");
    const instance = render(
      React.createElement(BrowseView, {
        category,
        limit: parseInt(opts.limit, 10) || 60,
      }),
    );
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- history ---
const historyCmd = program
  .command("history")
  .description("Show analysis history");
historyCmd
  .option("--limit <n>", "Max entries", "20")
  .option("--clear", "Clear all history")
  .action(async (opts) => {
    if (opts.clear) {
      const { clearHistory } = await import("./config/history.ts");
      await clearHistory();
      process.stdout.write("History cleared.\n");
      return;
    }
    const config = await loadConfig();
    setTheme(config.theme);
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: HistoryView } = await import("./tui/HistoryView.tsx");
    const instance = render(
      React.createElement(HistoryView, {
        limit: parseInt(opts.limit, 10) || 20,
      }),
    );
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- favorites ---
const favCmd = program
  .command("favorites")
  .description("Manage favorite fonts");
favCmd
  .command("add")
  .argument("<name>", "Font name")
  .option("-n, --note <text>", "Optional note")
  .action(async (name: string, opts) => {
    const { addFavorite } = await import("./config/favorites.ts");
    await addFavorite(name, opts.note);
    process.stdout.write(`Added ${name} to favorites.\n`);
  });
favCmd
  .command("list")
  .action(async () => {
    const config = await loadConfig();
    setTheme(config.theme);
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: FavoritesView } = await import("./tui/FavoritesView.tsx");
    const instance = render(React.createElement(FavoritesView));
    instance.waitUntilExit().then(() => process.exit(0));
  });
favCmd
  .command("remove")
  .argument("<name>", "Font name")
  .action(async (name: string) => {
    const { removeFavorite } = await import("./config/favorites.ts");
    await removeFavorite(name);
    process.stdout.write(`Removed ${name} from favorites.\n`);
  });

// --- init ---
program
  .command("init")
  .description("Set up wtfont (theme + Playwright)")
  .action(async () => {
    const config = await loadConfig();
    setTheme(config.theme);
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: InitView } = await import("./tui/InitView.tsx");
    const instance = render(
      React.createElement(InitView, { currentConfig: config }),
    );
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- config theme ---
const configCmd = program
  .command("config")
  .description("Manage wtfont configuration");
configCmd
  .command("theme")
  .argument("[name]")
  .option("--list", "List available themes")
  .action(async (name: string | undefined, opts: { list?: boolean }) => {
    const current = await loadConfig();
    if (opts.list || !name) {
      for (const t of THEME_NAMES) {
        const marker = t === current.theme ? "▸" : " ";
        process.stdout.write(`  ${marker} ${t}\n`);
      }
      return;
    }
    if (!THEME_NAMES.includes(name)) {
      process.stderr.write(
        `Unknown theme: ${name}. Available: ${THEME_NAMES.join(", ")}\n`,
      );
      process.exit(1);
    }
    await saveConfig({ theme: name });
    process.stdout.write(`Theme set to: ${name}\n`);
  });

// --- install-playwright ---
program
  .command("install-playwright")
  .description("Download Chromium for dynamic font detection (~150MB)")
  .action(async () => {
    const config = await loadConfig();
    setTheme(config.theme);
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: InstallPlaywrightView } = await import(
      "./tui/InstallPlaywrightView.tsx"
    );
    const instance = render(React.createElement(InstallPlaywrightView));
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- mcp ---
program
  .command("mcp")
  .description("Start MCP server for Claude Code / Desktop")
  .action(async () => {
    const { startMcpServer } = await import("./mcp/server.ts");
    await startMcpServer();
  });

program.parseAsync();

type OutputFormat = "tui" | "text" | "json";

function canUseTui(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

function resolveOutputFormat(
  raw: string | undefined,
  allowed: OutputFormat[],
): OutputFormat {
  const requested = (raw ?? "tui") as OutputFormat;
  if (!allowed.includes(requested)) {
    process.stderr.write(
      `Unknown format: ${raw}. Available: ${allowed.join(", ")}\n`,
    );
    process.exit(1);
  }
  if (requested === "tui" && !canUseTui()) return "text";
  return requested;
}

function formatAnalysisText(result: AnalysisResult): string {
  const lines = [
    `Fonts on ${result.domain} (${result.detection})`,
    "",
    `${"role".padEnd(11)}${"name".padEnd(30)}${"source".padEnd(10)}${"weights".padEnd(20)}free`,
    "-".repeat(75),
  ];
  for (const f of result.fonts) {
    lines.push(
      `${f.role.padEnd(11)}${truncate(f.name, 29).padEnd(30)}${f.source.padEnd(10)}${truncate(f.weights.join(","), 19).padEnd(20)}${f.isFree ? "yes" : "no"}`,
    );
  }
  lines.push("");
  lines.push(
    `${result.fonts.filter((f) => f.isFree).length}/${result.fonts.length} on Google Fonts.`,
  );
  return lines.join("\n") + "\n";
}

function formatLookupText(payload: {
  name: string;
  isGoogleFont: boolean;
  category: string | null;
  cssUrl: string | null;
  specimenUrl: string | null;
  googleFontCount: number;
}): string {
  if (!payload.isGoogleFont) {
    return [
      `${payload.name} is NOT on Google Fonts (${payload.googleFontCount} entries checked).`,
      "This is likely a commercial typeface.",
      "",
    ].join("\n");
  }
  return [
    `${payload.name} IS on Google Fonts.`,
    `Category: ${payload.category}`,
    `CSS URL: ${payload.cssUrl}`,
    `Specimen: ${payload.specimenUrl}`,
    "",
  ].join("\n");
}

function formatCodeText(payload: {
  code: string;
  cssUsage: string | null;
}): string {
  return payload.cssUsage
    ? `${payload.code}\n\nCSS usage:\n${payload.cssUsage}\n`
    : `${payload.code}\n`;
}

function formatPairText(result: PairResult): string {
  const lines = [
    `Pair candidates for ${result.input.name} (${result.input.category ?? "unknown"}):`,
    "",
  ];
  for (const s of result.suggestions) {
    lines.push(`${s.name} [${s.category}]`);
    lines.push(`  ${s.rationale}`);
  }
  lines.push("");
  lines.push(result.note);
  return lines.join("\n") + "\n";
}

function formatScanText(result: ScanResult): string {
  const lines = [`Scanned ${result.filesScanned} files in ${result.rootPath}.`, ""];
  if (result.fonts.length === 0) {
    lines.push("No non-system font-family usage found.");
  } else {
    for (const f of result.fonts) {
      lines.push(
        `${f.name} [${f.isFree ? "free" : "commercial"}] — ${f.occurrences}x across ${f.files.length} file(s)`,
      );
      for (const file of f.files.slice(0, 3)) lines.push(`  ${file}`);
      if (f.files.length > 3) lines.push(`  (+${f.files.length - 3} more)`);
    }
  }
  return lines.join("\n") + "\n";
}

function formatBrowseText(payload: {
  category: string;
  totalInCategory: number;
  totalGoogleFonts: number;
  fonts: string[];
}): string {
  return [
    `Google Fonts in "${payload.category}" (${payload.fonts.length} of ${payload.totalInCategory}, ${payload.totalGoogleFonts} total):`,
    "",
    ...payload.fonts,
    "",
  ].join("\n");
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
