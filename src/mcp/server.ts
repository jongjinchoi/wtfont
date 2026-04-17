import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { analyze, AnalyzeError } from "../core/analyze.ts";
import {
  getAllGoogleFonts,
  getGoogleFontCategory,
  getGoogleFontCount,
  getGoogleFontsByCategory,
  getGoogleFontsUrl,
  isGoogleFont,
} from "../core/google-fonts-db.ts";
import {
  generateCssUsageCode,
  generateFreeImportCode,
  generatePremiumCode,
  type Framework,
} from "../core/code-templates.ts";
import { pairFonts } from "../core/pair.ts";
import { scanProject } from "../core/scan-project.ts";
import { generateComparePage, specimenUrl } from "../core/preview.ts";
import { openBrowser } from "../utils/browser.ts";
import type { MatchedFont } from "../types/font.ts";

declare const PKG_VERSION: string;
const VERSION = typeof PKG_VERSION !== "undefined" ? PKG_VERSION : "0.1.0";

const INSTRUCTIONS = `wtfont identifies web fonts and helps you swap them for free Google Fonts alternatives.

## Typical workflow

1. \`extract_fonts({ url })\` to detect what fonts a site uses.
2. For each detected font, \`lookup_google_font({ name })\`:
   - If it IS on Google Fonts → recommend using it directly, then \`generate_font_code\`.
   - If it is NOT on Google Fonts → it's a commercial typeface. Suggest free alternatives.
3. When suggesting alternatives, judge on: classification, proportions, stroke weight,
   x-height, and overall visual impression. Validate each suggestion with
   \`lookup_google_font\` before presenting it — do not invent font names.
4. Encourage visual verification: \`preview_fonts({ names: [...] })\` opens a local HTML
   page rendering the fonts side-by-side so the user can actually SEE them.
5. When the user picks one, \`generate_font_code\` produces a copy-paste snippet for
   html, nextjs, nuxt, or react.

## Licensing

Detecting a font does NOT grant a license to use it. For commercial fonts, advise
the user to purchase an official license. Do not help circumvent DRM or redistribute
font files.

## Dynamic detection

By default \`extract_fonts\` uses static parsing (fast, covers most traditional sites).
Set \`dynamic: true\` for SPAs / React / Vue / Next CSR pages where fonts are loaded
via JavaScript. This requires the user to have installed \`playwright-core\` locally
(optional peer dependency).`;

const server = new McpServer(
  { name: "wtfont", version: VERSION },
  { instructions: INSTRUCTIONS },
);

// ─────────────────────────── extract_fonts ───────────────────────────
server.registerTool(
  "extract_fonts",
  {
    description:
      "Detect all fonts used on a website. Returns extracted fonts with role, source, weights, and Google Fonts DB status.",
    inputSchema: {
      url: z.string().describe("Full URL, e.g. 'https://stripe.com'"),
      dynamic: z
        .boolean()
        .optional()
        .describe(
          "If true, use Playwright for JS-rendered sites (slower, requires playwright-core peer dep).",
        ),
    },
  },
  async ({ url, dynamic }) => {
    try {
      const result = await analyze(url, { dynamic });
      const lines: string[] = [];
      lines.push(`Fonts on ${result.domain} (${result.detection}):`);
      lines.push("");
      lines.push(
        `${"role".padEnd(11)}${"name".padEnd(30)}${"source".padEnd(10)}${"weights".padEnd(20)}free`,
      );
      lines.push("-".repeat(75));
      for (const f of result.fonts) {
        lines.push(
          `${f.role.padEnd(11)}${truncate(f.name, 29).padEnd(30)}${f.source.padEnd(10)}${truncate(f.weights.join(","), 19).padEnd(20)}${f.isFree ? "yes" : "no"}`,
        );
      }
      const freeCount = result.fonts.filter((f) => f.isFree).length;
      lines.push("");
      lines.push(
        `${freeCount}/${result.fonts.length} on Google Fonts. Analyzed at ${result.analyzedAt}.`,
      );

      if (
        dynamic &&
        result.dynamicStatus &&
        result.dynamicStatus !== "success" &&
        result.dynamicStatus !== "skipped"
      ) {
        lines.push("");
        lines.push(
          `⚠ Dynamic detection requested but failed (${result.dynamicStatus}).`,
        );
        lines.push(
          `  Run \`wtfont install-playwright\` to install Chromium (~150MB), then retry.`,
        );
        lines.push(`  Results above are from static parsing only.`);
      }

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    } catch (err) {
      const message =
        err instanceof AnalyzeError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ─────────────────────────── lookup_google_font ───────────────────────────
server.registerTool(
  "lookup_google_font",
  {
    description:
      "Check whether a font is on Google Fonts. Returns category, CSS URL, and specimen URL if found.",
    inputSchema: {
      name: z.string().describe("Font name, e.g. 'Inter' or 'Plus Jakarta Sans'"),
    },
  },
  async ({ name }) => {
    const found = isGoogleFont(name);
    if (!found) {
      return {
        content: [
          {
            type: "text" as const,
            text: `"${name}" is NOT on Google Fonts (${getGoogleFontCount()} entries checked).\nThis is likely a commercial typeface.`,
          },
        ],
      };
    }
    const category = getGoogleFontCategory(name);
    const url = getGoogleFontsUrl(name);
    const specimen = specimenUrl(name);
    return {
      content: [
        {
          type: "text" as const,
          text: [
            `"${name}" IS on Google Fonts.`,
            `  Category: ${category}`,
            `  CSS URL:  ${url}`,
            `  Specimen: ${specimen}`,
          ].join("\n"),
        },
      ],
    };
  },
);

// ─────────────────────────── list_google_fonts ───────────────────────────
server.registerTool(
  "list_google_fonts",
  {
    description:
      "List Google Fonts, optionally filtered by category. Useful to browse candidates for a given role.",
    inputSchema: {
      category: z
        .enum(["sans-serif", "serif", "display", "handwriting", "monospace"])
        .optional()
        .describe("Filter by category"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(500)
        .optional()
        .describe("Max results (default 80)"),
    },
  },
  async ({ category, limit }) => {
    const cap = limit ?? 80;
    const names = category
      ? getGoogleFontsByCategory(category).slice(0, cap)
      : getAllGoogleFonts()
          .map(([name]) => name)
          .slice(0, cap);
    const title = category
      ? `Google Fonts in "${category}" (${names.length} of ${getGoogleFontsByCategory(category).length}):`
      : `Google Fonts (${names.length} of ${getGoogleFontCount()}):`;
    return {
      content: [
        {
          type: "text" as const,
          text: [title, "", ...names.map((n) => `  ${titleCase(n)}`)].join("\n"),
        },
      ],
    };
  },
);

// ─────────────────────────── compare_fonts ───────────────────────────
server.registerTool(
  "compare_fonts",
  {
    description:
      "Compare Google Fonts DB attributes of multiple fonts (category, free/commercial, URL).",
    inputSchema: {
      names: z
        .array(z.string())
        .min(2)
        .max(10)
        .describe("Two or more font names to compare"),
    },
  },
  async ({ names }) => {
    const lines: string[] = [
      `${"name".padEnd(28)}${"category".padEnd(16)}on Google Fonts`,
      "-".repeat(60),
    ];
    for (const name of names) {
      const cat = getGoogleFontCategory(name) ?? "—";
      const free = isGoogleFont(name) ? "yes" : "no";
      lines.push(
        `${truncate(name, 27).padEnd(28)}${cat.padEnd(16)}${free}`,
      );
    }
    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  },
);

// ─────────────────────────── pair_fonts ───────────────────────────
server.registerTool(
  "pair_fonts",
  {
    description:
      "Get curated Google Fonts pairing candidates for a given body font. " +
      "The model should make the final visual judgement using the instructions' criteria.",
    inputSchema: {
      bodyFont: z.string().describe("Font used for body text"),
      targetRole: z
        .enum(["heading", "display"])
        .optional()
        .describe("What role the partner font will serve"),
    },
  },
  async ({ bodyFont, targetRole }) => {
    const result = pairFonts(bodyFont, targetRole ?? "heading");
    const lines: string[] = [];
    lines.push(
      `Pair candidates for ${bodyFont} (${result.input.category ?? "unknown"}):`,
    );
    lines.push("");
    for (const s of result.suggestions) {
      lines.push(`  ${s.name}  [${s.category}]`);
      lines.push(`    ${s.rationale}`);
    }
    lines.push("");
    lines.push(result.note);
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  },
);

// ─────────────────────────── generate_font_code ───────────────────────────
server.registerTool(
  "generate_font_code",
  {
    description:
      "Generate copy-paste code for using a font in html, nextjs, nuxt, or react.",
    inputSchema: {
      fontName: z.string().describe("Original font name"),
      alternativeName: z
        .string()
        .optional()
        .describe("Alternative Google Fonts name, if replacing a commercial font"),
      role: z
        .enum(["heading", "body", "display", "monospace"])
        .describe("Role in the design"),
      framework: z
        .enum(["html", "nextjs", "nuxt", "react"])
        .describe("Target framework"),
      weights: z
        .array(z.string())
        .min(1)
        .describe("Font weights, e.g. ['400', '500', '700']"),
    },
  },
  async ({ fontName, alternativeName, role, framework, weights }) => {
    const altName = alternativeName ?? fontName;
    const altIsFree = isGoogleFont(altName);
    const category =
      getGoogleFontCategory(altName) ??
      getGoogleFontCategory(fontName) ??
      "sans-serif";
    const googleFontsUrl = altIsFree
      ? getGoogleFontsUrl(altName, weights)
      : null;

    const font: MatchedFont = {
      role,
      originalName: fontName,
      isFree: altIsFree,
      alternativeName: altName,
      googleFontsUrl,
      fallback: category,
      weights,
    };

    const code = googleFontsUrl
      ? generateFreeImportCode(font)
      : generatePremiumCode(font, framework as Framework);

    const out: string[] = [];
    out.push(
      altIsFree
        ? `Free Google Font: ${altName}`
        : `Commercial font: ${fontName} — license required`,
    );
    out.push("");
    out.push(code);
    if (!googleFontsUrl) {
      out.push("");
      out.push("CSS usage:");
      out.push(generateCssUsageCode(font));
    }
    return { content: [{ type: "text" as const, text: out.join("\n") }] };
  },
);

// ─────────────────────────── preview_fonts ───────────────────────────
server.registerTool(
  "preview_fonts",
  {
    description:
      "Generate a local HTML page that renders the given fonts side-by-side and open it in the user's browser. Use this to let the user VISUALLY compare candidates.",
    inputSchema: {
      names: z.array(z.string()).min(1).max(6),
      sampleText: z.string().optional(),
    },
  },
  async ({ names, sampleText }) => {
    try {
      if (names.length === 1) {
        const url = specimenUrl(names[0]);
        openBrowser(url);
        return {
          content: [
            {
              type: "text" as const,
              text: `Opened specimen for "${names[0]}": ${url}`,
            },
          ],
        };
      }
      const path = await generateComparePage(names, sampleText);
      openBrowser(`file://${path}`);
      return {
        content: [
          {
            type: "text" as const,
            text: `Compare page opened at ${path}\nFonts: ${names.join(", ")}`,
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// ─────────────────────────── scan_project_fonts ───────────────────────────
server.registerTool(
  "scan_project_fonts",
  {
    description:
      "Scan a local project directory for font-family usage in CSS / JS / HTML files. Returns which fonts appear and how often.",
    inputSchema: {
      path: z
        .string()
        .describe("Absolute path to the project directory to scan"),
    },
  },
  async ({ path }) => {
    try {
      const result = await scanProject(path);
      const lines: string[] = [];
      lines.push(`Scanned ${result.filesScanned} files in ${result.rootPath}.`);
      lines.push("");
      if (result.fonts.length === 0) {
        lines.push("No non-system font-family usage found.");
      } else {
        for (const f of result.fonts) {
          const badge = f.isFree ? "free" : "commercial";
          lines.push(
            `  ${f.name} [${badge}] — ${f.occurrences}× across ${f.files.length} file(s)`,
          );
          for (const file of f.files.slice(0, 3)) {
            lines.push(`    ${file}`);
          }
          if (f.files.length > 3) {
            lines.push(`    (+${f.files.length - 3} more)`);
          }
        }
      }
      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
