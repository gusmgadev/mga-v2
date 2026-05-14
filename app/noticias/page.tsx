import type { Metadata } from "next"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"
import Noticias from "@/components/landing/noticias"
import { supabaseAdmin } from "@/services/supabase-admin"

export const metadata: Metadata = {
  title: "Noticias y Novedades | MGA Informática",
  description: "Las últimas noticias y novedades de MGA Informática",
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
