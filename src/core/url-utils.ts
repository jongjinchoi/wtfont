export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  const parsed = new URL(url);
  parsed.protocol = "https:";
  parsed.search = "";
  parsed.hash = "";
  let result = parsed.origin + parsed.pathname;
  if (result.endsWith("/")) {
    result = result.slice(0, -1);
  }
  return result;
}

export function urlToSlug(url: string): string {
  const normalized = normalizeUrl(url);
  const parsed = new URL(normalized);
  let slug = parsed.host + parsed.pathname;
  slug = slug.replace(/[^a-zA-Z0-9]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug.toLowerCase();
}

export function validateUrl(input: string): boolean {
  if (!input || !input.trim()) return false;
  try {
    let url = input.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export function extractDomainAndPath(url: string): {
  domain: string;
  path: string;
} {
  const normalized = normalizeUrl(url);
  const parsed = new URL(normalized);
  return { domain: parsed.hostname, path: parsed.pathname };
}
