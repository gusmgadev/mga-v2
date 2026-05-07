# CONTEXT.md — MGA Informática

> **Cómo usar este archivo:**
> 1. Al iniciar cada chat con la IA, adjuntarlo junto con `lib/theme.ts`
> 2. Al terminar cada sesión, actualizar "Funcionalidades implementadas" y "Pendientes"
>
> **Regla fundamental:** Los valores de colores, tipografía, textos, logos,
> contacto y navegación NO se escriben aquí — todos viven en `lib/theme.ts`.
> Este archivo describe el proyecto. `theme.ts` describe el diseño y los datos.

---

## Descripción general

- **Proyecto:** MGA Informática (sitio web + sistema de gestión)
- **Cliente:** MGA Informática
- **Rubro:** Servicios IT — desarrollo web, mantenimiento de equipos, sistemas de gestión (Zoologic), consultoría IT, soporte técnico
- **Objetivo:** Landing para captar clientes + páginas de servicios + sistema Zoologic
- **URL producción:** https://mgadigital.com.ar
- **Fecha inicio:** 2026
- **Estado:** Landing completa con secciones adicionales (Sistemas Zoologic, proceso interactivo)

---

## Fuente de verdad del diseño y datos

**Todos los valores visuales y de contenido están en `lib/theme.ts`.**
Antes de crear o modificar cualquier componente, adjuntar ese archivo.

| Qué necesitás saber            | Dónde está en theme.ts              |
|-------------------------------|-------------------------------------|
| URL y nombre del sitio         | `theme.site.*`                      |
| Colores de la marca            | `theme.colors.*`                    |
| Tipografía y tamaños           | `theme.fonts.*` / `theme.fontSizes.*` |
| Logo (claro y blanco)          | `theme.logo.*`                      |
| Datos de contacto              | `theme.contact.*`                   |
| Textos del Hero                | `theme.hero.*`                      |
| Palabras del banner animado    | `theme.banner.words`                |
| Navegación y CTA del navbar    | `theme.navbar.*` (items incluidos)  |
| Servicios (items y textos)     | `theme.services.*`                  |
| Pasos del proceso              | `theme.process.*`                   |
| Sección clientes (título)      | `theme.clients.*`                   |
| Descripción, redes, mapa       | `theme.footer.*`                    |
| Espaciado, radios, sombras     | `theme.spacing.*` / `theme.radii.*` / `theme.shadows.*` |
| Transiciones                   | `theme.transitions.*`               |
| Rutas de auth y dashboard      | `theme.auth.*` / `theme.dashboard.*` |

**Los clientes (22 empresas) viven en `lib/clientes.ts`** — separado de theme.ts por volumen.

**Nunca hardcodear colores, fuentes ni textos en los componentes.**
Siempre importar: `import { theme } from '@/lib/theme'`

---

## Stack tecnológico

- **Framework:** Next.js 16.2.4 con App Router
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 + `@tailwindcss/postcss`
- **Animaciones:** Framer Motion 12.38.0
- **Iconos:** Lucide React 1.14.0
- **Base de datos:** Supabase (`@supabase/supabase-js` instalado — no implementado aún)
- **Autenticación:** NextAuth.js v5 beta (instalado — no implementado aún)
- **Email:** Resend (instalado — no implementado aún)
- **Formularios:** React Hook Form + Zod (instalados — no implementados aún)
- **Deploy:** Sin configurar — dominio mgadigital.com.ar

---

## Estructura de carpetas

```
mga-v2/
│
├── app/                          # RUTAS
│   ├── (public)/                 # Zona pública — solo README, pendiente
│   ├── (auth)/                   # Zona autenticación — solo README, pendiente
│   ├── (dashboard)/              # Zona privada — solo README, pendiente
│   ├── layout.tsx                # Layout raíz con metadata SEO completa
│   ├── page.tsx                  # Landing principal (ruta "/")
│   ├── sitemap.ts                # Genera /sitemap.xml automáticamente
│   ├── robots.ts                 # Genera /robots.txt automáticamente
│   ├── favicon.ico               # Favicon (Next.js lo detecta solo en app/)
│   └── globals.css               # Estilos globales y animaciones Tailwind
│
├── components/                   # COMPONENTES UI
│   └── landing/                  # Componentes de la landing
│       ├── moving-banner.tsx     # Banner animado fijo en top-0 (palabras clave)
│       ├── navbar.tsx            # Navbar tipo Template 5: logo centrado + links underline
│       ├── hero.tsx              # Template 1: slideshow 3 imágenes + mockup dashboard
│       ├── services.tsx          # Grilla 4 servicios desde theme.services
│       ├── process.tsx           # 4 pasos del proceso desde theme.process
│       ├── clients.tsx           # Grilla 22 clientes con hover card + Framer Motion
│       ├── contact.tsx           # Formulario (solo frontend — sin envío real aún)
│       ├── footer.tsx            # Banda CTA + 4 columnas + mapa embed
│       └── json-ld.tsx           # JSON-LD LocalBusiness para SEO (Schema.org)
│
├── lib/                          # LÓGICA Y CONFIG
│   ├── theme.ts                  # ← FUENTE DE VERDAD — colores, textos, datos, site URL
│   └── clientes.ts               # Array de 22 clientes con logo, dirección, teléfono
│
├── services/                     # APIs EXTERNAS — solo README, pendiente
├── hooks/                        # HOOKS CUSTOM — solo README, pendiente
├── types/                        # TIPOS TYPESCRIPT — solo README, pendiente
│
├── context/                      # DOCUMENTACIÓN Y BIBLIOTECAS
│   ├── CONTEXT.md                # Este archivo
│   ├── Biblioteca-Navbar.md      # 5 templates de navbar listos para usar
│   ├── Biblioteca-Hero.md        # 3 templates de hero listos para usar
│   ├── Biblioteca-Footer.md      # 3 templates de footer listos para usar
│   ├── AUTH_CONTEXT.md           # Guía para implementar autenticación
│   ├── AUTH_PROMPTS.md           # Prompts para auth backend
│   └── AUTH_UI_PROMPTS.md        # Prompts para auth UI
│
└── public/
    └── images/
        ├── logos/                # logo.png, mga-logo.png, etc.
        ├── hero/                 # hero-1.jpg, hero-2.jpg, hero-5.jpg (slideshow)
        └── clientes/             # 22 logos de clientes
```

### Las 4 reglas de esta arquitectura

1. **`lib/theme.ts` es la única fuente de verdad** — colores, textos, datos de contacto, rutas de logos, site URL
2. **Componentes separados por zona** — `landing/` nunca importa de `dashboard/` y viceversa
3. **`lib/clientes.ts`** — los 22 clientes viven acá, no en theme.ts (demasiado volumen)
4. **Tipos centralizados** — todos los tipos TypeScript en `types/` cuando se implementen

### Qué existe en este proyecto

- `app/(public)/`         → pendiente (solo README)
- `app/(auth)/`           → pendiente (solo README)
- `app/(dashboard)/`      → pendiente (solo README)
- `components/landing/`   → ✓ completo (9 componentes)
- `components/dashboard/` → pendiente
- `components/shared/`    → pendiente
- `lib/theme.ts`          → ✓ existe — es la fuente de verdad del proyecto
- `lib/clientes.ts`       → ✓ existe — 22 clientes con interface `Client`
- `services/`             → pendiente (Resend, Supabase Admin)
- `hooks/`                → pendiente
- `types/`                → pendiente
- `middleware.ts`         → pendiente (protección de rutas privadas)

---

## Rutas y componentes existentes

### Rutas creadas

- `/` → landing principal (page.tsx)
- `/desarrollo-web` → página de servicio desarrollo web
- `/sistemas-gestion` → página de servicio sistemas de gestión Zoologic
- `/consultoria-it` → página de servicio consultoría IT
- `/soporte-tecnico` → página de servicio soporte técnico
- `/lince` → página sistema Lince (Zoologic)
- `/dragonfish` → página sistema Dragonfish (Zoologic)
- `/pantera` → página sistema Pantera (Zoologic)
- `/sitemap.xml` → generado por sitemap.ts
- `/robots.txt` → generado por robots.ts

### Componentes landing (`components/landing/`)

- `moving-banner.tsx` → banda animada fija en z-50 top-0 con palabras clave del servicio leídas desde `theme.banner.words`
- `navbar.tsx`        → logo centrado + hamburguesa mobile (responsive). Desktop: links debajo del logo. Mobile: menú pantalla completa.
- `hero.tsx`          → slideshow de 3 imágenes con blur + overlay. "Mundo Digital" tiene animación de gradiente azul→celeste con borde gris.
- `services.tsx`      → grilla 4 columnas de servicios leídos desde `theme.services.items`
- `sistemas-zoologic.tsx` → grilla 3 sistemas Zoologic (Lince, Dragonfish, Pantera) con logos. Card completa clickeable → página del sistema. Badge "Agentes certificados desde el 2008".
- `process.tsx`       → timeline de 4 pasos leídos desde `theme.process.steps`. Hover revela detalle. CTA "¿Tenés una idea?" al pie.
- `clients.tsx`       → grilla responsiva de clientes, hover revela dirección y teléfono, animación Framer Motion float, borde azul MGA al hover
- `contact.tsx`       → formulario con campos nombre/email/teléfono/mensaje. Formulario arriba en mobile. Botón "Consultános" va a `/#contact`.
- `footer.tsx`        → banda CTA superior con gradiente + 4 columnas (empresa, servicios, nav, contacto+mapa)
- `json-ld.tsx`       → script JSON-LD con schema LocalBusiness para Google rich results

---

## Funcionalidades implementadas

- [x] Landing completa con todas las secciones
- [x] Moving banner animado con palabras clave de servicios
- [x] Navbar responsive: logo centrado, hamburguesa mobile, menú pantalla completa
- [x] Hero con slideshow de imágenes y animación "Mundo Digital" (gradiente azul→celeste con borde gris)
- [x] Sección Servicios (4 items desde theme.ts)
- [x] Sección Sistemas Zoologic con badge "Agentes certificados desde el 2008". Cards clickeables.
- [x] Sección Proceso interactiva (hover revela detalles). CTA "¿Tenés una idea?" al pie.
- [x] Sección Clientes con hover borde azul MGA
- [x] Formulario de contacto: formulario primero en mobile, info de contacto después
- [x] Footer con banda CTA + mapa de Google Maps embed
- [x] Páginas de servicios con Footer: desarrollo-web, sistemas-gestion, consultoria-it, soporte-tecnico
- [x] Páginas Zoologic con fondo imagen desenfocada: lince, dragonfish, pantera
- [x] Colores por sistema: Lince naranja, Dragonfish azul, Pantera violeta (título, bordes, cards)
- [x] Teléfono abre WhatsApp (#wa.me)
- [x] Botones "Consultános" van a /#contact
- [x] SEO completo en todas las páginas: title, description, keywords, Open Graph, canonical
- [x] sitemap.xml con todas las rutas (8 URLs)
- [x] robots.txt (bloquea /dashboard, /auth, /api)
- [x] JSON-LD LocalBusiness (Schema.org — Rich Results en Google)
- [x] favicon.ico
- [x] Envío de emails real (Resend — API route `/api/contact` implementada)
- [ ] Autenticación (NextAuth v5 instalado, pendiente)
- [ ] Protección de rutas privadas (middleware.ts pendiente)
- [ ] Dashboard funcional
- [ ] Deploy en mgadigital.com.ar
- [ ] Google Search Console (enviar sitemap tras deploy)

---

## Pendientes y próximos pasos

### Pendientes

- Autenticación (NextAuth v5 instalado)
- Middleware de rutas
- Dashboard funcional
- Deploy en mgadigital.com.ar
- Google Search Console

### Backlog

- Sección "Nosotros" (el link en navbar apunta a `#`, sin destino real)
- Página de servicios individuales con slug (`/servicios/[slug]`)
- Dashboard funcional (módulos: clientes, servicios, facturación)
- OG image dedicada 1200×630px (ahora usa hero-1.jpg)
- Google Business Profile — reclamar o dar de alta en maps.google.com
- Sumar `hero-2.jpg` al slideshow (actualmente usa hero-1, hero-2, hero-5)

---

## Convenciones del proyecto

- **Idioma del código:** inglés
- **Idioma de la UI:** español
- **Mensajes de error:** siempre en español
- **Nombres de archivos:** kebab-case (ej: `contact-form.tsx`)
- **Componentes:** PascalCase (ej: `ContactForm`)
- **Variables:** camelCase (ej: `isLoading`)
- **Estilos:** solo Tailwind + `theme.*`, sin valores hardcodeados
- **Imports:** absolutos desde raíz con `@/` (ej: `@/lib/theme`)
- **Comentarios:** en español

---

## Notas especiales del proyecto

- **navItems en `theme.navbar.items`** — los links del menú vienen de theme.ts. Editar el array `items` dentro de `navbar` en theme.ts para agregar/quitar rutas.
- **moving-banner.tsx** — los textos vienen de `theme.banner.words`. Editar ahí para cambiar las palabras del banner.
- **Formulario de contacto** — usa `/api/contact` (Resend). Requiere `RESEND_API_KEY` y `RESEND_FROM_EMAIL` en `.env.local`. El dominio `mgadigital.com.ar` debe estar verificado en Resend para que el `from` funcione; en desarrollo usar `onboarding@resend.dev`.
- **Clientes en lib/clientes.ts** — por volumen (22 items con múltiples campos) se decidió separar de theme.ts. Exporta el tipo `Client` y el array `clientes`.
- **`app/(auth)`, `app/(dashboard)`, `app/(public)`** — las carpetas existen (con README) pero no tienen rutas implementadas todavía. Next.js ignora los grupos vacíos.
- **favicon.ico** — vive en `app/favicon.ico`. Next.js App Router lo sirve automáticamente desde ahí.
- **Alt text de logos** — en `navbar.tsx` y `footer.tsx` usa `theme.site.name` (resuelto).
- **Imágenes hero** — el slideshow usa `hero-1.jpg`, `hero-2.jpg` y `hero-5.jpg` (configurados en `theme.hero.images`). El `hero-3.jpg` existe en public pero no se usa.

---

**Última actualización:** 07/05/2026 (v4)
**Actualizado por:** Claude Code
