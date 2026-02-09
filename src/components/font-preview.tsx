"use client";

import { useState, useEffect } from "react";

const SIZES = [16, 24, 36] as const;

export function FontPreview({
  fontName,
  googleFontsUrl,
  defaultText = "The quick brown fox jumps over the lazy dog",
}: {
  fontName: string;
  googleFontsUrl: string | null;
  defaultText?: string;
}) {
  const [size, setSize] = useState<number>(24);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!googleFontsUrl) {
      setLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.href = googleFontsUrl;
    link.rel = "stylesheet";
    link.onload = () => setLoaded(true);
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [googleFontsUrl]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`px-2 py-1 text-xs rounded font-mono cursor-pointer transition-colors duration-200
              ${
                size === s
                  ? "bg-brand text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            aria-label={`Set preview size to ${s}px`}
          >
            {s}
          </button>
        ))}
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand/50 min-h-[60px] transition-opacity duration-200"
        style={{
          fontFamily: `'${fontName}', sans-serif`,
          fontSize: `${size}px`,
          lineHeight: 1.5,
          opacity: loaded ? 1 : 0.5,
        }}
        role="textbox"
        aria-label="Font preview - click to edit"
      >
        {defaultText}
      </div>
      <p className="text-xs text-zinc-500">Click to edit the preview text</p>
    </div>
  );
}
