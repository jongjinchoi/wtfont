"use client";

import { useState } from "react";
import { CodeBlock } from "./code-block";
import {
  generateFreeImportCode,
  generatePremiumCode,
  type Framework,
} from "@/lib/code-templates";
import type { MatchedFont } from "@/types/font";

const FRAMEWORKS: { id: Framework; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "nextjs", label: "Next.js" },
  { id: "nuxt", label: "Nuxt" },
  { id: "react", label: "React" },
];

export function FrameworkTabs({
  font,
  mode,
}: {
  font: MatchedFont;
  mode: "free" | "premium";
}) {
  const [active, setActive] = useState<Framework>("html");

  const code =
    mode === "free"
      ? generateFreeImportCode(font)
      : generatePremiumCode(font, active);

  if (mode === "free" && !font.googleFontsUrl) return null;

  return (
    <div>
      {mode === "premium" && (
        <div className="flex gap-2 mb-3" role="tablist">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              role="tab"
              aria-selected={active === fw.id}
              onClick={() => setActive(fw.id)}
              className={`px-2 py-0.5 text-xs font-mono rounded transition-colors duration-200 cursor-pointer
                ${
                  active === fw.id
                    ? "bg-brand/20 text-brand border border-brand"
                    : "text-terminal-subtle hover:text-terminal-text border border-terminal-border"
                }`}
            >
              {fw.label}
            </button>
          ))}
        </div>
      )}
      <CodeBlock
        code={code}
        language={mode === "free" ? "html" : active === "html" ? "html" : "tsx"}
      />
    </div>
  );
}
