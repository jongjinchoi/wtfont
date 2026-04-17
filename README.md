<p align="center">
  <img src="https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/logo/icon.png" width="80" alt="wtfont">
</p>
<h1 align="center">wtfont</h1>
<p align="center">
  <a href="https://github.com/jongjinchoi/wtfont/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://github.com/jongjinchoi/wtfont"><img src="https://img.shields.io/github/stars/jongjinchoi/wtfont?style=social" alt="GitHub Stars"></a>
</p>
<p align="center">
  <strong>What the font is that website using?</strong>
</p>
<p align="center">
  Detect fonts, find free Google Fonts alternatives, and get copy-paste code<br>
  — from your terminal or through Claude.
</p>
<p align="center">
  <a href="#install">Install</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#mcp">MCP</a> ·
  <a href="#themes">Themes</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/demo.gif" width="600" /></p>

---

## Why

You find a beautifully typeset website. You want the same fonts. So you open DevTools, dig through CSS, google the font name, check if it's free — the flow breaks every time.

**wtfont fixes this.** One command. Fonts identified. Free alternatives suggested. Copy-paste code generated. Or let Claude do all of it through MCP.

## Features

- **Instant** — static parsing in ~1 second. Playwright for SPAs.
- **Offline DB** — 1,929 Google Fonts with correct display names. No API calls.
- **MCP native** — Claude Code, Claude Desktop, and Cursor can analyze fonts directly.
- **Keyboard-first** — vim-style j/k navigation. Analyze → code → copy without leaving.
- **Pipe-friendly** — `--format json` for scripting and CI.
- **Themeable** — 7 built-in themes (5 dark + 2 light).
- **Open source** — MIT. Zero telemetry. Everything local.

<h2 id="install">Install</h2>

```bash
npm install -g wtfont        # npm
bun install -g wtfont        # bun
pnpm add -g wtfont           # pnpm
```

No API keys required. No servers. Everything runs locally.

<h2 id="usage">Usage</h2>

```bash
wtfont analyze vercel.com                               # detect fonts
wtfont analyze linear.app --dynamic                     # JS-rendered sites
wtfont lookup Inter                                     # check Google Fonts DB
wtfont code Inter --framework nextjs --weights 400,700  # generate code
wtfont preview Inter "Plus Jakarta Sans" Manrope        # compare in browser
wtfont pair Inter                                       # suggest heading partners
wtfont scan                                             # audit current project
```

### Keyboard shortcuts

`wtfont analyze` acts as a hub — navigate results and take action without leaving:

| Key | Action |
|-----|--------|
| `j`/`k` or `↑`/`↓` | Move cursor |
| `c` | Code view for selected font (copy with `c` inside) |
| `enter` | Lookup view for selected font |
| `p` | Open preview in browser |
| `esc` | Back to list |
| `q` | Quit |

The same `j/k` navigation works in `browse`, `history`, and `favorites`.

### Analyze

Detect all fonts on a website. Navigate with `j/k`, drill into code or lookup inline.

```bash
wtfont analyze vercel.com
wtfont analyze vercel.com --format json          # pipe to jq
wtfont analyze linear.app --dynamic              # Playwright for SPAs
wtfont analyze slow-site.com --timeout 30        # custom timeout
```

<p align="center"><img src="https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/analyze.png" width="600" /></p>

### Lookup & Code

Check if a font is on Google Fonts. Generate copy-paste code for any framework.

```bash
wtfont lookup Inter            # free? category? specimen URL?
wtfont lookup "Söhne"          # commercial — suggests MCP for alternatives

wtfont code Inter --framework nextjs --weights 400,500,700
wtfont code "Proxima Nova" --framework html --role heading
```

<p align="center"><img src="https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/code.png" width="600" /></p>

### Pair & Preview

Suggest heading partners for a body font. Compare fonts side-by-side in your browser.

```bash
wtfont pair Inter                                    # suggest heading fonts
wtfont preview Inter Fraunces "Playfair Display"     # compare in browser
```

<p align="center"><img src="https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/pair.png" width="600" /></p>

### Scan

Audit your project for `font-family` usage. See which fonts are free and which are commercial.

```bash
wtfont scan                  # current directory
wtfont scan ./packages/ui    # specific path
```

<p align="center"><img src="https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/scan.png" width="600" /></p>

### Browse, History, Favorites

```bash
wtfont browse serif --limit 20    # browse Google Fonts by category
wtfont history                    # recent analyses (p preview, d delete)
wtfont favorites add Inter        # bookmark a font
wtfont favorites list             # view bookmarks (p preview, d remove)
```

### JSON output

```bash
wtfont analyze vercel.com --format json | jq '.fonts[] | select(.isFree == false) | .name'
```

<h2 id="mcp">MCP</h2>

wtfont runs as a local MCP server. Your AI assistant analyzes fonts without you switching context.

### Claude Code

```bash
# All projects (recommended)
claude mcp add --scope user --transport stdio wtfont -- npx -y wtfont mcp

# Current folder only
claude mcp add --transport stdio wtfont -- npx -y wtfont mcp
```

### Claude Desktop

Settings → Developer → Edit Config:

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

### Cursor

Settings → Tools & Integrations → New MCP Server (command type):

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

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

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

### VS Code (Cline)

Command Palette → `MCP: Add server` → stdio → `npx -y wtfont mcp`

---

**Tools:**

| Tool | Description |
|------|-------------|
| `extract_fonts` | Detect fonts on a website |
| `lookup_google_font` | Check Google Fonts DB |
| `list_google_fonts` | Browse fonts by category |
| `compare_fonts` | Compare multiple fonts |
| `pair_fonts` | Suggest pairing candidates |
| `generate_font_code` | Generate framework code |
| `preview_fonts` | Open visual comparison in browser |
| `scan_project_fonts` | Audit project font usage |

**Example: Find free alternatives**

```
You:    "What fonts does stripe.com use? Recommend free alternatives."

Claude: [calls extract_fonts → finds "sohne-var" (commercial)]
        [calls lookup_google_font → confirms not on Google Fonts]
        [suggests Inter, Space Grotesk, Manrope based on visual similarity]
        [calls preview_fonts → opens comparison in browser]

        "Stripe uses Söhne, a commercial geometric sans-serif.
        Inter is the closest free alternative (humanist proportions,
        similar x-height). Want me to generate Next.js code?"
```

**Example: Audit a project**

```
You:    "Scan this project and tell me which fonts are commercial."

Claude: [calls scan_project_fonts]

        "Found 2 fonts: Inter (free, Google Fonts) and Proxima Nova
        (commercial, used in 3 files). Consider replacing Proxima Nova
        with Plus Jakarta Sans — similar geometric style."
```

**Example: Font pairing**

```
You:    "Inter on body — suggest a heading font and show me side by side."

Claude: [calls pair_fonts → gets candidates]
        [calls preview_fonts → opens compare page]

        "Fraunces pairs well — classic serif/sans contrast.
        I opened a comparison in your browser. What do you think?"
```

All queries run locally. No data leaves your machine.

<h2 id="themes">Themes</h2>

7 built-in themes — 5 dark, 2 light. Switch with `wtfont config theme <name>`.

| | |
|---|---|
| ![Default](https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/theme-default.png) | ![Catppuccin Mocha](https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/theme-catppuccin-mocha.png) |
| ![Dracula](https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/theme-dracula.png) | ![Solarized](https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/theme-solarized.png) |
| ![Catppuccin Latte](https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/theme-catppuccin-latte.png) | ![Rose Pine Dawn](https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets/screenshots/theme-rose-pine-dawn.png) |

| Theme | Type |
|-------|------|
| **Default** | Dark |
| **Monochrome** | Dark |
| **Solarized** | Dark |
| **Catppuccin Mocha** | Dark |
| **Dracula** | Dark |
| **Catppuccin Latte** | Light |
| **Rose Pine Dawn** | Light |

## Playwright / dynamic detection

Static parsing covers most SSR/MPA sites. For SPAs where fonts load via JavaScript, use `--dynamic`:

```bash
wtfont analyze linear.app --dynamic
```

If Chromium isn't installed, wtfont prompts to install it:

```
⚠ Dynamic detection requested but Chromium not found.
  Install now? (~150MB download)
  [y] Install and retry  [n] Continue with static
```

Or install ahead of time:

```bash
wtfont install-playwright
```

## How it works

Static parsing uses [cheerio](https://cheerio.js.org/) + [css-tree](https://github.com/csstree/csstree) to extract fonts from `<link>`, `@font-face`, `@import`, `font-family`, and inline styles.

Dynamic detection launches Chromium via Playwright, then collects fonts via `document.fonts`, `getComputedStyle`, and the Resource Timing API — cross-validating against what's actually loaded.

The Google Fonts DB (1,929 entries with original display names) is auto-refreshed weekly by [GitHub Actions](.github/workflows/update-fonts-db.yml).

## Configuration

Stored at `~/.wtfont/`:

- `config.json` — theme, defaults
- `history.json` — recent analyses (last 100)
- `favorites.json` — bookmarked fonts

## Why no AI in the CLI?

The original wtfont used Gemini/OpenAI for font matching. This CLI removes that:

- **MCP users** get better recommendations from Claude itself, with full conversational context
- **CLI-only users** get the raw Google Fonts DB match — pipe `--format json` into your own tooling

Licensing: detecting a font does not grant a license to use it. Many web fonts are commercial software — always purchase a proper license before shipping.

## Contributing

```bash
git clone https://github.com/jongjinchoi/wtfont.git
cd wtfont
bun install
bun run src/index.ts analyze <url>    # run locally
bun run test:run                       # run tests
bun run update-db                      # refresh Google Fonts DB
```

Issues and pull requests are welcome.

## License

MIT — see [LICENSE](./LICENSE)

---

<p align="center">
  <strong>wtfont</strong> — what the font.
</p>
