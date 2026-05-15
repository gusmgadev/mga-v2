# CONTEXT.md — MGA Informática

> **Nota:** Este archivo es un resumen de alto nivel para referencia rápida.
> La fuente de verdad completa del proyecto está en **`CLAUDE.md`** (raíz del repo).
> Para sesiones de IA, siempre preferir adjuntar `CLAUDE.md`.

---

## Descripción general

- **Proyecto:** MGA Informática (sitio web + sistema de gestión interno)
- **Cliente:** MGA Informática
- **Rubro:** Servicios IT — desarrollo web, mantenimiento de equipos, sistemas de gestión (Zoologic), consultoría IT, soporte técnico
- **URL producción:** https://mgadigital.com.ar
- **Repo GitHub:** https://github.com/gusmgadev/mga-v2
- **Deploy:** Vercel (rama `master`)
- **Estado:** Landing completa + Dashboard de gestión implementado (auth, permisos, 6 módulos de negocio)

---

## Fuente de verdad del diseño y datos

**Todos los valores visuales y de contenido están en `lib/theme.ts`.**

| Qué necesitás saber            | Dónde está en theme.ts              |
|-------------------------------|-------------------------------------|
| URL y nombre del sitio         | `theme.site.*`                      |
| Colores de la marca            | `theme.colors.*`                    |
| Tipografía y tamaños           | `theme.fonts.*` / `theme.fontSizes.*` |
| Logo                           | `theme.logo.*`                      |
| Datos de contacto              | `theme.contact.*`                   |
| Textos del Hero                | `theme.hero.*`                      |
| Palabras del banner animado    | `theme.banner.words`                |
| Navegación del navbar          | `theme.navbar.*`                    |
| Servicios (items y textos)     | `theme.services.*`                  |
| Pasos del proceso              | `theme.process.*`                   |
| Espaciado, radios, sombras     | `theme.spacing.*` / `theme.radii.*` |
| Rutas de auth y dashboard      | `theme.auth.*` / `theme.dashboard.*` |

**Los clientes (22 empresas) viven en `lib/clientes.ts`** — separado de theme.ts por volumen.

---

## Stack tecnológico

- **Framework:** Next.js 16.2.4 — App Router (`params`/`searchParams` son `Promise`, siempre `await`)
- **Lenguaje:** TypeScript strict
- **Estilos landing:** Tailwind CSS v4 + Framer Motion
- **Estilos dashboard:** inline styles con `theme.*` (sin Tailwind)
- **IA / voz:** Groq Whisper (STT) + Llama 3.3 (voz remitos + extracción oportunidades desde email)
- **Rich text:** TipTap (Bold / Italic / Highlight) para el editor de noticias en el dashboard
- **Instagram:** Graph API v21.0 — auto-post al publicar una noticia
- **Autenticación:** NextAuth.js v5 beta — CredentialsProvider + JWT
- **Base de datos:** Supabase PostgreSQL (dos clientes: anon y service role)
- **Formularios:** React Hook Form + Zod
- **Iconos:** Lucide React 1.14.0
- **Email:** Resend — `/api/contact`
- **Deploy:** Vercel (rama master)

---

## Estructura de alto nivel

```
mga-v2/
├── app/
│   ├── (public)/          # Landing pública
│   ├── (auth)/            # Login y registro
│   ├── (dashboard)/       # Sistema de gestión privado
│   └── api/               # API routes (auth, contact, dashboard/*)
├── components/
│   ├── landing/           # 9 componentes de la landing
│   └── dashboard/         # Sidebar, Header, QuickCreate modals, VoiceRecorder, CatalogoCombobox, RichTextEditor
├── lib/
│   ├── theme.ts           # FUENTE DE VERDAD — colores, tipografía, datos
│   ├── auth.ts            # Config NextAuth
│   ├── permisos.ts        # getModulePermisos() + tipo ModulePermisos
│   └── clientes.ts        # 22 clientes de la landing
├── services/
│   ├── supabase-admin.ts  # Cliente Supabase service role (solo server)
│   └── instagram.ts       # Auto-post a Instagram Graph API al publicar noticias
├── hooks/
│   └── usePermissions.ts  # Hook cliente para permisos
├── proxy.ts               # Middleware de rutas (se llama proxy.ts, no middleware.ts)
└── public/images/         # logos/, hero/, clientes/
```

---

## Funcionalidades implementadas

### Landing pública
- [x] Todas las secciones: Banner animado, Navbar, Hero slideshow, Servicios, Sistemas Zoologic, Proceso, Clientes, Contacto, Footer
- [x] Páginas de servicios: desarrollo-web, sistemas-gestion, consultoria-it, soporte-tecnico
- [x] Páginas Zoologic: lince, dragonfish, pantera
- [x] Formulario de contacto con envío real (Resend)
- [x] SEO completo: title, description, OG, canonical, sitemap.xml, robots.txt, JSON-LD
- [x] Botón flotante de WhatsApp

### Dashboard (sistema de gestión)
- [x] Autenticación: NextAuth v5 + Supabase Auth + JWT
- [x] Sistema de roles: Administrador / Usuario
- [x] Sistema de permisos por módulo (`role_permissions` en DB)
- [x] Protección de rutas en `proxy.ts`
- [x] Módulo Clientes: lista, crear, editar (con permisos)
- [x] Módulo Activos: lista, crear, editar (con permisos)
- [x] Módulo Servicios: lista, crear, detalle, editar, tareas, pagos (con permisos)
- [x] Módulo Presupuestos: lista, crear, detalle, editar, ítems (con permisos)
- [x] Módulo Productos: lista, crear, editar; catálogo con código, marca, rubro, unidad, stock, costo, precio venta
- [x] Módulo Remitos: lista, crear, detalle, editar, confirmar, ítems
  - Ingreso de stock por voz: Groq Whisper (transcripción) + Llama 3.3 (extracción de productos)
  - Matching automático por código (exacto y normalizado) y por nombre (pg_trgm / ILIKE fallback)
  - Auto-inserción con confianza ≥ 0.70; panel de pendientes para el resto
  - Panel de pendientes: "Usar esta coincidencia", "Crear producto", "Descartar"
- [x] Módulo Noticias: lista, crear, editar con rich text (TipTap), imágenes, fecha editable, toggle publicada/borrador, auto-post Instagram al publicar. Página pública `/noticias` y `/noticias/[id]`
- [x] Módulo Oportunidades: búsqueda IMAP Gmail, selección de emails, extracción automática con Groq Llama 3.3, deduplicación por message_id, soporte tipo_op (OP_NUEVA / SEGUIMIENTO / CROSS_SELLING)
- [x] Panel Admin: Usuarios, Roles, Permisos
- [x] Quick-create inline: crear cliente o activo desde cualquier formulario sin salir de la pantalla
- [x] CatalogoCombobox: combobox compartido con creación inline de marca/rubro
- [x] Modales: click afuera NO cierra, botón guardar (💾) en header de todos los modales con formulario

---

## Pendientes

- **Sección Nosotros** — link en navbar apunta a `#`, sin destino
- **OG image dedicada** — actualmente usa `hero-1.jpg`
- **Google Search Console** — enviar sitemap

---

## Convenciones clave

- **Dashboard:** inline styles con `theme.*`, nunca Tailwind
- **Arquitectura page→client:** `page.tsx` (server) fetcha datos y permisos → pasa como props a `XxxClient.tsx` (client)
- **Modales dentro de `<form>`:** siempre usar `createPortal(jsx, document.body)` para evitar `<form>` anidados
- **`git add` con `(dashboard)` en el path:** usar Bash, no PowerShell
- **El middleware se llama `proxy.ts`**, no `middleware.ts`

---

**Última actualización:** 2026-05-15
**Actualizado por:** Claude Code
