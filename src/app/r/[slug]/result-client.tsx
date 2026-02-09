"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FontCard } from "@/components/font-card";
import { ShareButton } from "@/components/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisResult } from "@/types/font";
import type { AnalyzeResponse, AnalyzeErrorResponse } from "@/types/api";

export function ResultPageClient({
  initialData,
  url,
}: {
  initialData?: AnalysisResult;
  url?: string;
}) {
  const [data, setData] = useState<AnalysisResult | null>(initialData ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialData);

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
        } else {
          setData(json.data);
        }
      } catch {
        setError("Failed to analyze. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    analyze();
  }, [initialData, url]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Header section */}
          {data && (
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-100">
                  Fonts on{" "}
                  <span className="text-brand">{data.domain}</span>
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  {data.matchedFonts.length} font
                  {data.matchedFonts.length !== 1 && "s"} detected
                </p>
              </div>
              <ShareButton
                url={data.url}
                domain={data.domain}
                fontCount={data.matchedFonts.length}
              />
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ))}
              <p className="text-sm text-zinc-500 text-center animate-pulse">
                Analyzing fonts and finding alternatives...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <Link
                href="/"
                className="inline-block mt-4 text-xs text-zinc-400 hover:text-zinc-200 underline transition-colors duration-200"
              >
                Try another URL
              </Link>
            </div>
          )}

          {/* Results */}
          {data && (
            <div className="space-y-6">
              {data.matchedFonts.map((font, i) => (
                <FontCard key={`${font.originalName}-${i}`} font={font} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
