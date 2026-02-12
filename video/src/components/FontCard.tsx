import React from "react";
import { colors, fonts, type FontData } from "../styles/theme";

// ── 출처: src/components/font-card.tsx 15-20줄 ──
const ROLE_LABELS: Record<string, string> = {
  heading: "Heading",
  body: "Body",
  display: "Display",
  monospace: "Monospace",
};

// ── 출처: src/components/font-card-free-section.tsx 3-7줄 ──
function scoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.error;
}

// ── 출처: src/lib/code-templates.ts ──
function toFileName(name: string): string {
  return name.replace(/\s+/g, "");
}

function roleToSelector(role: string): string {
  const map: Record<string, string> = {
    heading: "h1, h2, h3",
    body: "body, p",
    display: ".display, .hero-title",
    monospace: "code, pre",
  };
  return map[role] || "body";
}

function weightToLabel(weight: string): string {
  const map: Record<string, string> = {
    "100": "Thin",
    "200": "ExtraLight",
    "300": "Light",
    "400": "Regular",
    "500": "Medium",
    "600": "SemiBold",
    "700": "Bold",
    "800": "ExtraBold",
    "900": "Black",
  };
  return map[weight] || "Regular";
}

function generateCssUsageCode(font: FontData): string {
  const selector = roleToSelector(font.role);
  return `${selector} {\n  font-family: '${font.originalName}', ${font.fallback};\n}`;
}

function generateFreeImportCode(font: FontData): string {
  if (!font.googleFontsUrl) return "";
  const selector = roleToSelector(font.role);
  return `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="${font.googleFontsUrl}" rel="stylesheet">\n\n/* CSS */\n${selector} {\n  font-family: '${font.alternativeName}', ${font.fallback};\n}`;
}

function generatePremiumCode(font: FontData): string {
  const fontFile = toFileName(font.originalName);
  const selector = roleToSelector(font.role);
  return `<!-- Place .woff2 files in /public/fonts/ -->\n<link rel="preload" href="/fonts/${fontFile}-${weightToLabel(font.weights[0] || "400")}.woff2"\n      as="font" type="font/woff2" crossorigin />\n\n<style>\n${font.weights
    .map(
      (w) =>
        `  @font-face {\n    font-family: '${font.originalName}';\n    src: url('/fonts/${fontFile}-${weightToLabel(w)}.woff2') format('woff2');\n    font-weight: ${w};\n    font-style: normal;\n    font-display: swap;\n  }`
    )
    .join("\n\n")}\n\n  ${selector} {\n    font-family: '${font.originalName}', '${font.alternativeName}', ${font.fallback};\n  }\n</style>`;
}

// ── divide-y divide-terminal-border 대응 ──
const Divider: React.FC = () => (
  <div style={{ height: 1, backgroundColor: colors.terminalBorder }} />
);

// ── 출처: src/components/font-preview.tsx 5-69줄 ──
const PREVIEW_SIZES = [16, 24, 36] as const;

const FontPreviewStatic: React.FC<{ fontName: string }> = ({ fontName }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {/* Size buttons — font-preview.tsx 36-51줄 */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {PREVIEW_SIZES.map((s) => (
        <span
          key={s}
          style={{
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            fontFamily: fonts.mono,
            ...(s === 24
              ? {
                  backgroundColor: "rgba(234, 88, 12, 0.2)",
                  color: colors.brand,
                  border: `1px solid ${colors.brand}`,
                }
              : {
                  color: colors.terminalSubtle,
                  border: `1px solid ${colors.terminalBorder}`,
                }),
          }}
        >
          {s}
        </span>
      ))}
    </div>
    {/* Preview text box — font-preview.tsx 53-67줄 */}
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${colors.terminalBorder}`,
        backgroundColor: colors.terminalCode,
        fontFamily: `'${fontName}', sans-serif`,
        fontSize: 24,
        lineHeight: 1.5,
        color: colors.terminalText,
        minHeight: 60,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}
    >
      The quick brown fox jumps over the lazy dog
    </div>
  </div>
);

// ── 출처: src/components/code-block.tsx 14-46줄 ──
const CodeBlockStatic: React.FC<{ code: string; language: string }> = ({
  code,
  language,
}) => (
  <div
    style={{
      borderRadius: 8,
      border: `1px solid ${colors.terminalBorder}`,
      backgroundColor: colors.terminalCode,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    }}
  >
    {/* Header — code-block.tsx 16-19줄 */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 12px",
        borderBottom: `1px solid ${colors.terminalBorder}`,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: colors.terminalSubtle,
          fontFamily: fonts.mono,
          textTransform: "uppercase",
        }}
      >
        {language}
      </span>
    </div>
    {/* Code — code-block.tsx 22-43줄 */}
    <pre
      style={{
        overflowX: "auto",
        padding: 12,
        fontSize: 14,
        lineHeight: 1.625,
        margin: 0,
      }}
    >
      <code style={{ fontFamily: fonts.mono, color: colors.terminalText }}>
        {code.split("\n").map((line, i) => {
          const trimmed = line.trimStart();
          const isComment =
            trimmed.startsWith("//") ||
            trimmed.startsWith("/*") ||
            trimmed.startsWith("*") ||
            trimmed.startsWith("<!--");
          return (
            <span key={i}>
              {i > 0 && "\n"}
              {isComment ? (
                <span style={{ color: colors.terminalComment }}>{line}</span>
              ) : (
                line
              )}
            </span>
          );
        })}
      </code>
    </pre>
  </div>
);

// ── 출처: src/components/framework-tabs.tsx 12-63줄 ──
const FRAMEWORKS = [
  { id: "html", label: "HTML" },
  { id: "nextjs", label: "Next.js" },
  { id: "nuxt", label: "Nuxt" },
  { id: "react", label: "React" },
];

const FrameworkTabsStatic: React.FC<{ code: string }> = ({ code }) => (
  <div>
    {/* Tabs — framework-tabs.tsx 38-55줄 (HTML active by default) */}
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {FRAMEWORKS.map((fw, i) => (
        <span
          key={fw.id}
          style={{
            padding: "2px 8px",
            fontSize: 12,
            fontFamily: fonts.mono,
            borderRadius: 4,
            ...(i === 0
              ? {
                  backgroundColor: "rgba(234, 88, 12, 0.2)",
                  color: colors.brand,
                  border: `1px solid ${colors.brand}`,
                }
              : {
                  color: colors.terminalSubtle,
                  border: `1px solid ${colors.terminalBorder}`,
                }),
          }}
        >
          {fw.label}
        </span>
      ))}
    </div>
    <CodeBlockStatic code={code} language="html" />
  </div>
);

// ── 메인 FontCard — 출처: src/components/font-card.tsx 22-209줄 ──
export const FontCard: React.FC<{
  font: FontData;
  index: number;
  opacity?: number;
}> = ({ font, index, opacity = 1 }) => {
  const hasAiAlternative =
    font.googleFontsUrl && font.alternativeName !== font.originalName;

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Command header — font-card.tsx 35-37줄: text-xs text-terminal-link */}
      <div
        style={{
          fontSize: 12,
          color: colors.terminalLink,
          fontFamily: fonts.mono,
        }}
      >
        <span style={{ color: colors.brand }}>$</span> cat font[{index}]
      </div>

      {/* Card — ui/card.tsx: rounded-lg border bg-terminal-surface p-5 */}
      <div
        style={{
          borderRadius: 8,
          border: `1px solid ${colors.terminalBorder}`,
          backgroundColor: colors.terminalSurface,
          padding: 20,
        }}
      >
        {/* ── Group 1: Font Identity ── font-card.tsx 42-115줄 */}
        <div
          style={{
            paddingBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Name + Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              {/* font-card.tsx 45-47줄: text-lg font-semibold text-terminal-text */}
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: colors.terminalText,
                }}
              >
                {font.originalName}
              </div>
              {/* font-card.tsx 48-56줄: text-xs text-terminal-subtle mt-0.5 */}
              <div
                style={{
                  fontSize: 12,
                  color: colors.terminalSubtle,
                  fontFamily: fonts.mono,
                  marginTop: 2,
                }}
              >
                <span>role: {ROLE_LABELS[font.role] || font.role}</span>
                {font.weights.length > 0 && (
                  <span style={{ marginLeft: 12 }}>
                    weights: {font.weights.join(", ")}
                  </span>
                )}
              </div>
            </div>
            {/* Badge — font-card.tsx 59-66줄 */}
            <span
              style={{
                fontSize: 12,
                fontFamily: fonts.mono,
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 2,
                paddingBottom: 2,
                color: font.isFree ? colors.success : colors.warning,
              }}
            >
              {font.isFree ? "FREE" : "CUSTOM"}
            </span>
          </div>

          {/* Marketplace links — font-card.tsx 70-103줄 */}
          {font.myfontsUrl && font.fontspringUrl && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12,
                fontSize: 12,
                fontFamily: fonts.mono,
              }}
            >
              <span style={{ color: colors.terminalLink }}>
                Search on MyFonts ↗
              </span>
              <span style={{ color: colors.terminalLink }}>
                Search on Fontspring ↗
              </span>
            </div>
          )}

          {/* Google Fonts (non-AI-alternative only) — font-card.tsx 105-114줄 */}
          {!hasAiAlternative && font.googleFontsUrl && (
            <span
              style={{
                fontSize: 12,
                fontFamily: fonts.mono,
                color: colors.terminalLink,
              }}
            >
              Google Fonts ↗
            </span>
          )}
        </div>

        {/* ── Group 2: Free Alternative ── font-card.tsx 117-133줄 */}
        {hasAiAlternative && (
          <>
            <Divider />
            <div
              style={{
                paddingTop: 16,
                paddingBottom: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Label — font-card.tsx 120줄 */}
              <div
                style={{
                  fontSize: 12,
                  color: colors.terminalSubtle,
                  fontFamily: fonts.mono,
                }}
              >
                free alternative
              </div>

              {/* FreeBadge box — font-card-free-section.tsx 15-35줄 */}
              <div
                style={{
                  borderRadius: 8,
                  border: `1px solid ${colors.terminalBorder}`,
                  backgroundColor: colors.terminalCode,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {/* FREE badge — font-card-free-section.tsx 18줄 */}
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.mono,
                        fontWeight: 700,
                        color: colors.success,
                      }}
                    >
                      FREE
                    </span>
                    {/* Alt name — font-card-free-section.tsx 19-21줄 */}
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: colors.terminalText,
                      }}
                    >
                      {font.alternativeName}
                    </span>
                  </div>
                  {/* Score — font-card-free-section.tsx 23-28줄 */}
                  {font.similarityScore > 0 && (
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.mono,
                        fontWeight: 500,
                        color: scoreColor(font.similarityScore),
                      }}
                    >
                      {font.similarityScore}%
                    </span>
                  )}
                </div>
                {/* Description — font-card-free-section.tsx 31-33줄 */}
                <p
                  style={{
                    fontSize: 14,
                    color: colors.terminalMuted,
                    lineHeight: 1.625,
                    margin: 0,
                  }}
                >
                  {font.similarity}
                </p>
              </div>

              {/* Google Fonts link — font-card.tsx 124-131줄 */}
              <span
                style={{
                  fontSize: 12,
                  fontFamily: fonts.mono,
                  color: colors.terminalLink,
                }}
              >
                Google Fonts ↗
              </span>
            </div>
          </>
        )}

        {/* ── Group 3: Preview ── font-card.tsx 135-149줄 */}
        {font.googleFontsUrl && (
          <>
            <Divider />
            <div
              style={{
                paddingTop: 16,
                paddingBottom: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Label — font-card.tsx 138-141줄 */}
              <div
                style={{
                  fontSize: 12,
                  color: colors.terminalSubtle,
                  fontFamily: fonts.mono,
                }}
              >
                preview
                {hasAiAlternative ? ` (${font.alternativeName})` : ""}
              </div>
              <FontPreviewStatic
                fontName={
                  hasAiAlternative
                    ? font.alternativeName
                    : font.originalName
                }
              />
            </div>
          </>
        )}

        {/* ── Group 4: Code Snippets ── font-card.tsx 151-196줄 */}
        <Divider />
        <div
          style={{
            paddingTop: 16,
            paddingBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Google Fonts CDN — font-card.tsx 153-169줄 */}
          {font.googleFontsUrl && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: colors.terminalSubtle,
                  fontFamily: fonts.mono,
                }}
              >
                google fonts CDN · add to {"<head>"}
              </div>
              <CodeBlockStatic
                code={generateFreeImportCode(font)}
                language="html"
              />
            </div>
          )}

          {/* CSS usage — font-card.tsx 172-187줄 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: colors.terminalSubtle,
                fontFamily: fonts.mono,
              }}
            >
              css · add to stylesheet
            </div>
            <CodeBlockStatic
              code={generateCssUsageCode(font)}
              language="css"
            />
          </div>

          {/* Self-host — font-card.tsx 189-195줄 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: colors.terminalSubtle,
                fontFamily: fonts.mono,
              }}
            >
              self-host · download &amp; serve locally
              {!font.isFree && " (license required)"}
            </div>
            <FrameworkTabsStatic code={generatePremiumCode(font)} />
          </div>
        </div>

        {/* ── Group 5: Notes ── font-card.tsx 198-205줄 */}
        {font.notes && (
          <>
            <Divider />
            <div style={{ paddingTop: 16 }}>
              <p
                style={{
                  fontSize: 12,
                  color: colors.terminalSubtle,
                  lineHeight: 1.625,
                  margin: 0,
                }}
              >
                {font.notes}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
