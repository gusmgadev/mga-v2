import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Lince Indumentaria - Sistema de Gestión",
  description: "Lince Indumentaria es el sistema más elegido por la industria de la indumentaria con más de 25 años en el mercado. Gestiona ventas, stock, producción y más.",
}

export default function LincePage() {
  const { sistemasZoologic } = theme
  const lince = sistemasZoologic.items[0]

  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-32 pb-12 px-4 md:px-8" style={{ backgroundColor: "#fff" }}>
        <div className="max-w-6xl mx-auto">
<div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
              {lince.title}
            </h1>
            <p className="text-base mb-6" style={{ color: theme.colors.textMuted }}>
              El sistema más elegido por la industria con más de 25 años en el mercado
            </p>
            <div className="h-40 flex items-center justify-center mx-auto" style={{ maxWidth: "360px" }}>
              <Image
                src={lince.logo}
                alt="Lince Indumentaria"
                width={360}
                height={160}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#F5F5F3" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.primary }}>Gestión de Ventas</h3>
              <p style={{ color: theme.colors.textMuted }}>Agilizá la gestión de ventas emitiendo facturas, tickets o facturación electrónica.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#F5F5F3" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.primary }}>Producción</h3>
              <p style={{ color: theme.colors.textMuted }}>Controlá el stock de avíos y telas, gestioná el proceso de corte en talleres y el control de calidad.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#F5F5F3" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.primary }}>Inventario</h3>
              <p style={{ color: theme.colors.textMuted }}>Controlá y ajustá las diferencias del stock del sistema en función al inventario físico.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: theme.colors.text }}>
              Todas las funcionalidades que necesitás
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Gestión de Ventas Minorista",
                "Gestión de Ventas Mayorista",
                "Gestión de Compras",
                "Toma de Inventario",
                "Tarjetas de Crédito",
                "Gestión de Producción",
                "Contabilidad",
                "Centralizador",
                "Zoo Logic Cubos",
                "Programador de Tareas",
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border }}>
                  <h4 className="font-semibold" style={{ color: theme.colors.text }}>{item}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: "#F58220" }}>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Mejorá el trabajo en tu negocio con Lince Indumentaria
            </h2>
            <a
              href="/#contact"
              className="inline-block px-8 py-3 rounded-lg font-medium"
              style={{ backgroundColor: "#fff", color: "#F58220" }}
            >
              Consultános
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}