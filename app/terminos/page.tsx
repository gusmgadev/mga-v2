import type { Metadata } from "next"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso del sitio web de MGA Informática, servicios de desarrollo web, sistemas de gestión y soporte informático en Chubut.",
  alternates: { canonical: `${theme.site.url}/terminos` },
}

const { contact, site } = theme

export default function TerminosPage() {
  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-[136px] pb-20 px-4 md:px-8" style={{ backgroundColor: theme.colors.background }}>
        <article className="max-w-3xl mx-auto py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: theme.colors.text }}>
            Términos y Condiciones
          </h1>

          <div className="space-y-6 text-base" style={{ color: theme.colors.text }}>
            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Uso del sitio</h2>
              <p style={{ color: theme.colors.textMuted }}>
                El acceso y la navegación en {site.url} implican la aceptación de estos términos. El
                contenido del sitio tiene carácter informativo sobre los servicios ofrecidos por MGA
                Informática y no constituye una oferta contractual vinculante.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Servicios y presupuestos</h2>
              <p style={{ color: theme.colors.textMuted }}>
                Los precios, alcances y tiempos de los servicios se definen en cada propuesta
                comercial escrita. La información publicada en el sitio es orientativa y puede
                actualizarse sin previo aviso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Propiedad intelectual</h2>
              <p style={{ color: theme.colors.textMuted }}>
                Los textos, logos, imágenes y marcas del sitio pertenecen a MGA Informática o se
                utilizan con autorización de sus titulares. Queda prohibida su reproducción sin
                consentimiento previo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Enlaces externos</h2>
              <p style={{ color: theme.colors.textMuted }}>
                El sitio puede incluir enlaces a páginas de terceros. MGA Informática no se
                responsabiliza por el contenido o las prácticas de privacidad de dichos sitios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Contacto</h2>
              <p style={{ color: theme.colors.textMuted }}>
                Para consultas sobre estos términos, escribinos a{" "}
                <a href={`mailto:${contact.email}`} className="font-medium underline" style={{ color: theme.colors.primary }}>
                  {contact.email}
                </a>{" "}
                o al {contact.phone}.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
