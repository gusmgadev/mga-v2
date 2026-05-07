// ─────────────────────────────────────────────────────────────────────────────
// lib/theme.ts — Sistema de Diseño Base — MGA Informática
// Todos los componentes importan desde acá — un cambio acá cambia todo.
// ─────────────────────────────────────────────────────────────────────────────

export interface NavSubItem {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href: string
  scroll?: boolean
  submenu?: NavSubItem[]
}

export const theme = {

  // ── SITIO ──────────────────────────────────────────────────────────────────
  site: {
    url:     "https://mgadigital.com.ar",
    name:    "MGA Informática",
    ogImage: "/images/hero/hero-1.jpg",     // imagen para compartir en redes (1200×630 ideal)
  },

  // ── COLORES ────────────────────────────────────────────────────────────────
  colors: {
    primary:    "#1A237E",   // azul marino (marca principal)
    secondary:  "#1C1C1E",   // gris oscuro (cards, bloques)
    accent:     "#42A5F5",   // azul celeste (CTA, highlights)
    background: "#FFFFFF",   // fondo general (claro)
    dark:       "#0D1B5E",   // azul más oscuro para navbar/contraste
    text:       "#333333",   // texto principal
    textMuted:  "#666666",   // texto secundario
    border:     "#E0E0E0",   // bordes sutiles en modo claro
    success:    "#1D9E75",
    error:      "#E24B4A",
    warning:    "#EF9F27",
  },

  // ── TIPOGRAFÍA ─────────────────────────────────────────────────────────────
  fonts: {
    primary:   "Inter, Roboto, sans-serif",  // títulos
    secondary: "Inter, Roboto, sans-serif",  // cuerpo
  },

  fontSizes: {
    xs:   "11px",
    sm:   "13px",
    base: "16px",
    lg:   "20px",
    xl:   "28px",
    xxl:  "40px",
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
    sm:   "6px",
    md:   "12px",
    lg:   "20px",
    full: "99px",
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

  // ── BREAKPOINTS ───────────────────────────────────────────────────────────
  breakpoints: {
    mobile:  "640px",
    tablet:  "768px",
    desktop: "1024px",
  },

  // ── BANNER ANIMADO ─────────────────────────────────────────────────────────
  banner: {
    words: [
      "DISEÑO WEB",
      "SISTEMAS A MEDIDA",
      "CONTROL STOCK Y VENTAS",
      "SERVICIO TÉCNICO",
      "ASESORAMIENTO INFORMÁTICO",
      "VENTAS DE EQUIPOS",
    ],
  },

  // ── NAVBAR ─────────────────────────────────────────────────────────────────
  navbar: {
    height:       "64px",
    heightMobile: "56px",
    cta: {
      text: "Contactanos",
      href: "#contact",
    },
items: [
      { label: "Servicios", href: "/#services", scroll: true },
      { label: "Proceso", href: "/#process", scroll: true },
      { label: "Sistemas Zoologic", href: "/#sistemas-zoologic", scroll: true },
      { label: "Clientes", href: "/#clientes", scroll: true },
      { label: "Contacto", href: "/#contact", scroll: true },
    ] as NavItem[],
  },

  // ── SERVICIOS ────────────────────────────────────────────────────────────────
  services: {
    title: "Nuestros Servicios",
    subtitle: "Soluciones tecnológicas integrales para tu hogar y empresa",
    
    items: [
      {
        icon: "code",
        title: "Desarrollo Web",
        description: "Sitios web, aplicaciones y sistemas personalizados adaptados a tus necesidades.",
      },
      {
        icon: "shopping-cart",
        title: "Sistemas de Gestión",
        description: "Software de punto de venta, gestión de inventario y administración empresarial.",
      },
      {
        icon: "briefcase",
        title: "Consultoría IT",
        description: "Asesoramiento especializado para optimizar tu infraestructura tecnológica.",
      },
      {
        icon: "tool",
        title: "Mantenimiento y Soporte",
        description: "Servicio técnico, reparaciones, optimización y mantenimiento de equipos.",
      },
    ],
  },

  // ── PROCESO ────────────────────────────────────────────────────────────────
  process: {
    title: "Nuestro Proceso de Trabajo",
    subtitle: "Así transformamos tu idea en solución digital",
    
    steps: [
      {
        number: "01",
        title: "Diagnóstico",
        description: "Analizamos tus necesidades y evaluamos la mejor solución para tu caso.",
      },
      {
        number: "02",
        title: "Propuesta",
        description: "Presentamos un plan personalizado con tiempos y presupuesto detallado.",
      },
      {
        number: "03",
        title: "Desarrollo",
        description: "Implementamos la solución con comunicación constante y entregas parciales.",
      },
      {
        number: "04",
        title: "Entrega y Soporte",
        description: "Entregamos el producto terminado y brindamos soporte post-implementación.",
      },
    ],
  },

// ── CLIENTES ────────────────────────────────────────────────────────────────
  clients: {
    title: "Algunas empresas y comercios que confian en nostros",
    subtitle: "desde el 2004 brindando soluciones tecnologicas en la region",
    items: [], // se carga desde lib/clientes.ts
  },

  // ── SISTEMAS ZOOLOGIC ───────────────────────────────────────────────────────
  sistemasZoologic: {
    title: "Sistemas de Gestión Zoologic",
    subtitle: "Somos agentes comerciales certificados de Zoologic desde el año 2010",
    badge: "Agentes Comerciales Certificados",
    year: "2010",
items: [
      {
        name: "Lince Indumentaria",
        logo: "/images/logos/lince-logo.png",
        title: "Lince Indumentaria",
        description: "Lince Indumentaria es el sistema más elegido por la industria de la indumentaria con más de 25 años en el mercado, que te permite gestionar todas las instancias de tu operatoria comercial. Gestión de venta minorista, mayorista, compras, toma de inventario, tarjetas de crédito y gestión de producción.",
        subtitle: "El más elegido por la industria con más de 25 años en el mercado",
        url: "/lince",
      },
      {
        name: "Dragonfish Color y Talle - Pymes",
        logo: "/images/logos/dragonfish-logo.png",
        title: "Dragonfish Color y Talle - Pymes",
        description: "Dragonfish Color y Talle - Pymes es el software completo, sencillo y adaptable a las necesidades de tu negocio o empresa que te permite realizar y dar seguimiento muy fácilmente a todas las actividades de tu local, para que potencies las fortalezas de tu negocio y puedas crecer. Integraciones con Mercado Libre, Tienda Nube y WooCommerce.",
        subtitle: "Gestión, administración y control para Pymes.",
        url: "/dragonfish",
      },
      {
        name: "Pantera Comercios",
        logo: "/images/logos/pantera-logo.png",
        title: "Pantera Comercios",
        description: "Pantera Comercios es un sistema de gestión 100% web con el que podrás controlar el stock, emitir facturas, registrar la caja, facturar las ventas de Mercado Libre y obtener informes integrales de gestión. Vas a poder administrar todo tu negocio, de manera fácil, intuitiva y a muy bajo costo.",
        subtitle: "Software de gestión líder del mercado.",
        url: "/pantera",
      },
    ],
  },

  // ── HERO ───────────────────────────────────────────────────────────────────
  hero: {
    height:          "80vh",
    heightMobile:    "70vh",
    overlayOpacity:  0.75,
    blurAmount:      "4px",
    slideInterval:   3000,
    slideTransition: "1s",

    tag:            "SOLUCIONES TECNOLÓGICAS PARA EMPRESAS Y PARTICULARES",
    title:          "Impulsamos tu Negocio en el",
    titleHighlight: "Mundo Digital",
    subtitle:       "Soluciones tecnológicas innovadoras que impulsan el crecimiento de tu negocio. Desde desarrollo web hasta gestión empresarial integral.",

    cta: {
      primary:   { text: "Ver Servicios", href: "#services" },
      secondary: { text: "Contactanos",   href: "#contact"  },
    },

    images: [
      "/images/hero/hero-1.jpg",
      "/images/hero/hero-2.jpg",
      "/images/hero/hero-5.jpg",
    ],
  },

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  footer: {
    description: "En MGA Informática brindamos soluciones tecnológicas integrales: reparación de computadoras, optimización de sistemas, instalación de hardware, desarrollo de software a medida y asesoramiento técnico para hogares y empresas.",
    copyright:   "MGA Informática 2026",

    social: {
      facebook:  "",
      instagram: "https://www.instagram.com/mgainformatica.ok/",
      linkedin:  "",
    },

    maps: {
      embedUrl: "https://www.google.com/maps?q=24+de+Marzo+925,+Rada+Tilly,+Chubut,+Argentina&output=embed",
      height:   "120px",
    },

    legal: {
      privacy: "/privacidad",
      terms:   "/terminos",
    },

    services: [
      { label: "Desarrollo WEB", href: "#services" },
      { label: "Sistemas de Gestion y Puntos de venta", href: "#services" },
      { label: "Consultoria IT",    href: "#services" },
      { label: "Mantenimiento y Soporte IT",         href: "#services" },
    ],

    nav: [
      { label: "Inicio",    href: "/" },
      { label: "Servicios", href: "#services" },
      { label: "Clientes",  href: "#clientes" },
      { label: "Proceso",   href: "#process" },
      { label: "Contacto", href: "#contact" },
    ],
  },

  // ── CONTACTO ───────────────────────────────────────────────────────────────
  contact: {
    phone:    "+54 297 403-6526",
    email:    "consultas@mgadigital.com.ar",
    whatsapp: "5492974036526",
    address:  "24 de Marzo 925, Rada Tilly, Chubut, Argentina",
    title:    "Ponete en contacto",
    subtitle: "Completá el formulario y nos comunicamos a la brevedad",
  },

  // ── LOGO ───────────────────────────────────────────────────────────────────
  logo: {
    path:      "/images/logos/logo.png",
    pathWhite: "/images/logos/logo-white.png",
    width:  160,
    height:  40,
  },

  // ── AUTH ────────────────────────���─��────────────────────────────────────────
  auth: {
    logo: {
      width:  120,
      height:  32,
    },
    redirectAfterLogin:    "/dashboard",
    redirectAfterLogout:   "/auth/signin",
    redirectAfterRegister: "/auth/signin",
  },

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  dashboard: {
    sidebarWidth:          "240px",
    sidebarWidthCollapsed: "64px",
    headerHeight:          "60px",
  },

} as const

// ─────────────────────────────────────────────────────────────────────────────
// Tipos exportados
// ─────────────────────────────────────────────────────────────────────────────

export type Theme = typeof theme
export type ThemeColors = typeof theme.colors