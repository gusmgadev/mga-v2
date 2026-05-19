import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Sistemas de Gestión y Punto de Venta en Chubut - MGA Informática",
  description: "Distribuidor certificado ZooLogic en Chubut. Sistemas de punto de venta, control de stock, facturación electrónica AFIP y gestión empresarial para pymes en Rada Tilly y Comodoro Rivadavia.",
  keywords: ["sistema de gestión Chubut", "punto de venta Rada Tilly", "ZooLogic Chubut", "facturación electrónica AFIP", "control stock Comodoro Rivadavia", "software pymes Patagonia", "sistema de stock Patagonia", "control de ventas Comodoro Rivadavia", "sistema punto de venta Argentina", "gestión empresarial Rada Tilly"],
  alternates: { canonical: `${theme.site.url}/sistemas-gestion` },
  openGraph: {
    title: "Sistemas de Gestión - MGA Informática",
    description: "Distribuidor certificado ZooLogic en Chubut. POS, stock y facturación electrónica.",
    url: `${theme.site.url}/sistemas-gestion`,
    siteName: theme.site.name,
    locale: "es_AR",
    type: "website",
  },
}

const heroImage = "/images/hero/hero-1.jpg"

export default function SistemasGestionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Sistemas de Gestión y Punto de Venta",
        description: "Distribuidor certificado ZooLogic en Chubut. Sistemas de punto de venta, control de stock, facturación electrónica AFIP y gestión empresarial para pymes en Rada Tilly y Comodoro Rivadavia.",
        url: "https://mgadigital.com.ar/sistemas-gestion",
        provider: { "@type": "LocalBusiness", name: "MGA Informática", url: "https://mgadigital.com.ar" },
        areaServed: [
          { "@type": "City", name: "Rada Tilly" },
          { "@type": "City", name: "Comodoro Rivadavia" },
          { "@type": "State", name: "Chubut" },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Sistemas ZooLogic",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "SoftwareApplication", name: "Lince Indumentaria", url: "https://mgadigital.com.ar/lince" } },
            { "@type": "Offer", itemOffered: { "@type": "SoftwareApplication", name: "Dragonfish Color y Talle", url: "https://mgadigital.com.ar/dragonfish" } },
            { "@type": "Offer", itemOffered: { "@type": "SoftwareApplication", name: "Pantera Comercios", url: "https://mgadigital.com.ar/pantera" } },
          ],
        },
      }) }} />
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-32" style={{ backgroundColor: "#fff" }}>
        <div className="relative h-96 w-full overflow-hidden">
          <Image src={heroImage} alt="Sistemas de Gestión" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Sistemas de Gestión</h1>
            <p className="text-lg max-w-2xl">Soluciones completas de gestión de stock, ventas e inventario.</p>
          </div>
        </div>
        <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-base mb-6" style={{ color: theme.colors.text }}>
              Como distribuidor certificado de ZooLogic, implementamos sistemas de gestión empresarial para puntos de venta, control de stock, facturación electrónica y más. Soluciones pensadas para pymes y emprendedores que quieren profesionalizar su negocio.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.text }}>¿Qué incluye?</h2>
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

          <div className="p-4 rounded-xl flex items-center justify-center gap-6" style={{ backgroundColor: theme.colors.primary }}>
            <h2 className="text-base font-bold text-white">¿Querés profesionalizar tu negocio?</h2>
            <a href="/#contact" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0" style={{ backgroundColor: "#fff", color: theme.colors.primary }}>Consultános</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
