import type { MetadataRoute } from "next"
import { theme } from "@/lib/theme"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow:     "/",
      disallow:  ["/dashboard/", "/auth/", "/api/"],
    },
    sitemap: `${theme.site.url}/sitemap.xml`,
  }
}
