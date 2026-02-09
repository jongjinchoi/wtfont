import type { ExtractedFont, FontRole, FontSource } from "@/types/font";

interface PlaywrightFont {
  name: string;
  source: "google" | "adobe" | "custom";
  weight?: string;
  style?: string;
  role: "heading" | "body" | "monospace" | "unknown";
  selectors: string[];
  resourceUrl?: string;
  detectionMethod: string;
}

interface PlaywrightResponse {
  success: boolean;
  fonts: PlaywrightFont[];
  url: string;
  error?: string;
}

const SERVICE_URL = process.env.PLAYWRIGHT_SERVICE_URL;
const SERVICE_SECRET = process.env.PLAYWRIGHT_SERVICE_SECRET;

/**
 * Extract fonts from a URL using the Playwright microservice.
 * Returns null if the service is not configured or if the request fails.
 */
export async function extractFontsWithPlaywright(
  url: string,
  timeout = 15000
): Promise<ExtractedFont[] | null> {
  if (!SERVICE_URL) return null;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (SERVICE_SECRET) {
      headers["Authorization"] = `Bearer ${SERVICE_SECRET}`;
    }

    const res = await fetch(`${SERVICE_URL}/extract`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url, timeout }),
      signal: AbortSignal.timeout(timeout + 5000),
    });

    if (!res.ok) return null;

    const data: PlaywrightResponse = await res.json();
    if (!data.success || !data.fonts?.length) return null;

    return data.fonts.map((f) => ({
      name: f.name,
      role: (f.role === "unknown" ? "body" : f.role) as FontRole,
      source: f.source as FontSource,
      weights: f.weight ? f.weight.split(", ") : [],
      selectors: f.selectors,
    }));
  } catch {
    return null;
  }
}
