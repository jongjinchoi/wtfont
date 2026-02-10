"use client";

import { useState, useCallback } from "react";

export function CopyButton({
  text,
  label = "Copy",
  onCopied,
}: {
  text: string;
  label?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  }, [text, onCopied]);

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-mono text-terminal-subtle hover:text-terminal-text transition-colors duration-200 cursor-pointer"
      aria-label={copied ? "Copied!" : label}
    >
      {copied ? <span className="text-success">Copied!</span> : label}
    </button>
  );
}
