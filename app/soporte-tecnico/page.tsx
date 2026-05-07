import type { Metadata } from "next"
import Image from "next/image"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Soporte Técnico y Reparación de PC en Rada Tilly - MGA Informática",
  description: "Soporte técnico presencial y remoto en Rada Tilly y Comodoro Rivadavia. Reparación de computadoras, mantenimiento preventivo, redes, backup y recuperación de datos.",
  keywords: ["soporte técnico Rada Tilly", "reparación computadoras Chubut", "mantenimiento PC Comodoro Rivadavia", "servicio técnico Patagonia", "backup datos Chubut"],
  alternates: { canonical: `${theme.site.url}/soporte-tecnico` },
  openGraph: {
    title: "Soporte Técnico - MGA Informática",
    description: "Soporte técnico presencial y remoto en Rada Tilly y Comodoro Rivadavia.",
    url: `${theme.site.url}/soporte-tecnico`,
    siteName: theme.site.name,
    locale: "es_AR",
    type: "website",
  },
}

const heroImage = "/images/hero/hero-3.jpg"

export default function SoporteTecnicoPage() {
  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-32" style={{ backgroundColor: "#fff" }}>
        <div className="relative h-96 w-full overflow-hidden">
          <Image src={heroImage} alt="Soporte Técnico" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Soporte Técnico</h1>
            <p className="text-lg max-w-2xl">Soporte especializado para mantener tus sistemas funcionando sin interrupciones.</p>
          </div>
        </div>
        <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-base mb-6" style={{ color: theme.colors.text }}>
              Brindamos soporte técnico presencial y remoto para mantener tu infraestructura tecnológica en óptimas condiciones. Diagnóstico, reparación, mantenimiento preventivo y asistencia continua para que tu negocio no se detenga.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.text }}>¿Qué incluye?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Soporte remoto y presencial",
                "Mantenimiento preventivo de equipos",
                "Redes y conectividad",
                "Instalación y configuración de software",
                "Backup y recuperación de datos",
                "Atención prioritaria para clientes",
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border }}>
                  <span className="font-medium" style={{ color: theme.colors.text }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl flex items-center justify-center gap-6" style={{ backgroundColor: theme.colors.primary }}>
            <h2 className="text-base font-bold text-white">¿Tu sistema necesita soporte?</h2>
            <a href="/#contact" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0" style={{ backgroundColor: "#fff", color: theme.colors.primary }}>Consultános</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
