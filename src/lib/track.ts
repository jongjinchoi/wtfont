export function trackEvent(data: {
  event: "affiliate_click" | "code_copy" | "share";
  fontName: string;
  marketplace?: string;
  framework?: string;
}) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, url: window.location.href }),
  }).catch(() => {});
}
