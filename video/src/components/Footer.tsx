import React from "react";
import { colors, spacing, fonts } from "../styles/theme";

// 출처: src/components/footer.tsx — 전체 너비 border, 내부 960px 중앙정렬
export const Footer: React.FC = () => (
  <div
    style={{
      width: "100%",
      borderTop: `1px solid ${colors.terminalBorder}`,
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
        fontSize: 12,
        color: colors.terminalSubtle,
      }}
    >
      {/* Left items — footer.tsx 6-14줄 */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span>
          <span style={{ color: colors.brand }}>*</span> AI matching
        </span>
        <span>
          <span style={{ color: colors.brand }}>&lt;/&gt;</span> HTML / Next.js
          / Nuxt / React
        </span>
        <span>
          <span style={{ color: colors.success }}>+</span> 100% free
        </span>
      </div>
      {/* Right — footer.tsx 16줄 */}
      <span>v0.1.0</span>
    </div>
  </div>
);
