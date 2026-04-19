import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";

export type SsrfBlockedCode =
  | "INVALID_URL"
  | "BAD_SCHEME"
  | "PRIVATE_IP"
  | "UNRESOLVABLE"
  | "REDIRECT_LOOP";

export class SsrfBlockedError extends Error {
  readonly code: SsrfBlockedCode;
  constructor(message: string, code: SsrfBlockedCode) {
    super(message);
    this.name = "SsrfBlockedError";
    this.code = code;
  }
}

// IPv4 ranges (as named by ipaddr.js) that must never be reached from MCP.
const BLOCKED_IPV4_RANGES = new Set([
  "private",
  "loopback",
  "linkLocal",
  "carrierGradeNat",
  "reserved",
  "broadcast",
  "unspecified",
  "multicast",
]);

// IPv6 ranges that must never be reached.
const BLOCKED_IPV6_RANGES = new Set([
  "uniqueLocal",
  "loopback",
  "linkLocal",
  "reserved",
  "unspecified",
  "multicast",
]);

function isPrivateIp(raw: string): boolean {
  try {
    // ipaddr.process unwraps IPv4-mapped IPv6 to pure IPv4.
    const addr = ipaddr.process(raw);
    if (addr.kind() === "ipv4") {
      return BLOCKED_IPV4_RANGES.has(addr.range());
    }
    return BLOCKED_IPV6_RANGES.has(addr.range());
  } catch {
    // Unparseable → fail closed.
    return true;
  }
}

function stripBrackets(hostname: string): string {
  return hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
}

export interface AssertResult {
  url: URL;
  ips: string[];
}

/**
 * Parse a URL and refuse it if its host (or any resolved IP) belongs to a
 * private / reserved / loopback range, or if the scheme is not http(s).
 * Callers should invoke this before every outbound fetch or navigation.
 */
export async function assertPublicUrl(raw: string): Promise<AssertResult> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SsrfBlockedError(`Invalid URL: ${raw}`, "INVALID_URL");
  }

  if (url.protocol === "http:") {
    throw new SsrfBlockedError(
      `Refusing plain http:// (use https://). Got: ${url.href}`,
      "BAD_SCHEME",
    );
  }
  if (url.protocol !== "https:") {
    throw new SsrfBlockedError(
      `Blocked URL scheme ${url.protocol} (only https allowed)`,
      "BAD_SCHEME",
    );
  }

  const hostname = stripBrackets(url.hostname);
  if (!hostname) {
    throw new SsrfBlockedError(`Missing host in URL`, "INVALID_URL");
  }

  let ips: string[];
  if (isIP(hostname)) {
    ips = [hostname];
  } else {
    try {
      const resolved = await lookup(hostname, { all: true, verbatim: true });
      ips = resolved.map((r) => r.address);
    } catch {
      throw new SsrfBlockedError(
        `Cannot resolve host: ${hostname}`,
        "UNRESOLVABLE",
      );
    }
    if (ips.length === 0) {
      throw new SsrfBlockedError(
        `No A/AAAA records for host: ${hostname}`,
        "UNRESOLVABLE",
      );
    }
  }

  for (const ip of ips) {
    if (isPrivateIp(ip)) {
      throw new SsrfBlockedError(
        `Blocked private/reserved IP ${ip} for host ${hostname}`,
        "PRIVATE_IP",
      );
    }
  }

  return { url, ips };
}

export interface SafeFetchOptions {
  maxRedirects?: number;
  timeoutMs?: number;
}

/**
 * `fetch` wrapped with assertPublicUrl() at the origin and at every redirect
 * hop. Uses `redirect: "manual"` so the guard runs before each next request.
 */
export async function safeFetch(
  raw: string,
  init: RequestInit = {},
  opts: SafeFetchOptions = {},
): Promise<Response> {
  const maxRedirects = opts.maxRedirects ?? 5;
  const timeoutMs = opts.timeoutMs ?? 10000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = init.signal ?? controller.signal;

  let currentUrl = raw;
  let hops = 0;

  try {
    // Bounded redirect loop.
    while (true) {
      await assertPublicUrl(currentUrl);

      const res = await fetch(currentUrl, {
        ...init,
        redirect: "manual",
        signal,
      });

      // Follow 3xx manually so each hop passes assertPublicUrl.
      if (res.status >= 300 && res.status < 400 && res.status !== 304) {
        const location = res.headers.get("location");
        if (!location) {
          return res;
        }
        hops++;
        if (hops > maxRedirects) {
          throw new SsrfBlockedError(
            `Too many redirects (>${maxRedirects}) starting from ${raw}`,
            "REDIRECT_LOOP",
          );
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      return res;
    }
  } finally {
    clearTimeout(timer);
  }
}
