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

/** Slim AI response — only the fields AI needs to generate */
export interface AiMatchedFont {
  originalName: string;
  alternativeName: string;
  similarity: string;
  similarityScore: number;
}

/** Full matched result used by UI (AI fields + locally enriched fields) */
export interface MatchedFont {
  role: FontRole;
  originalName: string;
  isFree: boolean;
  alternativeName: string;
  googleFontsUrl: string | null;
  fallback: string;
  similarity: string;
  similarityScore: number;
  notes: string;
  weights: string[];
  myfontsUrl: string | null;
  fontspringUrl: string | null;
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
