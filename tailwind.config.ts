import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        pixel: ["var(--font-geist-pixel-square)", "monospace"],
      },
      colors: {
        brand: "#f97316",
      },
    },
  },
  plugins: [],
} satisfies Config;
