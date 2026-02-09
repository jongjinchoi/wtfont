import type { MatchedFont } from "@/types/font";
import { Badge } from "./ui/badge";
import { FrameworkTabs } from "./framework-tabs";

export function FontCardPremiumSection({ font }: { font: MatchedFont }) {
  if (!font.premiumUrl) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="custom" />
          <div>
            <p className="text-sm font-medium text-zinc-100">
              {font.originalName}
            </p>
            {font.premiumPrice && (
              <p className="text-xs text-zinc-500">
                From {font.premiumPrice}
              </p>
            )}
          </div>
        </div>
        <a
          href={font.premiumUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors duration-200 cursor-pointer"
        >
          Buy License
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-xs text-zinc-400 mb-3">
          Self-host with a purchased license:
        </p>
        <FrameworkTabs font={font} mode="premium" />
      </div>
    </div>
  );
}
