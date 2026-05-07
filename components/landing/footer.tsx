import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"
import { theme } from "@/lib/theme"

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function Footer() {
  return (
    <footer>
      <div
        className="px-12 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
        style={{
          background: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 50%, ${theme.colors.primary} 100%)`,
        }}
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ¿Necesitas organizar y controlar tu local o emprendimiento?
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            Escribinos hoy, te respondemos en menos de 24 horas.
          </p>
        </div>
        <div className="flex justify-start md:justify-end">
          <Link
            href={theme.navbar.cta.href}
            className="px-7 py-2.5 rounded-full font-bold transition-transform hover:scale-105"
            style={{
              backgroundColor: "#fff",
              color: theme.colors.primary,
            }}
          >
            {theme.navbar.cta.text}
          </Link>
        </div>
      </div>

      <div
        className="px-12 py-9"
        style={{
          backgroundColor: theme.colors.background,
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <img
              src={theme.logo.path}
              alt={theme.site.name}
              width={theme.logo.width}
              height={theme.logo.height}
              className="mb-4"
            />
            <p className="text-sm mb-4" style={{ color: theme.colors.textMuted }}>
              {theme.footer.description}
            </p>
            {theme.footer.social.instagram && (
              <a
                href={theme.footer.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border mr-2"
                style={{
                  borderColor: "#E0E8F0",
                  color: theme.colors.textMuted,
                }}
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div>
            <h3
              className="text-xs uppercase tracking-wider mb-4 font-semibold"
              style={{ color: theme.colors.text }}
            >
              Servicios
            </h3>
            <ul className="space-y-2">
              {theme.footer.services.map((service, idx) => (
                <li key={idx}>
                  <Link
                    href={service.href}
                    className="text-sm hover:underline"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-xs uppercase tracking-wider mb-4 font-semibold"
              style={{ color: theme.colors.text }}
            >
              Navegación
            </h3>
            <ul className="space-y-2">
              {theme.footer.nav.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-sm hover:underline"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-xs uppercase tracking-wider mb-4 font-semibold"
              style={{ color: theme.colors.text }}
            >
             Contacto
            </h3>
            <ul className="space-y-3 text-sm" style={{ color: theme.colors.textMuted }}>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <a href={`https://wa.me/${theme.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">{theme.contact.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <a href={`mailto:${theme.contact.email}`}>{theme.contact.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{theme.contact.address}</span>
              </li>
            </ul>

            {theme.footer.maps.embedUrl && (
              <iframe
                src={theme.footer.maps.embedUrl}
                width="100%"
                height={theme.footer.maps.height}
                className="mt-4 rounded-lg"
                style={{ border: "none" }}
                loading="lazy"
              />
            )}
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row justify-between items-center pt-4 border-t"
          style={{ borderColor: theme.colors.border }}
        >
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            {theme.footer.copyright}
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link
              href={theme.footer.legal.privacy}
              className="text-sm hover:underline"
              style={{ color: theme.colors.textMuted }}
            >
              Privacidad
            </Link>
            <Link
              href={theme.footer.legal.terms}
              className="text-sm hover:underline"
              style={{ color: theme.colors.textMuted }}
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}