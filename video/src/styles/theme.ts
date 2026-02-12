// 라이트 모드 색상 — 출처: src/app/globals.css :root.light (39-59줄)
export const colors = {
  brand: "#ea580c",
  success: "#16a34a",
  error: "#dc2626",
  warning: "#d97706",
  info: "#0891b2",
  terminalBg: "#f5f5f0",
  terminalSurface: "#ebebeb",
  terminalBorder: "#d4d4d4",
  terminalText: "#1c1c1c",
  terminalMuted: "#666666",
  terminalSubtle: "#888888",
  terminalDim: "#aaaaaa",
  terminalLink: "#555555",
  terminalCode: "#e8e8e3",
  terminalComment: "#4d7a36",
};

// 간격 — 출처: src/app/globals.css :root (9-15줄)
export const spacing = {
  maxWidth: 960,
  pagePx: 24,
  barY: 8,
  section: 16,
  line: 4,
};

// 폰트 — 출처: src/app/layout.tsx 77줄 (body: font-mono text-sm = 14px)
export const fonts = {
  mono: "'Geist Mono', monospace",
};

// macOS dots — 출처: src/components/header.tsx 10-12줄
export const macDots = {
  red: "#ff5f57",
  yellow: "#febc2e",
  green: "#28c840",
};

// ASCII art — 출처: src/app/page.tsx 12-36줄 (정확한 복사)
export const ASCII_LINES = [
  "██╗    ██╗██╗  ██╗ █████╗ ████████╗",
  "██║    ██║██║  ██║██╔══██╗╚══██╔══╝",
  "██║ █╗ ██║███████║███████║   ██║   ",
  "██║███╗██║██╔══██║██╔══██║   ██║   ",
  "╚███╔███╔╝██║  ██║██║  ██║   ██║   ",
  " ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ",
  " ",
  "████████╗██╗  ██╗███████╗",
  "╚══██╔══╝██║  ██║██╔════╝",
  "   ██║   ███████║█████╗  ",
  "   ██║   ██╔══██║██╔══╝  ",
  "   ██║   ██║  ██║███████╗",
  "   ╚═╝   ╚═╝  ╚═╝╚══════╝",
  " ",
  "███████╗ ██████╗ ███╗   ██╗████████╗",
  "██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝",
  "█████╗  ██║   ██║██╔██╗ ██║   ██║   ",
  "██╔══╝  ██║   ██║██║╚██╗██║   ██║   ",
  "██║     ╚██████╔╝██║ ╚████║   ██║   ",
  "╚═╝      ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ",
];

// Disclaimer — 출처: src/app/page.tsx 278-284줄
export const DISCLAIMERS: Array<{ tag: "info" | "warn"; text: string }> = [
  { tag: "info", text: "WTFont.wtf is a developer tool that identifies fonts used on publicly accessible web pages for research and learning purposes." },
  { tag: "info", text: "No Circumvention \u2014 This tool only analyzes publicly available CSS and rendered styles. It does not bypass DRM, extract or redistribute font files, or access protected resources." },
  { tag: "info", text: "Support Type Foundries \u2014 We provide affiliate links to official marketplaces like Fontspring and MyFonts so you can purchase licenses directly. Great typography deserves fair compensation." },
  { tag: "warn", text: "Respect Licenses \u2014 Detecting a font does not grant you a license to use it. Many web fonts are commercial software. Always purchase a proper license before using them in your projects." },
  { tag: "warn", text: "No Liability \u2014 This tool is provided as-is. The authors assume no responsibility for how detected font information is used." },
];

// 예제 사이트 — 출처: src/components/url-input.tsx 5-9줄
export const EXAMPLE_SITES = ["apple.com", "airbnb.com", "anthropic.com", "spotify.com"];

// Airbnb 분석 결과 — 출처: https://wtfont.wtf/r/airbnb-com 실제 데이터
export interface FontData {
  originalName: string;
  role: string;
  weights: string[];
  isFree: boolean;
  alternativeName: string;
  similarityScore: number;
  similarity: string;
  googleFontsUrl: string;
  myfontsUrl: string;
  fontspringUrl: string;
  fallback: string;
  notes: string;
}

export const AIRBNB_DATA = {
  domain: "airbnb.com",
  fontCount: 2,
  analyzedAt: "2026. 2. 12.",
  fonts: [
    {
      originalName: "Airbnb Cereal VF",
      role: "heading",
      weights: ["400", "700"],
      isFree: false,
      alternativeName: "Nunito Sans",
      similarityScore: 80,
      similarity: "Nunito Sans shares a similar geometric sans-serif style with Airbnb Cereal VF, offering a clean and modern appearance suitable for headings. It provides a comparable level of readability and visual appeal.",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&display=swap",
      myfontsUrl: "https://www.myfonts.com/search?query=Airbnb%20Cereal%20VF",
      fontspringUrl: "https://www.fontspring.com/search?q=Airbnb%20Cereal%20VF",
      fallback: "sans-serif",
      notes: "Use Nunito Sans for headings to maintain modern and approachable feel, similar to Airbnb's branding",
    },
    {
      originalName: "Circular",
      role: "body",
      weights: ["400"],
      isFree: false,
      alternativeName: "Montserrat",
      similarityScore: 85,
      similarity: "Montserrat is geometric sans-serif providing similar clean aesthetic, good readability and neutral tone",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap",
      myfontsUrl: "https://www.myfonts.com/search?query=Circular",
      fontspringUrl: "https://www.fontspring.com/search?q=Circular",
      fallback: "sans-serif",
      notes: "Employ Montserrat for body text to ensure clarity and contemporary style",
    },
  ] as FontData[],
};
