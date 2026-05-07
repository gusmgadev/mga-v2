import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Lince Indumentaria - Sistema de Gestión en Chubut | MGA Informática",
  description: "Lince Indumentaria: el sistema más elegido por la industria textil con más de 25 años en el mercado. Gestión de ventas, stock, producción y facturación electrónica. Distribuidor certificado en Chubut.",
  keywords: ["Lince Indumentaria Chubut", "sistema gestión indumentaria", "ZooLogic Lince", "software textil Patagonia", "punto de venta indumentaria Comodoro Rivadavia"],
  alternates: { canonical: `${theme.site.url}/lince` },
  openGraph: {
    title: "Lince Indumentaria - MGA Informática",
    description: "Sistema de gestión líder para la industria de la indumentaria. Distribuidor certificado en Chubut.",
    url: `${theme.site.url}/lince`,
    siteName: theme.site.name,
    locale: "es_AR",
    type: "website",
  },
}

export default function LincePage() {
  const { sistemasZoologic } = theme
  const lince = sistemasZoologic.items[0]

  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-48 pb-12 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/secciones/zoologic.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: "blur(3px) brightness(0.85)" }}
          />
        </div>
        <div className="absolute inset-0 bg-white/75" />
        <div className="max-w-6xl mx-auto relative">
<div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#F58220" }}>
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
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #F58220" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#F58220" }}>Gestión de Ventas</h3>
              <p style={{ color: theme.colors.textMuted }}>Agilizá la gestión de ventas emitiendo facturas, tickets o facturación electrónica.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #F58220" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#F58220" }}>Producción</h3>
              <p style={{ color: theme.colors.textMuted }}>Controlá el stock de avíos y telas, gestioná el proceso de corte en talleres y el control de calidad.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #F58220" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#F58220" }}>Inventario</h3>
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
                <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: "#E0E0DD", border: "1px solid #F58220" }}>
                  <h4 className="font-semibold" style={{ color: "#374151" }}>{item}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl flex items-center justify-center gap-6" style={{ backgroundColor: "#F58220" }}>
            <h2 className="text-base font-bold text-white">
              Mejorá el trabajo en tu negocio con Lince Indumentaria
            </h2>
            <a
              href="/#contact"
              className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0"
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