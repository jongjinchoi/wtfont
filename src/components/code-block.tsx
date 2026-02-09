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
    <div className="relative group rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-xs text-zinc-500 font-mono uppercase">
          {language}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-zinc-300">{code}</code>
      </pre>
    </div>
  );
}
