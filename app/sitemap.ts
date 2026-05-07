import type { MetadataRoute } from "next"
import { theme } from "@/lib/theme"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = theme.site.url

  return [
    {
      url:             base,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        1,
    },
  ]
}
