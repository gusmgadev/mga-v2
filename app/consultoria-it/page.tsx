import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Consultoría IT en Rada Tilly y Comodoro Rivadavia",
  description: "Asesoría estratégica en tecnología e infraestructura para tu negocio en Chubut. Diagnóstico tecnológico, planificación IT, seguridad informática y transformación digital.",
  keywords: ["consultoría IT Rada Tilly", "asesoría tecnológica Chubut", "transformación digital Patagonia", "infraestructura IT Comodoro Rivadavia", "seguridad informática Chubut"],
  alternates: { canonical: `${theme.site.url}/consultoria-it` },
  openGraph: {
    title: "Consultoría IT - MGA Informática",
    description: "Asesoría estratégica en tecnología e infraestructura para tu negocio en Chubut.",
    url: `${theme.site.url}/consultoria-it`,
    siteName: theme.site.name,
    locale: "es_AR",
    type: "website",
  },
}

const heroImage = "/images/hero/hero-5.jpg"

export default function ConsultoriaITPage() {
  const faqs = [
    {
      q: "¿Qué incluye una consultoría IT?",
      a: "Diagnóstico tecnológico integral, planificación de infraestructura, selección de herramientas y software, seguridad informática, transformación digital y capacitación del equipo.",
    },
    {
      q: "¿Para qué tipo de empresas es?",
      a: "Para comercios, emprendimientos, profesionales y pymes que quieren ordenar su tecnología, reducir problemas operativos y crecer con una hoja de ruta clara.",
    },
    {
      q: "¿Cómo comienza el trabajo?",
      a: "Con un diagnóstico de tu situación actual y tus objetivos. A partir de ahí diseñamos una propuesta personalizada adaptada a tus necesidades y presupuesto.",
    },
    {
      q: "¿Pueden ejecutar el plan propuesto?",
      a: "Sí. Además del asesoramiento, desarrollamos e implementamos las soluciones recomendadas y brindamos soporte continuo.",
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
          <Image src={heroImage} alt="Consultoría IT" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Consultoría IT</h1>
            <p className="text-lg max-w-2xl">Asesoría estratégica en tecnología e infraestructura para tu negocio.</p>
          </div>
        </div>
        <div className="py-12 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-base mb-6" style={{ color: theme.colors.text }}>
              Te ayudamos a tomar las mejores decisiones tecnológicas para tu empresa. Analizamos tu situación actual, identificamos oportunidades de mejora y diseñamos una hoja de ruta digital adaptada a tus objetivos y presupuesto.
            </p>
            <p className="text-base mb-6" style={{ color: theme.colors.text }}>
              Asesoramos a comercios, profesionales y pymes de Comodoro Rivadavia, Rada Tilly y la región de Chubut, con acompañamiento en cada etapa de la implementación.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.text }}>¿Qué incluye?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Diagnóstico tecnológico integral",
                "Planificación de infraestructura IT",
                "Selección de herramientas y software",
                "Transformación digital",
                "Seguridad informática",
                "Capacitación del equipo",
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
              <Link href="/desarrollo-web" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Desarrollo Web</Link>
              <Link href="/sistemas-gestion" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Sistemas de Gestión</Link>
              <Link href="/soporte-tecnico" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Soporte Técnico</Link>
            </div>
          </section>

          <div className="p-4 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-4" style={{ backgroundColor: theme.colors.primary }}>
            <h2 className="text-base font-bold text-white text-center">¿Querés transformar tu negocio?</h2>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/#contact" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap" style={{ backgroundColor: "#fff", color: theme.colors.primary }}>Consultános</Link>
              <a href={`https://wa.me/${theme.contact.whatsapp}?text=Hola%20MGA%2C%20quisiera%20consultar%20por%20consultor%C3%ADa%20IT`} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap" style={{ backgroundColor: "#25D366", color: "#fff" }}>WhatsApp</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
