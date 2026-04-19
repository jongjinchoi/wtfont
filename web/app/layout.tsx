import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SITE_URL, SITE_NAME, AUTHOR, KEYWORDS } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jbmono",
  display: "swap",
});

const TITLE =
  "wtfont — identify web fonts from your terminal or through Claude";
const DESCRIPTION =
  "Detect fonts on any website, find free Google Fonts alternatives, and get copy-paste code. Two interfaces — MCP or CLI.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · wtfont",
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [AUTHOR],
  creator: AUTHOR.name,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0e12" },
  ],
};

// Runs synchronously before hydration: reads URL hash + localStorage and
// sets `html[data-interface]` so CSS can hide the inactive toggle view from
// first paint. Prevents MCP→CLI hydration flicker for returning users who
// previously picked CLI. See vercel-react-best-practices:
// rendering-hydration-no-flicker + client-localstorage-schema.
const interfaceBootScript = `(function(){try{var h=location.hash.replace('#','');var s=null;try{s=localStorage.getItem('wtfont-interface:v1');}catch(e){}var v=(h==='mcp'||h==='cli')?h:(s==='mcp'||s==='cli')?s:'mcp';document.documentElement.dataset.interface=v;}catch(e){document.documentElement.dataset.interface='mcp';}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jbMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{ __html: interfaceBootScript }}
        />
        {children}
      </body>
    </html>
  );
}
