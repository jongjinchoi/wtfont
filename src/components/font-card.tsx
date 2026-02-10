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
import { trackEvent } from "@/lib/track";

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
      <div className="text-xs text-terminal-link font-mono">
        <span className="text-brand">$</span> cat font[{index}]
      </div>

      <Card>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-terminal-text">
                {font.originalName}
              </h3>
              <div className="text-xs text-terminal-subtle mt-0.5 font-mono">
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
                  ? "text-success"
                  : "text-warning"
              }`}
            >
              {font.isFree ? "FREE" : "CUSTOM"}
            </span>
          </div>

          {/* Free alternative info (paid fonts only) */}
          {hasAiAlternative && (
            <>
              <div className="text-xs text-terminal-subtle font-mono">
                -- free alternative --
              </div>
              <FontCardFreeSection font={font} />
            </>
          )}

          {/* Preview */}
          {font.googleFontsUrl && (
            <>
              <div className="text-xs text-terminal-subtle font-mono">
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
              <div className="text-xs text-terminal-subtle font-mono">
                -- google fonts CDN · add to {"<head>"} --
              </div>
              <CodeBlock
                code={generateFreeImportCode(font)}
                language="html"
                onCopied={() =>
                  trackEvent({
                    event: "code_copy",
                    fontName: font.originalName,
                    framework: "cdn",
                  })
                }
              />
            </>
          )}

          {/* CSS Usage */}
          <div className="text-xs text-terminal-subtle font-mono">
            -- css · add to stylesheet --
          </div>
          <CodeBlock
            code={generateCssUsageCode(font)}
            language="css"
            onCopied={() =>
              trackEvent({
                event: "code_copy",
                fontName: font.originalName,
                framework: "css",
              })
            }
          />

          {/* Self-host code */}
          <div className="text-xs text-terminal-subtle font-mono">
            -- self-host · download {"&"} serve locally
            {!font.isFree && " (license required)"} --
          </div>
          <FrameworkTabs font={font} mode="premium" />

          {/* Purchase link */}
          {font.premiumUrl && (
            <a
              href={font.premiumUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent({
                  event: "affiliate_click",
                  fontName: font.originalName,
                  marketplace: font.premiumUrl?.includes("myfonts.com")
                    ? "myfonts"
                    : "fontspring",
                })
              }
              className="inline-flex items-center gap-1.5 text-xs font-mono text-warning hover:opacity-80 transition-colors duration-200 cursor-pointer"
            >
              Buy License ↗
              {font.premiumPrice && (
                <span className="text-terminal-subtle ml-1">
                  from {font.premiumPrice}
                </span>
              )}
            </a>
          )}

          {/* Search links — only show platforms where the font is available */}
          {(font.isFree || font.premiumUrl) && (
            <div className="flex flex-wrap gap-3 pt-3 border-t border-terminal-border text-xs font-mono">
              {font.isFree && (
                <a
                  href={`https://fonts.google.com/?query=${searchName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terminal-link hover:text-terminal-text transition-colors duration-200 cursor-pointer"
                >
                  Google Fonts ↗
                </a>
              )}
              {font.premiumUrl && (
                <>
                  <a
                    href={`https://www.myfonts.com/search?query=${searchName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent({
                        event: "affiliate_click",
                        fontName: font.originalName,
                        marketplace: "myfonts",
                      })
                    }
                    className="text-terminal-link hover:text-terminal-text transition-colors duration-200 cursor-pointer"
                  >
                    MyFonts ↗
                  </a>
                  <a
                    href={`https://www.fontspring.com/search?q=${searchName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent({
                        event: "affiliate_click",
                        fontName: font.originalName,
                        marketplace: "fontspring",
                      })
                    }
                    className="text-terminal-link hover:text-terminal-text transition-colors duration-200 cursor-pointer"
                  >
                    Fontspring ↗
                  </a>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          {font.notes && (
            <p className="text-xs text-terminal-subtle leading-relaxed">
              {font.notes}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
