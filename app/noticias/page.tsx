import type { Metadata } from "next"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"
import Noticias from "@/components/landing/noticias"
import { supabaseAdmin } from "@/services/supabase-admin"
import { theme } from "@/lib/theme"

export const metadata: Metadata = {
  title: "Noticias y Novedades | MGA Informática",
  description: "Últimas noticias, actualizaciones y novedades de MGA Informática: sistemas de gestión, desarrollo web, soporte técnico y soluciones IT en Rada Tilly y Comodoro Rivadavia, Chubut.",
  keywords: [
    "noticias tecnología Chubut",
    "novedades sistemas gestión",
    "MGA Informática noticias",
    "actualizaciones software Patagonia",
    "blog IT Comodoro Rivadavia",
    "Zoologic noticias",
  ],
  alternates: { canonical: `${theme.site.url}/noticias` },
  openGraph: {
    title: "Noticias y Novedades — MGA Informática",
    description: "Últimas noticias y novedades sobre soluciones IT, sistemas de gestión y desarrollo web en Chubut.",
    url: `${theme.site.url}/noticias`,
    siteName: theme.site.name,
    locale: "es_AR",
    type: "website",
  },
}

export const dynamic = 'force-dynamic'

export default async function NoticiasPage() {
  const { data: noticias } = await supabaseAdmin
    .from("noticias")
    .select("id, titulo, resumen, imagen_card, created_at")
    .eq("publicada", true)
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false })

  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-[136px]">
        {noticias && noticias.length > 0 ? (
          <Noticias noticias={noticias} />
        ) : (
          <div className="py-32 text-center" style={{ backgroundColor: "#F5F5F3" }}>
            <p style={{ color: "#666", fontSize: "16px" }}>No hay noticias publicadas por el momento.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
