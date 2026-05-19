import type { MetadataRoute } from "next"
import { theme } from "@/lib/theme"
import { supabaseAdmin } from "@/services/supabase-admin"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = theme.site.url

  const { data: noticias } = await supabaseAdmin
    .from("noticias")
    .select("id, created_at")
    .eq("publicada", true)

  const noticiaUrls: MetadataRoute.Sitemap = (noticias ?? []).map((n) => ({
    url: `${base}/noticias/${n.id}`,
    lastModified: new Date(n.created_at),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }))

  return [
    { url: base,                         lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/desarrollo-web`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sistemas-gestion`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/consultoria-it`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/soporte-tecnico`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/lince`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/dragonfish`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/pantera`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/noticias`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    ...noticiaUrls,
  ]
}
