"use client";

import { CopyButton } from "./copy-button";

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
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed">
        <code className="font-mono text-terminal-text">{code}</code>
      </pre>
    </div>
  );
}
