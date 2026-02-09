import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WTFont.wtf — Find fonts, get free alternatives, copy the code",
  description:
    "Enter any website URL. We extract the fonts, find free alternatives, and give you copy-paste code for HTML, Next.js, Nuxt, and React.",
  metadataBase: new URL("https://wtfont.wtf"),
  openGraph: {
    title: "WTFont.wtf",
    description: "What font is that? Free alternatives + ready-to-use code.",
    url: "https://wtfont.wtf",
    siteName: "WTFont.wtf",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WTFont.wtf",
    description: "What font is that? Free alternatives + ready-to-use code.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
