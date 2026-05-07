# BIBLIOTECA DE HERO
3 Templates — Sistema de Diseño

> **Antes de usar cualquier template:**
> Adjuntar `lib/theme.ts` junto con este archivo.
> Todos los valores de color, textos, imágenes y configuración del slideshow
> se leen desde ahí. No hay nada que hardcodear.

---

## Cómo completar theme.ts para el Hero

Solo estos campos afectan al hero. Completarlos antes de pedir cualquier template:

```typescript
// lib/theme.ts — sección hero
hero: {
  height:          "100vh",     // altura en desktop
  heightMobile:    "90vh",      // altura en mobile
  overlayOpacity:  0.75,        // opacidad del overlay (0-1)
  blurAmount:      "4px",       // blur de las imágenes de fondo
  slideInterval:   4000,        // ms entre imágenes
  slideTransition: "1.2s",      // duración del fade

  tag:            "[TAG_HERO]",         // ej: 'SOLUCIONES TECNOLÓGICAS'
  title:          "[TITULO_HERO]",      // título principal
  titleHighlight: "[PALABRA_DESTACADA]",// palabra en colors.secondary
  subtitle:       "[SUBTITULO_HERO]",   // descripción breve

  cta: {
    primary:   { text: "[CTA_PRIMARIO]",   href: "[HREF_PRIMARIO]" },
    secondary: { text: "[CTA_SECUNDARIO]", href: "[HREF_SECUNDARIO]" },
  },

  images: [
    "/images/hero/hero-1.jpg",  // JPG/PNG mínimo 1920x1080px, máx 300KB
    "/images/hero/hero-2.jpg",
    "/images/hero/hero-3.jpg",
  ],
},

// También se usan:
colors.primary      // botón CTA primario
colors.secondary    // palabra destacada del título + botón secundario
colors.dark         // base del overlay oscuro
logo.path           // logo sobre fondos claros (Template 2)
logo.pathWhite      // logo en hero oscuro (Templates 1 y 3)
```

**Nota sobre las imágenes:** deben ser JPG o PNG de al menos 1920×1080px.
Peso máximo recomendado: 300KB cada una. Nombrarlas `hero-1.jpg`, `hero-2.jpg`, etc.
en `/public/images/hero/`.

---

## TEMPLATE 1 — Imagen de fondo + mockup derecha
**Recomendado · Profesional · Versátil**

Imágenes rotantes con overlay oscuro a la izquierda. Título y CTA a la izquierda, mockup de app animado a la derecha.

### Variables que usa de theme.ts

| Variable theme.ts              | Uso en el componente                             |
|-------------------------------|--------------------------------------------------|
| `theme.hero.height`           | Altura del contenedor                            |
| `theme.hero.heightMobile`     | Altura en mobile                                 |
| `theme.hero.images`           | Array de rutas de imágenes del slideshow         |
| `theme.hero.slideInterval`    | Ms entre imágenes                                |
| `theme.hero.slideTransition`  | Duración del fade                                |
| `theme.hero.blurAmount`       | Blur de las imágenes de fondo                    |
| `theme.hero.tag`              | Etiqueta superior (badge)                        |
| `theme.hero.title`            | Título principal                                 |
| `theme.hero.titleHighlight`   | Palabra en `colors.secondary`                    |
| `theme.hero.subtitle`         | Descripción breve                                |
| `theme.hero.cta.primary`      | Texto y href del botón principal                 |
| `theme.hero.cta.secondary`    | Texto y href del botón secundario                |
| `theme.colors.primary`        | Fondo del botón CTA primario                     |
| `theme.colors.secondary`      | Color de la palabra destacada + badge            |
| `theme.colors.dark`           | Base del overlay                                 |
| `theme.logo.pathWhite`        | Logo blanco sobre el hero oscuro                 |

### Comportamiento

- Imágenes de fondo con `blur(theme.hero.blurAmount)` y crossfade suave
- Overlay gradiente: opaco a la izquierda (`rgba(dark, 0.88)`), transparente a la derecha
- Título entra con animación fadeUp en secuencia: tag → título → subtítulo → botones
- Mockup: componente con datos simulados, animación de entrada desde la derecha
- Dots de navegación abajo a la izquierda, clickeables
- Auto-avance cada `slideInterval` ms, pausa al hover
- Mobile: mockup se oculta, layout de una columna

### Prompt para la IA

```
Adjuntar: components/landing/hero.tsx + lib/theme.ts

Crear el Hero Template 1 — Imagen de fondo + mockup derecha.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ESPECIFICACIONES:
- Contenedor:
  height=theme.hero.height, position relative, overflow hidden

- Slideshow de imágenes:
  Cada imagen: position absolute, inset 0
  object-fit cover, filter blur(theme.hero.blurAmount)
  transition opacity theme.hero.slideTransition ease
  Auto-avance cada theme.hero.slideInterval ms
  Pausa con onMouseEnter / reanuda con onMouseLeave

- Overlay:
  position absolute, inset 0
  background: linear-gradient(to right,
    rgba(dark,0.88) 0%,
    rgba(dark,0.88) 45%,
    rgba(dark,0.40) 70%,
    rgba(dark,0.10) 100%)
  Usar theme.colors.dark como base del rgba

- Layout interno:
  grid 2 columnas, gap 32px, padding 0 48px
  align-items center, position relative z-index 2

- Columna izquierda:
  Tag: badge pill, border rgba(secondary,0.4)
    color=theme.colors.secondary, font-size xs
    animación fadeUp 0.6s
  Título: font-size 3.5rem, font-weight 800, color blanco
    Palabra theme.hero.titleHighlight en color=theme.colors.secondary
    animación fadeUp delay 0.1s
  Subtítulo: theme.hero.subtitle
    color rgba(255,255,255,0.70), max-width 400px
    animación fadeUp delay 0.2s
  Botones: flex gap-3, animación fadeUp delay 0.3s
    CTA primario: bg=theme.colors.primary, border-radius full
      texto: theme.hero.cta.primary.text
      href: theme.hero.cta.primary.href
    CTA secundario: borde rgba(255,255,255,0.3), border-radius full
      texto: theme.hero.cta.secondary.text
      href: theme.hero.cta.secondary.href

- Columna derecha — mockup de dashboard:
  Contenedor: bg rgba(255,255,255,0.06)
    border rgba(255,255,255,0.12), border-radius 16px
    animación slideInRight 0.8s delay 0.4s
  Contenido: barra de título simulada + filas de datos + grid de 2 cards

- Dots de navegación:
  position absolute, bottom 16px, left 48px
  Activo: pill elongado, color=theme.colors.secondary
  Inactivo: círculo rgba(255,255,255,0.3)

- Mobile (< theme.breakpoints.tablet):
  grid 1 columna, ocultar mockup
  height=theme.hero.heightMobile

Manejar estado del slideshow con useState + useEffect.
```

---

## TEMPLATE 2 — Split 50/50 con estadísticas
**Datos · Credibilidad · Servicios**

Layout dividido: izquierda con gradiente, derecha con imágenes rotantes y cards de estadísticas con glassmorphism.

### Variables que usa de theme.ts

| Variable theme.ts              | Uso en el componente                             |
|-------------------------------|--------------------------------------------------|
| `theme.hero.height`           | Altura del contenedor                            |
| `theme.hero.heightMobile`     | Altura en mobile                                 |
| `theme.hero.images`           | Imágenes del lado derecho                        |
| `theme.hero.slideInterval`    | Ms entre imágenes                                |
| `theme.hero.blurAmount`       | Blur de las imágenes                             |
| `theme.hero.tag`              | Etiqueta sobre el título                         |
| `theme.hero.title`            | Título principal                                 |
| `theme.hero.subtitle`         | Descripción breve                                |
| `theme.hero.cta.primary`      | Botón de acción                                  |
| `theme.colors.primary`        | Base del gradiente izquierdo                     |
| `theme.colors.dark`           | Base del gradiente izquierdo                     |
| `theme.colors.secondary`      | Color del tag y acento                           |
| `theme.logo.pathWhite`        | Logo blanco sobre el lado izquierdo              |

### Estadísticas configurables

Cada stat tiene `number` (string) y `label` (string). Se pueden poner 2, 3 o 4 — el grid se adapta.
Las cards usan glassmorphism: `rgba(255,255,255,0.12)` + `backdrop-filter: blur(8px)`.

### Comportamiento

- Lado izquierdo: fijo con `linear-gradient(135deg, colors.dark 0%, colors.primary 100%)`
- Lado derecho: slideshow de imágenes con fade suave
- Stats: cards con glassmorphism, posición `absolute bottom-left` de la imagen
- Textos izquierdo: animación fadeUp en secuencia
- Mobile: imagen arriba (50vh), contenido abajo — stats en fila horizontal scrolleable

### Prompt para la IA

```
Adjuntar: components/landing/hero.tsx + lib/theme.ts

Crear el Hero Template 2 — Split 50/50 con estadísticas.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ESTADÍSTICAS:
[
  { number: "[STAT_1_NUM]", label: "[STAT_1_LABEL]" },
  { number: "[STAT_2_NUM]", label: "[STAT_2_LABEL]" },
  { number: "[STAT_3_NUM]", label: "[STAT_3_LABEL]" },
]
(Reemplazar con los 3 números más impactantes del negocio)

ESPECIFICACIONES:
- Contenedor:
  display grid, grid-template-columns 1fr 1fr
  height=theme.hero.height, overflow hidden

- Lado izquierdo:
  background: linear-gradient(135deg,
    theme.colors.dark 0%, theme.colors.primary 100%)
  padding 60px 48px, display flex flex-col justify-center
  Tag: badge pequeño, bg rgba(secondary,0.15), color secondary
    texto: theme.hero.tag
  Título: theme.hero.title
    font-size 3rem, font-weight 700, color blanco, line-height 1.2
  Subtítulo: theme.hero.subtitle
    color rgba(255,255,255,0.65)
  Botón:
    bg blanco, color=theme.colors.dark, border-radius md
    texto: theme.hero.cta.primary.text
    href: theme.hero.cta.primary.href
    hover: bg rgba(255,255,255,0.9)
  Animaciones fadeUp en secuencia con delays

- Lado derecho:
  position relative, overflow hidden
  Slideshow: imágenes con blur(theme.hero.blurAmount)
    filter brightness(0.7), crossfade suave
  Overlay: linear-gradient(to left, transparent 60%, rgba(dark,0.3) 100%)
  Stats: position absolute, bottom 20px, left 20px, right 20px
    display grid, grid-cols 3, gap 8px
    Cada card:
      bg rgba(255,255,255,0.12), backdrop-filter blur(8px)
      border 0.5px solid rgba(255,255,255,0.2)
      border-radius 10px, padding 12px, text-align center
      Número: font-size xl, font-weight 700, color blanco
      Label: font-size xs, color rgba(255,255,255,0.6)

- Mobile (< theme.breakpoints.tablet):
  grid 1 columna
  Lado derecho arriba: height 50vh
  Stats: fila horizontal con overflow-x auto

Manejar estado del slideshow con useState + useEffect.
```

---

## TEMPLATE 3 — Fullscreen centrado + pills flotantes
**Premium · Inmersivo · Alto impacto visual**

Imágenes fullscreen muy oscuras y desenfocadas. Contenido centrado con título en gradiente. Pills flotantes a la derecha mostrando servicios con animación.

### Variables que usa de theme.ts

| Variable theme.ts              | Uso en el componente                             |
|-------------------------------|--------------------------------------------------|
| `theme.hero.height`           | Altura del contenedor                            |
| `theme.hero.heightMobile`     | Altura en mobile                                 |
| `theme.hero.images`           | Imágenes de fondo                                |
| `theme.hero.slideInterval`    | Ms entre imágenes                                |
| `theme.hero.blurAmount`       | Blur de las imágenes                             |
| `theme.hero.tag`              | Etiqueta con dot animado                         |
| `theme.hero.title`            | Primera parte del título (color blanco)          |
| `theme.hero.titleHighlight`   | Segunda parte con gradiente de texto             |
| `theme.hero.subtitle`         | Descripción breve                                |
| `theme.hero.cta.primary`      | Botón con gradiente                              |
| `theme.hero.cta.secondary`    | Botón glassmorphism                              |
| `theme.colors.primary`        | Inicio del gradiente del título y botón          |
| `theme.colors.secondary`      | Fin del gradiente del título y botón             |

### Pills flotantes configurables

Cada pill tiene: `icon` (componente de icono), `title`, `subtitle`, `color` (fondo del ícono).
Máximo recomendado: 3-4 pills. Animación `floatUp` en loop con delays distintos por índice.

### Comportamiento

- Imágenes: `blur + brightness(0.35)`, crossfade lento (`1.5s`)
- Tag: pill con dot verde animado (pulse)
- Título: primera parte blanca, segunda parte con `background-clip: text` en gradiente
- Pills: `position absolute right`, animación `floatUp 3s infinite` con stagger
- Mobile: pills se ocultan, título reducido a `2.5rem`

### Prompt para la IA

```
Adjuntar: components/landing/hero.tsx + lib/theme.ts

Crear el Hero Template 3 — Fullscreen centrado con pills flotantes.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

PILLS:
[
  { icon: "[ICONO_1]", title: "[TITULO_1]", subtitle: "[SUB_1]", color: "[COLOR_1]" },
  { icon: "[ICONO_2]", title: "[TITULO_2]", subtitle: "[SUB_2]", color: "[COLOR_2]" },
  { icon: "[ICONO_3]", title: "[TITULO_3]", subtitle: "[SUB_3]", color: "[COLOR_3]" },
]
(Reemplazar con los servicios principales del negocio)

ESPECIFICACIONES:
- Contenedor:
  position relative, height=theme.hero.height
  overflow hidden, display flex
  align-items center, justify-content center

- Imágenes:
  position absolute, inset 0
  filter: blur(theme.hero.blurAmount) brightness(0.35)
  transition opacity 1.5s ease
  Auto-avance cada theme.hero.slideInterval

- Overlay:
  position absolute, inset 0, bg rgba(0,0,0,0.55)

- Contenido centrado (z-index 2):
  max-width 680px, text-align center, padding 0 48px
  Tag: pill flex items-center gap-2
    bg rgba(255,255,255,0.08)
    border 0.5px solid rgba(255,255,255,0.2)
    Texto: theme.hero.tag
    Dot verde: w-2 h-2, bg #4ade80, animation pulse 1.5s infinite
  Título:
    Línea 1 (theme.hero.title): color blanco
    Línea 2 (theme.hero.titleHighlight): gradiente
      background: linear-gradient(to right,
        theme.colors.secondary, theme.colors.primary)
      -webkit-background-clip text, -webkit-text-fill-color transparent
    font-size 4rem, font-weight 800, line-height 1.1
  Subtítulo: theme.hero.subtitle
    color rgba(255,255,255,0.65)
  Botones: flex justify-center gap-3
    Primario: bg gradiente primary→secondary, border-radius full
      texto: theme.hero.cta.primary.text
      href: theme.hero.cta.primary.href
    Secundario: glassmorphism, border-radius full
      bg rgba(255,255,255,0.10), backdrop-filter blur(8px)
      texto: theme.hero.cta.secondary.text
      href: theme.hero.cta.secondary.href

- Pills flotantes:
  position absolute, right 40px
  display flex flex-col, gap 12px, top 50% translateY(-50%)
  Cada pill: flex items-center gap-3
    bg rgba(255,255,255,0.10), backdrop-filter blur(8px)
    border 0.5px solid rgba(255,255,255,0.2)
    border-radius 99px, padding 8px 16px
    Ícono: w-8 h-8, border-radius full, bg color+"44"
    animation: floatUp 3s ease-in-out infinite
      delay: index × 1s

- Mobile (< theme.breakpoints.tablet):
  Ocultar pills
  font-size título: 2.5rem

Manejar estado del slideshow con useState + useEffect.

NOTA: Este template requiere imágenes de alta calidad.
Con imágenes de baja resolución el resultado no es el esperado.
```

---

## Resumen — Cuándo usar cada Hero

| Template              | Estilo              | Imágenes necesarias        | Ideal para                     |
|-----------------------|---------------------|---------------------------|--------------------------------|
| **1 — Mockup**        | Profesional, con app | 3 horizontales             | SaaS, agencias, tech           |
| **2 — Split stats**   | Datos, credibilidad  | 2-3 horizontales           | Servicios, empresas, pymes     |
| **3 — Fullscreen**    | Premium, inmersivo   | 3-5 de alta calidad        | Cualquier rubro premium        |

**Buena práctica:** tener al menos 3 imágenes para el slideshow, todas formato horizontal 16:9,
optimizadas. Nombrarlas `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg` en `/public/images/hero/`.
