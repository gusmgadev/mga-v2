"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { theme } from "@/lib/theme"
import { ArrowRight } from "lucide-react"

type NoticiaCard = {
  id: number
  titulo: string
  resumen: string
  imagen_card: string | null
  created_at: string
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
}

export default function Noticias({ noticias }: { noticias: NoticiaCard[] }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  if (noticias.length === 0) return null

  return (
    <section
      id="noticias"
      className="py-20 px-6 md:px-12"
      style={{ backgroundColor: "#F5F5F3", scrollMarginTop: "180px" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            Noticias y Novedades
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.colors.textMuted }}>
            Mantente al tanto de las últimas novedades de MGA Informática
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((n) => (
            <Link
              key={n.id}
              href={`/noticias/${n.id}`}
              style={{ textDecoration: "none" }}
              onMouseEnter={() => setHoveredId(n.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <article
                className="rounded-2xl overflow-hidden flex flex-col h-full"
                style={{
                  backgroundColor: "#fff",
                  boxShadow: hoveredId === n.id ? theme.shadows.md : theme.shadows.sm,
                  border: `1px solid ${hoveredId === n.id ? theme.colors.primary + "55" : theme.colors.border}`,
                  transition: "all 0.25s ease",
                  transform: hoveredId === n.id ? "translateY(-3px)" : "none",
                }}
              >
                {/* Imagen */}
                <div className="relative w-full" style={{ aspectRatio: "16/9", overflow: "hidden", backgroundColor: "#E8ECF0" }}>
                  {n.imagen_card ? (
                    <Image
                      src={n.imagen_card}
                      alt={n.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{
                        objectFit: "cover",
                        transition: "transform 0.35s ease",
                        transform: hoveredId === n.id ? "scale(1.04)" : "scale(1)",
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}22 0%, ${theme.colors.primary}44 100%)` }}
                    >
                      <span style={{ fontSize: "40px", opacity: 0.3 }}>📰</span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex flex-col flex-1 p-6">
                  <p
                    className="text-xs font-medium mb-3"
                    style={{ color: theme.colors.primary, textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    {formatFecha(n.created_at)}
                  </p>
                  <h3
                    className="text-lg font-bold leading-snug mb-3"
                    style={{ color: theme.colors.text }}
                  >
                    {n.titulo}
                  </h3>
                  <p
                    className="text-sm leading-relaxed flex-1"
                    style={{
                      color: theme.colors.textMuted,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {n.resumen}
                  </p>
                  <div
                    className="flex items-center gap-2 mt-4 text-sm font-medium"
                    style={{
                      color: hoveredId === n.id ? theme.colors.primary : theme.colors.textMuted,
                      transition: "color 0.2s ease",
                    }}
                  >
                    Leer más <ArrowRight size={14} style={{ transition: "transform 0.2s ease", transform: hoveredId === n.id ? "translateX(4px)" : "none" }} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
