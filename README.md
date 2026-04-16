# wtfont

Identify web fonts and find free Google Fonts alternatives — from your terminal or through Claude.

```bash
npm install -g wtfont
```

## What it does

- **Detect fonts** on any website (static HTML parsing; optional Playwright for SPAs)
- **Look up** any font in a local 1,900+ entry Google Fonts database (offline after install)
- **Generate code** for HTML, Next.js, Nuxt, or React
- **Preview & compare** fonts visually in your browser
- **Audit projects** — scan your local CSS/JS for `font-family` usage
- **Pair fonts** — get candidate partners for a body font
- **MCP server** — let Claude (Desktop or Code) drive the whole workflow

No API keys required. No servers. Everything runs locally.

## Quick start

```bash
# Analyze a website
wtfont analyze stripe.com

# Dynamic (JS-rendered) sites — opt-in, requires playwright-core
npm install -g playwright-core && npx playwright install chromium
wtfont analyze linear.app --dynamic

# Is this font on Google Fonts?
wtfont lookup Inter

# Generate Next.js code
wtfont code Inter --framework nextjs --weights 400,500,700

# Compare fonts side-by-side in a browser
wtfont preview Inter "Plus Jakarta Sans" Manrope

# Audit the current project
wtfont scan
```

## MCP — use wtfont through Claude

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (or your Claude Code config):

```json
{
  "mcpServers": {
    "wtfont": {
      "command": "npx",
      "args": ["-y", "wtfont", "mcp"]
    }
  }
}
```

Then ask Claude things like:

- *"What fonts does stripe.com use? Recommend free alternatives."*
- *"Inter on body — suggest a heading font and show me side by side."*
- *"Scan this project and tell me which fonts are commercial."*

Claude calls the 8 MCP tools: `extract_fonts`, `lookup_google_font`, `list_google_fonts`, `compare_fonts`, `pair_fonts`, `generate_font_code`, `preview_fonts`, `scan_project_fonts`. The server provides facts; Claude provides the taste.

## CLI reference

| Command | Description |
|---|---|
| `wtfont analyze <url>` | Detect fonts. `--dynamic` for SPAs. `--format json` for scripting. |
| `wtfont lookup <name>` | Check Google Fonts DB. |
| `wtfont code <name>` | Copy-paste code. `--framework html\|nextjs\|nuxt\|react`. |
| `wtfont preview <names...>` | Open specimen URL (1 font) or local compare HTML (2+). |
| `wtfont pair <name>` | Candidate pairing fonts for a body font. |
| `wtfont scan [path]` | Audit local project font usage. |
| `wtfont browse <category>` | Browse Google Fonts by category. |
| `wtfont history` | Recent analyses. `--clear` to reset. |
| `wtfont favorites <add\|list\|remove>` | Bookmark fonts. |
| `wtfont init` | Interactive setup. |
| `wtfont config theme [name]` | Switch terminal theme. |
| `wtfont mcp` | Start MCP stdio server. |

## How it works

Static parsing uses [cheerio](https://cheerio.js.org/) + [css-tree](https://github.com/csstree/csstree) to pull fonts from `<link>`, `@font-face`, `@import`, `font-family` rules, and inline styles. This catches most traditional (MPA/SSR) sites in ~1 second.

For SPAs where fonts load via JavaScript (React/Vue/Next CSR), enable `--dynamic`: it uses Playwright to run the page, then collects fonts via `document.fonts`, `getComputedStyle`, and the Resource Timing API — then cross-validates against what's actually loaded.

The Google Fonts DB (`src/core/google-fonts-db.ts`) is regenerated weekly by a GitHub Actions workflow (`.github/workflows/update-fonts-db.yml`) that fetches `fonts.google.com/metadata/fonts` and opens a PR.

## Configuration

Stored at `~/.wtfont/`:

- `config.json` — theme, defaults
- `history.json` — recent analyses (last 100)
- `favorites.json` — bookmarked fonts

## Why no AI in the CLI?

The original wtfont used Gemini/OpenAI for fonts alternatives matching. This CLI removes that:

- **MCP users** get better recommendations from Claude itself (Opus/Sonnet), with full conversational context
- **CLI-only users** get the raw Google Fonts DB match — and can always pipe `--format json` into their own tooling

Licensing: detecting a font does not grant a license to use it. Many web fonts are commercial software — always purchase a proper license before shipping.

## Development

```bash
bun install
bun run build:npm     # dist/npm/index.js
bun run test:run      # vitest
bun run update-db     # manually refresh Google Fonts DB
```

## License

MIT
