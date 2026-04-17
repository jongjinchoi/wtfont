# wtfont

Identify web fonts and find free Google Fonts alternatives — from your terminal or through Claude.

```bash
npm install -g wtfont
```

## What it does

- **Detect fonts** on any website (static HTML parsing; optional Playwright for SPAs)
- **Look up** any font in a local 1,929-entry Google Fonts database (offline after install)
- **Generate code** for HTML, Next.js, Nuxt, or React — copy to clipboard with `c`
- **Preview & compare** fonts visually in your browser
- **Audit projects** — scan your local CSS/JS for `font-family` usage
- **Pair fonts** — get candidate partners for a body font
- **MCP server** — let Claude (Desktop or Code) drive the whole workflow

No API keys required. No servers. Everything runs locally.

## Quick start

```bash
# Analyze a website — navigate results with j/k
wtfont analyze vercel.com

# Dynamic (JS-rendered) sites — installs Chromium on first use
wtfont analyze linear.app --dynamic

# Or install Chromium ahead of time
wtfont install-playwright

# Is this font on Google Fonts?
wtfont lookup Inter

# Generate Next.js code
wtfont code Inter --framework nextjs --weights 400,500,700

# Compare fonts side-by-side in a browser
wtfont preview Inter "Plus Jakarta Sans" Manrope

# Audit the current project
wtfont scan
```

## Interactive navigation

`wtfont analyze` acts as a **hub** — browse detected fonts and take action without leaving the session:

```
┌─ Fonts on vercel.com ─────────────────────────────────────────┐
│ ✓ Done — static parsing only                                  │
│                                                                │
│   role       name              source   weights           free │
│   ────────── ───────────────── ──────── ──────────────── ───  │
│   body       Geist             custom   100 900           ✓   │
│ ▸ body       Geist Mono        custom   100 900           ✓   │
│   body       Roboto Mono       custom   400,500,700       ✓   │
│   monospace  Space Mono        custom   400               ✓   │
│                                                                │
│ 6/13 on Google Fonts · 13 total                                │
├────────────────────────────────────────────────────────────────┤
│ j/k move · p preview · c code · enter lookup · q quit         │
└────────────────────────────────────────────────────────────────┘
```

| Key | Action |
|-----|--------|
| `j/k` or `↑/↓` | Move cursor between fonts |
| `c` | Open code view for the selected font (copy with `c` inside) |
| `enter` | Open lookup view for the selected font |
| `p` | Open preview in browser for the selected font |
| `esc` | Return from code/lookup back to the list |
| `q` | Quit |

The same `j/k` navigation works in `browse`, `history`, and `favorites` views.

## MCP — use wtfont through Claude

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Or for Claude Code:

```bash
claude mcp add wtfont -- npx -y wtfont mcp
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
| `wtfont lookup <name>` | Check Google Fonts DB. `p` preview, `c` copy URL. |
| `wtfont code <name>` | Generate code. `--framework html\|nextjs\|nuxt\|react`. `c` to copy. |
| `wtfont preview <names...>` | Open specimen (1 font) or local compare HTML (2+). |
| `wtfont pair <name>` | Candidate pairing fonts. `p` to preview compare. |
| `wtfont scan [path]` | Audit local project font usage. |
| `wtfont browse <category>` | Browse Google Fonts. `p` preview, `f` add to favorites. |
| `wtfont history` | Recent analyses. `p` preview fonts, `d` delete. `--clear` to reset. |
| `wtfont favorites <add\|list\|remove>` | Bookmark fonts. `p` preview, `d` remove. |
| `wtfont init` | Interactive setup (theme + Playwright). |
| `wtfont config theme [name]` | Switch terminal theme. `--list` to see all. |
| `wtfont install-playwright` | Download Chromium for `--dynamic` (~150MB). |
| `wtfont mcp` | Start MCP stdio server. |

## Themes

7 built-in themes — 5 dark, 2 light:

| Theme | Type |
|---|---|
| `default` | Dark |
| `monochrome` | Dark |
| `solarized` | Dark |
| `catppuccin-mocha` | Dark |
| `dracula` | Dark |
| `catppuccin-latte` | Light |
| `rose-pine-dawn` | Light |

```bash
wtfont config theme catppuccin-latte   # switch theme
wtfont config theme --list             # see all themes
```

## Playwright / dynamic detection

Static parsing covers most SSR/MPA sites. For SPAs (React/Vue/Next CSR) where fonts load via JavaScript, use `--dynamic`:

```bash
wtfont analyze linear.app --dynamic
```

If Chromium isn't installed, wtfont will prompt to install it:

```
⚠ Dynamic detection requested but Chromium not found.
  Install now? (~150MB download)
  [y] Install and retry  [n] Continue with static
```

Or install ahead of time:

```bash
wtfont install-playwright
```

`playwright-core` is bundled with wtfont (auto-installed). Only the Chromium browser binary (~150MB) requires the extra step.

## How it works

Static parsing uses [cheerio](https://cheerio.js.org/) + [css-tree](https://github.com/csstree/csstree) to pull fonts from `<link>`, `@font-face`, `@import`, `font-family` rules, and inline styles.

Dynamic detection uses Playwright to launch Chromium, then collects fonts via `document.fonts`, `getComputedStyle`, and the Resource Timing API — cross-validating against what's actually loaded.

The Google Fonts DB (`src/core/google-fonts-db.ts`, 1,929 entries with original display names) is regenerated weekly by a GitHub Actions workflow that fetches `fonts.google.com/metadata/fonts` and opens a PR.

## Configuration

Stored at `~/.wtfont/`:

- `config.json` — theme, defaults
- `history.json` — recent analyses (last 100)
- `favorites.json` — bookmarked fonts

## Why no AI in the CLI?

The original wtfont used Gemini/OpenAI for font alternative matching. This CLI removes that:

- **MCP users** get better recommendations from Claude itself (Opus/Sonnet), with full conversational context
- **CLI-only users** get the raw Google Fonts DB match — and can pipe `--format json` into their own tooling

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
