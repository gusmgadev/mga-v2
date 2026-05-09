# AUTH_CONTEXT.md — Sistema de Auth y Perfiles (MGA SaaS)

Adjuntá este archivo al inicio de cualquier chat relacionado con autenticación,
roles o permisos. Le da a la IA todo el contexto del sistema antes de implementar.

---

## Stack

- Next.js (App Router)
- NextAuth.js v5 — CredentialsProvider + JWT
- Supabase — Auth + PostgreSQL + RLS
- proxy.ts (Next.js 16+) — protección de rutas

---

## Roles

| id | name | description | is_default |
|---|---|---|---|
| 1 | `'Administrador'` | Acceso total al sistema | false |
| 2 | `'Usuario'` | Acceso limitado según permisos | true |

> **Reglas clave:**
> - Solo un Administrador puede cambiar el rol de otro usuario.
> - Un usuario nunca puede cambiar su propio rol.
> - Al registrarse, se asigna el rol con `is_default = true` automáticamente.
> - El `name` del rol es lo que viaja en el JWT — se compara como `session.user.role === 'Administrador'`.
> - Los roles son dinámicos — se pueden agregar nuevos desde el panel sin tocar código.

---

## Tablas en Supabase

### roles
Tabla maestra de roles. Permite agregar roles nuevos desde el panel sin tocar código.

```sql
create table public.roles (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  description text,
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- Solo un rol puede ser default
create unique index roles_is_default_true
  on public.roles (is_default)
  where is_default = true;

-- Datos iniciales
insert into public.roles (name, description, is_default) values
  ('Administrador', 'Acceso total al sistema', false),
  ('Usuario',       'Acceso limitado según permisos', true);
```

### users
Extiende `auth.users` de Supabase con datos del perfil.
El campo `role_id` referencia la tabla `roles`.

```sql
create table public.users (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text not null,
  name       text,
  role_id    bigint not null references public.roles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "usuario ve su propio perfil"
  on public.users for select
  using (auth.uid() = id);

create policy "admin ve todos"
  on public.users for select
  using (
    exists (
      select 1
      from public.users u
      join public.roles r on r.id = u.role_id
      where u.id = auth.uid() and r.name = 'Administrador'
    )
  );

create policy "admin puede actualizar cualquier user"
  on public.users for update
  using (
    exists (
      select 1
      from public.users u
      join public.roles r on r.id = u.role_id
      where u.id = auth.uid() and r.name = 'Administrador'
    )
  );
```

### role_permissions
Define qué módulos y acciones tiene permitidos cada rol.
Se edita desde el panel de admin — sin tocar código.
El campo `role_id` referencia la tabla `roles`.

```sql
create table public.role_permissions (
  id         bigint generated always as identity primary key,
  role_id    bigint not null references public.roles(id),
  module     text not null,   -- 'clientes' | 'servicios' | 'cobranzas' | 'admin'
  can_view   boolean default false,
  can_create boolean default false,
  can_edit   boolean default false,
  can_delete boolean default false,
  unique(role_id, module)
);

-- Administrador (id=1): acceso total
insert into public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
select r.id, m.module, true, true, true, true
from public.roles r
cross join (values ('clientes'), ('servicios'), ('cobranzas'), ('admin')) as m(module)
where r.name = 'Administrador';

-- Usuario (id=2): acceso limitado
insert into public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
select r.id, m.module, m.can_view, false, false, false
from public.roles r
cross join (values
  ('clientes',  true),
  ('servicios', true),
  ('cobranzas', false),
  ('admin',     false)
) as m(module, can_view)
where r.name = 'Usuario';
```

---

## Tipos TypeScript (types/auth.ts)

```ts
export type UserRole = string  // dinámico — viene de roles.name

export type Role = {
  id: number
  name: string
  description: string | null
  is_default: boolean
}

export type UserProfile = {
  id: string
  email: string
  name: string | null
  role_id: number
  role_name: string   // viene del join con roles
  created_at: string
}

export type RolePermission = {
  role_id: number
  module: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string      // roles.name — ej: 'Administrador'
      role_id: number   // roles.id  — ej: 1
    }
  }
  interface JWT {
    role: string
    role_id: number
  }
}
```

---

## Flujo de sesión

```
1. Usuario ingresa email + password en /auth/signin
2. NextAuth valida contra Supabase Auth
3. Si válido → carga perfil desde public.users JOIN public.roles
4. Guarda { id, email, name, role (name), role_id } en el JWT
5. proxy.ts intercepta cada request y verifica sesión + rol
6. Si ruta requiere Administrador y el user no lo es → redirige
7. En cada página: usePermissions('modulo') condiciona botones y secciones
```

---

## Rutas protegidas

| Ruta | Requiere |
|---|---|
| `/dashboard/*` | Sesión activa |
| `/dashboard/admin/*` | `session.user.role === 'Administrador'` |
| `/api/dashboard/*` | Sesión activa |
| `/auth/signin` | Sin sesión (si hay sesión → redirige al dashboard) |
| `/auth/registro` | Sin sesión (si hay sesión → redirige al dashboard) |

---

## Archivos del sistema

| Archivo | Responsabilidad |
|---|---|
| `types/auth.ts` | Tipos TypeScript centralizados |
| `lib/auth.ts` | Configuración de NextAuth + CredentialsProvider |
| `lib/supabase.ts` | Cliente Supabase (anon key) |
| `services/supabase-admin.ts` | Cliente Supabase (service role) — solo en server |
| `proxy.ts` | Protección de rutas — intercepta cada request |
| `hooks/usePermissions.ts` | Hook cliente para leer permisos del rol |
| `app/auth/signin/page.tsx` | Página de login |
| `app/auth/registro/page.tsx` | Página de registro |
| `app/api/auth/registro/route.ts` | Endpoint de registro |
| `app/api/permissions/route.ts` | Endpoint de consulta de permisos |
| `app/(dashboard)/dashboard/admin/usuarios/` | Panel gestión de usuarios (solo Administrador) ✅ |
| `app/api/dashboard/usuarios/[id]/route.ts` | Endpoint CRUD usuarios ✅ |
| `app/(dashboard)/dashboard/admin/roles/` | Panel gestión de roles (solo Administrador) ✅ |
| `app/api/dashboard/roles/route.ts` | Endpoint CRUD de roles ✅ |
| `app/(dashboard)/dashboard/admin/permisos/` | Panel gestión de permisos (solo Administrador) ✅ |
| `app/api/dashboard/permisos/route.ts` | Endpoint GET/PATCH de permisos ✅ |
| `hooks/usePermissions.ts` | Hook cliente para leer permisos del rol ❌ pendiente |

---

## Orden de implementación

Seguir este orden evita errores de dependencias entre archivos.

| # | Tarea | Estado |
|---|---|---|
| 1 | Crear tablas SQL en Supabase (roles → users → role_permissions) | ✅ |
| 2 | Variables de entorno (.env.local + Vercel) | ✅ |
| 3 | types/auth.ts | ✅ |
| 4 | lib/auth.ts (NextAuth config) | ✅ |
| 5 | middleware.ts | ✅ |
| 6 | Página de Login | ✅ |
| 7 | Página de Registro + endpoint | ✅ |
| 8 | Sidebar, Header y logout en el dashboard | ✅ |
| 9 | Panel admin/usuarios | ✅ |
| 10 | Panel admin/roles (CRUD de roles) | ✅ |
| 11 | Panel admin/permisos | ✅ |
| 12 | hook usePermissions + endpoint | ❌ pendiente |
| 13 | Aplicar usePermissions en todos los módulos | ❌ pendiente |
| 14 | Probar flujo completo en producción | ✅ |

---

*MGA Informática | 2026 | Auth System Context v2.0*
