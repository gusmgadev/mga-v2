"use client"

import { theme } from "@/lib/theme"
import Image from "next/image"
import { useState } from "react"
import { Phone, MapPin } from "lucide-react"
import { motion } from "framer-motion"

type ClienteDB = {
  id: number
  name: string
  rubro: string | null
  phone: string | null
  address: string | null
  imagen: string | null
  pagina_web: string | null
}

export default function Clients({ clientes }: { clientes: ClienteDB[] }) {
  const { clients } = theme
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <section
      id="clientes"
      className="py-20 px-6 md:px-12"
      style={{
        background: `linear-gradient(180deg, #1C1C1E 0%, #F5F5F3 100%)`,
        scrollMarginTop: "180px"
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "#fff" }}
          >
            {clients.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto animated-gradient-text"
            style={{ color: "#fff" }}
          >
            {clients.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {clientes.map((client, idx) => (
            <motion.div
              key={client.id}
              className="relative h-56 sm:h-52 rounded-xl overflow-hidden cursor-pointer"
              style={{
                backgroundColor: "#fff",
                boxShadow: theme.shadows.md,
                border: hoveredIdx === idx ? "4px solid #2979FF" : `1px solid ${theme.colors.border}`,
              }}
              animate={{
                y: [0, -2, 0, 2, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: idx * 0.6,
                ease: "easeInOut",
                times: [0, 0.25, 0.5, 0.75, 1],
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="absolute inset-0 p-2 flex flex-col items-center justify-center">
                <div className="w-22 h-22 relative mb-1 flex-shrink-0">
                  {client.imagen ? (
                    <Image
                      src={client.imagen}
                      alt={client.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-center font-semibold" style={{ color: theme.colors.textMuted }}>
                      {client.name}
                    </div>
                  )}
                </div>
                <h3
                  className="text-sm font-semibold text-center leading-tight"
                  style={{ color: theme.colors.text }}
                >
                  {client.name}
                </h3>
                <p
                  className="text-sm text-center"
                  style={{ color: theme.colors.textMuted }}
                >
                  {client.rubro}
                </p>

                <div
                  className="absolute inset-0 p-2 flex flex-col justify-center transition-opacity duration-200"
                  style={{
                    backgroundColor: "#fff",
                    opacity: hoveredIdx === idx ? 1 : 0,
                  }}
                >
                  <div className="w-22 h-22 relative mx-auto mb-1 flex-shrink-0">
                    {client.imagen ? (
                      <Image
                        src={client.imagen}
                        alt={client.name}
                        fill
                        className="object-contain"
                      />
                    ) : null}
                  </div>
                  <h3
                    className="text-sm font-bold text-center leading-tight"
                    style={{ color: theme.colors.text }}
                  >
                    {client.name}
                  </h3>
                  <p
                    className="text-sm text-center"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {client.rubro}
                  </p>
                  <div className="mt-1 pt-1 border-t" style={{ borderColor: theme.colors.border }}>
                    {client.address && (
                      <div className="flex items-center gap-1 justify-center">
                        <MapPin size={10} />
                        <span className="text-[10px] truncate max-w-full">{client.address}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1 justify-center">
                        <Phone size={10} />
                        <span className="text-[10px]">{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
