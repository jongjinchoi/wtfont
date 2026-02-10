# WTFont.wtf

웹사이트에서 사용 중인 폰트를 감지하고, 무료 대안 폰트를 찾아주는 분석 도구.

## 주요 기능

- **폰트 감지** — URL을 입력하면 CSS 정적 파싱 + Playwright 동적 렌더링을 병렬로 실행하여 폰트를 추출
- **AI 매칭** — Gemini 2.0 Flash (1순위) / GPT-4o mini (폴백)로 무료 Google Fonts 대안을 추천
- **코드 생성** — HTML, Next.js, Nuxt, React 프레임워크별 복사 가능한 코드 스니펫 제공
- **Google Fonts DB** — 1,911개 Google Fonts 로컬 데이터베이스로 AI 없이도 무료 폰트 즉시 식별
- **제휴 마케팅** — 유료 폰트에 대한 Fontspring/MyFonts 구매 링크 (CJ Affiliate)
- **캐시** — Upstash Redis 14일 TTL, URL → slug 매핑으로 결과 페이지 공유 가능
- **Pre-warm** — GitHub Actions 크론으로 14일마다 인기 URL 캐시 갱신

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15, React 19, TypeScript |
| 스타일링 | Tailwind CSS 3.4, Geist 폰트 (Sans/Mono/Pixel Square) |
| CSS 파싱 | cheerio + css-tree |
| 동적 렌더링 | Playwright 마이크로서비스 (Fastify, Docker) |
| AI | Google GenAI SDK (Gemini), OpenAI SDK (GPT-4o mini) |
| 캐시/레이트리밋 | Upstash Redis + Ratelimit |
| 분석 | Plausible Analytics |
| 배포 | Vercel (Next.js) + Railway (Playwright 서비스) |
| 테스트 | Vitest |

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # POST /api/analyze — 메인 분석 API
│   │   └── track/route.ts      # POST /api/track — 이벤트 트래킹 (Plausible)
│   ├── r/[slug]/               # 결과 페이지 (SSR + Client)
│   │   ├── page.tsx            # RSC — 캐시 조회 + 메타데이터
│   │   ├── result-client.tsx   # 클라이언트 — 분석 UI + 폰트 카드
│   │   ├── opengraph-image.tsx # 동적 OG 이미지
│   │   ├── loading.tsx         # 로딩 스켈레톤
│   │   ├── error.tsx           # 에러 바운더리
│   │   └── not-found.tsx       # 404
│   ├── page.tsx                # 홈 — 터미널 부팅 시퀀스 UI
│   ├── layout.tsx              # 루트 레이아웃 + ThemeProvider
│   ├── robots.ts               # robots.txt (AI 크롤러 차단)
│   └── sitemap.ts              # 동적 사이트맵 (Redis 캐시 기반)
├── components/
│   ├── font-card.tsx           # 폰트 분석 결과 카드
│   ├── font-card-free-section.tsx   # 무료 대안 섹션
│   ├── font-card-premium-section.tsx # 유료 구매 섹션
│   ├── font-preview.tsx        # 폰트 미리보기 (편집 가능)
│   ├── framework-tabs.tsx      # 프레임워크별 코드 탭
│   ├── code-block.tsx          # 코드 블록 + 복사
│   ├── copy-button.tsx         # 복사 버튼
│   ├── share-button.tsx        # 공유 (Twitter + 링크 복사)
│   ├── url-input.tsx           # URL 입력 폼
│   ├── header.tsx              # 헤더 (macOS 윈도우 스타일)
│   ├── footer.tsx              # 푸터
│   ├── theme-provider.tsx      # next-themes 래퍼
│   ├── theme-toggle.tsx        # 다크/라이트 토글
│   └── ui/                     # 기본 UI 컴포넌트 (Badge, Button, Card, Skeleton, Tabs)
├── lib/
│   ├── font-parser.ts          # CSS 정적 파싱 (cheerio + css-tree)
│   ├── playwright-client.ts    # Playwright 서비스 클라이언트
│   ├── font-merge.ts           # 정적/동적 결과 병합
│   ├── ai-matcher.ts           # AI 폰트 매칭 (Gemini → OpenAI 폴백)
│   ├── ai-prompt.ts            # AI 프롬프트 + Zod 스키마
│   ├── google-fonts-db.ts      # 1,911개 Google Fonts 로컬 DB
│   ├── system-fonts.ts         # 시스템 폰트 필터링 목록
│   ├── cache.ts                # Redis 캐시 (React.cache 래핑)
│   ├── rate-limiter.ts         # IP 기반 레이트리밋 (10회/일)
│   ├── code-templates.ts       # 프레임워크별 코드 생성기
│   ├── url-utils.ts            # URL 정규화/검증/슬러그
│   ├── affiliate.ts            # 제휴 URL 빌더 (Fontspring/MyFonts)
│   └── track.ts                # 클라이언트 이벤트 트래킹
└── types/
    ├── font.ts                 # ExtractedFont, MatchedFont, AnalysisResult
    └── api.ts                  # API 요청/응답 타입

services/playwright/            # Playwright 마이크로서비스 (별도 배포)
├── src/
│   ├── server.ts               # Fastify 서버 (POST /extract, GET /health)
│   ├── extract-fonts.ts        # 브라우저 내 폰트 추출 로직
│   └── browser-pool.ts         # 브라우저 인스턴스 풀
├── Dockerfile                  # mcr.microsoft.com/playwright 기반
└── package.json

scripts/
├── pre-warm.ts                 # 캐시 Pre-warm 스크립트
└── pre-warm-urls.ts            # Pre-warm 대상 URL 목록

.github/workflows/
└── pre-warm.yml                # 14일마다 캐시 갱신 크론
```

## 분석 파이프라인

```
URL 입력
  ↓
POST /api/analyze
  ↓
레이트리밋 확인 (10회/일/IP)
  ↓
Redis 캐시 확인 → 히트 시 즉시 반환
  ↓
[병렬 실행]
├── CSS 정적 파싱 (cheerio + css-tree)
│   ├── Google Fonts <link> 태그
│   ├── @import 규칙
│   ├── @font-face 선언
│   ├── font-family 사용처 + 셀렉터
│   └── 인라인 스타일
└── Playwright 동적 렌더링
    ├── document.fonts API
    ├── computedStyle 분석
    └── 폰트 리소스 URL 감지
  ↓
결과 병합 (중복 제거, 소스/역할 우선순위 적용)
  ↓
AI 매칭 (Gemini → OpenAI 폴백)
  ├── 무료 Google Fonts 대안 추천
  ├── 유사도 점수 (0-100)
  └── 유료 폰트 구매 링크
  ↓
제휴 ID 주입 (Fontspring/MyFonts)
  ↓
Redis 캐시 저장 (after() 비차단)
  ↓
응답 반환
```

## 환경변수

```bash
# AI 제공자 (최소 하나 필요)
GEMINI_API_KEY=                  # Google Gemini API 키
OPENAI_API_KEY=                  # OpenAI API 키 (폴백)

# Upstash Redis (캐시 + 레이트리밋)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# 분석
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=wtfont.wtf

# 제휴 마케팅 (CJ Affiliate)
FONTSPRING_AFFILIATE_ID=
MYFONTS_AFFILIATE_ID=

# Playwright 서비스
PLAYWRIGHT_SERVICE_URL=          # Railway 배포 URL
PLAYWRIGHT_SERVICE_SECRET=       # Bearer 토큰

# Pre-warm
PREWARM_SECRET=                  # 레이트리밋 우회용
```

## 시작하기

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 편집

# 개발 서버 (포트 3100)
pnpm dev

# 타입 체크
npx tsc --noEmit

# 테스트
pnpm test:run

# 빌드
pnpm build
```

## Playwright 서비스

Playwright 마이크로서비스는 별도로 배포합니다. JS로 동적 렌더링되는 폰트를 감지하기 위해 실제 브라우저를 사용합니다.

```bash
cd services/playwright

# 개발
npm run dev

# Docker 빌드
docker build -t wtfont-playwright .
docker run -p 3200:3200 -e SERVICE_SECRET=your-secret wtfont-playwright
```

## 레이트리밋

- IP 기반 고정 윈도우: **10회/일**
- Pre-warm 요청은 `x-prewarm-secret` 헤더로 레이트리밋 우회
- Redis 미설정 시 레이트리밋 비활성화

## 라이선스

Private
