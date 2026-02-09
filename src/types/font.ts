export type FontRole = "heading" | "body" | "display" | "monospace";
export type FontSource = "google" | "adobe" | "custom" | "system";

/** Extracted from target website's CSS */
export interface ExtractedFont {
  name: string;
  role: FontRole;
  source: FontSource;
  weights: string[];
  selectors: string[];
}

/** AI-matched result for a single font */
export interface MatchedFont {
  role: FontRole;
  originalName: string;
  isFree: boolean;
  alternativeName: string;
  googleFontsUrl: string | null;
  fallback: string;
  similarity: string;
  notes: string;
  weights: string[];
  premiumUrl: string | null;
  premiumPrice: string | null;
}

/** Complete analysis result stored in cache */
export interface AnalysisResult {
  url: string;
  domain: string;
  slug: string;
  extractedFonts: ExtractedFont[];
  matchedFonts: MatchedFont[];
  analyzedAt: string;
}
