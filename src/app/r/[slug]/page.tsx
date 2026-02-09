import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedResultBySlug } from "@/lib/cache";
import { ResultPageClient } from "./result-client";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ url?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCachedResultBySlug(slug);

  if (!result) {
    return { title: "Analyzing... — WTFont.wtf" };
  }

  const fontNames = result.matchedFonts
    .map((f) => f.originalName)
    .slice(0, 3)
    .join(", ");

  return {
    title: `Fonts on ${result.domain} — WTFont.wtf`,
    description: `${result.domain} uses ${fontNames}. See free alternatives and copy-paste code.`,
    openGraph: {
      title: `Fonts on ${result.domain}`,
      description: `Found ${result.matchedFonts.length} font(s): ${fontNames}. Get free alternatives + code.`,
      url: `https://wtfont.wtf/r/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `Fonts on ${result.domain} — WTFont.wtf`,
      description: `Found ${result.matchedFonts.length} font(s): ${fontNames}.`,
    },
  };
}

export default async function ResultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { url } = await searchParams;

  const cached = await getCachedResultBySlug(slug);

  if (cached) {
    return <ResultPageClient initialData={cached} />;
  }

  if (!url) {
    notFound();
  }

  return <ResultPageClient url={url} />;
}
