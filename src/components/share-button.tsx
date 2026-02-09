"use client";

import { useState, useCallback } from "react";
import { Button } from "./ui/button";

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

  const shareText = `Found ${fontCount} font${fontCount !== 1 ? "s" : ""} on ${domain} with free alternatives`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : url;

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-2">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors duration-200 cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share
      </a>
      <Button
        variant="ghost"
        onClick={handleCopyLink}
        className="text-xs px-3 py-1.5"
      >
        {copied ? (
          <span className="text-emerald-400">Copied!</span>
        ) : (
          "Copy link"
        )}
      </Button>
    </div>
  );
}
