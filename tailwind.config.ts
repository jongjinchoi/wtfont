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
      maxWidth: {
        content: "var(--max-width)",
      },
      colors: {
        brand: "var(--color-brand)",
        success: "var(--color-success)",
        error: "var(--color-error)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
        terminal: {
          bg: "var(--color-terminal-bg)",
          surface: "var(--color-terminal-surface)",
          border: "var(--color-terminal-border)",
          text: "var(--color-terminal-text)",
          muted: "var(--color-terminal-muted)",
          subtle: "var(--color-terminal-subtle)",
          dim: "var(--color-terminal-dim)",
          link: "var(--color-terminal-link)",
          code: "var(--color-terminal-code)",
          comment: "var(--color-terminal-comment)",
        },
      },
      spacing: {
        line: "var(--space-line)",
        section: "var(--space-section)",
        "bar-y": "var(--space-bar-y)",
        "page-px": "var(--page-px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
