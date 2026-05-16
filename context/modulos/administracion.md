# Módulo Administración — Contexto

> Cubre el grupo **Administración** en el dashboard: Auth, Permisos, Noticias, Usuarios, Roles.
> Solo accesible para el rol Administrador.

---

## Tablas de base de datos

```sql
-- Roles dinámicos
public.roles { id, name, description, is_default }
-- Roles actuales: 'Administrador' (id=1), 'Usuario' (id=2)

-- Perfiles de usuario (extiende auth.users de Supabase)
public.users { id (uuid, FK auth.users), email, name, role_id (FK roles) }

-- Permisos por módulo y rol
public.role_permissions { id, role_id, module, can_view, can_create, can_edit, can_delete }
-- UNIQUE(role_id, module)
-- Módulos actuales: 'clientes', 'activos', 'servicios', 'presupuestos', 'cobranzas', 'productos', 'remitos'

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

## Módulo Noticias

**Rich text editor:** TipTap (Bold/Italic/Highlight) en `components/dashboard/RichTextEditor.tsx`.
- Se carga con `next/dynamic({ ssr: false })` porque TipTap usa APIs del browser
- El campo `contenido` almacena HTML generado por TipTap

**Instagram auto-post:** `services/instagram.ts` → `postNoticiaToInstagram()`
- Se dispara en `PUT /api/dashboard/noticias/[id]` al pasar `publicada: false → true`
- Requiere `imagen_card` + variables de entorno configuradas
- Si las variables no están, se ignora silenciosamente

**Bucket Supabase Storage:** `noticias-imagenes` (debe ser Public)
**API de upload:** `POST /api/dashboard/upload/imagen` → devuelve `{ url: publicUrl }`

---

## Notas importantes — Administración

- **Administrador shortcircuit** — `getModulePermisos` devuelve FULL sin tocar DB. No depende de que existan filas en `role_permissions` para el admin.
- **Noticias — `contenido` es HTML** — generado por TipTap. Al renderizar en la página pública, usar `dangerouslySetInnerHTML`. Para backward compat con contenido antiguo en plain text, detectar con `/<[a-z]/i.test(contenido)` y convertir `\n` a `<br />` si no es HTML.
- **Noticias — `fecha`** — columna `date` (default CURRENT_DATE), editable desde el dashboard. En la página pública mostrar `noticia.fecha ?? noticia.created_at`. Formatear con split para evitar desfase UTC: `const [y,m,d] = dateStr.split('-'); new Date(Number(y), Number(m)-1, Number(d))`.
