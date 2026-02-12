import React from "react";
import { colors, spacing, fonts, macDots } from "../styles/theme";

// 출처: src/components/header.tsx — 전체 너비 border, 내부 960px 중앙정렬
export const Header: React.FC<{ domain?: string }> = ({ domain }) => (
  <div
    style={{
      width: "100%",
      borderBottom: `1px solid ${colors.terminalBorder}`,
      backgroundColor: colors.terminalBg,
    }}
  >
    <div
      style={{
        maxWidth: spacing.maxWidth,
        margin: "0 auto",
        padding: `${spacing.barY}px ${spacing.pagePx}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: fonts.mono,
      }}
    >
      {/* Left: macOS dots + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* macOS dots — header.tsx 9-13줄: w-3 h-3 rounded-full gap-1.5 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: macDots.red,
              display: "inline-block",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: macDots.yellow,
              display: "inline-block",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: macDots.green,
              display: "inline-block",
            }}
          />
        </div>
        {/* Title — header.tsx 14-19줄: text-sm text-terminal-muted */}
        <span style={{ fontSize: 14, color: colors.terminalMuted }}>
          {domain ? `${domain} - wtfont.wtf` : "wtfont.wtf"}
        </span>
      </div>
      {/* Right: theme toggle — theme-toggle.tsx 19줄: text-xs text-terminal-link */}
      <span style={{ fontSize: 12, color: colors.terminalLink }}>dark</span>
    </div>
  </div>
);
