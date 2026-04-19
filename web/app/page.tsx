import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import DemoFrame from "@/components/DemoFrame";
import WhySection from "@/components/WhySection";
import QuickStart from "@/components/QuickStart";
import InterfaceToggle from "@/components/InterfaceToggle";
import SecuritySection from "@/components/SecuritySection";
import Footer from "@/components/Footer";
import { SITE_URL, AUTHOR } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
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
  author: {
    "@type": "Person",
    name: AUTHOR.name,
    url: AUTHOR.url,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
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
