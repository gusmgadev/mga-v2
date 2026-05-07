import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Desarrollo Web en Rada Tilly y Comodoro Rivadavia - MGA Informática",
  description: "Creamos sitios web modernos, rápidos y escalables. Landing pages, tiendas online, aplicaciones web a medida en Rada Tilly, Chubut. Desarrollo con Next.js, React y Tailwind CSS.",
  keywords: ["desarrollo web Rada Tilly", "diseño web Comodoro Rivadavia", "páginas web Chubut", "tienda online Patagonia", "landing page", "aplicación web a medida"],
  alternates: { canonical: `${theme.site.url}/desarrollo-web` },
  openGraph: {
    title: "Desarrollo Web - MGA Informática",
    description: "Sitios web modernos y aplicaciones a medida en Rada Tilly, Chubut.",
    url: `${theme.site.url}/desarrollo-web`,
    siteName: theme.site.name,
    locale: "es_AR",
    type: "website",
  },
}

const heroImage = "/images/hero/hero-2.jpg"

export default function DesarrolloWebPage() {
  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-32" style={{ backgroundColor: "#fff" }}>
        <div className="relative h-96 w-full overflow-hidden">
          <Image src={heroImage} alt="Desarrollo Web" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Desarrollo Web</h1>
            <p className="text-lg max-w-2xl">Creamos sitios web modernos, rápidos y escalables con las últimas tecnologías.</p>
          </div>
        </div>
        <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
          <p className="text-base mb-6" style={{ color: theme.colors.text }}>
            Diseñamos y desarrollamos sitios web y aplicaciones a medida utilizando tecnologías modernas como Next.js, React y Tailwind CSS. Desde landing pages hasta plataformas completas, construimos soluciones digitales que convierten visitantes en clientes.
          </p>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.text }}>¿Qué incluye?</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {["Sitios web corporativos", "Tiendas online (E-Commerce)", "Aplicaciones web a medida", "Landing pages de alto impacto", "Optimización SEO", "Diseño responsive y mobile-first"].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border }}>
                <span className="font-medium" style={{ color: theme.colors.text }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl flex items-center justify-center gap-6" style={{ backgroundColor: theme.colors.primary }}>
            <h2 className="text-base font-bold text-white">¿Necesitás una solución web personalizada?</h2>
            <a href="/#contact" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0" style={{ backgroundColor: "#fff", color: theme.colors.primary }}>Consultános</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}