"use client"

import { theme } from "@/lib/theme"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function SistemasZoologic() {
  const { sistemasZoologic } = theme

  return (
    <section
      id="sistemas-zoologic"
      className="pt-8 pb-20 px-6 md:px-12 relative overflow-hidden"
      style={{
        scrollMarginTop: "180px",
      }}
    >
      <div className="absolute inset-0">
        <Image
          src="/images/secciones/sistemas1.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{ filter: "blur(2px) brightness(0.8)" }}
        />
      </div>
      <div className="absolute inset-0 bg-white/70" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Image
              src="/images/logos/zoologic.png"
              alt="Zoologic"
              width={240}
              height={80}
              className="object-contain"
            />
            <div className="text-left border-l-2 pl-4" style={{ borderColor: theme.colors.primary }}>
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: theme.colors.primary }}>
                Agentes certificados
              </p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text }}>
                desde el 2008
              </p>
            </div>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            {sistemasZoologic.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme.colors.textMuted }}
          >
            {sistemasZoologic.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sistemasZoologic.items.map((item, idx) => (
            <Link href={item.url} key={idx} className="block">
            <motion.div
              className="rounded-xl overflow-hidden flex flex-col cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{
                backgroundColor: "#fff",
                boxShadow: theme.shadows.md,
                border: `1px solid ${theme.colors.border}`,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="p-6 flex-1">
                <div className="h-40 relative mb-4 flex items-center justify-center">
                  <Image
                    src={item.logo}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3
                  className="text-xl font-bold text-center mb-1"
                  style={{ color: theme.colors.text }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm text-center mb-4"
                  style={{ color: theme.colors.textMuted }}
                >
                  {item.description}
                </p>
                <p
                  className="text-xs text-center mb-4 font-semibold"
                  style={{ color: theme.colors.text }}
                >
                  {item.subtitle}
                </p>
              </div>
              <div className="p-4 pt-0">
                <div
                  className="block w-1/2 mx-auto text-center py-2 rounded-lg font-medium text-sm"
                  style={{
                    backgroundColor: idx === 0 ? "#F58220" : idx === 1 ? "#0077C0" : "#7C3AED",
                    color: "#fff",
                  }}
                >
                  Conocer más
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}