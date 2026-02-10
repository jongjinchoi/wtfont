import type { MatchedFont } from "@/types/font";

function scoreColor(score: number): string {
  if (score >= 80) return "text-[#4ade80]";
  if (score >= 60) return "text-[#fbbf24]";
  return "text-[#f87171]";
}

export function FontCardFreeSection({ font }: { font: MatchedFont }) {
  if (!font.googleFontsUrl || font.alternativeName === font.originalName) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#4ade80]/15 bg-[#4ade80]/5 p-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-[#4ade80]">FREE</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#ccc]">
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
          <p className="text-xs text-[#555]">{font.similarity}</p>
        </div>
      </div>
    </div>
  );
}
