"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export default function ResultError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="font-pixel text-2xl text-zinc-100">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-400">
            We couldn&apos;t analyze that URL. The site may be blocking
            automated requests, or something unexpected happened.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={reset} variant="secondary">
              Try again
            </Button>
            <Link href="/">
              <Button variant="ghost">Go home</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
