# Módulo Administración — Contexto

> Cubre el grupo **Administración** en el dashboard: Auth, Permisos, Noticias, Usuarios, Roles, Importar.
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
  video_url (nullable, URL de YouTube o Vimeo — incrustado en el detalle público),
  publicada (bool, default false), orden (int, default 0),
  fecha (date, default CURRENT_DATE),
  created_at, updated_at
}
-- Migration: ALTER TABLE noticias ADD COLUMN video_url TEXT;
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

**Video thumbnail preview en admin:** componente `VideoPreview` (definido FUERA de `NoticiasAdminClient` para evitar remounting) en `NoticiasAdminClient.tsx`.
- YouTube: thumbnail via `https://img.youtube.com/vi/${id}/hqdefault.jpg` (sin API key)
- Vimeo: thumbnail via oEmbed `https://vimeo.com/api/oembed.json?url=...` (CORS habilitado, gratis)
- Usa `useEffect` con `AbortController` para cleanup. Se activa con `form.watch('video_url')`
- `VideoPreview` DEBE definirse fuera del componente padre — si se define adentro, React lo remonta en cada render

**Imágenes en página pública:** tanto cards (`components/landing/noticias.tsx`) como portada de detalle (`app/noticias/[id]/page.tsx`) usan `objectFit: "contain"` (no `cover`) para mostrar la imagen completa sin recorte.

**Layout de detalle público:** fecha + título van ANTES de la imagen portada, para que sean visibles sin scroll. Imagen en contenedor 16:9 con `backgroundColor: "#F0F2F4"`.

**Instagram auto-post:** `services/instagram.ts` → `postNoticiaToInstagram()`
- Se dispara en `PUT /api/dashboard/noticias/[id]` al pasar `publicada: false → true`
- Requiere `imagen_card` + variables de entorno configuradas
- Si las variables no están, se ignora silenciosamente

**Bucket Supabase Storage:** `noticias-imagenes` (debe ser Public)
**API de upload:** `POST /api/dashboard/upload/imagen` → devuelve `{ url: publicUrl }`

---

## Módulo Importar (admin/importar)

Herramienta de migración one-shot para importar servicios desde un Excel con hojas `clientes` y `servicios`.

**Flujo (upload desde browser):**
1. El usuario selecciona un `.xlsx` con `<input type="file" accept=".xlsx">`
2. `ImportarClient` construye un `FormData` y hace `POST /api/dashboard/importar/servicios` con el archivo
3. La API lee el buffer con `xlsx.read(buffer, { cellDates: true })` — sin archivo en disco
4. Fase 1: construye mapa `Cod_Cliente_Excel → cliente_id` buscando cada `Razon_Social` en `clientes` con `.ilike()`
5. Fase 2: upserta cada servicio con `onConflict: 'id'` (idempotente)
6. Si `Pagos > 0`: elimina cobranzas previas con `concepto = 'Pago importado desde Excel'` e inserta una nueva con `tipo = 'PAGO'` para que `saldo = Valor − Pagos`
7. Devuelve `{ total, importados, sinCliente[], errores[] }`

**Columnas del Excel → tabla `servicios`:**
| Excel | DB |
|---|---|
| `Nro Servicio` | `id` (preservar ID original — requiere `ALTER TABLE servicios ALTER COLUMN id SET GENERATED BY DEFAULT` antes) |
| `CodCliente` | `cliente_id` (via mapa construido desde hoja `clientes`) |
| `Problema` | `titulo` |
| `DetalleTrabajo` | `descripcion` |
| `Estado` | `estado` (mapa: `TERMINADO`/`EN PROCESO`/`CANCELADO`/`RECHAZADO`/`INGRESADO`/`PRESUPUESTADO`, default `INGRESADO`) |
| `EstadoPago` | `estado_pago` (mapa: `PAGADO`→`PAGADO`, `NO PAGADO`→`PENDIENTE`, `SIN CARGO`→`SIN CARGO`, `PAGO PARCIAL`→`PAGO PARCIAL`, default `PENDIENTE`) |
| `Valor` | `valor` (valor total del servicio, **no** `Valor − Pagos`) |
| `FechaIngreso` | `fecha` (Date → `yyyy-mm-dd`) |
| `Pagos` | cobranza `tipo=PAGO, concepto='Pago importado desde Excel', monto=Pagos` |

**SQL requerido antes de la primera importación:**
```sql
-- Permitir insertar ID manual (evita que Postgres ignore el id provisto)
ALTER TABLE servicios ALTER COLUMN id SET GENERATED BY DEFAULT;

-- Después de importar, resetear la secuencia para que los nuevos servicios no colisionen
SELECT setval(pg_get_serial_sequence('servicios', 'id'), (SELECT MAX(id) FROM servicios));
```

**Importante — por qué upload y no archivo en disco:**
- La carpeta `recursos/` está en `.gitignore` → Vercel no tiene el archivo en el build
- `outputFileTracingIncludes` no sirve si el archivo no está en el repo
- El upload desde browser resuelve esto sin necesidad de commitear el Excel

---

## Notas importantes — Administración

- **Administrador shortcircuit** — `getModulePermisos` devuelve FULL sin tocar DB. No depende de que existan filas en `role_permissions` para el admin.
- **Noticias — `contenido` es HTML** — generado por TipTap. Al renderizar en la página pública, usar `dangerouslySetInnerHTML`. Para backward compat con contenido antiguo en plain text, detectar con `/<[a-z]/i.test(contenido)` y convertir `\n` a `<br />` si no es HTML.
- **Noticias — `fecha`** — columna `date` (default CURRENT_DATE), editable desde el dashboard. En la página pública mostrar `noticia.fecha ?? noticia.created_at`. Formatear con split para evitar desfase UTC: `const [y,m,d] = dateStr.split('-'); new Date(Number(y), Number(m)-1, Number(d))`.
- **Importar — archivo en memoria, no en disco** — la API lee `xlsx.read(buffer)` desde `req.formData()`. No usar `readFile(path)` ni `outputFileTracingIncludes` — el archivo Excel está en `.gitignore` y Vercel no lo tiene.
- **Importar — idempotencia de cobranzas** — antes de insertar el pago importado se eliminan las cobranzas anteriores con `concepto = 'Pago importado desde Excel'` para el mismo `servicio_id`. Esto permite re-importar sin duplicar pagos.
