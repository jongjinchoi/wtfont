import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import DemoFrame from "@/components/DemoFrame";
import WhySection from "@/components/WhySection";
import QuickStart from "@/components/QuickStart";
import InterfaceToggle from "@/components/InterfaceToggle";
import SecuritySection from "@/components/SecuritySection";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, AUTHOR } from "@/lib/site";

const PERSON_ID = `${SITE_URL}/#person`;
const APP_ID = `${SITE_URL}/#software`;
const ORG_ID = `${SITE_URL}/#org`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: AUTHOR.name,
      url: AUTHOR.url,
      sameAs: [AUTHOR.url, "https://github.com/jongjinchoi"],
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      founder: { "@id": PERSON_ID },
    },
    {
      "@type": "SoftwareApplication",
      "@id": APP_ID,
      name: "wtfont",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Linux, Windows",
      description:
        "Identify web fonts on any website, find free Google Fonts alternatives, and generate copy-paste code. Runs from your terminal or through Claude via MCP.",
      url: SITE_URL,
      downloadUrl: "https://www.npmjs.com/package/wtfont",
      codeRepository: "https://github.com/jongjinchoi/wtfont",
      license: "https://github.com/jongjinchoi/wtfont/blob/main/LICENSE",
      image: `${SITE_URL}/opengraph-image.png`,
      author: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is wtfont?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "wtfont is an open-source CLI and MCP tool that identifies the fonts used on any website, cross-references them against the Google Fonts database, and generates copy-paste code for your stack. You can run it from your terminal or let Claude drive it through MCP.",
          },
        },
        {
          "@type": "Question",
          name: "How does wtfont identify fonts on a website?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "wtfont parses the site's HTML and CSS statically in roughly one second to extract every font-family declaration along with its role (body, heading, code), source (Google Fonts, Adobe, self-hosted), weights, and license. For JavaScript-rendered single-page apps it optionally falls back to Playwright.",
          },
        },
        {
          "@type": "Question",
          name: "Is wtfont free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. wtfont is MIT-licensed and published on npm for free. There is no paid tier.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install wtfont?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Install globally with `npm install -g wtfont` (or `bun install -g wtfont` / `pnpm add -g wtfont`), then run `wtfont analyze <url>`. For the Claude / MCP path, add `{\"command\": \"npx\", \"args\": [\"-y\", \"wtfont\", \"mcp\"]}` to your Claude Desktop config.",
          },
        },
        {
          "@type": "Question",
          name: "What's the difference between wtfont's MCP and CLI interfaces?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The CLI is a standalone command you run in your terminal — ideal for scripting, CI, and quick lookups. The MCP server lets Claude (Desktop, Code, Cursor, Windsurf, VS Code) call wtfont's tools conversationally, so you can ask questions like 'what fonts does stripe.com use, and what are free alternatives?' and get an answer with working code.",
          },
        },
        {
          "@type": "Question",
          name: "Does wtfont send my data anywhere?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. wtfont ships with zero telemetry. The MCP server uses stdio transport only — no HTTP listener, no network port, no cross-process access. Outbound fetches are https-only and guarded against SSRF.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "Install and run wtfont from the terminal",
      description:
        "Install the wtfont CLI globally with npm and identify the fonts on any website.",
      totalTime: "PT1M",
      supply: [{ "@type": "HowToSupply", name: "Node.js" }],
      tool: [{ "@type": "HowToTool", name: "npm" }],
      step: [
        {
          "@type": "HowToStep",
          name: "Install wtfont globally",
          text: "Run `npm install -g wtfont` in your terminal. You can also use `bun install -g wtfont` or `pnpm add -g wtfont`.",
        },
        {
          "@type": "HowToStep",
          name: "Analyze a website",
          text: "Run `wtfont analyze vercel.com`. wtfont prints every font on the page with its role, source, weights, and license.",
        },
        {
          "@type": "HowToStep",
          name: "Generate copy-paste code",
          text: "Pick a font name from the output and run `wtfont code Inter --framework nextjs` to get a ready-to-paste snippet including preconnect tags, weights, and fallback.",
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="hero-bg relative overflow-hidden">
        <div className="relative z-[1]">
          <Nav />
          <div className="mx-auto max-w-[1100px] px-6">
            <Hero />
            <DemoFrame />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-6">
        <WhySection />
        <QuickStart />
        <InterfaceToggle />
        <SecuritySection />
        <Footer />
      </div>
    </>
  );
}
