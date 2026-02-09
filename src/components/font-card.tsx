"use client";

import type { MatchedFont } from "@/types/font";
import { Card } from "./ui/card";
import { FontPreview } from "./font-preview";
import { FontCardFreeSection } from "./font-card-free-section";
import { CodeBlock } from "./code-block";
import { FrameworkTabs } from "./framework-tabs";
import { generateCssUsageCode } from "@/lib/code-templates";

const ROLE_LABELS: Record<string, string> = {
  heading: "Heading",
  body: "Body",
  display: "Display",
  monospace: "Monospace",
};

export function FontCard({ font }: { font: MatchedFont }) {
  const hasAiAlternative =
    font.googleFontsUrl && font.alternativeName !== font.originalName;
  const searchName = encodeURIComponent(font.originalName);

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              {font.originalName}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Used as {ROLE_LABELS[font.role] || font.role}
              {font.weights.length > 0 && (
                <span className="ml-2 text-zinc-600">
                  {font.weights.length} weight{font.weights.length > 1 && "s"}
                </span>
              )}
            </p>
          </div>
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded ${
              font.isFree
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-amber-500/10 text-amber-500"
            }`}
          >
            {font.isFree ? "Free" : "Premium"}
          </span>
        </div>

        {/* Font preview — always visible */}
        <FontPreview
          fontName={font.alternativeName || font.originalName}
          googleFontsUrl={font.googleFontsUrl}
        />

        {/* Free alternative — only when AI found a different free font */}
        {hasAiAlternative && <FontCardFreeSection font={font} />}

        {/* CSS Usage — always visible */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">CSS Usage</p>
          <CodeBlock code={generateCssUsageCode(font)} language="css" />
        </div>

        {/* Self-host code — always visible */}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">
            Self-host{!font.isFree && " (with purchased license)"}
          </p>
          <FrameworkTabs font={font} mode="premium" />
        </div>

        {/* Purchase link — only when premiumUrl available */}
        {font.premiumUrl && (
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
            {font.premiumPrice && (
              <span className="text-zinc-500 ml-1">
                from {font.premiumPrice}
              </span>
            )}
          </a>
        )}

        {/* Search links — always visible */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-zinc-800/50">
          <a
            href={`https://fonts.google.com/?query=${searchName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-200 cursor-pointer"
          >
            Search Google Fonts
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
          <a
            href={`https://www.myfonts.com/search?query=${searchName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-200 cursor-pointer"
          >
            Search MyFonts
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
          <a
            href={`https://www.fontspring.com/search?q=${searchName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-200 cursor-pointer"
          >
            Search Fontspring
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

        {/* Info note */}
        {font.notes && (
          <p className="text-xs text-zinc-500 leading-relaxed">{font.notes}</p>
        )}
      </div>
    </Card>
  );
}
