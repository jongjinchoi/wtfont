"use client";

import { useState, useCallback, useRef, type FormEvent } from "react";

const EXAMPLE_SITES = [
  { label: "apple.com", url: "apple.com" },
  { label: "airbnb.com", url: "airbnb.com" },
  { label: "claude.ai", url: "claude.ai" },
  { label: "spotify.com", url: "spotify.com" },
];

export function UrlInput({
  onSubmit,
  loading = false,
  showExamples = true,
}: {
  onSubmit: (url: string) => void;
  loading?: boolean;
  showExamples?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = url.trim();
      if (!trimmed) {
        setError("Please enter a URL");
        return;
      }
      setError("");
      onSubmit(trimmed);
    },
    [url, onSubmit]
  );

  const handleExampleClick = useCallback(
    (exampleUrl: string) => {
      setUrl(exampleUrl);
      setError("");
      onSubmit(exampleUrl);
    },
    [onSubmit]
  );

  return (
    <div className="w-full space-y-section">
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <span className="text-success select-none">guest@wtfont:~$</span>
          <span className="text-terminal-muted select-none ml-2">wtfont analyze</span>
          <div className="relative flex-1 ml-2">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              className="w-full bg-transparent outline-none text-terminal-text caret-transparent placeholder:text-terminal-dim"
              placeholder=""
              disabled={loading}
              aria-label="Website URL"
              aria-invalid={!!error}
              autoFocus
            />
            {!loading && (
              <span
                className="absolute top-1/2 -translate-y-1/2 w-2 h-5 bg-brand animate-blink pointer-events-none"
                style={{ left: url ? `${url.length}ch` : 0 }}
              />
            )}
          </div>
        </div>
      </form>

      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}

      {showExamples && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-terminal-subtle">try:</span>
          {EXAMPLE_SITES.map((site, i) => (
            <span key={site.url} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExampleClick(site.url)}
                disabled={loading}
                className="text-terminal-subtle hover:text-brand transition-colors duration-200
                  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed underline underline-offset-2 decoration-terminal-dim"
              >
                {site.label}
              </button>
              {i < EXAMPLE_SITES.length - 1 && (
                <span className="text-terminal-dim">·</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
