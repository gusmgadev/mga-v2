import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Pantera Comercios - Sistema de Gestión Web en Chubut | MGA Informática",
  description: "Pantera Comercios: sistema de gestión 100% web para comercios. Control de stock, facturación electrónica, caja y venta en Mercado Libre desde cualquier dispositivo. Distribuidor en Chubut.",
  keywords: ["Pantera Comercios Chubut", "sistema gestión web Patagonia", "ZooLogic Pantera", "software comercios Comodoro Rivadavia", "gestión online Chubut"],
  alternates: { canonical: `${theme.site.url}/pantera` },
  openGraph: {
    title: "Pantera Comercios - MGA Informática",
    description: "Sistema de gestión 100% web para comercios. Stock, facturación y Mercado Libre. Distribuidor en Chubut.",
    url: `${theme.site.url}/pantera`,
    siteName: theme.site.name,
    locale: "es_AR",
    type: "website",
  },
}

export default function PanteraPage() {
  const { sistemasZoologic } = theme
  const pantera = sistemasZoologic.items[2]

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
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#7C3AED" }}>
              {pantera.title}
            </h1>
            <p className="text-base mb-6" style={{ color: theme.colors.textMuted }}>
              Tu primer software de gestión 100% web
            </p>
            <div className="h-40 flex items-center justify-center mx-auto" style={{ maxWidth: "360px" }}>
              <Image
                src={pantera.logo}
                alt="Pantera Comercios"
                width={360}
                height={160}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #7C3AED" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#7C3AED" }}>Facturá desde cualquier lugar</h3>
              <p style={{ color: theme.colors.textMuted }}>Gestioná tu comercio 100% online desde tu celular, tablet o computadora.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #7C3AED" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#7C3AED" }}>Integrá tu eCommerce</h3>
              <p style={{ color: theme.colors.textMuted }}>Conectá con Mercado Libre y Tienda Nube automáticamente.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#E0E0DD", border: "1px solid #7C3AED" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#7C3AED" }}>Control total</h3>
              <p style={{ color: theme.colors.textMuted }}>Stock, caja, ventas y reportes en tiempo real.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: theme.colors.text }}>
              Todas las funcionalidades que necesitás
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Gestión de Ventas Online",
                "Gestión de Stock",
                "Caja",
                "Gestión de múltiples cuentas",
                "Estadísticas",
                "Compras y Proveedores",
                "Gestión de Ventas local físico",
                "Listas de precios",
                "Clientes y Cuentas Corrientes",
                "Seguridad",
                "Etiquetas y Categorías",
                "Importadores Masivos",
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: "#E0E0DD", border: "1px solid #7C3AED" }}>
                  <h4 className="font-semibold" style={{ color: "#374151" }}>{item}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl flex items-center justify-center gap-6" style={{ backgroundColor: "#7C3AED" }}>
            <h2 className="text-base font-bold text-white">
              ¿Qué esperás para optimizar tu negocio?
            </h2>
            <a
              href="/#contact"
              className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0"
              style={{ backgroundColor: "#fff", color: "#7C3AED" }}
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