"use client";

import type { MatchedFont } from "@/types/font";
import { Card } from "./ui/card";
import { FontPreview } from "./font-preview";
import { FontCardFreeSection } from "./font-card-free-section";
import { CodeBlock } from "./code-block";
import { FrameworkTabs } from "./framework-tabs";
import {
  generateCssUsageCode,
  generateFreeImportCode,
} from "@/lib/code-templates";

const ROLE_LABELS: Record<string, string> = {
  heading: "Heading",
  body: "Body",
  display: "Display",
  monospace: "Monospace",
};

export function FontCard({
  font,
  index = 0,
}: {
  font: MatchedFont;
  index?: number;
}) {
  const hasAiAlternative =
    font.googleFontsUrl && font.alternativeName !== font.originalName;
  const searchName = encodeURIComponent(font.originalName);

  return (
    <div className="space-y-2">
      {/* Terminal command header */}
      <div className="text-xs text-[#666] font-mono">
        <span className="text-brand">$</span> cat font[{index}]
      </div>

      <Card>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-[#ccc]">
                {font.originalName}
              </h3>
              <div className="text-xs text-[#555] mt-0.5 font-mono">
                <span>
                  role: {ROLE_LABELS[font.role] || font.role}
                </span>
                {font.weights.length > 0 && (
                  <span className="ml-3">
                    weights: {font.weights.join(", ")}
                  </span>
                )}
              </div>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 ${
                font.isFree
                  ? "text-[#4ade80]"
                  : "text-[#fbbf24]"
              }`}
            >
              {font.isFree ? "FREE" : "CUSTOM"}
            </span>
          </div>

          {/* Free alternative info (paid fonts only) */}
          {hasAiAlternative && (
            <>
              <div className="text-xs text-[#555] font-mono">
                -- free alternative --
              </div>
              <FontCardFreeSection font={font} />
            </>
          )}

          {/* Preview */}
          {font.googleFontsUrl && (
            <>
              <div className="text-xs text-[#555] font-mono">
                -- preview
                {hasAiAlternative ? ` (${font.alternativeName})` : ""} --
              </div>
              <FontPreview
                fontName={
                  hasAiAlternative ? font.alternativeName : font.originalName
                }
                googleFontsUrl={font.googleFontsUrl}
              />
            </>
          )}

          {/* Google Fonts import */}
          {font.googleFontsUrl && (
            <>
              <div className="text-xs text-[#555] font-mono">
                -- google fonts --
              </div>
              <CodeBlock
                code={generateFreeImportCode(font)}
                language="html"
              />
            </>
          )}

          {/* CSS Usage */}
          <div className="text-xs text-[#555] font-mono">-- css --</div>
          <CodeBlock code={generateCssUsageCode(font)} language="css" />

          {/* Self-host code */}
          <div className="text-xs text-[#555] font-mono">
            -- import{!font.isFree && " (license required)" } --
          </div>
          <FrameworkTabs font={font} mode="premium" />

          {/* Purchase link */}
          {font.premiumUrl && (
            <a
              href={font.premiumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#fbbf24] hover:text-amber-300 transition-colors duration-200 cursor-pointer"
            >
              Buy License ↗
              {font.premiumPrice && (
                <span className="text-[#555] ml-1">
                  from {font.premiumPrice}
                </span>
              )}
            </a>
          )}

          {/* Search links */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-terminal-border text-xs font-mono">
            <a
              href={`https://fonts.google.com/?query=${searchName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#666] hover:text-[#ccc] transition-colors duration-200 cursor-pointer"
            >
              Google Fonts ↗
            </a>
            <a
              href={`https://www.myfonts.com/search?query=${searchName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#666] hover:text-[#ccc] transition-colors duration-200 cursor-pointer"
            >
              MyFonts ↗
            </a>
            <a
              href={`https://www.fontspring.com/search?q=${searchName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#666] hover:text-[#ccc] transition-colors duration-200 cursor-pointer"
            >
              Fontspring ↗
            </a>
          </div>

          {/* Notes */}
          {font.notes && (
            <p className="text-xs text-[#555] leading-relaxed">
              {font.notes}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
