# MAP.md — mapa del proyecto mga-v2

> Mapa estructural generado desde el código real. Es la **referencia principal** del proyecto.
> No sustituye la doc de detalle: lógica de negocio → `CLAUDE.md` + `context/modulos/*.md`.
> Regenerar con `/mapa` cuando cambie la estructura. **No modificar código desde este comando.**

**Última regeneración:** 2026-10-22

---

## 1. Identificación

| Item | Valor |
|---|---|
| Proyecto | MGA Informática — landing pública + sistema de gestión interno + panel superadmin POS |
| Producción | https://mgadigital.com.ar |
| Repo | https://github.com/gusmgadev/mga-v2 |
| Deploy | Vercel, rama `master` |
| Comandos | `npm run dev` (webpack), `npm run build`, `npm run lint` |

---

## 2. Stack (según `package.json`)

Next.js **16.2.4** (App Router) · React **19.2.4** · TypeScript 5 strict · Tailwind **4** (solo landing) · NextAuth **5.0.0-beta.31** (Credentials + JWT) · Supabase JS 2 · Zod 4 + React Hook Form 7 · Framer Motion 12 (landing) · TipTap 3 (noticias) · Resend 6 · `imapflow` + `mailparser` (Gmail IMAP) · `xlsx` (import) · `ws` (solo `scripts/`) · `@next/third-parties` (GA4) · Lucide.

Externos por env: **Groq** (Whisper STT + GPT-OSS 20B), **Google Places** (radar), **Instagram Graph API**, **Supabase**, **Resend**.

> Next.js 16: `params` / `searchParams` en pages y routes son `Promise` → siempre `await`. Leer `node_modules/next/dist/docs/` ante dudas.

---

## 3. Estructura de carpetas

```
mga-v2/
├── app/
│   ├── layout.tsx                 # Root layout: Inter, GA4, WhatsAppButton, SessionProvider
│   ├── page.tsx                   # Landing "/"
│   ├── robots.ts / sitemap.ts     # SEO (sitemap lee `noticias`)
│   ├── consultoria-it|desarrollo-web|sistemas-gestion|soporte-tecnico/   # servicios
│   ├── lince|dragonfish|pantera/                                          # Zoologic
│   ├── noticias/ + noticias/[id]/                                         # noticias públicas
│   ├── (public)/                 # solo README (las páginas públicas están en la raíz de app/)
│   ├── (auth)/auth/              # signin, registro
│   ├── (dashboard)/dashboard/    # panel privado (page.tsx, layout.tsx, módulos, admin/)
│   ├── (superadmin)/superadmin/  # login, empresas, modulos
│   └── api/                      # auth, contact, upload, dashboard/*, superadmin/*
├── components/
│   ├── landing/                  # 12 comps (navbar, hero, services, clients, contact, json-ld, whatsapp…)
│   ├── dashboard/                # sidebar, header, DashboardShell, comboboxes, VoiceRecorder,
│   │                             # QuickCreate*, RichTextEditor, radar/ConvertirClienteModal
│   └── shared/session-provider.tsx
├── lib/                          # theme (fuente de verdad), auth, supabase, permisos,
│   │                             # superadmin-auth, clientes, gasto-pagos, fetchAllClientes
│   └── radar/                    # google-places, scoring, deduplication, normalization,
│                                 # categoryFilter, website, validations
├── services/                     # supabase-admin (service role), supabase-master, instagram
├── hooks/                        # usePermissions (ver §7), useIsMobile
├── types/                        # auth, stock, radar
├── context/                      # CONTEXT.md, AUTH_CONTEXT.md, modulos/*.md (doc por módulo)
├── supabase/migrations/          # SQL versionado (subconjunto — ver §8)
├── scripts/importar-excel.mjs    # migración puntual Clientes/Servicios desde Excel
├── docs/                         # radar-oportunidades-como-funciona.pdf
├── proxy.ts                      # middleware de protección de rutas (NO se llama middleware.ts)
└── public/images/                # logos, hero, clientes, noticias, Productos, secciones
```

---

## 4. Rutas de páginas

**Públicas:** `/` · `/desarrollo-web` · `/sistemas-gestion` · `/consultoria-it` · `/soporte-tecnico` · `/lince` · `/dragonfish` · `/pantera` · `/noticias` · `/noticias/[id]`

**Auth:** `/auth/signin` · `/auth/registro`

**Dashboard** (`(dashboard)/dashboard/`):

| Ruta | Archivos |
|---|---|
| `/dashboard` | `page.tsx`, `DashboardCards.tsx` |
| `/dashboard/clientes` | `page.tsx` + `ClientesClient.tsx` |
| `/dashboard/activos` | `page.tsx` + `ActivosClient.tsx` |
| `/dashboard/servicios`, `/servicios/[id]` | `ServiciosClient`, `ServicioDetalleClient` |
| `/dashboard/presupuestos`, `/presupuestos/[id]` | `PresupuestosClient`, `PresupuestoDetalleClient` |
| `/dashboard/productos` | `ProductosClient` |
| `/dashboard/remitos`, `/remitos/[id]` | `RemitosClient`, `RemitoDetalleClient` |
| `/dashboard/cobranzas` | `CobranzasClient` |
| `/dashboard/gastos` | `GastosClient` |
| `/dashboard/noticias` | `NoticiasAdminClient` |
| `/dashboard/oportunidades` | `OportunidadesClient` |
| `/dashboard/radar` | `RadarClient` + `nueva-busqueda/`, `prospectos/`, `prospectos/[id]/`, `servicios/` |
| `/dashboard/admin/usuarios` · `roles` · `permisos` · `importar` | `*Client.tsx` (solo rol Administrador) |

**Superadmin** (`(superadmin)/superadmin/`): `/superadmin` (redirect) · `/superadmin/login` · `/superadmin/empresas` · `/empresas/nueva` · `/empresas/[id]` · `/modulos`

---

## 5. API

Patrón: todas verifican `await auth()` (o cookie `sa_session` en superadmin) y devuelven 401. `params` es `Promise`.

**Base:** `api/auth/[...nextauth]`, `api/auth/registro` (POST), `api/contact` (POST, Resend), `api/upload/logo` (POST).

**`api/dashboard/`** (métodos observados):

| Grupo | Métodos |
|---|---|
| `clientes`, `activos`, `productos`, `noticias` | GET+POST · `[id]` PUT+DELETE |
| `servicios` | GET+POST · `[id]` GET+PUT+DELETE · `[id]/tareas` POST · `[id]/tareas/[tareaId]` PUT+DELETE · `[id]/pagos` POST · `[id]/pagos/[pagoId]` DELETE |
| `presupuestos` | GET+POST · `[id]` GET+PUT+DELETE · `[id]/items` POST · `[id]/items/[itemId]` DELETE |
| `remitos` | GET+POST · `[id]` GET+PUT · `[id]/confirmar` POST · `[id]/items` GET+POST · `[id]/items/[itemId]` PUT+DELETE |
| `cobranzas` | GET+POST · `[id]` PUT+DELETE · `[id]/imputar` POST |
| `gastos` | GET+POST · `[id]` PUT+DELETE · `plantilla` (+`[id]`) · `tarjetas` (+`[id]`) · `inicializar` POST · `pagos` POST · `pagos/[id]` PUT+DELETE |
| `oportunidades` | **GET** (lista) · `[id]` PATCH+DELETE · `[id]/iteraciones` GET+POST · `[id]/iteraciones/[iteracionId]` DELETE · `buscar-emails` POST (IMAP) · `extraer` POST (Groq) — *la creación ocurre dentro de `extraer`* |
| `radar` | `searches` GET+POST · `searches/[id]` GET+DELETE · `prospects` GET · `prospects/[id]` GET · `[id]/status` PATCH · `[id]/interactions` POST · `[id]/convert` POST · `interactions/[id]` DELETE · `servicios` GET+POST · `servicios/[id]` PUT+DELETE · `usage` GET |
| `usuarios`, `roles` | GET+POST · `[id]` PUT+DELETE |
| `permisos` | GET+PUT · `permissions` GET (permisos del usuario logueado) |
| `marcas`, `rubros`, `rubros-productos`, `origenes-destinos` | GET+POST (catálogos) |
| `upload/imagen`, `upload/presupuesto-doc` | POST (Storage) |
| `voz/transcribir` | POST (Groq Whisper → GPT-OSS → matching productos) |
| `importar/servicios` | POST FormData (xlsx → upsert servicios + cobranzas) |

**`api/superadmin/`:** `auth` POST+DELETE · `empresas` GET+POST · `empresas/[id]` GET+PUT · `empresas/[id]/modulos` PUT · `modulos` GET+POST · `modulos/[id]` PUT+DELETE.

---

## 6. Módulos del dashboard — estado

| Módulo | Grupo sidebar | Estado |
|---|---|---|
| Oportunidades | Servicios | ✅ Lista + IMAP/Groq + iteraciones + generar presupuesto/servicio |
| Radar de Oportunidades | Servicios | ✅ Búsqueda (Google Places) + prospectos + scoring + conversión a cliente |
| Radar Servicios | Servicios | ✅ Catálogo `prospect_services` (CRUD) |
| Prospectos | Servicios | ✅ Lista + detalle + interacciones + estado + convert |
| Servicios | Servicios | ✅ Lista + detalle + tareas + pagos + pago rápido desde grilla |
| Presupuestos | Servicios | ✅ Lista + detalle + ítems + adjunto + vínculo op/servicio |
| Activos | Servicios | ✅ Lista + crear + editar |
| Clientes | Altas | ✅ Lista + crear + editar + logo upload |
| Productos | Altas | ✅ Lista + crear + editar + marca/rubro + stock |
| Remitos | Stock | ✅ Lista + detalle + ítems + confirmar + ingreso por voz |
| Cobranzas | Fondos | ✅ Lista + crear + imputar pagos a cuenta (UI sin edición; la API sí tiene PUT) |
| Gastos | Fondos | ✅ Mensual + plantilla fija + inicializar mes + tarjetas + pagos parciales + KPIs |
| Noticias | Administración | ✅ CRUD + rich text + imágenes + fecha + Instagram auto-post |
| Usuarios / Roles / Permisos | Administración | ✅ CRUD / CRUD / edición por rol+módulo |
| Importar | Administración | ✅ Upload .xlsx → upsert servicios + cobranzas |

**Sidebar (`components/dashboard/sidebar.tsx`, `navGroups`):** Inicio · **Servicios** (Oportunidades, Radar, Radar Servicios, Prospectos, Servicios, Presupuestos, Activos) · **Altas** (Clientes, Productos) · **Stock** (Remitos) · **Fondos** (Cobranzas, Gastos) · **Administración** (`adminOnly`: Noticias, Usuarios, Roles, Permisos, Importar).

**Patrón de página:** `page.tsx` (server) → `auth()` + `getModulePermisos()` + fetch con `supabaseAdmin` → `<XxxClient initialData permisos />` (client, mutaciones vía `/api/dashboard/*`).

---

## 7. Auth y permisos

**Capas (independientes):**

1. **NextAuth v5** (`lib/auth.ts`) — Credentials contra `supabase.auth.signInWithPassword`, luego join `users` + `roles`; JWT con `role` (name) y `role_id`. Página: `/auth/signin`.
2. **`proxy.ts`** (middleware, `export const config`, matcher excluye `api/auth`):
   - `/superadmin/*` (≠ login) → exige cookie `sa_session === SUPERADMIN_SECRET`
   - `/dashboard/admin/*` → exige `session.user.role === 'Administrador'`
   - `/dashboard/*` → exige sesión
   - `/auth/signin|registro` con sesión → redirige a `/dashboard`
3. **Superadmin** — sin NextAuth: cookie `sa_session` (`lib/superadmin-auth.ts`), cliente `services/supabase-master.ts`.

**Roles:** `roles` (id 1 `Administrador` = total, id 2 `Usuario` = default) · `users` (perfil, FK `role_id`) · `role_permissions` (`unique(role_id,module)` con `can_view/can_create/can_edit/can_delete`).

**Módulos con permisos** (array en `api/dashboard/permissions/route.ts`): `clientes, activos, servicios, presupuestos, cobranzas, productos, remitos, noticias, oportunidades, gastos, radar`.
Server: `lib/permisos.ts → getModulePermisos(roleId, role, module)` (Administrador = FULL, sin fila = NONE).

**`hooks/usePermissions.ts` existe pero no está importado por ningún componente** (solo su propia definición) → las páginas usan `getModulePermisos` en server.

---

## 8. Datos (Supabase)

**Clientes Supabase:** `lib/supabase.ts` (anon, browser/auth) · `services/supabase-admin.ts` (service role, solo server, bypasa RLS) · `services/supabase-master.ts` (service role + `persistSession:false`, superadmin).

**Tablas usadas por el código:**

| Dominio | Tablas |
|---|---|
| Auth/admin | `roles`, `users`, `role_permissions` |
| Clientes/Activos | `clientes`, `activos` |
| Servicios | `servicios`, `servicio_tareas`, `servicio_pagos` |
| Presupuestos | `presupuestos`, `presupuesto_items` |
| Productos | `productos`, `marcas`, `rubros_productos` |
| Remitos | `remitos`, `remito_items`, `origenes_destinos` |
| Fondos | `cobranzas`, `gastos`, `gastos_plantilla`, `gastos_pagos`, `tarjetas` |
| Noticias/Ops | `noticias`, `oportunidades`, `oportunidad_iteraciones` |
| Radar | `prospect_searches`, `prospect_search_results`, `prospects`, `prospect_interactions`, `prospect_services`, `prospect_jobs`, `website_analyses`, `radar_api_usage`, `rubros` |
| Superadmin POS | `empresas`, `modulos`, `empresa_modulos` |

**Storage (buckets):** `clientes-logos`, `noticias-imagenes`, `presupuestos-docs`, `remitos-audio`.

**Migrations versionadas en `supabase/migrations/`:** `gastos.sql`, `gastos_pagos.sql`, `gastos_pago_parcial.sql`, `tarjetas.sql`, `oportunidades.sql`, `presupuestos_add_nro_tarea.sql`, `radar_oportunidades.sql` → el resto se aplicó manualmente en el SQL editor (ver pendientes §11).

---

## 9. Convenciones y decisiones técnicas (conservadas)

1. **Dashboard sin Tailwind** — inline styles + `import { theme } from '@/lib/theme'` (`theme.ts` es la fuente de verdad de colores/textos).
2. **Landing con Tailwind v4 + Framer Motion**, componentes en `components/landing/`.
3. **Dos estilos de UI**: landing Tailwind / dashboard `theme.*` — no mezclar.
4. **Supabase**: anon solo en browser/auth; service role solo en server.
5. **Formularios**: react-hook-form + `zodResolver` + validación Zod también en la API; errores en `<ErrorBox>`.
6. **Modales dashboard**: click afuera NO cierra; botón guardar en el header vía prop `formId` de `ModalCard` (+ `id` en el `<form>`); nunca `formId` en modales de confirmación.
7. **`proxy.ts` es el middleware** (no `middleware.ts`); Next.js lo detecta por `export const config`.
8. **Next.js 16**: `await params` / `await searchParams`.
9. **Dev con webpack** (`next dev --webpack`) — Turbopack deshabilitado por panics en `/superadmin/login`; el build de producción no se ve afectado.
10. **Módulo nuevo en dashboard** → SQL `role_permissions` + `sidebar.tsx` (navGroups) + array admin de `permissions/route.ts`. **Módulo nuevo en superadmin** → actualizar lista hardcodeada en 5 lugares (ver `context/modulos/superadmin.md`).
11. **`git add` con rutas `(dashboard)`/`(superadmin)`** → usar Bash, no PowerShell (paréntesis).
12. **Editor rich text**: TipTap cargado con `next/dynamic` `ssr:false` (solo noticias).
13. **IA**: Groq con retry en 429 y corte ante límite diario (ver `extraer/route.ts`).

---

## 10. Estado de fases

### 10.1 Auth / roles y permisos (`context/AUTH_CONTEXT.md` — orden de implementación)

| # | Tarea | Estado |
|---|---|---|
| 1 | Tablas SQL (roles → users → role_permissions) | ✅ |
| 2 | Variables de entorno (.env.local + Vercel) | ✅ |
| 3 | `types/auth.ts` | ✅ |
| 4 | `lib/auth.ts` (NextAuth config) | ✅ |
| 5 | middleware | ✅ (implementado como `proxy.ts`) |
| 6 | Página de Login | ✅ |
| 7 | Página de Registro + endpoint | ✅ |
| 8 | Sidebar, Header y logout | ✅ |
| 9 | Panel admin/usuarios | ✅ |
| 10 | Panel admin/roles | ✅ |
| 11 | Panel admin/permisos | ✅ |
| 12 | hook `usePermissions` + endpoint | ❌ pendiente (hook y endpoint **existen en código**, aún sin consumir) |
| 13 | Aplicar `usePermissions` en todos los módulos | ❌ pendiente |
| 14 | Probar flujo completo en producción | ✅ |

### 10.2 Módulos

Ver tabla de estado en §6 (migrada desde `context/CONTEXT.md` + módulos radar agregados).

---

## 11. Pendientes (conservados)

**Migrations por aplicar en Supabase SQL editor:**

```sql
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS fecha DATE DEFAULT CURRENT_DATE;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS nro_tarea INTEGER;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS archivo_url TEXT;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS servicio_id INTEGER REFERENCES servicios(id) ON DELETE SET NULL;
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS presupuesto_id INTEGER REFERENCES presupuestos(id) ON DELETE SET NULL;
ALTER TABLE servicio_tareas ADD COLUMN IF NOT EXISTS fecha DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS localidad TEXT;
ALTER TABLE oportunidades DROP CONSTRAINT IF EXISTS oportunidades_estado_check;
ALTER TABLE oportunidades ADD CONSTRAINT oportunidades_estado_check
  CHECK (estado IN ('NUEVA','PRIMER_CONTACTO_WS','EN_PROCESO','PRESUPUESTADA','GANADA','NO_GANADA','NO_OP'));
```

**Otras tareas:**

- **`SUPERADMIN_SECRET`** — cambiar el valor por defecto (`mga-superadmin-2025`) antes del deploy y agregarlo a Vercel env vars.
- **Cobranzas sin edición en UI** — `api/dashboard/cobranzas/[id]` expone PUT+DELETE, pero `CobranzasClient` solo usa DELETE; no hay botón de editar monto.
- **Google Search Console** — enviar sitemap tras deploy.
- **OG image dedicada** — hoy usa `hero-1.jpg`.
- **Sección Nosotros** — link del navbar apunta a `#`.
- **SQL `buscar_productos_por_nombre`** — falta búsqueda por `codigo` en pg_trgm (fallback ILIKE en route.ts con confianza 0.8).
- **Buckets** — `clientes-logos` y `presupuestos-docs` deben existir como Public.
- **Groq API key** — regenerar si fue revocada (secret scanning) y actualizar en Vercel.
- **SQL pre-importación (Admin/Importar)** — `ALTER TABLE servicios ALTER COLUMN id SET GENERATED BY DEFAULT;` antes del primer import y `setval(...)` después.
- **`hooks/usePermissions.ts`** — pendiente de uso masivo (fases 12/13, §10.1).
- **`GOOGLE_PAGESPEED_API_KEY`** — declarada en `.env.example`, sin implementar (spec radar §futuro).
- **`GEMINI_API_KEY` / `CEREBRAS_API_KEY`** — declaradas en `.env.example`, **sin uso en el código actual**.

---

## 12. Doc por módulo (`context/`)

| Módulo | Archivo |
|---|---|
| General | `context/CONTEXT.md`, `CLAUDE.md` (raíz, importa todo) |
| Auth/roles/permisos | `context/AUTH_CONTEXT.md` |
| Oportunidades · Servicios · Presupuestos · Activos · Clientes · Productos · Remitos · Cobranzas · Gastos · Noticias | `context/modulos/<nombre>.md` |
| Administración (auth, usuarios, roles, permisos, importar) | `context/modulos/administracion.md` |
| Superadmin POS | `context/modulos/superadmin.md` |
| Radar de Oportunidades (spec, 1275 líneas) | `context/modulos/radar_oportunidades_spec.md` |

---

## 13. Variables de entorno (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET / NEXTAUTH_URL
RESEND_API_KEY / RESEND_FROM_EMAIL
GROQ_API_KEY
INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN
GMAIL_IMAP_USER / GMAIL_IMAP_PASSWORD
GEMINI_API_KEY / CEREBRAS_API_KEY          # declaradas, sin uso actual
NEXT_PUBLIC_GA_ID
SUPERADMIN_SECRET
GOOGLE_MAPS_API_KEY                          # Radar (Places)
GOOGLE_PAGESPEED_API_KEY                     # Radar (futuro)
```
