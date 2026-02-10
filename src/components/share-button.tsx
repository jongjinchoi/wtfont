"use client";

import { useState, useCallback, useEffect } from "react";
import { trackEvent } from "@/lib/track";

export function ShareButton({
  url,
  domain,
  fontCount,
}: {
  url: string;
  domain: string;
  fontCount: number;
}) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const shareText = `Found ${fontCount} font${fontCount !== 1 ? "s" : ""} on ${domain} with free alternatives`;

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackEvent({ event: "share", fontName: domain, marketplace: "copy_link" });
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl, domain]);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent({ event: "share", fontName: domain, marketplace: "twitter" })
        }
        className="text-terminal-link hover:text-terminal-text transition-colors duration-200 cursor-pointer"
      >
        Share ↗
      </a>
      <span className="text-terminal-dim">|</span>
      <button
        onClick={handleCopyLink}
        className="text-terminal-link hover:text-terminal-text transition-colors duration-200 cursor-pointer"
      >
        {copied ? (
          <span className="text-success">Copied!</span>
        ) : (
          "Copy link"
        )}
      </button>
    </div>
  );
}
