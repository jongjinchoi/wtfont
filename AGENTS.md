# wtfont Agent Instructions

## Communication

- 대화는 한국어 존댓말로 한다.
- 코드 주석은 기존 파일 스타일을 따르되, 새 주석은 영어를 선호한다.
- 추측으로 보고하지 말고 실제 파일과 명령 출력에 근거해 답한다.

## Project Shape

wtfont는 CLI + MCP 도구다. 중앙집중 웹 서비스가 아니다.

- CLI entry: `src/index.ts`
- MCP entry: `src/mcp/server.ts`
- Core logic: `src/core/`
- TUI views: `src/tui/`
- Config storage: `~/.wtfont/{config,history,favorites}.json`
- npm build output: `dist/npm/index.js`
- Website: `web/` Next.js marketing/docs site

Core pipeline code must stay independent from Next.js and the web app.

## Commands

Root package:

- `bun test`
- `bun run test:run`
- `bun run build:npm`
- `bun run test:integration`
- `bun run update-db`

Web package:

- `cd web && bun run lint`
- `cd web && bun run build`
- `cd web && bun dev`

When verifying web builds, remember that `next/font/google` needs network access to fetch Google Fonts during build.

## Implementation Rules

- Keep changes minimal and scoped.
- Read the relevant code before changing behavior.
- Do not apply temporary fixes when the root cause is discoverable.
- Do not introduce OpenAI, Gemini, or other AI SDK calls into CLI/server code.
- MCP alternative recommendations are performed by the calling model through server instructions, not by wtfont itself.
- Do not manually edit generated Google Fonts entries in `src/core/google-fonts-db.ts`.
- Regenerate the font DB with `bun run update-db`.
- Preserve SSRF protections in `src/core/url-guard.ts` and Playwright request guarding in `src/core/playwright-extract.ts`.
- Preserve stdio-only MCP transport discipline. Do not write stray stdout logs from MCP server code.

## Playwright

`playwright-core` is imported dynamically in `src/core/playwright-extract.ts`.
Dynamic detection should fail gracefully when the library or browser binary is unavailable.

## Tests And Verification

Before reporting code changes as complete, run the smallest relevant verification command.
For release-impacting or MCP changes, also run:

- `bun test`
- `bun run build:npm`
- `bun run test:integration`

For web changes, run:

- `cd web && bun run lint`
- `cd web && bun run build`

## Existing Worktree

The repository may contain user changes.
Do not revert or overwrite unrelated changes unless explicitly requested.
