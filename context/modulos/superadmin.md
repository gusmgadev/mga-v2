# Panel Superadmin — Contexto

> Panel independiente en `/superadmin` para gestión de empresas clientes del sistema POS `mga-ptoventa`. Auth propia via cookie, completamente independiente de NextAuth.

---

## Auth

- **Cookie:** `sa_session` — debe ser igual a `SUPERADMIN_SECRET` (env var)
- **Login:** `POST /api/superadmin/auth` con `{ password }` → setea cookie HttpOnly, SameSite=Strict, Max-Age=86400
- **Logout:** `DELETE /api/superadmin/auth` → borra cookie
- **Helper:** `isSuperadminAuthenticated()` en `lib/superadmin-auth.ts` — llamar al inicio de cada API route
- **Middleware:** `proxy.ts` intercepta `/superadmin/*` antes que NextAuth — las dos protecciones son independientes

---

## Tablas de base de datos

```sql
-- Empresas clientes del POS mga-ptoventa
public.empresas {
  id (serial),
  nombre (text),
  codigo (text, unique),         -- identificador de login en mga-ptoventa
  activo (bool),
  supabase_url (text),
  supabase_anon_key (text nullable),
  supabase_service_key (text nullable),
  razon_social (text nullable),
  cuit (text nullable),
  telefono (text nullable),
  email (text nullable),
  direccion (text nullable),
  localidad (text nullable),
  plan ('basico'|'profesional'|'enterprise' nullable),
  fecha_inicio (date nullable),
  fecha_vencimiento (date nullable),
  estado_implementacion ('en_progreso'|'activo'|'pausado'|'suspendido' nullable),
  notas (text nullable),
  created_at, updated_at
}

-- Módulos habilitados por empresa (uno por módulo por empresa)
public.empresa_modulos {
  id (serial),
  empresa_id (int, FK → empresas),
  modulo (text),
  activo (bool)
  -- UNIQUE (empresa_id, modulo)
}
-- No hay migraciones en el repo — tablas creadas manualmente en Supabase master
```

---

## Módulos del POS disponibles

```ts
const MODULOS = ['ventas', 'inventario', 'caja', 'contactos', 'finanzas', 'administracion', 'optica']
```

**IMPORTANTE — la lista está hardcodeada en 5 lugares.** Al agregar un nuevo módulo, actualizar todos:

| Archivo | Constante |
|---------|-----------|
| `app/(superadmin)/superadmin/empresas/page.tsx` | contador `/ N` en columna Módulos |
| `app/(superadmin)/superadmin/empresas/nueva/page.tsx` | `const MODULOS` |
| `app/(superadmin)/superadmin/empresas/[id]/page.tsx` | `const MODULOS` |
| `app/api/superadmin/empresas/route.ts` | `const MODULOS_DEFAULT` |
| `app/api/superadmin/empresas/[id]/modulos/route.ts` | `const MODULOS_VALIDOS` |

**Comportamiento al crear empresa:** se insertan N filas en `empresa_modulos` (una por cada módulo en `MODULOS_DEFAULT`), con `activo` según la selección del formulario.

**Comportamiento al editar módulos:** upsert con `onConflict: 'empresa_id,modulo'` — nunca DELETE, solo toggle `activo`. Empresas creadas antes de agregar un nuevo módulo no tienen fila para ese módulo; el upsert la crea automáticamente la primera vez que se guarda la empresa (con `activo: false` si no estaba seleccionado).

---

## Supabase client

`services/supabase-master.ts` — service role key, `persistSession: false`. Separado de `supabase-admin.ts` porque apunta a la BD master (empresas POS), no a la BD del dashboard MGA.

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/superadmin/auth` | POST | Login — verifica password, setea cookie sa_session (24h) |
| `/api/superadmin/auth` | DELETE | Logout — borra cookie |
| `/api/superadmin/empresas` | GET | Lista todas las empresas con `empresa_modulos(*)` |
| `/api/superadmin/empresas` | POST | Crear empresa + insertar filas empresa_modulos |
| `/api/superadmin/empresas/[id]` | GET | Detalle empresa con módulos |
| `/api/superadmin/empresas/[id]` | PUT | Editar datos empresa (sin módulos) |
| `/api/superadmin/empresas/[id]/modulos` | PUT | Actualizar módulos — upsert completo de todos los MODULOS_VALIDOS |

---

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/superadmin` | Redirect → `/superadmin/empresas` |
| `/superadmin/login` | Login con contraseña |
| `/superadmin/empresas` | Lista de empresas con plan, estado impl., módulos activos `N/7`, vencimiento |
| `/superadmin/empresas/nueva` | Crear empresa — todos los módulos pre-seleccionados por defecto |
| `/superadmin/empresas/[id]` | Editar empresa + checkboxes de módulos (detecta cambios, PUT separado) |

---

## Notas importantes

- **Sin NextAuth** — todas las páginas son `'use client'`, fetching manual con `useEffect`. Si el fetch retorna 401 → `router.push('/superadmin/login')`.
- **Cambios de módulos se detectan por comparación de arrays ordenados:** `JSON.stringify([...modulos].sort()) !== JSON.stringify([...modulosOriginales].sort())`. Solo llama a `PUT /modulos` si hubo cambios.
- **`updated_at`** — se setea manualmente en `PUT /[id]` con `new Date().toISOString()` (no hay trigger automático en esta tabla).
- **`SUPERADMIN_SECRET`** — cambiar el valor por defecto (`mga-superadmin-2025`) antes del primer deploy a producción. Agregar a Vercel env vars.
