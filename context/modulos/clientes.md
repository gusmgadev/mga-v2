# Módulo Clientes — Contexto

> Módulo del grupo **Altas** en el dashboard.

---

## Tabla de base de datos

```sql
public.clientes {
  id, nombre, tipo ('PARTICULAR'|'EMPRESA'|'COMERCIO'),
  email (nullable), telefono (nullable), direccion (nullable), localidad (nullable),
  cuit (nullable), rubro (nullable), notas (nullable),
  activo (bool), imagen (nullable), pagina_web (nullable),
  mostrar_en_landing (bool), created_at
}
-- imagen: URL pública de Supabase Storage, bucket 'clientes-logos' (debe ser Public)
-- Migration pendiente: ALTER TABLE clientes ADD COLUMN IF NOT EXISTS localidad TEXT;
```

---

## Logo de cliente — upload

**API route:** `POST /api/upload/logo`
- Bucket: `clientes-logos` (Supabase Storage — debe existir como **Public**)
- Formatos aceptados: JPG, PNG, WEBP, SVG — máx. 5MB
- Devuelve `{ url: publicUrl }` con la URL pública permanente

---

## Quick-create desde otros módulos

`QuickCreateClienteModal` en `components/dashboard/QuickCreateClienteModal.tsx` permite crear un cliente inline desde los formularios de nuevo activo, nuevo servicio, nuevo presupuesto y crear presupuesto desde oportunidades.

- Usa `createPortal(jsx, document.body)` para evitar `<form>` anidados en el DOM
- Se renderiza con `zIndex: 60` (sobre los modales padre que usan `zIndex: 50`)
- En el flujo de oportunidades, los datos de contacto de la oportunidad se pre-cargan en el modal

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/clientes` | GET + POST | Lista / crear |
| `/api/dashboard/clientes/[id]` | GET + PUT + DELETE | Detalle / editar / eliminar |
| `/api/upload/logo` | POST | Sube logo a Supabase Storage (`clientes-logos`) |

---

## Notas importantes

- **Columnas en español** — todas las columnas de la tabla están en español (`nombre`, `tipo`, `telefono`, `direccion`, `notas`, `activo`). `ClienteSimple` en todos los módulos es `{ id: number; nombre: string }`. En selects de join usar `clientes(nombre)`, nunca `clientes(name)`.
- **Landing** — `mostrar_en_landing: true` hace que el cliente aparezca en la sección de clientes de la landing pública. `lib/clientes.ts` tiene los 22 clientes estáticos de la landing (array separado, no de DB).
