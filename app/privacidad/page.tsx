import type { Metadata } from "next"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de MGA Informática: cómo se recopilan, utilizan y protegen los datos personales enviados a través de mgadigital.com.ar.",
  alternates: { canonical: `${theme.site.url}/privacidad` },
}

const { contact, site } = theme

export default function PrivacidadPage() {
  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="min-h-screen pt-[136px] pb-20 px-4 md:px-8" style={{ backgroundColor: theme.colors.background }}>
        <article className="max-w-3xl mx-auto py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: theme.colors.text }}>
            Política de Privacidad
          </h1>

          <div className="space-y-6 text-base" style={{ color: theme.colors.text }}>
            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Datos que recopilamos</h2>
              <p style={{ color: theme.colors.textMuted }}>
                A través del formulario de contacto de {site.url} recopilamos únicamente los datos que
                ingresás voluntariamente: nombre, correo electrónico, teléfono (opcional) y el contenido
                de tu consulta. Estos datos se utilizan exclusivamente para responder tu consulta
                comercial.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Uso de los datos</h2>
              <p style={{ color: theme.colors.textMuted }}>
                Los datos personales enviados se emplean para atender tus consultas, preparar
                propuestas comerciales y brindar información sobre nuestros servicios. No se venden ni
                se comparten con terceros con fines comerciales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Servicios de terceros</h2>
              <p style={{ color: theme.colors.textMuted }}>
                Este sitio puede utilizar servicios de terceros (por ejemplo, Google Analytics) que
                recopilan información de navegación de forma agregada para mejorar el sitio. Podés
                gestionar las cookies de estos servicios desde las opciones de tu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Derechos sobre tus datos</h2>
              <p style={{ color: theme.colors.textMuted }}>
                Podés solicitar el acceso, la corrección o la eliminación de tus datos personales
                escribiendo a{" "}
                <a href={`mailto:${contact.email}`} className="font-medium underline" style={{ color: theme.colors.primary }}>
                  {contact.email}
                </a>{" "}
                o comunicándote al {contact.phone}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>Responsable del sitio</h2>
              <p style={{ color: theme.colors.textMuted }}>
                MGA Informática — {contact.address}. Teléfono: {contact.phone}. Email: {contact.email}.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
