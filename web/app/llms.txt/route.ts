import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const body = `# wtfont

> Identify any web font from your terminal or through Claude via MCP.

wtfont is a CLI + MCP tool that detects fonts on any website, cross-references them against the Google Fonts database, and generates copy-paste code for HTML, Next.js, Nuxt, or React.

## Two interfaces

- **CLI** — \`npm install -g wtfont\`, then \`wtfont analyze <url>\`.
- **MCP server** — \`npx -y wtfont mcp\` under Claude Desktop / Claude Code / Cursor / Windsurf / VS Code. Lets Claude answer font questions conversationally.

## Key capabilities

- \`wtfont analyze <url>\` — list every font on a site with its role, source, weights, and license.
- \`wtfont code <font> --framework <stack>\` — copy-paste snippet with preconnect, weights, fallback.
- \`wtfont pair <font>\` — heading partner suggestions from Google Fonts.
- \`wtfont scan\` — audit fonts across a local project, flag commercial ones.

## How it works

Static parsing in ~1 second. Playwright for single-page apps when needed. Google Fonts DB is auto-updated weekly.

## Trust

MIT-licensed. Zero telemetry. stdio-only MCP transport (no HTTP listener). SSRF-guarded URL fetcher. Provenance-signed npm releases.

## Resources

- Website: ${SITE_URL}
- GitHub: https://github.com/jongjinchoi/wtfont
- npm: https://www.npmjs.com/package/wtfont
- License: https://github.com/jongjinchoi/wtfont/blob/main/LICENSE
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
