import type { MetadataRoute } from "next";
import { getAllCachedSlugs } from "@/lib/cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllCachedSlugs();

  const resultPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `https://wtfont.wtf/r/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://wtfont.wtf",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...resultPages,
  ];
}
