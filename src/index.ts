#!/usr/bin/env node
import { Command } from "commander";
import { loadConfig, saveConfig } from "./config/config.ts";
import { setTheme, THEME_NAMES } from "./tui/theme.ts";

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
  .option("-f, --format <format>", "Output format (tui, json)", "tui")
  .option("-t, --timeout <seconds>", "Timeout in seconds", "15")
  .description("Detect fonts used on a website")
  .action(async (url: string, opts) => {
    const config = await loadConfig();
    setTheme(config.theme);
    const timeoutMs = Math.max(1, parseInt(opts.timeout, 10) || 15) * 1000;

    if (opts.format === "json") {
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
        process.stdout.write(JSON.stringify(r, null, 2) + "\n");
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
  .description("Check whether a font is on Google Fonts")
  .action(async (name: string) => {
    const {
      isGoogleFont,
      getGoogleFontCategory,
      getGoogleFontsUrl,
    } = await import("./core/google-fonts-db.ts");

    const found = isGoogleFont(name);
    if (found) {
      const category = getGoogleFontCategory(name);
      const url = getGoogleFontsUrl(name);
      const specimen = `https://fonts.google.com/specimen/${encodeURIComponent(name.replace(/\s+/g, "+"))}`;
      process.stdout.write(
        [
          `  ✓ ${titleCase(name)}`,
          `    Category:     ${category}`,
          `    Google Fonts: yes`,
          `    CSS URL:      ${url}`,
          `    Specimen:     ${specimen}`,
          ``,
          `    Next: wtfont code "${titleCase(name)}" --framework nextjs`,
          ``,
        ].join("\n"),
      );
    } else {
      process.stdout.write(
        [
          `  ✗ ${name}`,
          `    Not found on Google Fonts (${await import("./core/google-fonts-db.ts").then((m) => m.getGoogleFontCount())} entries).`,
          `    This is likely a commercial typeface.`,
          `    Tip: via MCP, ask Claude for free alternatives.`,
          ``,
        ].join("\n"),
      );
    }
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
  .description("Suggest candidate fonts to pair with the given body font")
  .action(async (name: string, opts) => {
    const { pairFonts } = await import("./core/pair.ts");
    const role = opts.role === "display" ? "display" : "heading";
    const result = pairFonts(name, role);

    const lines: string[] = [];
    lines.push(``);
    lines.push(
      `Pair suggestions for ${name} (${result.input.category ?? "unknown category"}${result.input.isGoogleFont ? ", Google Fonts" : ""})`,
    );
    lines.push(``);
    if (result.suggestions.length === 0) {
      lines.push(`  No suggestions found.`);
    } else {
      for (const s of result.suggestions) {
        lines.push(`  · ${titleCase(s.name).padEnd(22)} [${s.category}]`);
        lines.push(`      ${s.rationale}`);
      }
    }
    lines.push(``);
    lines.push(`  ${result.note}`);
    lines.push(``);
    process.stdout.write(lines.join("\n"));
  });

// --- scan ---
program
  .command("scan")
  .argument("[path]", "Directory to scan (default: current)", ".")
  .description("Audit font-family usage in a local project")
  .action(async (path: string) => {
    const config = await loadConfig();
    setTheme(config.theme);
    const { render } = await import("ink");
    const React = (await import("react")).default;
    const { default: ScanView } = await import("./tui/ScanView.tsx");
    const resolved = await import("node:path").then((p) => p.resolve(path));
    const instance = render(React.createElement(ScanView, { path: resolved }));
    instance.waitUntilExit().then(() => process.exit(0));
  });

// --- browse ---
program
  .command("browse")
  .argument("<category>", "sans-serif | serif | display | handwriting | monospace")
  .option("--limit <n>", "Max results to show", "60")
  .description("Browse Google Fonts by category")
  .action(async (category: string, opts) => {
    const config = await loadConfig();
    setTheme(config.theme);
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

// --- mcp ---
program
  .command("mcp")
  .description("Start MCP server for Claude Code / Desktop")
  .action(async () => {
    const { startMcpServer } = await import("./mcp/server.ts");
    await startMcpServer();
  });

program.parseAsync();

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
