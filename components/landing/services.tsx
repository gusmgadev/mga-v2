"use client"

import { theme } from "@/lib/theme"
import Image from "next/image"
import Link from "next/link"

const heroImages = [
  "/images/hero/hero-2.jpg",
  "/images/hero/hero-1.jpg", 
  "/images/hero/hero-3.jpg",
  "/images/hero/hero-5.jpg",
]

const descriptions = [
  "Creamos sitios web modernos, rápidos y escalables con las últimas tecnologías.",
  "Soluciones completas de gestión de stock, ventas e inventario. Distribuidor certificado ZooLogic.",
  "Soporte especializado para mantener tus sistemas funcionando sin interrupciones.",
  "Asesoría estratégica en tecnología e infraestructura para tu negocio.",
]

const links = [
  "/desarrollo-web",
  "/sistemas-gestion",
  "/consultoria-it",
  "/soporte-tecnico",
]

export default function Services() {
  const { services } = theme

  return (
    <section
      id="services"
      className="py-20 px-6 md:px-12"
      style={{ 
        backgroundColor: theme.colors.background,
        scrollMarginTop: "180px"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            {services.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme.colors.textMuted }}
          >
            {services.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.items.map((service, idx) => (
            <div
              key={idx}
              className="group relative rounded-xl overflow-hidden h-80"
            >
              <Image
                src={heroImages[idx]}
                alt={service.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60" />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <h3 className="text-xl font-bold mb-2">
                  {service.title}
                </h3>
                <p className="text-sm mb-4 line-clamp-2">
                  {descriptions[idx]}
                </p>
                <Link
                  href={links[idx]}
                  className="inline-block text-center py-2 rounded-lg font-medium bg-white/20 hover:bg-white/30 transition-colors text-sm"
                >
                  Conocer más
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}