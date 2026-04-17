import type { MatchedFont } from "../types/font.ts";

export type Framework = "html" | "nextjs" | "nuxt" | "react";

export function toFileName(name: string): string {
  return name.replace(/\s+/g, "");
}

export function toVarName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, "");
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "customFont";
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("")
  );
}

export function roleToSelector(role: string): string {
  const map: Record<string, string> = {
    heading: "h1, h2, h3",
    body: "body, p",
    display: ".display, .hero-title",
    monospace: "code, pre",
  };
  return map[role] || "body";
}

export function weightToLabel(weight: string): string {
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

export function generateCssUsageCode(font: MatchedFont): string {
  const selector = roleToSelector(font.role);
  return `${selector} {
  font-family: '${font.originalName}', ${font.fallback};
}`;
}

export function generateFreeImportCode(font: MatchedFont): string {
  if (!font.googleFontsUrl) return "";
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${font.googleFontsUrl}" rel="stylesheet">

/* CSS */
${roleToSelector(font.role)} {
  font-family: '${font.alternativeName}', ${font.fallback};
}`;
}

export function generatePremiumCode(
  font: MatchedFont,
  framework: Framework
): string {
  const fontFile = toFileName(font.originalName);
  const fontVar = toVarName(font.originalName);
  const selector = roleToSelector(font.role);

  switch (framework) {
    case "html":
      return `<!-- Place .woff2 files in /public/fonts/ -->
<link rel="preload" href="/fonts/${fontFile}-${weightToLabel(font.weights[0] || "400")}.woff2"
      as="font" type="font/woff2" crossorigin />

<style>
${font.weights
  .map(
    (w) => `  @font-face {
    font-family: '${font.originalName}';
    src: url('/fonts/${fontFile}-${weightToLabel(w)}.woff2') format('woff2');
    font-weight: ${w};
    font-style: normal;
    font-display: swap;
  }`
  )
  .join("\n\n")}

  ${selector} {
    font-family: '${font.originalName}', '${font.alternativeName}', ${font.fallback};
  }
</style>`;

    case "nextjs":
      return `// app/layout.tsx
import localFont from 'next/font/local'

const ${fontVar} = localFont({
  src: [
${font.weights.map((w) => `    { path: './fonts/${fontFile}-${weightToLabel(w)}.woff2', weight: '${w}' },`).join("\n")}
  ],
  variable: '--font-${fontVar}',
  fallback: ['${font.alternativeName}', '${font.fallback}'],
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html className={${fontVar}.variable}>
      <body>{children}</body>
    </html>
  )
}`;

    case "nuxt":
      return `// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/fonts.css'],
})

// assets/css/fonts.css
${font.weights
  .map(
    (w) => `@font-face {
  font-family: '${font.originalName}';
  src: url('/fonts/${fontFile}-${weightToLabel(w)}.woff2') format('woff2');
  font-weight: ${w};
  font-style: normal;
  font-display: swap;
}`
  )
  .join("\n\n")}`;

    case "react":
      return `// src/fonts.css
${font.weights
  .map(
    (w) => `@font-face {
  font-family: '${font.originalName}';
  src: url('./fonts/${fontFile}-${weightToLabel(w)}.woff2') format('woff2');
  font-weight: ${w};
  font-style: normal;
  font-display: swap;
}`
  )
  .join("\n\n")}

// src/App.jsx
import './fonts.css'

function App() {
  return (
    <div style={{ fontFamily: "'${font.originalName}', '${font.alternativeName}', ${font.fallback}" }}>
      ...
    </div>
  )
}`;
  }
}
