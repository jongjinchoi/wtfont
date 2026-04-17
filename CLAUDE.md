# Project Rules

> **필수**: 공통 개발 규칙은 `~/.claude/CLAUDE.md`를 반드시 참고할 것.

## Communication
- 한국어 존댓말을 사용할 것. 반말 금지.

## Architecture

wtfont는 CLI + MCP 도구다. 중앙집중 웹 서비스가 아니다.

- **CLI 진입**: `src/index.ts` — commander 기반
- **MCP 진입**: `src/mcp/server.ts` — stdio transport, 도구 8개
- **비즈니스 로직**: `src/core/` (파이프라인은 순수 함수, Next.js 의존 없음)
- **TUI 뷰**: `src/tui/` — ink + react
- **설정 저장소**: `~/.wtfont/{config,history,favorites}.json`
- **빌드**: `bun run build-npm.ts` → `dist/npm/index.js` (Node 타깃 ESM)

## Git 커밋
- Co-Authored-By 트레일러 절대 추가 금지
- 커밋 메시지에 Claude 관련 attribution 포함하지 않기

## AI 정책

CLI/서버 코드에는 AI 호출이 없다. MCP를 통한 대안 추천은 Claude가 직접 수행한다 (서버 `instructions` 필드 참고). Gemini/OpenAI SDK를 다시 추가하지 말 것.

## Google Fonts DB

`src/core/google-fonts-db.ts`는 auto-generated. 수동으로 엔트리 추가/수정 금지.
갱신: `bun run update-db` 또는 주간 GitHub Actions(`update-fonts-db.yml`).

## Playwright

`playwright-core`는 optional peer dependency. `src/core/playwright-extract.ts`는 런타임에 dynamic import — 미설치 환경에서 import 실패 시 null 반환해야 한다.
