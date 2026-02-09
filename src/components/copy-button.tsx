"use client";

import { useState, useCallback } from "react";
import { Button } from "./ui/button";

export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      variant="secondary"
      onClick={handleCopy}
      className="min-w-[70px] text-xs"
      aria-label={copied ? "Copied!" : label}
    >
      {copied ? <span className="text-emerald-400">Copied!</span> : label}
    </Button>
  );
}
