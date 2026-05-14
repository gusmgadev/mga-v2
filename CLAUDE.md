@AGENTS.md

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
| Groq API | — | Whisper (STT) + Llama 3.3 (extracción de productos por voz) |
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
│   │       ├── noticias/route.ts        # GET+POST
│   │       ├── noticias/[id]/route.ts  # PUT+DELETE + auto-post Instagram
│   │       ├── upload/imagen/route.ts  # POST — sube imagen a Supabase Storage
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
│       ├── sidebar.tsx                 # Sidebar con nav items
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
-- Clientes (todas las columnas en español)
public.clientes {
  id, nombre, tipo ('PARTICULAR'|'EMPRESA'|'COMERCIO'),
  email (nullable), telefono (nullable), direccion (nullable),
  cuit (nullable), rubro (nullable), notas (nullable),
  activo (bool), imagen (nullable), pagina_web (nullable),
  mostrar_en_landing (bool), created_at
}

-- Activos (equipos del cliente)
public.activos { id, nombre, tipo, marca, modelo, serie, cliente_id (FK), activo (bool), created_at }

-- Servicios (órdenes de trabajo)
public.servicios {
  id, cliente_id (FK), activo_id (FK nullable), titulo, descripcion,
  fecha (date, default CURRENT_DATE),
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

-- Stock / Remitos
public.marcas { id, nombre, activo (bool), created_at }
public.rubros_productos { id, nombre, activo (bool), created_at }

public.productos {
  id, codigo (nullable), nombre, marca (nullable), rubro (nullable), subrubro (nullable),
  unidad ('unidad'|'kg'|'bolsa'|'caja'|...), stock_actual (numeric),
  costo (nullable), precio_venta (nullable), activo (bool), created_at
}

public.origenes_destinos { id, tipo ('proveedor'|'sucursal'|'deposito'|'cliente'|'otro'), nombre, activo (bool), created_at }

public.remitos {
  id, usuario_id (FK nullable), numero_tipo ('automatico'|'manual'|'proveedor'),
  numero (string), tipo ('entrada'|'salida'), fecha (date),
  origen_destino_id (FK nullable), origen_destino_texto (nullable),
  observaciones (nullable), audio_url (nullable), transcripcion (nullable),
  estado ('borrador'|'confirmado'|'anulado'), confirmado_at (nullable), created_at
}

public.remito_items {
  id, remito_id (FK cascade), producto_id (FK nullable),
  nombre_detectado (nullable), cantidad (numeric), cantidad_asumida (bool),
  unidad (nullable), costo (nullable), precio_venta (nullable),
  confianza (nullable, 0-1), es_producto_nuevo (bool), orden (int), created_at
}

-- Noticias (módulo público + dashboard)
public.noticias {
  id, titulo, resumen, contenido (html string),
  imagen_card (nullable, URL Supabase Storage), imagen_portada (nullable, URL),
  publicada (bool, default false), orden (int, default 0),
  fecha (date, default CURRENT_DATE),
  created_at, updated_at
}
-- Bucket Supabase Storage: 'noticias-imagenes'
-- Al pasar publicada false→true: dispara auto-post a Instagram si hay imagen_card y env vars configuradas

public.movimientos_stock {
  id, producto_id (FK), remito_id (FK), remito_item_id (FK),
  tipo ('entrada'|'salida'|'ajuste'), cantidad (numeric),
  costo (nullable), stock_antes (numeric), stock_despues (numeric), created_at
}

-- Función pg_trgm (requiere extensión pg_trgm activa):
-- buscar_productos_por_nombre(p_nombre text, p_limit int) → busca por nombre, marca Y código
-- Devuelve: id, nombre, codigo, marca, unidad, stock_actual, costo, precio_venta, confianza (0-1)
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
  `['clientes', 'activos', 'servicios', 'presupuestos', 'cobranzas', 'productos', 'remitos']`

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
| Admin/Usuarios | ✅ | ✅ | — | ✅ | — |
| Admin/Roles | ✅ | ✅ | — | — | — |
| Admin/Permisos | ✅ | — | — | ✅ | — |

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

### Remitos — ingreso de stock por voz

**Flujo completo:**
1. `VoiceRecorder` graba audio con `MediaRecorder` API (formato `.webm`)
2. `POST /api/dashboard/voz/transcribir` recibe el audio + `remito_id`
3. Audio → Supabase Storage bucket `remitos-audio` (path: `{remitoId}/{timestamp}.webm`)
4. Groq Whisper (`whisper-large-v3`) transcribe a texto en español
5. Llama 3.3 (`llama-3.3-70b-versatile`) extrae productos del texto como JSON
6. Por cada producto detectado, se busca coincidencia en 4 intentos:
   - **Intento 0:** `ilike('codigo', codigoQuery)` exacto → confianza 1.0
   - **Intento 0b:** mismo con código normalizado (sin espacios/guiones) → confianza 1.0
   - **Intento 1:** RPC `buscar_productos_por_nombre` (pg_trgm, busca nombre+marca+código) → confianza real
   - **Fallback nombre:** `ilike('nombre', '%palabra%')` → confianza 0.5
   - **Fallback código:** `ilike('codigo', codigoNorm)` → confianza 0.8
7. API devuelve `{ audio_url, transcripcion, items: ProductoConMatch[] }`

**Lógica de inserción en el cliente (`RemitoDetalleClient`):**
- `confianza >= 0.7` → auto-insertar ítem vinculado al producto existente
- `confianza < 0.7` o producto nuevo → panel de pendientes para confirmar
- Panel de pendientes muestra nombre detectado + posible coincidencia con badge de confianza
- Acciones: "Usar esta coincidencia" (inserta con producto_match), "Crear producto" (abre modal), "Descartar"

**Keywords opcionales en el dictado (todas actúan como separadores):**
- `cantidad N` / `N unidad nombreProducto` — cantidad del ítem
- `codigo X` — código del producto (alfanumérico, si no se dice → se prueba el nombre como código)
- `costo N` / `precio de costo N` — costo unitario
- `venta N` / `precio de venta N` — precio de venta

**Tabla de ítems:** muestra `productos.nombre` (nombre real del catálogo) sobre `nombre_detectado` (texto dictado).

### Productos — catálogo con marca/rubro

`CatalogoCombobox` es un combobox compartido en `components/dashboard/CatalogoCombobox.tsx` que:
- Filtra opciones existentes mientras se tipea
- Permite crear una nueva opción con "+" guardando vía `onNewOption(valor)` 
- Usado en el modal de crear/editar producto para los campos **Marca** y **Rubro**
- También disponible en el modal "Crear producto" dentro de RemitoDetalleClient

Para agregar marca/rubro nuevo desde el modal de remitos: `POST /api/dashboard/marcas` y `POST /api/dashboard/rubros-productos`.

### Presupuestos — flujo especial
- Al crear → redirige inmediatamente al detalle (`router.push(/dashboard/presupuestos/${id})`)
- El total se calcula: `items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0)`
- Sin campo `valor` en la tabla — siempre calculado desde ítems

### Quick-create inline (modales dentro de formularios)
Patrón para crear entidades relacionadas sin salir del formulario actual.

**Componentes:** `QuickCreateClienteModal` y `QuickCreateActivoModal` en `components/dashboard/`.
- Reciben `onClose` y `onCreated(entidad)` como props
- **Usan `createPortal(jsx, document.body)`** — OBLIGATORIO para evitar `<form>` anidados en el DOM (HTML no lo permite y causa error de hidratación)
- Se renderizan con `zIndex: 60` (sobre los modales padre que usan `zIndex: 50`)
- El cliente que los usa mantiene el array de entidades en estado local (`localClientes`, `localActivos`) y llama `form.setValue(campo, id)` en el callback `onCreated`

**Dónde están integrados:**
| Lugar | Quick-create disponible |
|-------|------------------------|
| Nuevo presupuesto / nuevo servicio | + Cliente + Activo (activo requiere cliente seleccionado) |
| Editar presupuesto / servicio (detalle) | + Activo (cliente fijo, pre-rellenado) |
| Nuevo / editar activo | + Cliente |

**Botón `+` deshabilitado:** cuando no hay `cliente_id` seleccionado y el activo lo necesita → `opacity: 0.35, cursor: not-allowed`.

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
GROQ_API_KEY=          # Whisper (STT) + Llama 3.3 (extracción de productos por voz)
INSTAGRAM_USER_ID=     # ID numérico del usuario IG Business (no el @handle)
INSTAGRAM_ACCESS_TOKEN= # Token larga duración (60 días) o System User token (no vence)
```

**Instagram:** Si las variables no están configuradas, el auto-post se ignora silenciosamente. El token vence a los 60 días — renovar con Graph API Explorer o usar un System User token permanente.

---

## Qué falta / pendientes

- **Cobranzas y servicio_pagos desconectados** — los pagos registrados en el detalle de un servicio (`servicio_pagos`) no aparecen en el módulo Cobranzas, y viceversa. Decidir si fusionar o conectar.
- **Cobranzas sin edición** — solo existe DELETE, no PUT/PATCH. Si se ingresó mal un monto hay que borrar y recrear.
- **Google Search Console** — enviar sitemap tras deploy
- **OG image dedicada** — actualmente usa `hero-1.jpg`
- **Sección Nosotros** — link en navbar apunta a `#`, sin destino real
- **SQL `buscar_productos_por_nombre`** — debe actualizarse para incluir búsqueda por `codigo` en la función pg_trgm (ver script en historial de sesión 2026-05-13)

---

## Notas importantes para no repetir errores

1. **`git add` con rutas que contienen `(dashboard)`** → usar Bash, no PowerShell. PowerShell interpreta los paréntesis como agrupación.
2. **El archivo de middleware se llama `proxy.ts`**, no `middleware.ts`. Next.js lo detecta por el `export const config`.
3. **Administrador shortcircuit** — `getModulePermisos` devuelve FULL sin tocar DB. No depende de que existan filas en `role_permissions` para el admin.
4. **Presupuestos sin `valor`** — el total es calculado, no guardado. No agregar esa columna.
5. **Módulo nuevo** → recordar agregar en: (a) SQL `role_permissions`, (b) `sidebar.tsx`, (c) `permissions/route.ts` array de admin.
6. **`params` en Next.js 16** → siempre `const { id } = await params`, nunca `params.id` directo.
7. **Modales dentro de `<form>`** → usar siempre `createPortal(jsx, document.body)`. HTML prohíbe `<form>` anidados; sin portal causa error de hidratación. Aplica a `QuickCreateClienteModal` y `QuickCreateActivoModal`.
8. **Remitos — confianza auto-insert:** el umbral es `>= 0.7`. Por debajo va al panel de pendientes, no se inserta automáticamente.
9. **Remitos — tabla de ítems:** mostrar `item.productos?.nombre` primero; `item.nombre_detectado` como fallback. Nunca al revés (el nombre detectado puede ser el código dictado, no el nombre real del producto).
10. **`buscar_productos_por_nombre`** — si la función RPC no está actualizada para buscar por `codigo`, el fallback ILIKE en route.ts lo cubre con confianza 0.8.
11. **`clientes` — columnas en español** — todas las columnas de la tabla están en español (`nombre`, `tipo`, `telefono`, `direccion`, `notas`, `activo`). `ClienteSimple` en todos los módulos es `{ id: number; nombre: string }`. En selects de join usar `clientes(nombre)`, nunca `clientes(name)`.
12. **`servicios` — campo `fecha`** — columna `date` con default `CURRENT_DATE`. En JS formatear con `const [y,m,d] = fecha.split('-')` para evitar desfase UTC. La grilla ordena descendente por `fecha`. Saldo = `Math.max(0, valor - totalPagado)` calculado en cliente desde pagos de cobranzas.
13. **Cobranzas — tabla única de pagos** — `servicio_pagos` fue eliminada. Todos los pagos viven en `cobranzas` con `tipo='PAGO'`. Pagos vinculados a servicio tienen `servicio_id != null`; "pagos a cuenta" tienen `servicio_id = null`. `recalcularEstadoPago` está en `app/api/dashboard/cobranzas/route.ts` (exportada) y se reutiliza desde `[id]/route.ts` e `[id]/imputar/route.ts`.
14. **Imputar pago a cuenta** — `POST /api/dashboard/cobranzas/[id]/imputar` con `{ servicio_id, monto }`. Si es parcial, reduce el original y crea un nuevo registro vinculado. `ServicioDetalleClient` carga `initialPagos` (cobranzas del servicio) y `pagosACuenta` (del mismo cliente sin servicio) como props separados desde `page.tsx`.
15. **Modales del dashboard — comportamiento estándar:**
    - **Click afuera NO cierra** el modal (evita pérdida de cambios). Solo se cierra con el botón X.
    - **Botón guardar en el header**: `ModalCard` acepta prop `formId?: string`. Si se pasa, renderiza un botón `<Save>` a la izquierda del X con `type="submit" form={formId}`. Dar `id="create-form"` / `id="edit-form"` al `<form>` correspondiente. NO pasar `formId` en modales de confirmación/eliminación.
    - Este patrón está implementado en los 12 archivos client del dashboard.
16. **Noticias — `contenido` es HTML** — generado por TipTap (rich text editor). Al renderizar en la página pública, usar `dangerouslySetInnerHTML`. Para backward compat con contenido antiguo en plain text, detectar con `/<[a-z]/i.test(contenido)` y convertir `\n` a `<br />` si no es HTML. El editor se carga con `next/dynamic({ ssr: false })` porque TipTap usa APIs del browser.
17. **Noticias — `fecha`** — columna `date` (default CURRENT_DATE), editable desde el dashboard. En la página pública mostrar `noticia.fecha ?? noticia.created_at`. Formatear con split para evitar desfase UTC: `const [y,m,d] = dateStr.split('-'); new Date(Number(y), Number(m)-1, Number(d))`.
