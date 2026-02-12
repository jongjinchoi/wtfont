import React from "react";
import { AbsoluteFill } from "remotion";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { colors, spacing, fonts } from "../styles/theme";

// 전체 페이지 레이아웃: Header + main(960px 중앙) + Footer
// 출처: src/app/page.tsx 131-327줄, src/app/r/[slug]/result-client.tsx 177-282줄
export const Layout: React.FC<{
  domain?: string;
  children: React.ReactNode;
  mainPaddingTop?: number;
}> = ({ domain, children, mainPaddingTop = spacing.section }) => (
  <AbsoluteFill>
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.terminalBg,
        fontFamily: fonts.mono,
        fontSize: 14,
        color: colors.terminalText,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <Header domain={domain} />
      {/* main — page.tsx: flex-1 overflow-y-auto pt-section */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          paddingTop: mainPaddingTop,
        paddingBottom: mainPaddingTop,
        }}
      >
        {/* 컨텐츠 영역 — page.tsx: mx-auto max-w-content px-page-px */}
        <div
          style={{
            maxWidth: spacing.maxWidth,
            margin: "0 auto",
            padding: `0 ${spacing.pagePx}px`,
          }}
        >
          {children}
        </div>
      </div>
      <Footer />
    </div>
  </AbsoluteFill>
);
