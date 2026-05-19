@AGENTS.md
@context/modulos/servicios.md
@context/modulos/altas.md
@context/modulos/stock.md
@context/modulos/fondos.md
@context/modulos/administracion.md

# MGA Informática — Contexto completo del proyecto

## Qué es este proyecto

Dos productos en un mismo repo Next.js:

1. **Landing pública** (`/`) — sitio de marketing de MGA Informática (empresa de servicios IT). Incluye páginas de servicios, sistemas Zoologic, clientes, contacto.
2. **Dashboard privado** (`/dashboard`) — sistema interno de gestión. Módulos: Clientes, Activos, Servicios (con tareas y pagos), Presupuestos (con ítems), Productos/Stock, Remitos (ingreso de stock por voz), y panel Admin.

**URL producción:** https://mgadigital.com.ar  
**Repo GitHub:** https://github.com/gusmgadev/mga-v2  
**Deploy:** Vercel (rama `master`)

---

## Stack técnico (versiones exactas)

| Paquete | Versión | Notas |
|---|---|---|
| Next.js | 16.2.4 | App Router — `params`/`searchParams` son `Promise<...>` |
| React | 19.2.4 | |
| TypeScript | 5.x | Strict |
| Tailwind CSS | 4.x + `@tailwindcss/postcss` | Solo en landing |
| NextAuth.js | 5.0.0-beta.31 | CredentialsProvider + JWT |
| Supabase JS | 2.x | Auth + PostgreSQL |
| Zod | 4.x | Validación de forms y API |
| React Hook Form | 7.x | + `@hookform/resolvers` |
| Lucide React | 1.14.0 | Íconos |
| Framer Motion | 12.x | Solo en landing |
| Resend | 6.x | Email desde `/api/contact` |
| Groq API | — | Whisper (STT) + Llama 3.3 (voz/remitos) + Llama 3.3 (extracción oportunidades) |
| TipTap | — | Editor rich text (Bold/Italic/Highlight) — solo en dashboard noticias |

**IMPORTANTE — Next.js 16 breaking changes:**
- `params` y `searchParams` en page/route handlers son `Promise` — siempre `await params` antes de usar
- Leer `node_modules/next/dist/docs/` ante dudas sobre APIs

---

## Estructura de carpetas (estado actual)

```
mga-v2/
├── app/
│   ├── (public)/               # Landing pública
│   │   ├── page.tsx            # Landing principal "/"
│   │   ├── layout.tsx
│   │   ├── desarrollo-web/
│   │   ├── sistemas-gestion/
│   │   ├── consultoria-it/
│   │   ├── soporte-tecnico/
│   │   ├── lince/
│   │   ├── dragonfish/
│   │   └── pantera/
│   ├── (auth)/
│   │   └── auth/
│   │       ├── signin/page.tsx
│   │       └── registro/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── layout.tsx              # Sidebar + Header wrapper
│   │       ├── page.tsx                # Dashboard home
│   │       ├── clientes/
│   │       │   ├── page.tsx            # Server: fetch + permisos
│   │       │   └── ClientesClient.tsx  # Client: tabla, modales
│   │       ├── activos/
│   │       │   ├── page.tsx
│   │       │   └── ActivosClient.tsx
│   │       ├── servicios/
│   │       │   ├── page.tsx
│   │       │   ├── ServiciosClient.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── ServicioDetalleClient.tsx
│   │       ├── presupuestos/
│   │       │   ├── page.tsx
│   │       │   ├── PresupuestosClient.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── PresupuestoDetalleClient.tsx
│   │       ├── productos/
│   │       │   ├── page.tsx
│   │       │   └── ProductosClient.tsx # Catálogo con marca/rubro/stock
│   │       ├── remitos/
│   │       │   ├── page.tsx
│   │       │   ├── RemitosClient.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── RemitoDetalleClient.tsx # Ingreso por voz + tabla de ítems
│   │       ├── noticias/
│   │       │   ├── page.tsx
│   │       │   └── NoticiasAdminClient.tsx     # CRUD noticias + rich text + imágenes
│   │       └── admin/                  # Solo rol Administrador
│   │           ├── usuarios/
│   │           ├── roles/
│   │           └── permisos/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handlers
│   │   │   └── registro/route.ts
│   │   ├── contact/route.ts            # Email vía Resend
│   │   └── dashboard/
│   │       ├── permissions/route.ts    # GET: permisos del usuario logueado
│   │       ├── clientes/route.ts       # GET+POST
│   │       ├── clientes/[id]/route.ts  # GET+PUT+DELETE
│   │       ├── activos/route.ts
│   │       ├── activos/[id]/route.ts
│   │       ├── servicios/route.ts
│   │       ├── servicios/[id]/route.ts
│   │       ├── servicios/[id]/tareas/route.ts
│   │       ├── servicios/[id]/tareas/[tareaId]/route.ts
│   │       ├── servicios/[id]/pagos/route.ts
│   │       ├── servicios/[id]/pagos/[pagoId]/route.ts
│   │       ├── presupuestos/route.ts
│   │       ├── presupuestos/[id]/route.ts
│   │       ├── presupuestos/[id]/items/route.ts
│   │       ├── presupuestos/[id]/items/[itemId]/route.ts
│   │       ├── productos/route.ts
│   │       ├── productos/[id]/route.ts
│   │       ├── marcas/route.ts
│   │       ├── rubros-productos/route.ts
│   │       ├── remitos/route.ts
│   │       ├── remitos/[id]/route.ts
│   │       ├── remitos/[id]/confirmar/route.ts
│   │       ├── remitos/[id]/items/route.ts
│   │       ├── remitos/[id]/items/[itemId]/route.ts
│   │       ├── voz/transcribir/route.ts # Groq Whisper + Llama 3.3 + matching
│   │       ├── oportunidades/route.ts              # GET+POST
│   │       ├── oportunidades/[id]/route.ts         # PUT+DELETE
│   │       ├── oportunidades/buscar-emails/route.ts # POST — búsqueda IMAP Gmail
│   │       ├── oportunidades/extraer/route.ts      # POST — extracción Groq Llama 3.3
│   │       ├── noticias/route.ts        # GET+POST
│   │       ├── noticias/[id]/route.ts  # PUT+DELETE + auto-post Instagram
│   │       ├── upload/imagen/route.ts  # POST — sube imagen noticias a Supabase Storage
│   │       ├── upload/logo/route.ts    # POST — sube logo cliente a Supabase Storage
│   │       ├── usuarios/route.ts
│   │       ├── usuarios/[id]/route.ts
│   │       ├── roles/route.ts
│   │       ├── roles/[id]/route.ts
│   │       └── permisos/route.ts
│   ├── noticias/
│   │   ├── page.tsx                    # Lista pública de noticias
│   │   └── [id]/page.tsx               # Detalle público con rich text rendering
│   └── layout.tsx                      # Root layout
├── components/
│   ├── landing/                        # 9 componentes (Navbar, Hero, Services, etc.)
│   └── dashboard/
│       ├── sidebar.tsx                 # Sidebar con grupos operativos (navGroups)
│       ├── header.tsx
│       ├── QuickCreateClienteModal.tsx # Mini-modal para crear cliente inline (createPortal)
│       ├── QuickCreateActivoModal.tsx  # Mini-modal para crear activo inline (createPortal)
│       ├── VoiceRecorder.tsx           # Grabación de audio vía MediaRecorder API
│       ├── CatalogoCombobox.tsx        # Combobox con opción de crear nueva marca/rubro
│       └── RichTextEditor.tsx          # Editor TipTap (Bold/Italic/Highlight) — cargado con next/dynamic ssr:false
├── lib/
│   ├── theme.ts                        # FUENTE DE VERDAD — colores, tipografía, datos de contacto
│   ├── auth.ts                         # Configuración NextAuth
│   ├── supabase.ts                     # Cliente Supabase (anon key)
│   ├── clientes.ts                     # Array de 22 clientes (landing)
│   └── permisos.ts                     # getModulePermisos() + tipo ModulePermisos
├── services/
│   ├── supabase-admin.ts               # Cliente Supabase service role (solo server)
│   └── instagram.ts                    # postNoticiaToInstagram() — Graph API v21.0
├── hooks/
│   └── usePermissions.ts               # Hook cliente para leer permisos
├── types/
│   ├── auth.ts                         # Tipos NextAuth extendidos
│   └── stock.ts                        # Tipos: Producto, Remito, RemitoItem, ProductoDetectado, ProductoConMatch, etc.
├── context/                            # Documentación del proyecto
│   ├── CONTEXT.md                      # Resumen general (para humanos)
│   ├── AUTH_CONTEXT.md                 # Guía detallada del sistema de auth
│   └── modulos/                        # Contexto por módulo operativo
│       ├── servicios.md                # Oportunidades, Servicios, Presupuestos, Activos
│       ├── altas.md                    # Clientes, Productos
│       ├── stock.md                    # Remitos
│       ├── fondos.md                   # Cobranzas
│       └── administracion.md           # Auth, Permisos, Noticias, Admin
├── proxy.ts                            # Middleware de protección de rutas (nombre no estándar)
└── public/images/                      # logos/, hero/, clientes/
```

---

## Módulos del dashboard — estado actual

| Módulo | Lista | Crear | Detalle | Editar | Ítems/Extras |
|--------|-------|-------|---------|--------|--------------|
| Clientes | ✅ | ✅ | — | ✅ | — |
| Activos | ✅ | ✅ | — | ✅ | — |
| Servicios | ✅ | ✅ | ✅ | ✅ | ✅ tareas + pagos + fecha + saldo/pagado |
| Presupuestos | ✅ | ✅ | ✅ | ✅ | ✅ ítems |
| Productos | ✅ | ✅ | — | ✅ | marca/rubro combobox |
| Remitos | ✅ | ✅ | ✅ | ✅ | ✅ ítems + voz + confirmar |
| Cobranzas | ✅ | ✅ | — | — | ✅ filtros cliente/tipo + resumen cargos/pagado/saldo |
| Noticias | ✅ | ✅ | ✅ (pública) | ✅ | ✅ rich text + imágenes card/portada + fecha editable + Instagram auto-post |
| Oportunidades | ✅ | — | — | — | ✅ búsqueda IMAP Gmail + extracción Groq + deduplicación por message_id |
| Admin/Usuarios | ✅ | ✅ | — | ✅ | — |
| Admin/Roles | ✅ | ✅ | — | — | — |
| Admin/Permisos | ✅ | — | — | ✅ | — |

**Permisos aplicados:** todos los módulos de negocio respetan `can_view / can_create / can_edit / can_delete`.

**Sidebar — grupos operativos:**
- **SERVICIOS:** Oportunidades, Servicios, Presupuestos, Activos
- **ALTAS:** Clientes, Productos
- **STOCK:** Remitos
- **FONDOS:** Cobranzas
- **ADMINISTRACIÓN** *(admin only):* Noticias, Usuarios, Roles, Permisos

---

## Convenciones y patrones clave

### Dashboard — estilos
- **Sin Tailwind** en los componentes del dashboard — todo con inline styles usando `theme.*`
- Importar siempre: `import { theme } from '@/lib/theme'`
- Los valores de colores, radios, tipografía están en `theme.colors`, `theme.radii`, `theme.fontSizes`, etc.

### Dashboard — arquitectura de componentes
```
page.tsx (Server Component)
  → await auth() + redirect si no hay sesión
  → await getModulePermisos(...)
  → fetch data desde supabaseAdmin
  → render <XxxClient initialData={...} permisos={permisos} />

XxxClient.tsx (Client Component — 'use client')
  → recibe data + permisos como props (sin loading state, sin flash)
  → maneja state local (modales, optimistic updates)
  → llama a /api/dashboard/xxx para mutaciones
```

### Dashboard — patrón de API routes
```ts
// Siempre verificar sesión primero
const session = await auth()
if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

// params y searchParams son Promise en Next.js 16
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // ...
}
```

### Supabase — dos clientes
- `lib/supabase.ts` (anon key) → solo para auth en el browser / Credentials
- `services/supabase-admin.ts` (service role) → solo en server, bypasa RLS

### Formularios
- Siempre `react-hook-form` + `zodResolver` + schema Zod
- Validación en API route también (mismo schema o similar)
- Errores de API se muestran en `<ErrorBox>` dentro del modal

---

## Landing pública — componentes

Todos en `components/landing/`. Usan Tailwind + Framer Motion + `theme.*`.

- `moving-banner.tsx` — banda animada fija en top con `theme.banner.words`
- `navbar.tsx` — logo centrado, hamburguesa mobile
- `hero.tsx` — slideshow 3 imágenes con overlay
- `services.tsx` — 4 servicios desde `theme.services.items`
- `sistemas-zoologic.tsx` — 3 sistemas (Lince/Dragonfish/Pantera) con logos
- `process.tsx` — timeline 4 pasos con hover
- `clients.tsx` — 22 clientes con hover animado (Framer Motion)
- `contact.tsx` — formulario → `/api/contact` (Resend)
- `footer.tsx` — banda CTA + 4 columnas + mapa embed
- `json-ld.tsx` — Schema.org LocalBusiness

**`lib/clientes.ts`** — 22 clientes con logo, dirección, teléfono (separado de theme.ts por volumen).

---

## Variables de entorno necesarias

```
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
GROQ_API_KEY=           # Whisper (STT) + Llama 3.3 (voz remitos + extracción oportunidades — 100k tokens/día gratis)
GMAIL_IMAP_USER=        # Oportunidades: dirección Gmail
GMAIL_IMAP_PASSWORD=    # Oportunidades: App Password de Google (no la contraseña real)
INSTAGRAM_USER_ID=      # ID numérico del usuario IG Business (no el @handle)
INSTAGRAM_ACCESS_TOKEN= # Token larga duración (60 días) o System User token (no vence)
NEXT_PUBLIC_GA_ID=      # Google Analytics 4 Measurement ID (G-XXXXXXXX) — si no está, GA no se carga
```

**Instagram:** Si las variables no están configuradas, el auto-post se ignora silenciosamente. El token vence a los 60 días — renovar con Graph API Explorer o usar un System User token permanente.

**Google Analytics:** `@next/third-parties/google` — `GoogleAnalytics gaId={...}` agregado en `app/layout.tsx`. `NEXT_PUBLIC_*` se embebe en build time — cambiar la variable en Vercel requiere redeploy para que tome efecto. Measurement ID actual: `G-LN52WQPWPZ`.

---

## Qué falta / pendientes

- **Cobranzas sin edición** — solo existe DELETE, no PUT/PATCH. Si se ingresó mal un monto hay que borrar y recrear.
- **Google Search Console** — enviar sitemap tras deploy
- **OG image dedicada** — actualmente usa `hero-1.jpg`
- **Sección Nosotros** — link en navbar apunta a `#`, sin destino real
- **SQL `buscar_productos_por_nombre`** — debe actualizarse para incluir búsqueda por `codigo` en la función pg_trgm (ver script en historial de sesión 2026-05-13)
- **Supabase bucket `clientes-logos`** — crear como Public si no existe aún
- **DB `clientes.localidad`** — si no existe: `ALTER TABLE clientes ADD COLUMN localidad TEXT;`

---

## Notas globales (no repetir errores)

1. **`git add` con rutas que contienen `(dashboard)`** → usar Bash, no PowerShell. PowerShell interpreta los paréntesis como agrupación.
2. **El archivo de middleware se llama `proxy.ts`**, no `middleware.ts`. Next.js lo detecta por el `export const config`.
3. **Módulo nuevo** → recordar agregar en: (a) SQL `role_permissions`, (b) `sidebar.tsx` (navGroups), (c) `permissions/route.ts` array de admin.
4. **`params` en Next.js 16** → siempre `const { id } = await params`, nunca `params.id` directo.
5. **Modales del dashboard — comportamiento estándar:**
   - **Click afuera NO cierra** el modal (evita pérdida de cambios). Solo se cierra con el botón X.
   - **Botón guardar en el header**: `ModalCard` acepta prop `formId?: string`. Si se pasa, renderiza un botón `<Save>` a la izquierda del X con `type="submit" form={formId}`. Dar `id="create-form"` / `id="edit-form"` al `<form>` correspondiente. NO pasar `formId` en modales de confirmación/eliminación.
   - Este patrón está implementado en los 12 archivos client del dashboard.
