# BIBLIOTECA DE NAVBAR
5 Templates — Sistema de Diseño

> **Antes de usar cualquier template:**
> Adjuntar `lib/theme.ts` junto con este archivo.
> Todos los valores de color, tipografía, logo, CTA y contacto
> se leen desde ahí. No hay nada que hardcodear.

---

## Cómo completar theme.ts para el Navbar

Solo estos campos afectan al navbar. Completarlos antes de pedir cualquier template:

```typescript
// lib/theme.ts — sección navbar
navbar: {
  height:       "64px",       // altura del navbar en desktop
  heightMobile: "56px",       // altura en mobile
  cta: {
    text: "[TEXTO_CTA]",      // ej: 'Contactanos'
    href: "[DESTINO_CTA]",    // ej: '#contact' o '/contacto'
  },
},

// También se usan:
colors.primary      // fondo del item activo y botón CTA
colors.secondary    // underline activo en Template 5
colors.dark         // fondo en Template 3 y barra top en Template 4
colors.background   // fondo del navbar en templates claros
colors.border       // borde inferior sutil
fonts.primary       // fuente de los links
logo.path           // logo sobre fondos claros
logo.pathWhite      // logo sobre fondos oscuros
logo.width          // ancho de renderizado
logo.height         // alto de renderizado
contact.phone       // teléfono visible en Templates 4 y 5
contact.email       // email visible en Templates 4 y 5
transitions.fast    // velocidad del hover
shadows.nav         // sombra al hacer scroll
```

---

## TEMPLATE 1 — Clásico limpio
**Simple · Versátil · Recomendado como default**

Logo izquierda, links centro, CTA derecha. Item activo con pill redondeado en `colors.primary`. Funciona para cualquier tipo de proyecto.

### Variables que usa de theme.ts

| Variable theme.ts         | Uso en el componente                        |
|--------------------------|---------------------------------------------|
| `theme.colors.primary`   | Fondo del pill activo + botón CTA           |
| `theme.colors.background`| Fondo del navbar                            |
| `theme.fonts.primary`    | Fuente de los links                         |
| `theme.logo.path`        | Logo PNG sobre fondo claro                  |
| `theme.logo.width/height`| Dimensiones del logo                        |
| `theme.navbar.height`    | Alto del navbar                             |
| `theme.navbar.cta.text`  | Texto del botón de acción                   |
| `theme.navbar.cta.href`  | Destino del botón                           |
| `theme.transitions.fast` | Velocidad del hover                         |
| `theme.shadows.nav`      | Sombra al hacer scroll                      |

### Comportamiento

- Active: pill redondeado (`radii.full`) en `colors.primary`, texto blanco
- Hover: fondo gris suave con transición `transitions.fast`
- Sticky con sombra `shadows.nav` al hacer scroll
- Mobile: hamburguesa → menú desplegable hacia abajo

### Prompt para la IA

```
Adjuntar: components/landing/navbar.tsx + lib/theme.ts

Crear el Navbar Template 1 — Clásico limpio.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ITEMS DEL MENÚ: ["Servicios", "Proceso", "Clientes", "Contacto"]

ESPECIFICACIONES:
- Contenedor: bg=theme.colors.background, height=theme.navbar.height
  sticky top-0, z-index 50
  Al hacer scroll: box-shadow=theme.shadows.nav con transición
- Logo: imagen desde theme.logo.path
  width=theme.logo.width height=theme.logo.height
- Links:
  Item activo: bg=theme.colors.primary, color blanco
    border-radius=theme.radii.full, padding 6px 16px
  Hover: bg gris suave, border-radius=theme.radii.full
  Transición: theme.transitions.fast
  Detectar ruta activa según la tecnología del proyecto
- Botón CTA:
  Texto: theme.navbar.cta.text
  Href: theme.navbar.cta.href
  bg=theme.colors.primary, color blanco
  border-radius=theme.radii.full, font-weight bold
  Hover: opacidad 90%
- Mobile (< theme.breakpoints.mobile):
  Mostrar icono hamburguesa
  Al hacer click: menú desplegable hacia abajo
  Fondo blanco, links en columna, padding generoso
```

---

## TEMPLATE 2 — Flotante glassmorphism
**Moderno · Impactante · Requiere hero oscuro**

Navbar flotante con fondo translúcido y blur. Requiere `logo.pathWhite` y hero con fondo oscuro.

### Variables que usa de theme.ts

| Variable theme.ts           | Uso en el componente                        |
|-----------------------------|---------------------------------------------|
| `theme.colors.dark`         | Color de referencia para el fondo detrás    |
| `theme.colors.primary`      | Fondo del botón CTA                         |
| `theme.logo.pathWhite`      | Logo versión blanca (obligatorio)           |
| `theme.logo.width/height`   | Dimensiones del logo                        |
| `theme.navbar.height`       | Alto del navbar                             |
| `theme.navbar.cta.text`     | Texto del botón                             |
| `theme.navbar.cta.href`     | Destino del botón                           |
| `theme.transitions.fast`    | Velocidad de hover y transición scroll      |

### Comportamiento

- Navbar flotante: `border-radius: 99px`, sticky `top: 16px`, centrado horizontalmente
- Fondo: `rgba(255,255,255,0.08)` + `backdrop-filter: blur(12px)`
- Borde: `0.5px solid rgba(255,255,255,0.15)`
- Item activo: `bg rgba(255,255,255,0.18)`, texto blanco
- Al hacer scroll (> 20px): blur y opacidad aumentan levemente
- CTA: botón blanco sólido con texto `colors.dark`
- Mobile: hamburguesa blanca → dropdown oscuro con blur

### Prompt para la IA

```
Adjuntar: components/landing/navbar.tsx + lib/theme.ts

Crear el Navbar Template 2 — Flotante glassmorphism.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ITEMS DEL MENÚ: ["Servicios", "Proceso", "Clientes", "Contacto"]

ESPECIFICACIONES:
- Contenedor: sticky top-4, max-width 900px, mx-auto
  bg rgba(255,255,255,0.08), backdrop-filter blur(12px)
  border 0.5px solid rgba(255,255,255,0.15)
  border-radius 99px, padding 8px 24px
  Al scroll > 20px: bg rgba(255,255,255,0.15), blur 16px
  Transición: theme.transitions.fast
- Logo: imagen desde theme.logo.pathWhite
  width=theme.logo.width height=theme.logo.height
- Links:
  Color base: rgba(255,255,255,0.70)
  Hover: blanco
  Item activo: bg rgba(255,255,255,0.18), color blanco
    border-radius 99px, padding 6px 16px
  Detectar ruta activa según la tecnología del proyecto
- Botón CTA:
  Texto: theme.navbar.cta.text
  Href: theme.navbar.cta.href
  bg blanco, color=theme.colors.dark
  border-radius 99px, font-weight 600
- Mobile (< theme.breakpoints.mobile):
  Hamburguesa blanca
  Dropdown: bg rgba(15,26,53,0.95), backdrop-filter blur(12px)
  border-radius 16px, links en columna

NOTA: Este template requiere hero con fondo oscuro.
No funciona sobre fondos blancos.
```

---

## TEMPLATE 3 — Logo en badge de color
**Corporativo · Oscuro · Tech**

Navbar oscuro con logo dentro de un badge de `colors.primary`. Links con underline animado en el item activo.

### Variables que usa de theme.ts

| Variable theme.ts           | Uso en el componente                        |
|-----------------------------|---------------------------------------------|
| `theme.colors.primary`      | Color del badge del logo                    |
| `theme.colors.secondary`    | Color del underline activo                  |
| `theme.colors.dark`         | Fondo del navbar (o usar `#0A0A0A`)         |
| `theme.logo.path`           | Logo PNG (visible sobre badge de color)     |
| `theme.logo.width/height`   | Dimensiones del logo                        |
| `theme.navbar.height`       | Alto del navbar                             |
| `theme.navbar.cta.text`     | Texto del botón                             |
| `theme.navbar.cta.href`     | Destino del botón                           |
| `theme.transitions.fast`    | Velocidad del hover                         |

### Comportamiento

- Fondo negro / `colors.dark` en toda la barra
- Logo en badge: `bg=colors.primary`, `border-radius: 8px`, padding `6px 14px`
- Links inactivos: `rgba(255,255,255,0.60)`, hover blanco
- Item activo: `color=colors.secondary` + `border-bottom 2px solid colors.secondary`
- CTA: borde `rgba(255,255,255,0.25)`, hover `rgba(255,255,255,0.08)`
- Mobile: hamburguesa blanca → dropdown oscuro

### Prompt para la IA

```
Adjuntar: components/landing/navbar.tsx + lib/theme.ts

Crear el Navbar Template 3 — Logo en badge de color.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ITEMS DEL MENÚ: ["Servicios", "Proceso", "Clientes", "Contacto"]

ESPECIFICACIONES:
- Contenedor: bg=theme.colors.dark, height=theme.navbar.height
  sticky top-0, z-index 50
  Al scroll: box-shadow 0 2px 12px rgba(0,0,0,0.4)
- Logo en badge:
  bg=theme.colors.primary, border-radius 8px
  padding 6px 14px, flex items-center gap-2
  Imagen desde theme.logo.path
  height=theme.logo.height
- Links:
  Color base: rgba(255,255,255,0.60)
  Hover: blanco, transición theme.transitions.fast
  Item activo: color=theme.colors.secondary
    border-bottom 2px solid theme.colors.secondary
  Detectar ruta activa según la tecnología del proyecto
- Botón CTA:
  Texto: theme.navbar.cta.text
  Href: theme.navbar.cta.href
  border 1px solid rgba(255,255,255,0.25), color blanco
  bg transparent, hover bg rgba(255,255,255,0.08)
  border-radius=theme.radii.sm
- Mobile (< theme.breakpoints.mobile):
  Hamburguesa blanca
  Dropdown bg #111111, links en columna
```

---

## TEMPLATE 4 — Dos filas con datos de contacto
**Completo · Profesional · Negocios locales**

Barra superior con teléfono y email. Barra principal con logo, links y CTA. Ideal cuando el contacto directo es clave.

### Variables que usa de theme.ts

| Variable theme.ts           | Uso en el componente                        |
|-----------------------------|---------------------------------------------|
| `theme.colors.dark`         | Fondo de la barra superior                  |
| `theme.colors.primary`      | Fondo del item activo + botón CTA           |
| `theme.colors.background`   | Fondo de la barra principal                 |
| `theme.colors.border`       | Borde inferior de la barra principal        |
| `theme.logo.path`           | Logo PNG sobre fondo claro                  |
| `theme.logo.width/height`   | Dimensiones del logo                        |
| `theme.navbar.height`       | Alto de la barra principal                  |
| `theme.navbar.cta.text`     | Texto del botón                             |
| `theme.navbar.cta.href`     | Destino del botón                           |
| `theme.contact.phone`       | Teléfono visible en la barra superior       |
| `theme.contact.email`       | Email visible en la barra superior          |
| `theme.fontSizes.xs`        | Tamaño del texto en la barra superior       |
| `theme.transitions.fast`    | Velocidad del hover                         |

### Comportamiento

- Barra top: `colors.dark`, padding `5px 32px`, alineado a la derecha
- Barra principal: `colors.background`, borde inferior `colors.border`
- Item activo: `bg=colors.primary`, texto blanco, `border-radius: radii.sm`
- Hover: fondo gris suave, `border-radius: radii.sm`
- Al hacer scroll: barra top se oculta con slide-up, sombra en barra principal
- Mobile: barra top se oculta, solo queda la barra principal

### Prompt para la IA

```
Adjuntar: components/landing/navbar.tsx + lib/theme.ts

Crear el Navbar Template 4 — Dos filas con contacto.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ITEMS DEL MENÚ: ["Servicios", "Proceso", "Clientes", "Contacto"]

ESPECIFICACIONES:
- Barra superior:
  bg=theme.colors.dark, padding 5px 32px
  justify-end, gap 24px
  Mostrar: theme.contact.phone y theme.contact.email
  font-size=theme.fontSizes.xs, color rgba(255,255,255,0.60)
  Mobile (< theme.breakpoints.mobile): display none

- Barra principal:
  bg=theme.colors.background, height=theme.navbar.height
  border-bottom 2px solid theme.colors.border
  sticky (junto con la barra top cuando está visible)

- Logo: imagen desde theme.logo.path
  width=theme.logo.width height=theme.logo.height

- Links:
  Item activo: bg=theme.colors.primary, color blanco
    border-radius=theme.radii.sm, padding 6px 14px
  Hover: bg gris suave, border-radius=theme.radii.sm
  Detectar ruta activa según la tecnología del proyecto

- Botón CTA:
  Texto: theme.navbar.cta.text
  Href: theme.navbar.cta.href
  bg=theme.colors.primary, color blanco
  border-radius=theme.radii.sm, font-weight bold

- Al hacer scroll: ocultar barra top con animación slide-up
  Agregar shadow en barra principal

- Mobile: hamburguesa → dropdown blanco, links en columna
```

---

## TEMPLATE 5 — Logo centrado elegante
**Editorial · Premium · Restaurantes / Moda**

Logo centrado, links debajo en uppercase. Barra superior con contacto. Subrayado animado en item activo. Requiere logo horizontal.

### Variables que usa de theme.ts

| Variable theme.ts           | Uso en el componente                        |
|-----------------------------|---------------------------------------------|
| `theme.colors.primary`      | Color del subrayado activo                  |
| `theme.colors.background`   | Fondo del navbar                            |
| `theme.colors.border`       | Borde inferior sutil                        |
| `theme.logo.path`           | Logo PNG horizontal (obligatorio)           |
| `theme.logo.width/height`   | Dimensiones del logo                        |
| `theme.navbar.cta.text`     | Texto del botón (opcional en este template) |
| `theme.navbar.cta.href`     | Destino del botón                           |
| `theme.contact.phone`       | Teléfono en la barra superior               |
| `theme.contact.email`       | Email en la barra superior                  |
| `theme.fontSizes.xs`        | Tamaño de links y barra superior            |
| `theme.transitions.fast`    | Velocidad del hover y subrayado             |

### Comportamiento

- Barra top: `#F9F9F7`, contacto alineado a la derecha
- Logo centrado con dimensiones de `theme.logo`
- Links centrados debajo del logo, uppercase, `letter-spacing: 1.5px`
- Item activo: `color=colors.primary` + `::after` con `bg=colors.primary` al 100% de ancho
- Hover: `::after` aparece con `width: 100%` desde `0%`
- Sticky: barra top desaparece al scroll, logo + links quedan fijos centrados
- Mobile: logo centrado + hamburguesa a la derecha

### Prompt para la IA

```
Adjuntar: components/landing/navbar.tsx + lib/theme.ts

Crear el Navbar Template 5 — Logo centrado elegante.
Importar todos los valores desde lib/theme.ts. No hardcodear colores ni textos.

ITEMS DEL MENÚ: ["Servicios", "Proceso", "Clientes", "Nosotros", "Contacto"]

ESPECIFICACIONES:
- Barra superior:
  bg #F9F9F7, border-bottom 0.5px solid theme.colors.border
  justify-end, padding 5px 32px
  Mostrar: theme.contact.phone y theme.contact.email
  font-size=theme.fontSizes.xs, color #888
  Mobile: display none

- Barra principal:
  display flex-col, align-items center, gap 12px
  bg=theme.colors.background
  border-bottom 0.5px solid theme.colors.border
  padding 12px 0

- Logo: imagen desde theme.logo.path, centrado
  width=theme.logo.width height=theme.logo.height

- Links:
  font-size=theme.fontSizes.xs
  letter-spacing 1.5px, text-transform uppercase
  color #666, padding 4px 16px
  Hover: color theme.colors.primary, transición theme.transitions.fast
  Item activo: color=theme.colors.primary
    Subrayado animado: ::after position absolute bottom -4px
      height 1.5px, bg=theme.colors.primary
      width 0 → 100% con transición theme.transitions.fast
  Detectar ruta activa según la tecnología del proyecto

- Sticky al scroll:
  Barra top se oculta
  Logo + links quedan fijos centrados
  Agregar border-bottom sutil

- Mobile (< theme.breakpoints.mobile):
  Logo centrado + hamburguesa a la derecha
  Dropdown centrado, links uppercase en columna

NOTA: Requiere logo horizontal.
Si el logo es cuadrado o vertical, usar Templates 1, 3 o 4.
```

---

## Resumen — Cuándo usar cada template

| Template             | Estilo              | Logo requerido  | Ideal para                          |
|----------------------|---------------------|-----------------|-------------------------------------|
| **1 — Clásico**      | Limpio, minimalista | Cualquier formato | Default para cualquier proyecto   |
| **2 — Glassmorphism**| Moderno, tech       | Versión blanca  | Startups, apps, hero oscuro         |
| **3 — Badge**        | Corporativo, oscuro | Cualquier formato | Tech, industrial, empresa          |
| **4 — Dos filas**    | Profesional         | Cualquier formato | Negocios locales, servicios        |
| **5 — Centrado**     | Editorial, premium  | Horizontal      | Restaurantes, moda, premium         |

**Combinaciones que funcionan bien:**
- Todo claro: Navbar 1 + Hero 1 + Footer 1
- Todo oscuro: Navbar 2 + Hero 3 + Footer 2
- Mixto con CTA final: Navbar 1 + Hero 2 + Footer 3
