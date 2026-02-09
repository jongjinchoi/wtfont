"use client";

import { useState, useCallback, type FormEvent } from "react";
import { Button } from "./ui/button";

const EXAMPLE_SITES = [
  { label: "Stripe", url: "stripe.com" },
  { label: "Linear", url: "linear.app" },
  { label: "Vercel", url: "vercel.com" },
  { label: "Notion", url: "notion.so" },
];

export function UrlInput({
  onSubmit,
  loading = false,
}: {
  onSubmit: (url: string) => void;
  loading?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

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
    <div className="w-full max-w-2xl space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter any website URL..."
            className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-colors duration-200
              ${
                error
                  ? "border-red-500/50 focus:ring-red-500/50"
                  : "border-zinc-800 focus:ring-brand/50"
              }`}
            disabled={loading}
            aria-label="Website URL"
            aria-invalid={!!error}
          />
        </div>
        <Button type="submit" disabled={loading} className="px-6 shrink-0">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze"
          )}
        </Button>
      </form>

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-600">Try:</span>
        {EXAMPLE_SITES.map((site) => (
          <button
            key={site.url}
            type="button"
            onClick={() => handleExampleClick(site.url)}
            disabled={loading}
            className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-400
              hover:text-zinc-200 hover:border-zinc-700 transition-colors duration-200
              cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {site.label}
          </button>
        ))}
      </div>
    </div>
  );
}
