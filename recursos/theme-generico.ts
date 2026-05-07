// ─────────────────────────────────────────────────────────────────────────────
// lib/theme.ts — Sistema de Diseño Base
// Copiá este archivo a cada proyecto nuevo y completá los valores entre [ ]
// Todos los componentes importan desde acá — un cambio acá cambia todo.
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {

  // ── COLORES ────────────────────────────────────────────────────────────────
  colors: {
    primary:    "#XXXXXX",   // ej: #2E5C8A — color principal de la marca
    secondary:  "#XXXXXX",   // ej: #6BA3D0 — color secundario / hover
    accent:     "#XXXXXX",   // ej: #1D9E75 — color de acento / destacado
    background: "#FFFFFF",   // fondo general de la app
    dark:       "#XXXXXX",   // ej: #0F1A35 — fondos oscuros / navbar dark
    text:       "#1A1A1A",   // texto principal
    textMuted:  "#666666",   // texto secundario / placeholders
    border:     "#E8E8E8",   // bordes de inputs, cards, separadores
    success:    "#1D9E75",   // mensajes de éxito
    error:      "#E24B4A",   // mensajes de error
    warning:    "#EF9F27",   // mensajes de advertencia
  },

  // ── TIPOGRAFÍA ─────────────────────────────────────────────────────────────
  fonts: {
    primary:   "[FUENTE_TITULOS]",   // ej: 'DM Sans' — títulos y UI
    secondary: "[FUENTE_CUERPO]",    // ej: 'DM Sans' — cuerpo de texto
                                     // si es la misma fuente, repetir el valor
  },

  fontSizes: {
    xs:   "11px",   // labels, badges, metadata
    sm:   "13px",   // texto secundario, captions
    base: "16px",   // texto base del cuerpo
    lg:   "20px",   // subtítulos pequeños
    xl:   "28px",   // títulos de sección
    xxl:  "40px",   // títulos grandes
  },

  fontWeights: {
    regular: 400,
    medium:  500,
    bold:    700,
  },

  // ── ESPACIADO ──────────────────────────────────────────────────────────────
  spacing: {
    xs:  "4px",
    sm:  "8px",
    md:  "16px",
    lg:  "24px",
    xl:  "48px",
    xxl: "80px",
  },

  // ── BORDES ─────────────────────────────────────────────────────────────────
  radii: {
    sm:   "6px",    // inputs, badges pequeños
    md:   "12px",   // cards, modals
    lg:   "20px",   // cards grandes
    full: "99px",   // pills, botones redondeados
  },

  // ── SOMBRAS ────────────────────────────────────────────────────────────────
  shadows: {
    sm:  "0 1px 3px rgba(0,0,0,0.08)",
    md:  "0 4px 12px rgba(0,0,0,0.10)",
    nav: "0 2px 8px rgba(0,0,0,0.06)",
  },

  // ── TRANSICIONES ───────────────────────────────────────────────────────────
  transitions: {
    fast:   "0.15s ease",
    normal: "0.25s ease",
    slow:   "0.40s ease",
  },

  // ── BREAKPOINTS ────────────────────────────────────────────────────────────
  breakpoints: {
    mobile:  "640px",
    tablet:  "768px",
    desktop: "1024px",
  },

  // ── NAVBAR ─────────────────────────────────────────────────────────────────
  navbar: {
    height:       "64px",
    heightMobile: "56px",
    cta: {
      text: "[TEXTO_CTA]",    // ej: 'Contactanos'
      href: "[DESTINO_CTA]",  // ej: '#contact'
    },
  },

  // ── HERO ───────────────────────────────────────────────────────────────────
  hero: {
    height:          "100vh",
    heightMobile:    "90vh",
    overlayOpacity:  0.75,       // opacidad del overlay sobre las imágenes (0-1)
    blurAmount:      "4px",      // blur de las imágenes de fondo
    slideInterval:   4000,       // ms entre imágenes del slideshow
    slideTransition: "1.2s",     // duración del fade entre imágenes

    tag:            "[TAG_HERO]",              // ej: 'SOLUCIONES TECNOLÓGICAS'
    title:          "[TITULO_HERO]",           // título principal
    titleHighlight: "[PALABRA_DESTACADA]",     // palabra en color secondary
    subtitle:       "[SUBTITULO_HERO]",        // descripción breve

    cta: {
      primary:   { text: "[CTA_PRIMARIO]",   href: "[HREF_PRIMARIO]"   },
      secondary: { text: "[CTA_SECUNDARIO]", href: "[HREF_SECUNDARIO]" },
    },

    images: [
      "/images/hero/hero-1.jpg",  // JPG/PNG mínimo 1920x1080px, máx 300KB
      "/images/hero/hero-2.jpg",
      "/images/hero/hero-3.jpg",
    ],
  },

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  footer: {
    description: "[DESCRIPCION_EMPRESA]",  // ej: 'Soluciones tecnológicas para...'
    copyright:   "[NOMBRE_EMPRESA] [AÑO]", // ej: 'MGA Informática 2026'

    social: {
      facebook:  "[URL_FACEBOOK]",   // https://facebook.com/tu-pagina — o "" si no tiene
      instagram: "[URL_INSTAGRAM]",  // https://instagram.com/tu-usuario — o "" si no tiene
      linkedin:  "[URL_LINKEDIN]",   // https://linkedin.com/company/nombre — o "" si no tiene
    },

    maps: {
      // Google Maps → buscar dirección → Compartir → Insertar un mapa → copiar src del iframe
      embedUrl: "[EMBED_URL_MAPS]",
      height:   "120px",
    },

    legal: {
      privacy: "/privacidad",
      terms:   "/terminos",
    },

    services: [
      // { label: "Nombre del servicio", href: "/servicios/slug" },
    ],

    nav: [
      { label: "Inicio",    href: "/" },
      { label: "Servicios", href: "#services" },
      { label: "Clientes",  href: "#clientes" },
      { label: "Proceso",   href: "#process" },
      { label: "Contacto",  href: "#contact" },
    ],
  },

  // ── CONTACTO ───────────────────────────────────────────────────────────────
  contact: {
    phone:    "[TELEFONO]",     // ej: +54 297 443-7049
    email:    "[EMAIL]",        // ej: contacto@empresa.com
    whatsapp: "[WHATSAPP]",     // solo números sin + ni espacios — ej: 5492974437049
    address:  "[DIRECCION]",    // ej: Comodoro Rivadavia, Chubut — o null si no aplica
  },

  // ── LOGO ───────────────────────────────────────────────────────────────────
  logo: {
    path:      "/images/logos/logo.png",       // logo sobre fondos claros
    pathWhite: "/images/logos/logo-white.png", // logo sobre fondos oscuros
    width:  160,  // px — ancho de renderizado
    height:  40,  // px — alto de renderizado
  },

  // ── AUTH ───────────────────────────────────────────────────────────────────
  // Valores usados en las páginas de login, registro y reseteo de clave
  auth: {
    logo: {
      width:  120,  // px — más pequeño que el navbar
      height:  32,
    },
    redirectAfterLogin:    "/dashboard",
    redirectAfterLogout:   "/auth/signin",
    redirectAfterRegister: "/auth/signin",
  },

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  // Valores usados en el sistema interno
  dashboard: {
    sidebarWidth:          "240px",
    sidebarWidthCollapsed: "64px",
    headerHeight:          "60px",
  },

} as const

// ─────────────────────────────────────────────────────────────────────────────
// Tipos exportados — útiles para tipar props de componentes
// ─────────────────────────────────────────────────────────────────────────────

export type Theme = typeof theme
export type ThemeColors = typeof theme.colors
