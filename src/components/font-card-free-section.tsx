import type { MatchedFont } from "@/types/font";
import { Badge } from "./ui/badge";
import { CodeBlock } from "./code-block";
import { generateFreeImportCode } from "@/lib/code-templates";

export function FontCardFreeSection({ font }: { font: MatchedFont }) {
  if (!font.googleFontsUrl || font.alternativeName === font.originalName) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
      <div className="flex items-center gap-3">
        <Badge variant="free" />
        <div>
          <p className="text-sm font-medium text-zinc-100">
            {font.alternativeName}
          </p>
          <p className="text-xs text-zinc-500">{font.similarity}</p>
        </div>
      </div>

      <CodeBlock
        code={generateFreeImportCode(font)}
        language="html"
      />
    </div>
  );
}
