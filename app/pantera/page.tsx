import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Pantera Comercios - Sistema de Gestión 100% Web",
  description: "Pantera Comercios es un sistema de gestión 100% web. Controlá el stock, emití facturas, registrá caja y vendé en Mercado Libre.",
}

export default function PanteraPage() {
  const { sistemasZoologic } = theme
  const pantera = sistemasZoologic.items[2]

  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-32 pb-12 px-4 md:px-8" style={{ backgroundColor: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
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
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#F5F5F3" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.primary }}>Facturá desde cualquier lugar</h3>
              <p style={{ color: theme.colors.textMuted }}>Gestioná tu comercio 100% online desde tu celular, tablet o computadora.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#F5F5F3" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.primary }}>Integrá tu eCommerce</h3>
              <p style={{ color: theme.colors.textMuted }}>Conectá con Mercado Libre y Tienda Nube automáticamente.</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#F5F5F3" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.primary }}>Control total</h3>
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
                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border }}>
                  <h4 className="font-semibold" style={{ color: theme.colors.text }}>{item}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: "#7C3AED" }}>
            <h2 className="text-2xl font-bold mb-4 text-white">
              ¿Qué esperás para optimizar tu negocio?
            </h2>
            <a
              href="/#contact"
              className="inline-block px-8 py-3 rounded-lg font-medium"
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