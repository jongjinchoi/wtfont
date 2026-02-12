export function trackEvent(data: {
  event: "affiliate_click" | "code_copy" | "share";
  fontName: string;
  marketplace?: string;
  framework?: string;
}) {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(data.event, {
      fontName: data.fontName,
      marketplace: data.marketplace,
      framework: data.framework,
    });
  }
}
