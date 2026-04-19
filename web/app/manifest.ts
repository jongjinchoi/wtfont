import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — identify web fonts`,
    short_name: SITE_NAME,
    description:
      "Detect fonts, find free Google Fonts alternatives, and get copy-paste code.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0e12",
    theme_color: "#0d0e12",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
