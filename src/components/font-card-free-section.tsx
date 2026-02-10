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
    <div className="rounded-lg border border-success/15 bg-success/5 p-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-success">FREE</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-terminal-text">
              {font.alternativeName}
            </p>
            {font.similarityScore > 0 && (
              <span
                className={`text-xs font-mono ${scoreColor(font.similarityScore)}`}
              >
                {font.similarityScore}% match
              </span>
            )}
          </div>
          <p className="text-xs text-terminal-subtle">{font.similarity}</p>
        </div>
      </div>
    </div>
  );
}
