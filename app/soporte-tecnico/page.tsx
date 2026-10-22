import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Soporte Técnico y Reparación de PC en Rada Tilly",
  description: "Soporte técnico presencial y remoto en Rada Tilly y Comodoro Rivadavia. Reparación de computadoras, mantenimiento preventivo, redes, backup y recuperación de datos.",
  keywords: ["soporte técnico Rada Tilly", "reparación computadoras Chubut", "mantenimiento PC Comodoro Rivadavia", "servicio técnico Patagonia", "backup datos Chubut", "servicio técnico computadoras Patagonia", "reparación PC Comodoro Rivadavia", "técnico informático Rada Tilly", "recuperación datos Patagonia", "soporte remoto Chubut"],
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
  const faqs = [
    {
      q: "¿Atienden de forma remota y presencial?",
      a: "Sí. Brindamos soporte remoto y presencial en la zona de Rada Tilly y Comodoro Rivadavia, según el tipo de problema y tus necesidades.",
    },
    {
      q: "¿Qué incluye el mantenimiento preventivo?",
      a: "Revisión, limpieza y optimización de equipos e infraestructura para detectar problemas a tiempo y evitar interrupciones en tu operación.",
    },
    {
      q: "¿Pueden ayudar con redes y conectividad?",
      a: "Sí. Trabajamos redes, conectividad, instalación y configuración de software, además de backup y recuperación de datos.",
    },
    {
      q: "¿Cómo solicito soporte?",
      a: "Escribinos por WhatsApp o completá el formulario de contacto describiendo el problema. Evaluamos el caso y coordinamos la atención.",
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }) }} />
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
            <p className="text-base mb-6" style={{ color: theme.colors.text }}>
              Atendemos a hogares, profesionales, comercios y empresas de Rada Tilly, Comodoro Rivadavia y la región de Chubut.
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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.text }}>Preguntas frecuentes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {faqs.map((f, idx) => (
                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border }}>
                  <h3 className="font-semibold mb-2" style={{ color: theme.colors.text }}>{f.q}</h3>
                  <p className="text-sm" style={{ color: theme.colors.textMuted }}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-center" style={{ color: theme.colors.text }}>También te puede interesar</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/consultoria-it" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Consultoría IT</Link>
              <Link href="/sistemas-gestion" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Sistemas de Gestión</Link>
              <Link href="/desarrollo-web" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Desarrollo Web</Link>
            </div>
          </section>

          <div className="p-4 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-4" style={{ backgroundColor: theme.colors.primary }}>
            <h2 className="text-base font-bold text-white text-center">¿Tu sistema necesita soporte?</h2>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/#contact" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap" style={{ backgroundColor: "#fff", color: theme.colors.primary }}>Consultános</Link>
              <a href={`https://wa.me/${theme.contact.whatsapp}?text=Hola%20MGA%2C%20necesito%20soporte%20t%C3%A9cnico`} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap" style={{ backgroundColor: "#25D366", color: "#fff" }}>WhatsApp</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
