import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"
import { supabaseAdmin } from "@/services/supabase-admin"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { data } = await supabaseAdmin
    .from("noticias")
    .select("titulo, resumen")
    .eq("id", Number(id))
    .eq("publicada", true)
    .single()

  if (!data) return { title: "Noticia no encontrada | MGA Informática" }

  return {
    title: `${data.titulo} | MGA Informática`,
    description: data.resumen,
    openGraph: {
      title: `${data.titulo} | MGA Informática`,
      description: data.resumen,
      locale: "es_AR",
      type: "article",
    },
  }
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
}

const contentStyles = `
  .noticia-body p { margin-bottom: 0.75em; }
  .noticia-body p:last-child { margin-bottom: 0; }
  .noticia-body mark { background-color: #fef08a; border-radius: 2px; padding: 0 2px; }
  .noticia-body strong { font-weight: 700; }
  .noticia-body em { font-style: italic; }
`

export default async function NoticiaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: noticia, error } = await supabaseAdmin
    .from("noticias")
    .select("*")
    .eq("id", Number(id))
    .single()

  if (error || !noticia) notFound()
  if (!noticia.publicada) redirect("/")

  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-48 pb-20 px-4 md:px-8" style={{ backgroundColor: "#F5F5F3" }}>
        <div className="max-w-3xl mx-auto">

          {/* Volver */}
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors"
            style={{ color: theme.colors.primary, textDecoration: "none" }}
          >
            <ArrowLeft size={15} />
            Volver a noticias
          </Link>

          {/* Card principal */}
          <article
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#fff", boxShadow: theme.shadows.md }}
          >
            {/* Imagen portada */}
            {noticia.imagen_portada && (
              <div className="relative w-full" style={{ aspectRatio: "16/7", overflow: "hidden" }}>
                <Image
                  src={noticia.imagen_portada}
                  alt={noticia.titulo}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}

            <div className="p-8 md:p-12">
              {/* Fecha */}
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: theme.colors.primary }}
              >
                {formatFecha(noticia.created_at)}
              </p>

              {/* Título */}
              <h1
                className="text-2xl md:text-3xl font-bold leading-tight mb-6"
                style={{ color: theme.colors.text }}
              >
                {noticia.titulo}
              </h1>

              {/* Separador */}
              <div
                className="mb-6"
                style={{ height: "2px", width: "48px", backgroundColor: theme.colors.primary, borderRadius: "2px" }}
              />

              {/* Resumen destacado */}
              <p
                className="text-base leading-relaxed mb-8 font-medium"
                style={{ color: theme.colors.textMuted }}
              >
                {noticia.resumen}
              </p>

              {/* Contenido completo */}
              <style>{contentStyles}</style>
              <div
                className="noticia-body text-base leading-relaxed"
                style={{ color: theme.colors.text }}
                dangerouslySetInnerHTML={{
                  __html: /<[a-z]/i.test(noticia.contenido)
                    ? noticia.contenido
                    : noticia.contenido.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </article>

          {/* Volver (bottom) */}
          <div className="mt-10 text-center">
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: theme.colors.primary,
                color: "#fff",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} />
              Ver todas las noticias
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
