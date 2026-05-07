import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"

export const metadata: Metadata = {
  title: "Sistemas de Gestión - MGA Informática",
  description: "Soluciones completas de gestión de stock, ventas e inventario.",
}

const heroImage = "/images/hero/hero-1.jpg"

export default function SistemasGestionPage() {
  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-32" style={{ backgroundColor: "#fff" }}>
        <div className="relative h-96 w-full overflow-hidden">
          <Image
            src={heroImage}
            alt="Sistemas de Gestión"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Sistemas de Gestión
            </h1>
            <p className="text-lg max-w-2xl">
              Solucione completa de gestión de stock, venta e inventario.
            </p>
          </div>
        </div>
        <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-base mb-6" style={{ color: theme.colors.text }}>
              Como distribuidor certificado de ZooLogic, implementamos sistemas de gestión empresarial para puntos de venta, control de stock, facturación electrónica y más. Soluciones pensadas para pymes y emprendedores que quieren profesionalizar su negocio.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.text }}>
              ¿Qué incluye?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Sistema de punto de venta (POS)",
                "Control de stock e inventario",
                "Facturación electrónica AFIP",
                "Reportes y estadísticas",
                "Gestión de clientes y proveedores",
                "Integración con balanzas y lectores de código",
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border }}>
                  <span className="font-medium" style={{ color: theme.colors.text }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: theme.colors.primary }}>
            <h2 className="text-2xl font-bold mb-4 text-white">
              ¿Querés profesionalizar tu negocio?
            </h2>
            <a
              href="/#contact"
              className="inline-block px-8 py-3 rounded-lg font-medium"
              style={{ backgroundColor: "#fff", color: theme.colors.primary }}
            >
              Consultános
            </a>
          </div>
        </div>
      </main>
    </>
  )
}