import type { MetadataRoute } from "next"
import { theme } from "@/lib/theme"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = theme.site.url

  return [
    { url: base,                         lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/desarrollo-web`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sistemas-gestion`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/consultoria-it`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/soporte-tecnico`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/lince`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/dragonfish`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/pantera`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ]
}
