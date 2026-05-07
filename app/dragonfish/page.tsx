import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Dragonfish - Sistema de Gestión para Pymes en Chubut | MGA Informática",
  description: "Dragonfish Color y Talle: software completo para pymes con integración a Mercado Libre, Tienda Nube y WooCommerce. Gestión de stock, facturación y multi-sucursales. Distribuidor certificado en Chubut.",
  keywords: ["Dragonfish Chubut", "sistema gestión pymes Patagonia", "ZooLogic Dragonfish", "software Mercado Libre Chubut", "facturación electrónica pymes Comodoro Rivadavia"],
  alternates: { canonical: `${theme.site.url}/dragonfish` },
  openGraph: {
    title: "Dragonfish - MGA Informática",
    description: "Software completo para pymes con integración a Mercado Libre y Tienda Nube. Distribuidor en Chubut.",
    url: `${theme.site.url}/dragonfish`,
    siteName: theme.site.name,
    locale: "es_AR",
    type: "website",
  },
}

export default function DragonfishPage() {
  const { sistemasZoologic } = theme
  const dragonfish = sistemasZoologic.items[1]

  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-48 pb-12 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/secciones/zoologic.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "blur(3px) brightness(0.85)" }}
          />
        </div>
        <div className="absolute inset-0 bg-white/75" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#0077C0" }}>
              {dragonfish.title}
            </h1>
            <p className="text-base mb-6" style={{ color: theme.colors.textMuted }}>
              El software completo, sencillo y adaptable a las necesidades de tu negocio
            </p>
            <div className="h-40 flex items-center justify-center mx-auto" style={{ maxWidth: "460px" }}>
              <Image
                src={dragonfish.logo}
                alt="Dragonfish"
                width={460}
                height={160}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #0077C0" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#0077C0" }}>Gestión Integral</h3>
              <p style={{ color: theme.colors.textMuted }}>Administración y control completo para tu empresa.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #0077C0" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#0077C0" }}>Multi-sucursales</h3>
              <p style={{ color: theme.colors.textMuted }}>Gestión de múltiples locales, depósitos y oficinas.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #0077C0" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#0077C0" }}>Integraciones</h3>
              <p style={{ color: theme.colors.textMuted }}>Conecta tu tienda con Mercado Libre, Tienda Nube y WooCommerce.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: theme.colors.text }}>
              Todas las funcionalidades que necesitás
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Gestión de Stock",
                "Facturación Electrónica",
                "Control de Caja",
                "Gestión de Proveedores",
                "Contabilidad",
                "Conciliación Bancaria",
                "Reportes y Estadísticas",
                "Promociones y Descuentos",
                "Gestión de Clientes",
                "Importadores Masivos",
                "Etiquetas y Códigos",
                "Seguridad y Permisos",
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: "#E0E0DD", border: "1px solid #0077C0" }}>
                  <h4 className="font-semibold" style={{ color: "#374151" }}>{item}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl flex items-center justify-center gap-6" style={{ backgroundColor: "#0077C0" }}>
            <h2 className="text-base font-bold text-white">
              Optimizá tu negocio con Dragonfish
            </h2>
            <a
              href="/#contact"
              className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0"
              style={{ backgroundColor: "#fff", color: "#0077C0" }}
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