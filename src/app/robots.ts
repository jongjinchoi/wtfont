import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "ClaudeBot",
          "Bytespider",
          "Google-Extended",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://wtfont.wtf/sitemap.xml",
  };
}
