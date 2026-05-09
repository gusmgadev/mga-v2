@AGENTS.md

# MGA Informática — Contexto completo del proyecto

## Qué es este proyecto

Dos productos en un mismo repo Next.js:

1. **Landing pública** (`/`) — sitio de marketing de MGA Informática (empresa de servicios IT). Incluye páginas de servicios, sistemas Zoologic, clientes, contacto.
2. **Dashboard privado** (`/dashboard`) — sistema interno de gestión. Módulos: Clientes, Activos, Servicios (con tareas y pagos), Presupuestos (con ítems), y panel Admin.

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
│   │       ├── usuarios/route.ts
│   │       ├── usuarios/[id]/route.ts
│   │       ├── roles/route.ts
│   │       ├── roles/[id]/route.ts
│   │       └── permisos/route.ts
│   └── layout.tsx                      # Root layout
├── components/
│   ├── landing/                        # 9 componentes (Navbar, Hero, Services, etc.)
│   └── dashboard/
│       ├── sidebar.tsx                 # Sidebar con nav items
│       └── header.tsx
├── lib/
│   ├── theme.ts                        # FUENTE DE VERDAD — colores, tipografía, datos de contacto
│   ├── auth.ts                         # Configuración NextAuth
│   ├── supabase.ts                     # Cliente Supabase (anon key)
│   ├── clientes.ts                     # Array de 22 clientes (landing)
│   └── permisos.ts                     # getModulePermisos() + tipo ModulePermisos
├── services/
│   └── supabase-admin.ts               # Cliente Supabase service role (solo server)
├── hooks/
│   └── usePermissions.ts               # Hook cliente para leer permisos
├── types/
│   └── auth.ts                         # Tipos NextAuth extendidos
├── context/                            # Documentación y bibliotecas de componentes
│   ├── CONTEXT.md                      # Descripción general (desactualizado — usar CLAUDE.md)
│   ├── AUTH_CONTEXT.md                 # Guía del sistema de auth
│   ├── Biblioteca-Navbar.md
│   ├── Biblioteca-Hero.md
│   └── Biblioteca-Footer.md
├── proxy.ts                            # Middleware de protección de rutas (nombre no estándar)
└── public/images/                      # logos/, hero/, clientes/
```

---

## Sistema de autenticación

**Stack:** NextAuth v5 beta CredentialsProvider + Supabase Auth + JWT

**Flujo:**
1. `/auth/signin` → NextAuth valida email/password contra Supabase Auth
2. Si válido → carga perfil de `public.users JOIN public.roles`
3. JWT guarda `{ id, email, name, role (string), role_id (number) }`
4. `proxy.ts` intercepta cada request (no `middleware.ts` — el archivo se llama `proxy.ts`)

**Sesión:**
```ts
session.user = { id: string, email: string, name: string, role: string, role_id: number }
// role es el name del rol: 'Administrador' | 'Usuario'
```

**Protección de rutas (proxy.ts):**
- `/dashboard/*` → requiere sesión activa
- `/dashboard/admin/*` → requiere `role === 'Administrador'`
- `/auth/signin`, `/auth/registro` → redirige al dashboard si hay sesión

---

## Base de datos (Supabase PostgreSQL)

### Tablas del sistema

```sql
-- Roles dinámicos
public.roles { id, name, description, is_default }
-- Roles actuales: 'Administrador' (id=1), 'Usuario' (id=2)

-- Perfiles de usuario (extiende auth.users)
public.users { id (uuid, FK auth.users), email, name, role_id (FK roles) }

-- Permisos por módulo y rol
public.role_permissions { id, role_id, module, can_view, can_create, can_edit, can_delete }
-- UNIQUE(role_id, module)
-- Módulos actuales: 'clientes', 'activos', 'servicios', 'presupuestos', 'cobranzas', 'admin'
```

### Tablas de negocio

```sql
-- Clientes
public.clientes { id, name, email, phone, address, active (bool), created_at }

-- Activos (equipos del cliente)
public.activos { id, nombre, tipo, marca, modelo, serie, cliente_id (FK), activo (bool), created_at }

-- Servicios (órdenes de trabajo)
public.servicios {
  id, cliente_id (FK), activo_id (FK nullable), titulo, descripcion,
  estado ('INGRESADO'|'EN PROCESO'|'CANCELADO'|'RECHAZADO'|'TERMINADO'|'PRESUPUESTADO'),
  estado_pago ('PENDIENTE'|'SIN CARGO'|'GARANTIA'|'PAGO PARCIAL'|'PAGADO'),
  valor, created_at, updated_at
}

public.servicio_tareas { id, servicio_id (FK cascade), descripcion, estado ('INICIADA'|'EN PROCESO'|'PAUSADA'|'CANCELADA'|'TERMINADA'), created_at }
public.servicio_pagos  { id, servicio_id (FK cascade), monto, fecha, metodo ('EFECTIVO'|'TRANSFERENCIA'|'TARJETA'|'CHEQUE'|'OTRO'), notas, created_at }

-- Presupuestos (cotizaciones)
public.presupuestos {
  id, cliente_id (FK), activo_id (FK nullable), titulo, descripcion,
  estado ('BORRADOR'|'ENVIADO'|'APROBADO'|'RECHAZADO'|'VENCIDO'),
  fecha_vencimiento (date nullable), created_at, updated_at
}
-- No tiene campo `valor` — el total se calcula desde los ítems

public.presupuesto_items {
  id, presupuesto_id (FK cascade), descripcion, cantidad (numeric), precio_unitario (numeric),
  orden (int, default 0), created_at
}
-- subtotal = cantidad × precio_unitario (calculado en JS, no stored)
```

---

## Sistema de permisos

**Patrón server-side (en cada `page.tsx`):**
```ts
const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'modulo')
if (!permisos.can_view) redirect('/dashboard')
// Luego pasar permisos al Client component como prop
```

**`lib/permisos.ts`:**
- `getModulePermisos(roleId, role, module)` → shortcircuit para Administrador (devuelve FULL sin query)
- Exporta `ModulePermisos = { can_view, can_create, can_edit, can_delete }`

**Hook cliente (`hooks/usePermissions.ts`):**
- Llama a `/api/dashboard/permissions` con caché en memoria (evita fetches duplicados)
- Para uso client-side cuando no se puede pasar como prop desde server

**`/api/dashboard/permissions` (GET):**
- Administrador → hardcoded FULL para todos los módulos
- Otros → query a `role_permissions` por `role_id`
- **Cuando se agrega un módulo nuevo, actualizar este array:**
  `['clientes', 'activos', 'servicios', 'presupuestos']`

---

## Módulos del dashboard — estado actual

| Módulo | Lista | Crear | Detalle | Editar | Tareas/Ítems | Pagos |
|--------|-------|-------|---------|--------|--------------|-------|
| Clientes | ✅ | ✅ | — | ✅ | — | — |
| Activos | ✅ | ✅ | — | ✅ | — | — |
| Servicios | ✅ | ✅ | ✅ | ✅ | ✅ tareas | ✅ pagos |
| Presupuestos | ✅ | ✅ | ✅ | ✅ | ✅ ítems | — |
| Admin/Usuarios | ✅ | ✅ | — | ✅ | — | — |
| Admin/Roles | ✅ | ✅ | — | — | — | — |
| Admin/Permisos | ✅ | — | — | ✅ | — | — |

**Permisos aplicados:** todos los módulos de negocio respetan `can_view / can_create / can_edit / can_delete`.

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
async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

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

### Presupuestos — flujo especial
- Al crear → redirige inmediatamente al detalle (`router.push(/dashboard/presupuestos/${id})`)
- El total se calcula: `items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0)`
- Sin campo `valor` en la tabla — siempre calculado desde ítems

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
```

---

## Qué falta / pendientes

- **Módulo Cobranzas** — en `role_permissions` existe el módulo pero no hay página ni API
- **Google Search Console** — enviar sitemap tras deploy
- **OG image dedicada** — actualmente usa `hero-1.jpg`
- **Sección Nosotros** — link en navbar apunta a `#`, sin destino real

---

## Notas importantes para no repetir errores

1. **`git add` con rutas que contienen `(dashboard)`** → usar Bash, no PowerShell. PowerShell interpreta los paréntesis como agrupación.
2. **El archivo de middleware se llama `proxy.ts`**, no `middleware.ts`. Next.js lo detecta por el `export const config`.
3. **Administrador shortcircuit** — `getModulePermisos` devuelve FULL sin tocar DB. No depende de que existan filas en `role_permissions` para el admin.
4. **Presupuestos sin `valor`** — el total es calculado, no guardado. No agregar esa columna.
5. **Módulo nuevo** → recordar agregar en: (a) SQL `role_permissions`, (b) `sidebar.tsx`, (c) `permissions/route.ts` array de admin.
6. **`params` en Next.js 16** → siempre `const { id } = await params`, nunca `params.id` directo.
