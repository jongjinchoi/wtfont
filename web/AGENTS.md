# Web Agent Instructions

Follow the root project instructions in `../AGENTS.md`.

This directory is the Next.js marketing/docs site for wtfont. It is not the CLI or MCP runtime.

## Next.js Version

This project uses a recent Next.js version with breaking changes from older training data.
Before changing Next.js APIs, routing, metadata, font, image, or config behavior, verify the relevant local docs or existing code patterns first.

## Local Commands

- `bun run lint`
- `bun run build`
- `bun dev`

`next/font/google` requires network access during production builds.
