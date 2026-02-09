export function buildAffiliateUrl(
  url: string | null,
  marketplace?: string
): string | null {
  if (!url) return null;

  const affiliateId =
    marketplace === "myfonts"
      ? process.env.MYFONTS_AFFILIATE_ID
      : process.env.FONTSPRING_AFFILIATE_ID;

  if (!affiliateId) return url;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("fontspring.com")) {
      parsed.searchParams.set("af", affiliateId);
    } else if (parsed.hostname.includes("myfonts.com")) {
      parsed.searchParams.set("ref", affiliateId);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
