"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FontCard } from "@/components/font-card";
import { ShareButton } from "@/components/share-button";
import { UrlInput } from "@/components/url-input";
import { normalizeUrl, urlToSlug } from "@/lib/url-utils";
import type { AnalysisResult } from "@/types/font";
import type { AnalyzeResponse, AnalyzeErrorResponse } from "@/types/api";

interface LogLine {
  text: string;
  type: "command" | "info" | "success" | "error";
}

export function ResultPageClient({
  initialData,
  url,
}: {
  initialData?: AnalysisResult;
  url?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(initialData ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [showResults, setShowResults] = useState(!!initialData);
  const startTime = useRef(Date.now());

  const handleNewAnalysis = useCallback(
    (newUrl: string) => {
      const normalized = normalizeUrl(newUrl);
      const slug = urlToSlug(normalized);
      router.push(`/r/${slug}?url=${encodeURIComponent(normalized)}`);
    },
    [router]
  );

  const domain = url
    ? url.replace(/^https?:\/\//, "").split("/")[0]
    : "";

  // Build loading log sequence
  useEffect(() => {
    if (initialData || !url) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    startTime.current = Date.now();

    setLogs([{ text: `wtfont analyze ${domain}`, type: "command" }]);

    timers.push(
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { text: `Connecting to ${domain}...`, type: "info" },
        ]);
      }, 400)
    );

    timers.push(
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { text: "Connected", type: "success" },
        ]);
      }, 1200)
    );

    timers.push(
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { text: "Parsing CSS & finding fonts...", type: "info" },
        ]);
      }, 1800)
    );

    timers.push(
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { text: "Matching free alternatives...", type: "info" },
        ]);
      }, 2500)
    );

    return () => timers.forEach(clearTimeout);
  }, [initialData, url, domain]);

  // Fetch data
  useEffect(() => {
    if (initialData || !url) return;

    async function analyze() {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const json = (await res.json()) as
          | AnalyzeResponse
          | AnalyzeErrorResponse;

        if (!json.success) {
          setError(json.error);
          setLogs((prev) => [
            ...prev,
            { text: `Error: ${json.error}`, type: "error" },
          ]);
        } else {
          const elapsed = Date.now() - startTime.current;
          setData(json.data);
          setLogs((prev) => [
            ...prev,
            {
              text: `Found ${json.data.matchedFonts.length} font${json.data.matchedFonts.length !== 1 ? "s" : ""} (${elapsed}ms)`,
              type: "success",
            },
            { text: "Analysis complete", type: "success" },
          ]);
          setTimeout(() => setShowResults(true), 500);
        }
      } catch {
        setError("Failed to analyze. Please try again.");
        setLogs((prev) => [
          ...prev,
          { text: "Connection failed", type: "error" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    analyze();
  }, [initialData, url]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header domain={domain} />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-content px-page-px space-y-8">
          {/* Terminal log */}
          {!initialData && (
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="animate-fade-in-line"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {log.type === "command" && (
                    <span className="text-terminal-text">
                      <span className="text-brand">$</span> {log.text}
                    </span>
                  )}
                  {log.type === "info" && (
                    <span className="text-terminal-link">{log.text}</span>
                  )}
                  {log.type === "success" && (
                    <span className="text-success">
                      <span className="mr-1">+</span>
                      {log.text}
                    </span>
                  )}
                  {log.type === "error" && (
                    <span className="text-red-400">
                      <span className="mr-1">x</span>
                      {log.text}
                    </span>
                  )}
                </div>
              ))}
              {loading && (
                <span className="inline-block w-2 h-4 bg-terminal-text animate-blink mt-1" />
              )}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="border border-red-500/20 bg-red-500/5 p-4 text-sm animate-fade-in-line">
              <p className="text-red-400">{error}</p>
              <Link
                href="/"
                className="inline-block mt-3 text-xs text-terminal-link hover:text-terminal-text underline underline-offset-2 transition-colors duration-200"
              >
                &lt;- Back to home
              </Link>
            </div>
          )}

          {/* Results */}
          {showResults && data && (
            <div className="space-y-6 animate-fade-in-line">
              {/* Summary */}
              <div className="border-t border-terminal-border pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 text-sm font-mono">
                    <div>
                      <span className="text-terminal-link">domain: </span>
                      <span className="text-brand">{data.domain}</span>
                    </div>
                    <div>
                      <span className="text-terminal-link">fonts: </span>
                      <span className="text-terminal-text">
                        {data.matchedFonts.length} detected
                      </span>
                    </div>
                    <div>
                      <span className="text-terminal-link">date: </span>
                      <span className="text-terminal-text">
                        {new Date(data.analyzedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ShareButton
                    url={data.url}
                    domain={data.domain}
                    fontCount={data.matchedFonts.length}
                  />
                </div>
              </div>

              {/* Font cards */}
              {data.matchedFonts.map((font, i) => (
                <div
                  key={`${font.originalName}-${i}`}
                  className="animate-fade-in-line"
                  style={{ animationDelay: `${(i + 1) * 0.15}s` }}
                >
                  <FontCard font={font} index={i} />
                </div>
              ))}

              {/* Analyze another site */}
              <div className="pt-4 border-t border-terminal-border">
                <UrlInput onSubmit={handleNewAnalysis} showExamples={false} />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
