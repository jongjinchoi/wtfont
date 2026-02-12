import type { AnalysisResult } from "./font";

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: true;
  data: AnalysisResult;
}

export interface AnalyzeErrorResponse {
  success: false;
  error: string;
  code:
    | "INVALID_URL"
    | "FETCH_FAILED"
    | "PARSE_FAILED"
    | "AI_FAILED"
    | "RATE_LIMITED"
    | "UNKNOWN";
}

