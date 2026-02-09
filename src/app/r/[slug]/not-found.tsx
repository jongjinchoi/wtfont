import Link from "next/link";
import { Header } from "@/components/header";

export default function ResultNotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="font-pixel text-3xl text-zinc-100">404</h2>
          <p className="text-sm text-zinc-400">
            This result doesn&apos;t exist or has expired. Results are cached for
            7 days.
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-brand hover:text-orange-400 underline transition-colors duration-200"
          >
            Analyze a new URL
          </Link>
        </div>
      </main>
    </>
  );
}
