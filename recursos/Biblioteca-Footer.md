# BIBLIOTECA DE FOOTER
3 Templates — Sistema de Diseño

> **Antes de usar cualquier template:**
> Adjuntar `lib/theme.ts` junto con este archivo.
> Todos los valores de color, textos, contacto, redes y mapa
> se leen desde ahí. No hay nada que hardcodear.

---

## Cómo completar theme.ts para el Footer

Solo estos campos afectan al footer. Completarlos antes de pedir cualquier template:

```typescript
// lib/theme.ts — sección footer
footer: {
  description: "[DESCRIPCION_EMPRESA]",  // texto descriptivo de la empresa
  copyright:   "[NOMBRE_EMPRESA] [AÑO]", // ej: 'MGA Informática 2026'

  social: {
    facebook:  "[URL_FACEBOOK]",   // https://facebook.com/tu-pagina
    instagram: "[URL_INSTAGRAM]",  // https://instagram.com/tu-usuario
    linkedin:  "[URL_LINKEDIN]",   // https://linkedin.com/company/nombre
  },

  maps: {
    embedUrl: "[EMBED_URL_MAPS]",  // Maps → Compartir → Insertar → copiar src del iframe
    height:   "120px",
  },

  legal: {
    privacy: "/privacidad",
    terms:   "/terminos",
  },

  services: [
    { label: "[SERVICIO_1]", href: "/servicios/slug-1" },
    { label: "[SERVICIO_2]", href: "/servicios/slug-2" },
    // agregar los servicios del proyecto
  ],

  nav: [
    { label: "Inicio",    href: "/" },
    { label: "Servicios", href: "#services" },
    { label: "Clientes",  href: "#clientes" },
    { label: "Proceso",   href: "#process" },
    { label: "Contacto",  href: "#contact" },
  ],
},

// También se usan:
colors.primary      // hover de links + iconos de redes
colors.secondary    // hover alternativo (Template 2)
colors.dark         // fondo oscuro (Template 2)
colors.background   // fondo claro (Templates 1 y 3)
colors.textMuted    // texto secundario
colors.border       // separadores
logo.path           // logo sobre fondos claros
logo.pathWhite      // logo sobre fondos oscuros (Template 2)
logo.width/height   // dimensiones del logo
contact.phone       // teléfono
contact.email       // email
contact.whatsapp    // número para wa.me/
navbar.cta.href     // destino del botón CTA (Template 3)
transitions.fast    // velocidad del hover
radii.md            // border-radius del iframe de Maps
```

**Cómo obtener el embedUrl de Google Maps:**
maps.google.com → buscar la dirección → Compartir → Insertar un mapa → copiar el `src` del iframe.

---

## TEMPLATE 1 — Clásico 4 columnas claro
**Completo · Versátil · Recomendado como default**

Footer claro con 4 columnas: empresa, servicios, navegación y contacto con mapa. El más completo. Funciona para cualquier tipo de negocio.

### Variables que usa de theme.ts

| Variable theme.ts              | Uso en el componente                             |
|-------------------------------|--------------------------------------------------|
| `theme.colors.primary`        | Hover de links + bg hover de iconos de redes    |
| `theme.colors.background`     | Fondo del footer (`#F8F9FB` o blanco)           |
| `theme.colors.border`         | Línea separadora superior y barra inferior       |
| `theme.colors.textMuted`      | Texto descriptivo y links inactivos              |
| `theme.colors.dark`           | Títulos de columnas                              |
| `theme.logo.path`             | Logo sobre fondo claro                           |
| `theme.logo.width/height`     | Dimensiones del logo                             |
| `theme.footer.description`    | Texto descriptivo de la empresa                  |
| `theme.footer.social.*`       | Links de Facebook, Instagram, LinkedIn           |
| `theme.footer.services`       | Array de links de servicios                      |
| `theme.footer.nav`            | Array de links de navegación                     |
| `theme.footer.maps.embedUrl`  | URL del iframe de Google Maps                    |
| `theme.footer.maps.height`    | Alto del iframe                                  |
| `theme.footer.legal.*`        | Links de privacidad y términos                   |
| `theme.footer.copyright`      | Texto de copyright                               |
| `theme.contact.phone`         | Teléfono                                         |
| `theme.contact.email`         | Email (link mailto:)                             |
| `theme.contact.whatsapp`      | Número para wa.me/                               |
| `theme.transitions.fast`      | Velocidad del hover                              |
| `theme.radii.md`              | Border-radius del iframe de Maps                 |

### Comportamiento

- Grid 4 columnas: `2fr 1fr 1fr 1.5fr`, gap 40px
- Col 1: logo + descripción + iconos de redes sociales
- Col 2: links de servicios con hover en `colors.primary`
- Col 3: links de navegación
- Col 4: contacto con iconos + Google Maps iframe
- Iconos de redes: bg `#E8ECF0`, hover `bg=colors.primary` color blanco
- Barra inferior: copyright + links legales
- Mobile: apila en 1 columna, mapa al final

### Prompt para la IA

```
Adjuntar: components/landing/footer.tsx + lib/theme.ts

Crear el Footer Template 1 — Clásico 4 columnas claro.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ESPECIFICACIONES:
- Contenedor:
  bg=#F8F9FB, border-top 1px solid theme.colors.border
  padding 48px 48px 0

- Grid principal:
  grid-template-columns 2fr 1fr 1fr 1.5fr, gap 40px
  margin-bottom 40px

- Columna 1 — Empresa:
  Logo: imagen desde theme.logo.path
    width=theme.logo.width height=theme.logo.height
  Descripción: theme.footer.description
    color=theme.colors.textMuted, font-size sm
  Redes sociales (iconos Facebook, Instagram, LinkedIn):
    Cada icono: w-8 h-8, bg #E8ECF0, border-radius md
    Hover: bg=theme.colors.primary, color blanco
    Transición: theme.transitions.fast
    Links: theme.footer.social.facebook/instagram/linkedin
    target="_blank" rel="noopener noreferrer"

- Columna 2 — Servicios:
  Título: uppercase, letter-spacing 0.5px, color dark
  Links: theme.footer.services (label + href)
    color=theme.colors.textMuted
    Hover: color=theme.colors.primary
    Transición: theme.transitions.fast

- Columna 3 — Navegación:
  Título: uppercase, letter-spacing 0.5px
  Links: theme.footer.nav (label + href)
    Mismo estilo que columna 2

- Columna 4 — Contacto:
  Items con ícono + texto:
    Teléfono: theme.contact.phone
    Email: theme.contact.email (link mailto:)
    WhatsApp: botón que abre wa.me/theme.contact.whatsapp
  Google Maps: iframe
    src=theme.footer.maps.embedUrl
    width 100%, height=theme.footer.maps.height
    border-radius=theme.radii.md, border 0, loading lazy

- Barra inferior:
  border-top 1px solid theme.colors.border, padding 20px 0
  flex justify-between align-items center
  Copyright: theme.footer.copyright, color=theme.colors.textMuted
  Links: Privacidad (theme.footer.legal.privacy)
         Términos (theme.footer.legal.terms)

- Mobile (< theme.breakpoints.tablet):
  Grid 1 columna, mapa al final
  Iconos de redes en fila horizontal
```

---

## TEMPLATE 2 — Oscuro con acento
**Profesional · Impactante · Para heroes oscuros**

Footer oscuro azul marino. Contraste fuerte con landings claras. Links con hover en `colors.secondary`. Barra inferior con línea de gradiente.

### Variables que usa de theme.ts

| Variable theme.ts              | Uso en el componente                             |
|-------------------------------|--------------------------------------------------|
| `theme.colors.dark`           | Fondo oscuro del footer                          |
| `theme.colors.primary`        | Hover de iconos de redes                         |
| `theme.colors.secondary`      | Hover de links                                   |
| `theme.logo.pathWhite`        | Logo versión blanca (obligatorio)                |
| `theme.logo.width/height`     | Dimensiones del logo                             |
| `theme.footer.description`    | Texto descriptivo (en blanco semitransparente)   |
| `theme.footer.social.*`       | Links de redes sociales                          |
| `theme.footer.services`       | Array de links de servicios                      |
| `theme.footer.nav`            | Array de links de navegación                     |
| `theme.footer.maps.embedUrl`  | URL del iframe de Google Maps                    |
| `theme.footer.maps.height`    | Alto del iframe                                  |
| `theme.footer.legal.*`        | Links de privacidad y términos                   |
| `theme.footer.copyright`      | Texto de copyright                               |
| `theme.contact.phone`         | Teléfono                                         |
| `theme.contact.email`         | Email                                            |
| `theme.contact.whatsapp`      | Número para wa.me/                               |
| `theme.transitions.fast`      | Velocidad del hover                              |
| `theme.radii.md`              | Border-radius del iframe                         |

### Comportamiento

- Mismo layout 4 columnas que Template 1
- Logo versión blanca
- Textos en `rgba(255,255,255,0.50–0.70)`
- Iconos de redes: bg semitransparente + borde sutil
- Links hover: `color=colors.secondary`
- Iconos de contacto: bg `rgba(primary, 0.25)`
- Maps: con overlay semitransparente oscuro
- Barra inferior: copyright + línea de gradiente `primary→secondary`

### Prompt para la IA

```
Adjuntar: components/landing/footer.tsx + lib/theme.ts

Crear el Footer Template 2 — Oscuro con acento.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ESPECIFICACIONES:
- Contenedor:
  bg=theme.colors.dark, padding 48px 48px 0

- Grid principal:
  Mismo que Template 1 (2fr 1fr 1fr 1.5fr)
  border-bottom 1px solid rgba(255,255,255,0.08)
  padding-bottom 40px

- Columna 1 — Empresa:
  Logo: imagen desde theme.logo.pathWhite
    width=theme.logo.width height=theme.logo.height
  Descripción: theme.footer.description
    color rgba(255,255,255,0.50)
  Redes:
    bg rgba(255,255,255,0.06)
    border 0.5px solid rgba(255,255,255,0.10)
    color rgba(255,255,255,0.60)
    Hover: bg=theme.colors.primary, border=primary, color blanco
    Transición: theme.transitions.fast

- Columnas 2 y 3:
  Títulos: color rgba(255,255,255,0.35), uppercase
  Links: color rgba(255,255,255,0.55)
  Hover: color=theme.colors.secondary
  Transición: theme.transitions.fast

- Columna 4 — Contacto:
  Ícono: bg rgba(primary,0.25), color=theme.colors.secondary
  Texto: color rgba(255,255,255,0.55)
  Maps: opacity 0.7 sobre iframe
    border rgba(255,255,255,0.08), border-radius=theme.radii.md

- Barra inferior:
  padding 20px 0, flex justify-between align-items center
  Copyright: theme.footer.copyright, color rgba(255,255,255,0.30)
  Acento visual: div w-10 h-0.5
    bg: linear-gradient(to right, primary, secondary)

- Mobile (< theme.breakpoints.tablet): grid 1 columna

NOTA: Combina muy bien con heroes oscuros (Templates 1 y 3 del Hero).
```

---

## TEMPLATE 3 — Banda CTA + minimalista
**Moderno · Conversión · Último CTA antes de irse**

Banda de color arriba con un CTA de último momento. Debajo, footer limpio y blanco con 4 columnas compactas.

### Variables que usa de theme.ts

| Variable theme.ts              | Uso en el componente                             |
|-------------------------------|--------------------------------------------------|
| `theme.colors.primary`        | Fondo de la banda CTA                            |
| `theme.colors.background`     | Fondo del footer principal                       |
| `theme.colors.border`         | Borde superior del footer principal              |
| `theme.colors.textMuted`      | Texto de links inactivos                         |
| `theme.logo.path`             | Logo sobre fondo claro                           |
| `theme.logo.width/height`     | Dimensiones del logo                             |
| `theme.footer.description`    | Texto descriptivo de la empresa                  |
| `theme.footer.social.*`       | Links de redes sociales                          |
| `theme.footer.services`       | Array de links de servicios                      |
| `theme.footer.nav`            | Array de links de navegación                     |
| `theme.footer.maps.embedUrl`  | URL del iframe de Google Maps                    |
| `theme.footer.maps.height`    | Alto del iframe                                  |
| `theme.footer.legal.*`        | Links de privacidad y términos                   |
| `theme.footer.copyright`      | Texto de copyright                               |
| `theme.contact.phone`         | Teléfono                                         |
| `theme.contact.email`         | Email                                            |
| `theme.contact.whatsapp`      | Número para wa.me/                               |
| `theme.navbar.cta.href`       | Destino del botón en la banda                    |
| `theme.transitions.fast`      | Velocidad del hover y botón                      |
| `theme.radii.full`            | Border-radius del botón de banda y redes         |

### Por qué funciona la banda CTA

El usuario que llega al footer sin haber convertido está al final de la página. Es el último momento para convencerlo antes de que se vaya. Un CTA claro y directo ahí convierte mejor que cualquier popup. El título y subtítulo deben ser directos: beneficio + sin compromiso.

### Comportamiento

- Banda: `bg=colors.primary`, grid 2 cols (texto + botón), padding `36px 48px`
- Botón en banda: bg blanco, color `primary`, pill, hover `scale(1.02)`
- Footer principal: bg blanco, grid 4 cols más compacto
- Iconos de redes: estilo pill circular con borde
- Mobile: banda apila título + botón en columna; botón ancho completo

### Prompt para la IA

```
Adjuntar: components/landing/footer.tsx + lib/theme.ts

Crear el Footer Template 3 — Banda CTA + minimalista.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

BANDA CTA — personalizar según el negocio:
BAND_TITLE:    "[TITULO_CTA]"    // ej: '¿Listo para digitalizar tu negocio?'
BAND_SUBTITLE: "[SUBTITULO_CTA]" // ej: 'Contactanos hoy, te asesoramos sin compromiso.'
BAND_CTA_TEXT: "[TEXTO_BOTON]"   // ej: 'Contactanos ahora'

ESPECIFICACIONES:
- Banda superior:
  bg=theme.colors.primary, padding 36px 48px
  display grid, grid-template-columns 1fr auto
  gap 32px, align-items center
  Título: font-size xl, font-weight 700, color blanco
  Subtítulo: font-size sm, color rgba(255,255,255,0.70)
  Botón:
    bg blanco, color=theme.colors.primary
    border-radius=theme.radii.full, font-weight 700
    padding 10px 28px, white-space nowrap
    Hover: bg rgba(255,255,255,0.92), scale(1.02)
    Transición: theme.transitions.fast
    href: theme.navbar.cta.href

- Footer principal:
  bg=theme.colors.background
  border-top 1px solid theme.colors.border
  padding 36px 48px 0
  Grid: grid-template-columns 2fr 1fr 1fr 1fr, gap 32px

- Columna 1:
  Logo: imagen desde theme.logo.path
    width=theme.logo.width height=theme.logo.height
  Descripción: theme.footer.description
    font-size sm, color=theme.colors.textMuted
  Redes: iconos en pill circular
    border 0.5px solid #E0E8F0, w-7 h-7
    hover: bg=theme.colors.primary, color blanco, border primary
    Transición: theme.transitions.fast

- Columnas 2 y 3 — links compactos:
  font-size sm
  Links: color=theme.colors.textMuted
  Hover: color=theme.colors.primary

- Columna 4 — contacto compacto:
  Ícono inline + texto en misma línea
  Teléfono, Email (mailto:), WhatsApp (wa.me/)
  Maps iframe compacto al final
    src=theme.footer.maps.embedUrl
    height=theme.footer.maps.height
    border-radius=theme.radii.md

- Barra inferior:
  padding 14px 0
  Copyright (izquierda): theme.footer.copyright
  Links legales (derecha): Privacidad y Términos

- Mobile (< theme.breakpoints.tablet):
  Banda: flex-col, botón ancho completo
  Footer: grid 1 columna

TIP: Cambiar BAND_TITLE según el rubro hace este footer muy efectivo.
Ej. clínica: '¿Necesitás turno?' / tech: '¿Listo para digitalizar?'
```

---

## Resumen — Cuándo usar cada Footer

| Template             | Estilo             | Logo requerido  | Ideal para                              |
|----------------------|--------------------|-----------------|-----------------------------------------|
| **1 — Clásico**      | Claro, completo    | Cualquier formato | Default para cualquier proyecto       |
| **2 — Oscuro**       | Marino, impactante | Logo blanco     | Hero oscuro, tech, corporativo          |
| **3 — Banda CTA**    | Moderno, conversión| Cualquier formato | Cuando se quiere un último CTA        |

**Combinaciones que funcionan bien:**
- Todo claro: Navbar 1 + Hero 1 + Footer 1
- Todo oscuro: Navbar 2 + Hero 3 + Footer 2
- Mixto con CTA final: Navbar 1 + Hero 2 + Footer 3
