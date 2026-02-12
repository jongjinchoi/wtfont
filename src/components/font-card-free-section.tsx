import type { MatchedFont } from "@/types/font";

function scoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-error";
}

export function FontCardFreeSection({ font }: { font: MatchedFont }) {
  if (!font.googleFontsUrl || font.alternativeName === font.originalName) {
    return null;
  }

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-code p-4 space-y-3 shadow-sm shadow-black/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-success">FREE</span>
          <p className="text-base font-bold text-terminal-text">
            {font.alternativeName}
          </p>
        </div>
        {font.similarityScore > 0 && (
          <span
            className={`text-xs font-mono font-medium ${scoreColor(font.similarityScore)}`}
          >
            {font.similarityScore}%
          </span>
        )}
      </div>
      <p className="text-sm text-terminal-muted leading-relaxed">
        {font.similarity}
      </p>
    </div>
  );
}
