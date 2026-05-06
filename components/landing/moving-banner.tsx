"use client"

import { theme } from "@/lib/theme"

const words = [
  "DISEÑO WEB",
  "SISTEMAS A MEDIDA",
  "CONTROL STOCK Y VENTAS",
  "SERVICIO TÉCNICO",
  "ASESORAMIENTO INFORMÁTICO",
  "VENTAS DE EQUIPOS",
]

export default function MovingBanner() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 overflow-hidden py-2"
      style={{
        background: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 50%, ${theme.colors.primary} 100%)`,
      }}
    >
      <div className="flex whitespace-nowrap animate-banner-scroll">
        {[...words, ...words, ...words].map((word, idx) => (
          <span
            key={idx}
            className="mx-8 text-xs font-bold tracking-widest uppercase"
            style={{ color: "#fff" }}
          >
            {word}
            <span className="mx-6 text-white opacity-50">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}