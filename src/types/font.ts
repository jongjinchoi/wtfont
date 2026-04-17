export type FontRole = "heading" | "body" | "display" | "monospace";
export type FontSource = "google" | "adobe" | "custom" | "system";
export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace";

/** Extracted from a target website's CSS or rendered page. */
export interface ExtractedFont {
  name: string;
  role: FontRole;
  source: FontSource;
  weights: string[];
  selectors: string[];
}

/** An extracted font enriched with Google Fonts DB lookup. */
export interface EnrichedFont extends ExtractedFont {
  isFree: boolean;
  category: string;
  googleFontsUrl: string | null;
  specimenUrl: string | null;
}

/** Input to code-template generators. */
export interface MatchedFont {
  role: FontRole;
  originalName: string;
  isFree: boolean;
  alternativeName: string;
  googleFontsUrl: string | null;
  fallback: string;
  weights: string[];
}

/** Full analysis result. */
export interface AnalysisResult {
  url: string;
  domain: string;
  fonts: EnrichedFont[];
  analyzedAt: string;
  detection: "static" | "dynamic" | "merged";
  dynamicStatus?:
    | "success"
    | "no_library"
    | "no_browser"
    | "error"
    | "skipped";
  dynamicError?: string;
}
