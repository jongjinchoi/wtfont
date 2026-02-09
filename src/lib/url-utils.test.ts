import { describe, it, expect } from "vitest";
import {
  normalizeUrl,
  urlToSlug,
  validateUrl,
  extractDomainAndPath,
} from "./url-utils";

describe("normalizeUrl", () => {
  it("adds https:// if missing", () => {
    expect(normalizeUrl("stripe.com")).toBe("https://stripe.com");
  });
  it("keeps existing https", () => {
    expect(normalizeUrl("https://stripe.com")).toBe("https://stripe.com");
  });
  it("upgrades http to https", () => {
    expect(normalizeUrl("http://stripe.com")).toBe("https://stripe.com");
  });
  it("strips trailing slash", () => {
    expect(normalizeUrl("stripe.com/")).toBe("https://stripe.com");
  });
  it("strips query params", () => {
    expect(normalizeUrl("stripe.com?ref=foo")).toBe("https://stripe.com");
  });
  it("preserves path", () => {
    expect(normalizeUrl("stripe.com/docs/payments")).toBe(
      "https://stripe.com/docs/payments"
    );
  });
});

describe("urlToSlug", () => {
  it("converts domain to slug", () => {
    expect(urlToSlug("https://stripe.com")).toBe("stripe-com");
  });
  it("includes path segments", () => {
    expect(urlToSlug("https://stripe.com/docs/payments")).toBe(
      "stripe-com-docs-payments"
    );
  });
});

describe("validateUrl", () => {
  it("returns true for valid URLs", () => {
    expect(validateUrl("stripe.com")).toBe(true);
    expect(validateUrl("https://linear.app")).toBe(true);
  });
  it("returns false for invalid input", () => {
    expect(validateUrl("")).toBe(false);
    expect(validateUrl("not a url")).toBe(false);
  });
});

describe("extractDomainAndPath", () => {
  it("extracts domain and path", () => {
    const result = extractDomainAndPath("https://stripe.com/docs");
    expect(result).toEqual({ domain: "stripe.com", path: "/docs" });
  });
  it("extracts root path", () => {
    const result = extractDomainAndPath("stripe.com");
    expect(result).toEqual({ domain: "stripe.com", path: "/" });
  });
});
