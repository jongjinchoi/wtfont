"use client";

import { CopyButton } from "./copy-button";

export function CodeBlock({
  code,
  language = "html",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="relative group rounded-lg border border-terminal-border bg-[#1a1a1a] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-terminal-border">
        <span className="text-xs text-[#555] font-mono uppercase">
          {language}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed">
        <code className="font-mono text-[#ccc]">{code}</code>
      </pre>
    </div>
  );
}
