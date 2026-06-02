# Módulo Noticias — Contexto

> Módulo del grupo **Administración** en el dashboard (solo Administrador). Gestión de noticias con rich text, imágenes, video y auto-post a Instagram.

---

## Tabla de base de datos

```sql
public.noticias {
  id, titulo, resumen, contenido (html string),
  imagen_card (nullable, URL Supabase Storage), imagen_portada (nullable, URL),
  video_url (nullable, URL de YouTube o Vimeo — incrustado en el detalle público),
  publicada (bool, default false), orden (int, default 0),
  fecha (date, default CURRENT_DATE),
  created_at, updated_at
}
-- Migration: ALTER TABLE noticias ADD COLUMN IF NOT EXISTS video_url TEXT;
-- Bucket Supabase Storage: 'noticias-imagenes' (debe ser Public)
-- Al pasar publicada false→true: dispara auto-post a Instagram si hay imagen_card y env vars configuradas
```

---

## Rich text editor

**TipTap** (Bold/Italic/Highlight) en `components/dashboard/RichTextEditor.tsx`.
- Se carga con `next/dynamic({ ssr: false })` porque TipTap usa APIs del browser
- El campo `contenido` almacena HTML generado por TipTap
- Al renderizar en la página pública usar `dangerouslySetInnerHTML`
- Backward compat con contenido antiguo en plain text: detectar con `/<[a-z]/i.test(contenido)` y convertir `\n` a `<br />` si no es HTML

---

## Video thumbnail preview en admin

Componente `VideoPreview` (definido **FUERA** de `NoticiasAdminClient` para evitar remounting) en `NoticiasAdminClient.tsx`.
- YouTube: thumbnail via `https://img.youtube.com/vi/${id}/hqdefault.jpg` (sin API key)
- Vimeo: thumbnail via oEmbed `https://vimeo.com/api/oembed.json?url=...` (CORS habilitado, gratis)
- Usa `useEffect` con `AbortController` para cleanup. Se activa con `form.watch('video_url')`
- `VideoPreview` DEBE definirse fuera del componente padre — si se define adentro, React lo remonta en cada render y pierde el estado

---

## Imágenes

- **Upload:** `POST /api/upload/imagen` → devuelve `{ url: publicUrl }`; bucket `noticias-imagenes` (Public)
- **En página pública:** tanto cards como portada de detalle usan `objectFit: "contain"` (no `cover`) para mostrar la imagen completa sin recorte
- **Layout de detalle público:** fecha + título van ANTES de la imagen portada. Imagen en contenedor 16:9 con `backgroundColor: "#F0F2F4"`

---

## Instagram auto-post

`services/instagram.ts` → `postNoticiaToInstagram()`
- Se dispara en `PUT /api/dashboard/noticias/[id]` al pasar `publicada: false → true`
- Requiere `imagen_card` + variables de entorno configuradas
- Si las variables no están, se ignora silenciosamente

**Variables de entorno requeridas:**
```
INSTAGRAM_USER_ID=      # ID numérico del usuario IG Business (no el @handle)
INSTAGRAM_ACCESS_TOKEN= # Token larga duración (60 días) o System User token (no vence)
```
El token vence a los 60 días — renovar con Graph API Explorer o usar un System User token permanente.

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/noticias` | GET + POST | Lista / crear |
| `/api/dashboard/noticias/[id]` | GET + PUT + DELETE | Detalle / editar / eliminar + auto-post IG |
| `/api/upload/imagen` | POST | Sube imagen a Supabase Storage (`noticias-imagenes`) |

---

## Notas importantes

- **`fecha`** — columna `date` (default CURRENT_DATE), editable desde el dashboard. En la página pública mostrar `noticia.fecha ?? noticia.created_at`. Formatear con split para evitar desfase UTC: `const [y,m,d] = dateStr.split('-'); new Date(Number(y), Number(m)-1, Number(d))`.
- **`contenido` es HTML** — generado por TipTap. Para backward compat: detectar con `/<[a-z]/i.test(contenido)` y convertir `\n` a `<br />` si no es HTML.
