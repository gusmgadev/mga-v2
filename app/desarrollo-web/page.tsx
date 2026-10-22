import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Desarrollo Web en Rada Tilly y Comodoro Rivadavia",
  description: "Creamos sitios web modernos, rápidos y escalables. Landing pages, tiendas online, aplicaciones web a medida en Rada Tilly, Chubut. Desarrollo con Next.js, React y Tailwind CSS.",
  keywords: ["desarrollo web Rada Tilly", "diseño web Comodoro Rivadavia", "páginas web Chubut", "tienda online Patagonia", "landing page", "aplicación web a medida", "aplicaciones web Patagonia", "e-commerce Patagonia", "venta online Comodoro Rivadavia", "sistemas web Patagonia"],
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
  const faqs = [
    {
      q: "¿Qué tipos de sitios web desarrollan?",
      a: "Sitios web corporativos, tiendas online (e-commerce), aplicaciones web a medida y landing pages, con tecnologías modernas como Next.js, React y Tailwind CSS.",
    },
    {
      q: "¿Trabajan fuera de Chubut?",
      a: "Sí. Acompañamos proyectos en remoto para empresas, comercios y profesionales de toda la Patagonia y de Argentina, además de nuestros clientes de Comodoro Rivadavia y Rada Tilly.",
    },
    {
      q: "¿El sitio queda optimizado para Google?",
      a: "Sí. Aplicamos buenas prácticas de SEO técnico, rendimiento y experiencia móvil en cada proyecto para que tu sitio sea fácil de encontrar y de usar.",
    },
    {
      q: "¿Cómo solicito un presupuesto?",
      a: "Completá el formulario de contacto o escribinos por WhatsApp contándonos qué necesitás. Revisamos tu caso y te enviamos una propuesta con alcance y presupuesto.",
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
          <p className="text-base mb-6" style={{ color: theme.colors.text }}>
            Trabajamos con empresas, comercios, profesionales y emprendimientos de Comodoro Rivadavia, Rada Tilly y toda la región de Chubut, con proyectos presenciales en la zona y en modalidad remota.
          </p>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.text }}>¿Qué incluye?</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {["Sitios web corporativos", "Tiendas online (E-Commerce)", "Aplicaciones web a medida", "Landing pages de alto impacto", "Optimización SEO", "Diseño responsive y mobile-first"].map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border }}>
                <span className="font-medium" style={{ color: theme.colors.text }}>{item}</span>
              </div>
            ))}
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
              <Link href="/sistemas-gestion" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Sistemas de Gestión</Link>
              <Link href="/consultoria-it" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Consultoría IT</Link>
              <Link href="/soporte-tecnico" className="px-5 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary }}>Soporte Técnico</Link>
            </div>
          </section>

          <div className="p-4 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-4" style={{ backgroundColor: theme.colors.primary }}>
            <h2 className="text-base font-bold text-white text-center">¿Necesitás una solución web personalizada?</h2>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/#contact" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap" style={{ backgroundColor: "#fff", color: theme.colors.primary }}>Consultános</Link>
              <a href={`https://wa.me/${theme.contact.whatsapp}?text=Hola%20MGA%2C%20quisiera%20consultar%20por%20desarrollo%20web`} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 rounded-lg font-medium text-sm whitespace-nowrap" style={{ backgroundColor: "#25D366", color: "#fff" }}>WhatsApp</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}