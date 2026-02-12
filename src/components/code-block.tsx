"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "./copy-button";

function CopyIconButton({
  text,
  onCopied,
}: {
  text: string;
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
      className="absolute bottom-2 right-2 p-1.5 rounded-md border border-terminal-border bg-terminal-surface/80 text-terminal-subtle hover:text-terminal-text opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function CodeBlock({
  code,
  language = "html",
  onCopied,
}: {
  code: string;
  language?: string;
  onCopied?: () => void;
}) {
  return (
    <div className="relative group rounded-lg border border-terminal-border bg-terminal-code overflow-hidden shadow-sm shadow-black/10">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-terminal-border">
        <span className="text-xs text-terminal-subtle font-mono uppercase">
          {language}
        </span>
        <CopyButton text={code} onCopied={onCopied} />
      </div>
      <pre className="relative overflow-x-auto p-3 text-sm leading-relaxed">
        <code className="font-mono text-terminal-text">
          {code.split("\n").map((line, i) => {
            const trimmed = line.trimStart();
            const isComment =
              trimmed.startsWith("//") ||
              trimmed.startsWith("/*") ||
              trimmed.startsWith("*") ||
              trimmed.startsWith("<!--");
            return (
              <span key={i}>
                {i > 0 && "\n"}
                {isComment ? (
                  <span className="text-terminal-comment">{line}</span>
                ) : (
                  line
                )}
              </span>
            );
          })}
        </code>
        <CopyIconButton text={code} onCopied={onCopied} />
      </pre>
    </div>
  );
}
