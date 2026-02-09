import type { MatchedFont } from "@/types/font";
import { CodeBlock } from "./code-block";
import { generateFreeImportCode } from "@/lib/code-templates";

export function FontCardFreeSection({ font }: { font: MatchedFont }) {
  if (!font.googleFontsUrl || font.alternativeName === font.originalName) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-[#4ade80]/15 bg-[#4ade80]/5 p-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-[#4ade80]">FREE</span>
        <div>
          <p className="text-sm font-medium text-[#ccc]">
            {font.alternativeName}
          </p>
          <p className="text-xs text-[#555]">{font.similarity}</p>
        </div>
      </div>

      <CodeBlock code={generateFreeImportCode(font)} language="html" />
    </div>
  );
}
