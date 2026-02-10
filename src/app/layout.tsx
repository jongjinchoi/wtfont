import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: {
    default: "WTFont.wtf — What font is that website using?",
    template: "%s — WTFont.wtf",
  },
  description:
    "Detect fonts on any website. Find free Google Fonts alternatives and get copy-paste code for your project.",
  metadataBase: new URL("https://wtfont.wtf"),
  keywords: [
    "font identifier",
    "what font is this",
    "web font detector",
    "free font alternatives",
    "google fonts",
    "font analyzer",
    "css fonts",
    "web typography",
  ],
  authors: [{ name: "WTFont.wtf" }],
  creator: "WTFont.wtf",
  openGraph: {
    title: "WTFont.wtf — What font is that website using?",
    description:
      "Detect any website's fonts. Get free alternatives and copy-paste code.",
    url: "https://wtfont.wtf",
    siteName: "WTFont.wtf",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WTFont.wtf — What font is that website using?",
    description:
      "Detect any website's fonts. Get free alternatives and copy-paste code.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://wtfont.wtf",
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
      className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable}`}
      suppressHydrationWarning
    >
      <body className="font-mono antialiased bg-terminal-bg text-terminal-text">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
