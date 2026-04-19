"use client";
import { useState, type ReactNode } from "react";

export default function CodeBlock({
  children,
  text,
  className = "",
}: {
  children: ReactNode;
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <pre
        className={`m-0 overflow-x-auto rounded-md border border-border bg-bg p-4 text-[12.5px] text-text ${className}`}
      >
        {children}
      </pre>
      <button
        onClick={copy}
        aria-label="Copy to clipboard"
        type="button"
        className={`absolute top-2 right-2 z-[2] rounded border px-2.5 py-1 font-mono text-[11px] transition-colors ${
          copied
            ? "border-green text-green"
            : "border-border-strong bg-surface-2 text-dim hover:border-primary hover:text-text"
        }`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
