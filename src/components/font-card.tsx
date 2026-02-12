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

  return (
    <div className="space-y-2">
      {/* Terminal command header */}
      <div className="text-xs text-terminal-link font-mono">
        <span className="text-brand">$</span> cat font[{index}]
      </div>

      <Card>
        <div className="divide-y divide-terminal-border">
          {/* ── Group 1: Font Identity ── */}
          <div className="pb-6 space-y-2">
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

            {font.myfontsUrl && font.fontspringUrl && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <a
                  href={font.myfontsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent({
                      event: "affiliate_click",
                      fontName: font.originalName,
                      marketplace: "myfonts",
                    })
                  }
                  className="text-warning hover:opacity-80 transition-colors duration-200 cursor-pointer"
                >
                  MyFonts ↗
                </a>
                <a
                  href={font.fontspringUrl}
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
              </div>
            )}

            {!hasAiAlternative && font.googleFontsUrl && (
              <a
                href={`https://fonts.google.com/?query=${encodeURIComponent(font.originalName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-mono text-terminal-link hover:text-terminal-text transition-colors duration-200 cursor-pointer"
              >
                Google Fonts ↗
              </a>
            )}
          </div>

          {/* ── Group 2: Free Alternative ── */}
          {hasAiAlternative && (
            <div className="pt-4 pb-6 space-y-3">
              <div className="text-xs text-terminal-subtle font-mono">
                free alternative
              </div>
              <FontCardFreeSection font={font} />
              <a
                href={`https://fonts.google.com/?query=${encodeURIComponent(font.alternativeName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-mono text-terminal-link hover:text-terminal-text transition-colors duration-200 cursor-pointer"
              >
                Google Fonts ↗
              </a>
            </div>
          )}

          {/* ── Group 3: Preview ── */}
          {font.googleFontsUrl && (
            <div className="pt-4 pb-6 space-y-3">
              <div className="text-xs text-terminal-subtle font-mono">
                preview
                {hasAiAlternative ? ` (${font.alternativeName})` : ""}
              </div>
              <FontPreview
                fontName={
                  hasAiAlternative ? font.alternativeName : font.originalName
                }
                googleFontsUrl={font.googleFontsUrl}
              />
            </div>
          )}

          {/* ── Group 4: Code Snippets ── */}
          <div className="pt-4 pb-6 space-y-4">
            {font.googleFontsUrl && (
              <div className="space-y-2">
                <div className="text-xs text-terminal-subtle font-mono">
                  google fonts CDN · add to {"<head>"}
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
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs text-terminal-subtle font-mono">
                css · add to stylesheet
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
            </div>

            <div className="space-y-2">
              <div className="text-xs text-terminal-subtle font-mono">
                self-host · download {"&"} serve locally
                {!font.isFree && " (license required)"}
              </div>
              <FrameworkTabs font={font} mode="premium" />
            </div>
          </div>

          {/* ── Group 5: Notes ── */}
          {font.notes && (
            <div className="pt-4">
              <p className="text-xs text-terminal-subtle leading-relaxed">
                {font.notes}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
