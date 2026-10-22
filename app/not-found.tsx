import Link from "next/link"
import { theme } from "@/lib/theme"
import MovingBanner from "@/components/landing/moving-banner"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
}

const suggestions = [
  { label: "Desarrollo Web", href: "/desarrollo-web" },
  { label: "Sistemas de Gestión", href: "/sistemas-gestion" },
  { label: "Consultoría IT", href: "/consultoria-it" },
  { label: "Soporte Técnico", href: "/soporte-tecnico" },
  { label: "Noticias y Novedades", href: "/noticias" },
]

export default function NotFound() {
  return (
    <>
      <MovingBanner />
      <Navbar />
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ paddingTop: "160px", paddingBottom: "80px", backgroundColor: theme.colors.background }}
      >
        <p
          className="text-7xl md:text-8xl font-extrabold mb-4"
          style={{ color: theme.colors.primary }}
        >
          404
        </p>
        <h1
          className="text-2xl md:text-3xl font-bold mb-3"
          style={{ color: theme.colors.text }}
        >
          La página que buscás no existe
        </h1>
        <p className="text-base mb-8 max-w-lg" style={{ color: theme.colors.textMuted }}>
          Puede que el enlace esté desactualizado o que la página se haya movido.
          Elegí una opción o volvé al inicio.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {suggestions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-5 py-2 rounded-full text-sm font-medium transition-transform hover:scale-105"
              style={{
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.primary,
                backgroundColor: theme.colors.background,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="px-8 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105"
          style={{ backgroundColor: theme.colors.primary, color: "#fff" }}
        >
          Volver al inicio
        </Link>
      </main>
      <Footer />
    </>
  )
}
