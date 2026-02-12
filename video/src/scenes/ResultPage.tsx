import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Layout } from "../components/Layout";
import { FontCard } from "../components/FontCard";
import { colors, fonts, AIRBNB_DATA } from "../styles/theme";

// 결과 페이지 로그 시퀀스 — 출처: src/app/r/[slug]/result-client.tsx 49-115줄
const LOG_LINES = [
  { text: `wtfont analyze ${AIRBNB_DATA.domain}`, type: "command" as const, frame: 0 },
  { text: `Connecting to ${AIRBNB_DATA.domain}...`, type: "info" as const, frame: 12 },
  { text: "Connected", type: "success" as const, frame: 30 },
  { text: "Parsing CSS & finding fonts...", type: "info" as const, frame: 48 },
  { text: "Matching free alternatives...", type: "info" as const, frame: 66 },
  { text: `Found ${AIRBNB_DATA.fontCount} fonts (847ms)`, type: "success" as const, frame: 84 },
  { text: "Analysis complete", type: "success" as const, frame: 90 },
];

// Scene 2: ResultPage (480 frames = 16s)
// Phase 3 (0-119): Terminal log — result-client.tsx
// Phase 4 (120-479): Results + scroll — result-client.tsx
export const ResultPage: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 3: Log sequence
  const lastLogFrame = LOG_LINES[LOG_LINES.length - 1].frame;
  const allLogsDone = frame > lastLogFrame + 5;
  const showResults = frame >= 120;

  // Loading cursor — result-client.tsx 211-213줄: w-2 h-4 bg-terminal-text animate-blink
  const showLoadingCursor =
    !allLogsDone && Math.floor(frame / 15) % 2 === 0;

  // Phase 4: Results fade-in
  const summaryOpacity = showResults
    ? interpolate(frame, [120, 135], [0, 1], {
        extrapolateRight: "clamp",
      })
    : 0;

  const card1Opacity = showResults
    ? interpolate(frame, [150, 165], [0, 1], {
        extrapolateRight: "clamp",
      })
    : 0;

  const card2Opacity = showResults
    ? interpolate(frame, [200, 215], [0, 1], {
        extrapolateRight: "clamp",
      })
    : 0;

  // Scroll animation: card 2 fully visible at frame 215, start scroll at 240
  // 240→460 = 220 frames (7.3s), comfortable reading pace
  // 콘텐츠 전체 높이 ~3500px, 뷰포트 ~940px → 스크롤 필요 ~2600px
  const scrollY = interpolate(frame, [240, 460], [0, 2700], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  // Blinking cursor for bottom UrlInput — url-input.tsx 73-78줄
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <Layout domain={AIRBNB_DATA.domain} mainPaddingTop={32}>
      {/* Scrollable content wrapper */}
      <div style={{ transform: `translateY(-${scrollY}px)` }}>
      {/* space-y-8 = gap 32px — result-client.tsx 180줄 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Terminal log — result-client.tsx 182-213줄: space-y-1 font-mono text-sm */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontFamily: fonts.mono,
            fontSize: 14,
          }}
        >
          {LOG_LINES.filter((log) => frame >= log.frame).map((log, i) => (
            <div key={i}>
              {/* command — result-client.tsx 189-192줄: $ = brand(주황!), text = terminal-text */}
              {log.type === "command" && (
                <span style={{ color: colors.terminalText }}>
                  <span style={{ color: colors.brand }}>$</span>{" "}
                  {log.text}
                </span>
              )}
              {/* info — result-client.tsx 194-196줄: text-terminal-link */}
              {log.type === "info" && (
                <span style={{ color: colors.terminalLink }}>
                  {log.text}
                </span>
              )}
              {/* success — result-client.tsx 197-201줄: text-success, + prefix mr-1 */}
              {log.type === "success" && (
                <span style={{ color: colors.success }}>
                  <span style={{ marginRight: 4 }}>+</span>
                  {log.text}
                </span>
              )}
            </div>
          ))}
          {/* Loading cursor — result-client.tsx 211-213줄 */}
          {showLoadingCursor && (
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 16,
                backgroundColor: colors.terminalText,
                marginTop: 4,
              }}
            />
          )}
        </div>

        {/* Results section — result-client.tsx 230-277줄: space-y-6 */}
        {showResults && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {/* Summary — result-client.tsx 233-259줄 */}
            <div style={{ opacity: summaryOpacity }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                {/* Left: domain/fonts/date — text-sm font-mono space-y-1 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    fontSize: 14,
                    fontFamily: fonts.mono,
                  }}
                >
                  <div>
                    <span style={{ color: colors.terminalLink }}>
                      domain:{" "}
                    </span>
                    <span style={{ color: colors.brand }}>
                      {AIRBNB_DATA.domain}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: colors.terminalLink }}>
                      fonts:{" "}
                    </span>
                    <span style={{ color: colors.terminalText }}>
                      {AIRBNB_DATA.fontCount} detected
                    </span>
                  </div>
                  <div>
                    <span style={{ color: colors.terminalLink }}>
                      date:{" "}
                    </span>
                    <span style={{ color: colors.terminalText }}>
                      {AIRBNB_DATA.analyzedAt}
                    </span>
                  </div>
                </div>

                {/* Right: Share button — share-button.tsx 33-58줄 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontFamily: fonts.mono,
                  }}
                >
                  <span style={{ color: colors.terminalLink }}>
                    Share ↗
                  </span>
                  <span style={{ color: colors.terminalDim }}>|</span>
                  <span style={{ color: colors.terminalLink }}>
                    Copy link
                  </span>
                </div>
              </div>
            </div>

            {/* Font Cards — result-client.tsx 262-270줄 */}
            {AIRBNB_DATA.fonts.map((font, i) => (
              <FontCard
                key={i}
                font={font}
                index={i}
                opacity={i === 0 ? card1Opacity : card2Opacity}
              />
            ))}

            {/* Analyze another site — result-client.tsx 272-275줄 */}
            <div
              style={{
                paddingTop: 16,
                borderTop: `1px solid ${colors.terminalBorder}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ color: colors.success, userSelect: "none" }}>
                  guest@wtfont:~$
                </span>
                <span
                  style={{
                    color: colors.terminalMuted,
                    marginLeft: 8,
                    userSelect: "none",
                  }}
                >
                  wtfont analyze
                </span>
                {/* Blinking cursor — url-input.tsx 73-78줄: w-2 h-5 bg-brand animate-blink */}
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 20,
                    backgroundColor: colors.brand,
                    marginLeft: 8,
                    opacity: cursorVisible ? 1 : 0,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};
