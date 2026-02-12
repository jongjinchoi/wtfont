import React from "react";
import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";
import { Layout } from "../components/Layout";
import {
  colors,
  spacing,
  fonts,
  ASCII_LINES,
  DISCLAIMERS,
  EXAMPLE_SITES,
} from "../styles/theme";

const SPINNER = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
const TARGET_URL = "airbnb.com";

// Scene 1: HomePage (240 frames = 8s)
// Phase 1 (0-149): Boot sequence — 출처: src/app/page.tsx
// Phase 2 (150-239): URL typing + Enter — 출처: src/components/url-input.tsx
export const HomePage: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Phase 1: Boot sequence timing ──
  const showLine1 = frame >= 8; // $ ssh guest@wtfont.wtf
  const showLine2 = frame >= 18; // Connecting to wtfont.wtf...
  const showLine3 = frame >= 30; // + Connected (2ms)
  const showLine4 = frame >= 38; // [system] next 15.x | react 19.x | ai-powered
  const showLine5 = frame >= 46; // > home
  const showProgress = frame >= 52 && frame < 70;
  const showMotd = frame >= 70;
  const showUrlInput = frame >= 134;

  // Progress bar — page.tsx 188-215줄
  const progressPercent = showProgress
    ? Math.min(
        100,
        Math.round(
          interpolate(frame, [52, 68], [0, 100], {
            extrapolateRight: "clamp",
          })
        )
      )
    : 0;
  const progressBarTotal = 20;
  const progressFilled = Math.round(
    (progressPercent / 100) * progressBarTotal
  );
  const spinnerIdx = Math.floor(frame / 2) % SPINNER.length;

  // ASCII art (frame 76-115, 20 lines, 2 frames each) — page.tsx 104-107줄
  const asciiLineCount = Math.min(
    ASCII_LINES.length,
    frame >= 76 ? Math.floor((frame - 76) / 2) + 1 : 0
  );

  // Disclaimer (frame 118-130, 5 items, 3 frames each) — page.tsx 278-295줄
  const disclaimerCount = Math.min(
    DISCLAIMERS.length,
    frame >= 118 ? Math.floor((frame - 118) / 3) + 1 : 0
  );

  // ── Phase 2: Typing ──
  const typingFrame = frame - 150;
  const charsTyped =
    typingFrame >= 0
      ? Math.min(Math.floor(typingFrame / 3), TARGET_URL.length)
      : 0;
  const typedText = TARGET_URL.substring(0, charsTyped);
  const isDoneTyping = charsTyped >= TARGET_URL.length;

  // Cursor blink (1s cycle = 30 frames, step-end) — globals.css 63-66줄
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  // Boot cursor: before URL input appears — page.tsx 318-322줄
  const showBootCursor = frame < 134 && cursorBlink;

  // URL input cursor — url-input.tsx 73-78줄
  const urlCursorVisible =
    showUrlInput && (isDoneTyping ? cursorBlink : true);

  // Highlight "airbnb.com" in examples after typing complete
  const highlightAirbnb = isDoneTyping;

  return (
    <>
      <Layout mainPaddingTop={spacing.section}>
        {/* Line 1: $ ssh guest@wtfont.wtf — page.tsx 142-148줄 */}
        {showLine1 && (
          <div
            style={{
              paddingTop: spacing.line,
              paddingBottom: spacing.line,
            }}
          >
            <span style={{ color: colors.success }}>$</span>
            <span style={{ color: colors.terminalText, marginLeft: 8 }}>
              ssh guest@wtfont.wtf
            </span>
          </div>
        )}

        {/* Line 2: Connecting... — page.tsx 152-156줄 */}
        {showLine2 && (
          <div
            style={{
              color: colors.terminalSubtle,
              paddingTop: spacing.line,
              paddingBottom: spacing.line,
            }}
          >
            Connecting to wtfont.wtf...
          </div>
        )}

        {/* Line 3: + Connected (2ms) — page.tsx 161-165줄 */}
        {showLine3 && (
          <div
            style={{
              color: colors.success,
              paddingTop: spacing.line,
              paddingBottom: spacing.line,
            }}
          >
            <span style={{ marginRight: 6 }}>+</span>
            Connected (2ms)
          </div>
        )}

        {/* Line 4: [system] — page.tsx 170-174줄 */}
        {showLine4 && (
          <div
            style={{
              color: colors.terminalSubtle,
              paddingTop: spacing.line,
              paddingBottom: spacing.line,
            }}
          >
            [system] next 15.x | react 19.x | ai-powered
          </div>
        )}

        {/* Line 5: > home — page.tsx 179-183줄: text-terminal-muted py-line pt-8 */}
        {showLine5 && (
          <div
            style={{
              color: colors.terminalMuted,
              paddingTop: 32,
              paddingBottom: spacing.line,
            }}
          >
            &gt; home
          </div>
        )}

        {/* Progress bar — page.tsx 188-215줄 */}
        {showProgress && (
          <div
            style={{
              paddingTop: spacing.line,
              paddingBottom: spacing.line,
            }}
          >
            <span style={{ color: colors.brand }}>
              {SPINNER[spinnerIdx]}
            </span>
            <span style={{ color: colors.terminalMuted, marginLeft: 8 }}>
              Loading assets...
            </span>
            <span style={{ marginLeft: 12 }}>
              <span style={{ color: colors.brand }}>
                {"\u2588".repeat(progressFilled)}
              </span>
              <span style={{ color: colors.terminalSubtle }}>
                {"\u2591".repeat(progressBarTotal - progressFilled)}
              </span>
            </span>
            <span style={{ color: colors.terminalSubtle, marginLeft: 8 }}>
              {progressPercent}%
            </span>
          </div>
        )}

        {/* MOTD box — page.tsx 229-234줄: my-2 px-4 py-2.5 border border-brand rounded inline-block */}
        {showMotd && (
          <div
            style={{
              marginTop: 8,
              marginBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 10,
              paddingBottom: 10,
              border: `1px solid ${colors.brand}`,
              borderRadius: 4,
              display: "inline-block",
            }}
          >
            <span style={{ color: colors.brand, marginRight: 8 }}>*</span>
            <span style={{ color: colors.terminalText }}>
              Analyze any website's fonts. Find free alternatives. Get
              copy-paste code.
            </span>
          </div>
        )}

        {/* ASCII art — page.tsx 238-272줄: 각 문자를 개별 span으로 렌더링 (254-268줄) */}
        {asciiLineCount > 0 && (
          <div
            style={{
              marginTop: spacing.section,
              fontSize: 16,
              lineHeight: 1.2,
              overflow: "hidden",
              userSelect: "none",
            }}
          >
            {ASCII_LINES.slice(0, asciiLineCount).map((line, li) => (
              <div key={li} style={{ whiteSpace: "nowrap" }}>
                {[...line].map((char, ci) => (
                  <span
                    key={ci}
                    style={{
                      display: "inline-block",
                      width: "1ch",
                      textAlign: "center",
                      fontFamily: "monospace",
                      color: colors.brand,
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer — page.tsx 277-295줄: mt-section space-y-1 */}
        {disclaimerCount > 0 && (
          <div
            style={{
              marginTop: spacing.section,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {DISCLAIMERS.slice(0, disclaimerCount).map((msg, i) => (
              <div
                key={i}
                style={{
                  paddingTop: spacing.line,
                  paddingBottom: spacing.line,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    color:
                      msg.tag === "warn" ? colors.warning : colors.info,
                  }}
                >
                  [{msg.tag}]
                </span>
                <span
                  style={{ color: colors.terminalSubtle, marginLeft: 8 }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* URL Input — url-input.tsx 48-110줄 */}
        {showUrlInput && (
          <div style={{ paddingTop: spacing.section }}>
            {/* Input line — url-input.tsx 52-80줄 */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ color: colors.success }}>
                guest@wtfont:~$
              </span>
              <span
                style={{ color: colors.terminalMuted, marginLeft: 8 }}
              >
                wtfont analyze
              </span>
              <span
                style={{ color: colors.terminalText, marginLeft: 8 }}
              >
                {typedText}
              </span>
              {urlCursorVisible && (
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 20,
                    backgroundColor: colors.brand,
                    marginLeft: 2,
                  }}
                />
              )}
            </div>

            {/* Try: examples — url-input.tsx 89-108줄 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                fontSize: 12,
              }}
            >
              <span style={{ color: colors.terminalSubtle }}>try:</span>
              {EXAMPLE_SITES.map((site, i) => (
                <React.Fragment key={site}>
                  <span
                    style={{
                      color:
                        highlightAirbnb && site === TARGET_URL
                          ? colors.brand
                          : colors.terminalSubtle,
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                      textDecorationColor: colors.terminalDim,
                    }}
                  >
                    {site}
                  </span>
                  {i < EXAMPLE_SITES.length - 1 && (
                    <span style={{ color: colors.terminalDim }}>
                      &middot;
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Boot cursor — page.tsx 318-322줄: w-2 h-4 bg-brand animate-blink */}
        {showBootCursor && (
          <div style={{ paddingTop: spacing.line }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 16,
                backgroundColor: colors.brand,
              }}
            />
          </div>
        )}
      </Layout>

    </>
  );
};
