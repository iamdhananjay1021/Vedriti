import type { MetadataRoute } from "next";

const SITE_URL = "https://vedrit.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/privacy-policy", "/terms", "/delete-account"];
  return pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "yearly",
    priority: path === "" ? 1 : 0.4,
  }));
}
