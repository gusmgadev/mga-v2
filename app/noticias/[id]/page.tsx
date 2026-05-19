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
    alternates: { canonical: `${theme.site.url}/noticias/${id}` },
    openGraph: {
      title: `${data.titulo} | MGA Informática`,
      description: data.resumen,
      url: `${theme.site.url}/noticias/${id}`,
      locale: "es_AR",
      type: "article",
    },
  }
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.includes('/shorts/')) {
        const id = u.pathname.split('/shorts/')[1]?.split('/')[0]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
      const v = u.searchParams.get('v')
      return v ? `https://www.youtube.com/embed/${v}` : null
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).find(p => /^\d+$/.test(p))
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

function formatFecha(dateStr: string) {
  const [y, m, d] = dateStr.split('T')[0].split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
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

  const embedUrl = noticia.video_url ? getEmbedUrl(noticia.video_url) : null

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
            {/* Fecha + Título — siempre visible al entrar */}
            <div className="px-8 pt-8 pb-6 md:px-12 md:pt-10 md:pb-8">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: theme.colors.primary }}
              >
                {formatFecha(noticia.fecha ?? noticia.created_at)}
              </p>
              <h1
                className="text-2xl md:text-3xl font-bold leading-tight"
                style={{ color: theme.colors.text }}
              >
                {noticia.titulo}
              </h1>
            </div>

            {/* Imagen portada — completa, sin recorte */}
            {noticia.imagen_portada && (
              <div className="relative w-full" style={{ aspectRatio: "16/9", backgroundColor: "#F0F2F4" }}>
                <Image
                  src={noticia.imagen_portada}
                  alt={noticia.titulo}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}

            {/* Contenido */}
            <div className="p-8 md:p-12">
              <div
                className="mb-6"
                style={{ height: "2px", width: "48px", backgroundColor: theme.colors.primary, borderRadius: "2px" }}
              />

              <p
                className="text-base leading-relaxed mb-8 font-medium"
                style={{ color: theme.colors.textMuted }}
              >
                {noticia.resumen}
              </p>

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

              {embedUrl && (
                <div style={{ marginTop: '32px' }}>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', backgroundColor: '#000' }}>
                    <iframe
                      src={embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                </div>
              )}
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: noticia.titulo,
        description: noticia.resumen,
        url: `${theme.site.url}/noticias/${id}`,
        datePublished: noticia.fecha ?? noticia.created_at,
        dateModified: noticia.created_at,
        image: noticia.imagen_portada ? [noticia.imagen_portada] : [`${theme.site.url}${theme.site.ogImage}`],
        author: { "@type": "Organization", name: "MGA Informática", url: theme.site.url },
        publisher: {
          "@type": "Organization",
          name: "MGA Informática",
          logo: { "@type": "ImageObject", url: `${theme.site.url}${theme.logo.path}` },
        },
      }) }} />
      <Footer />
    </>
  )
}
