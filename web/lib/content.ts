export const SITE = {
  repo: "https://github.com/jongjinchoi/wtfont",
  npm: "https://www.npmjs.com/package/wtfont",
  license: "https://github.com/jongjinchoi/wtfont/blob/main/LICENSE",
  security: "https://github.com/jongjinchoi/wtfont#security",
  assetsBase:
    "https://raw.githubusercontent.com/jongjinchoi/wtfont/main/assets",
};

export const IMG = {
  logo: `${SITE.assetsBase}/logo/icon.png`,
  demo: `${SITE.assetsBase}/screenshots/demo.gif`,
  analyze: `${SITE.assetsBase}/screenshots/analyze.png`,
  code: `${SITE.assetsBase}/screenshots/code.png`,
  pair: `${SITE.assetsBase}/screenshots/pair.png`,
  scan: `${SITE.assetsBase}/screenshots/scan.png`,
  themeMonochrome: `${SITE.assetsBase}/screenshots/theme-monochrome.png`,
  themeMocha: `${SITE.assetsBase}/screenshots/theme-catppuccin-mocha.png`,
  themeDracula: `${SITE.assetsBase}/screenshots/theme-dracula.png`,
  themeSolarized: `${SITE.assetsBase}/screenshots/theme-solarized.png`,
  themeLatte: `${SITE.assetsBase}/screenshots/theme-catppuccin-latte.png`,
  themeRosePineDawn: `${SITE.assetsBase}/screenshots/theme-rose-pine-dawn.png`,
};

export const MCP_CONFIG_JSON = `{
  "mcpServers": {
    "wtfont": {
      "command": "npx",
      "args": ["-y", "wtfont", "mcp"]
    }
  }
}`;

export type McpExample = {
  title: string;
  question: string;
  trace: string;
  reply: string;
};

export const MCP_EXAMPLES: McpExample[] = [
  {
    title: "Find free alternatives",
    question:
      '"What fonts does stripe.com use? Recommend free alternatives."',
    trace: "→ extract_fonts → lookup_google_font → preview_fonts",
    reply:
      '"Stripe uses Söhne, a commercial geometric sans-serif. Inter is the closest free alternative (humanist proportions, similar x-height). Want me to generate Next.js code?"',
  },
  {
    title: "Audit a project",
    question:
      '"Scan this project and tell me which fonts are commercial."',
    trace: "→ scan_project_fonts",
    reply:
      '"Found 2 fonts: Inter (free) and Proxima Nova (commercial, used in 3 files). Consider replacing Proxima Nova with Plus Jakarta Sans — similar geometric style."',
  },
  {
    title: "Pair fonts",
    question:
      '"Inter on body — suggest a heading font and show me side by side."',
    trace: "→ pair_fonts → preview_fonts",
    reply:
      '"Fraunces pairs well — classic serif/sans contrast. I opened a comparison in your browser. What do you think?"',
  },
];

export type McpTool = { name: string; desc: string };

export const MCP_TOOLS: McpTool[] = [
  { name: "extract_fonts", desc: "detect fonts on a website" },
  { name: "lookup_google_font", desc: "Google Fonts DB check" },
  { name: "list_google_fonts", desc: "browse by category" },
  { name: "compare_fonts", desc: "side-by-side" },
  { name: "pair_fonts", desc: "heading suggestions" },
  { name: "generate_font_code", desc: "framework code" },
  { name: "preview_fonts", desc: "open in browser" },
  { name: "scan_project_fonts", desc: "audit usage" },
];

export type FeatureRow = {
  tag: string;
  title: string;
  body: string;
  code: string;
  img: string;
  reverse?: boolean;
};

export const FEATURE_ROWS: FeatureRow[] = [
  {
    tag: "analyze",
    title: "Detect every font on a site",
    body: "Static parsing in ~1 second. Playwright for SPAs when you need it. Each font shows its role, source, weights, and whether it's free.",
    code: "wtfont analyze vercel.com",
    img: IMG.analyze,
  },
  {
    tag: "code",
    title: "Copy-paste code for your stack",
    body: "Pick a font. Get a snippet for html, nextjs, nuxt, or react — weights, fallback, and import included.",
    code: "wtfont code Inter --framework nextjs",
    img: IMG.code,
    reverse: true,
  },
  {
    tag: "pair",
    title: "Heading partners for your body font",
    body: "Curated Google Fonts candidates with a reason for each. Open a side-by-side compare page in your browser.",
    code: "wtfont pair Inter",
    img: IMG.pair,
  },
  {
    tag: "scan",
    title: "Audit the fonts in your project",
    body: "Walks your repo and finds every font-family usage. See which are free, which are commercial, and where they live.",
    code: "wtfont scan",
    img: IMG.scan,
    reverse: true,
  },
];

export type Theme = { name: string; img: string };

export const THEMES: Theme[] = [
  { name: "monochrome", img: IMG.themeMonochrome },
  { name: "catppuccin-mocha", img: IMG.themeMocha },
  { name: "dracula", img: IMG.themeDracula },
  { name: "solarized", img: IMG.themeSolarized },
  { name: "catppuccin-latte", img: IMG.themeLatte },
  { name: "rose-pine-dawn", img: IMG.themeRosePineDawn },
];

export const KEYBOARD_SHORTCUTS: { key: string; action: string }[] = [
  { key: "j/k or ↑/↓", action: "Move cursor" },
  { key: "c", action: "Code view for selected font (copy with c inside)" },
  { key: "enter", action: "Lookup view for selected font" },
  { key: "p", action: "Open preview in browser" },
  { key: "esc", action: "Back to list" },
  { key: "q", action: "Quit" },
];

export const SECURITY_BULLETS = [
  {
    icon: "IO",
    title: "stdio only",
    body: "No HTTP listener, no network port, no cross-process access.",
  },
  {
    icon: "SS",
    title: "https-only",
    body: "Refuses plain http://, including at every redirect hop. SSRF guard validates every URL against private and reserved ranges.",
  },
  {
    icon: "✓",
    title: "Provenance signed",
    body: "Every release tarball is cryptographically signed via GitHub Actions. Verify with `npm audit signatures`.",
  },
];
