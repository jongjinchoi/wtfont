# wtfont Website

This directory contains the Next.js marketing/docs site for wtfont.

The runtime CLI and MCP server live in the repository root under `src/`. This web app presents the product, install paths, MCP setup examples, screenshots, SEO metadata, and static routes such as `llms.txt`, `robots.txt`, and `sitemap.xml`.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Bun

## Commands

```bash
bun dev
bun run lint
bun run build
bun start
```

Production builds use `next/font/google` for Inter and JetBrains Mono, so `bun run build` needs network access to fetch Google Fonts during the build.

## Structure

- `app/page.tsx` — single-page marketing/docs route with JSON-LD
- `app/layout.tsx` — metadata, Google fonts, and interface boot script
- `app/llms.txt/route.ts` — static LLM-readable project summary
- `components/` — page sections and interactive interface toggle
- `lib/content.ts` — display content, links, screenshots, and command snippets
- `lib/site.ts` — canonical site metadata

## Notes

The MCP/CLI interface toggle stores the selected view in `localStorage` under `wtfont-interface:v1` and mirrors it in the URL hash. The layout includes a small pre-hydration script to set `html[data-interface]` before React hydrates, preventing the inactive view from flashing on first paint.
