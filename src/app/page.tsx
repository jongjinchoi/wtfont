"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UrlInput } from "@/components/url-input";
import { normalizeUrl, urlToSlug } from "@/lib/url-utils";

export default function HomePage() {
  const router = useRouter();

  const handleSubmit = useCallback(
    (url: string) => {
      const normalized = normalizeUrl(url);
      const slug = urlToSlug(normalized);
      router.push(`/r/${slug}?url=${encodeURIComponent(normalized)}`);
    },
    [router]
  );

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="font-pixel text-5xl sm:text-7xl tracking-tight">
              <span className="text-brand">WTFont</span>
              <span className="text-zinc-500">.wtf</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto">
              Enter any website URL. Get the fonts, free alternatives, and
              copy-paste code.
            </p>
          </div>

          <UrlInput onSubmit={handleSubmit} />

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-600 pt-4">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              AI-powered matching
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                />
              </svg>
              HTML / Next.js / Nuxt / React
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
              100% free
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
