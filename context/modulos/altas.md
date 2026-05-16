# Módulo Altas — Contexto

> Cubre los módulos del grupo **Altas** en el dashboard: Clientes, Productos.

---

## Tablas de base de datos

```sql
-- Clientes (todas las columnas en español)
public.clientes {
  id, nombre, tipo ('PARTICULAR'|'EMPRESA'|'COMERCIO'),
  email (nullable), telefono (nullable), direccion (nullable), localidad (nullable),
  cuit (nullable), rubro (nullable), notas (nullable),
  activo (bool), imagen (nullable), pagina_web (nullable),
  mostrar_en_landing (bool), created_at
}
-- imagen: URL de Supabase Storage, bucket 'clientes-logos'
-- Si localidad no existe aún: ALTER TABLE clientes ADD COLUMN localidad TEXT;

-- Catálogo de productos
public.marcas { id, nombre, activo (bool), created_at }
public.rubros_productos { id, nombre, activo (bool), created_at }

public.productos {
  id, codigo (nullable), nombre, marca (nullable), rubro (nullable), subrubro (nullable),
  unidad ('unidad'|'kg'|'bolsa'|'caja'|...), stock_actual (numeric),
  costo (nullable), precio_venta (nullable), activo (bool), created_at
}
```

---

## Productos — catálogo con marca/rubro

`CatalogoCombobox` es un combobox compartido en `components/dashboard/CatalogoCombobox.tsx` que:
- Filtra opciones existentes mientras se tipea
- Permite crear una nueva opción con "+" guardando vía `onNewOption(valor)`
- Usado en el modal de crear/editar producto para los campos **Marca** y **Rubro**
- También disponible en el modal "Crear producto" dentro de RemitoDetalleClient

Para agregar marca/rubro nuevo desde el modal de remitos: `POST /api/dashboard/marcas` y `POST /api/dashboard/rubros-productos`.

---

## Logo de cliente — upload

El campo `imagen` en clientes acepta una URL de Supabase Storage.

**API route:** `POST /api/upload/logo`
- Bucket: `clientes-logos` (debe existir en Supabase Storage como **Public**)
- Formatos aceptados: JPG, PNG, WEBP, SVG — máx. 5MB
- Devuelve `{ url: publicUrl }` con la URL pública permanente

---

## Notas importantes — Altas

- **`clientes` — columnas en español** — todas las columnas de la tabla están en español (`nombre`, `tipo`, `telefono`, `direccion`, `notas`, `activo`). `ClienteSimple` en todos los módulos es `{ id: number; nombre: string }`. En selects de join usar `clientes(nombre)`, nunca `clientes(name)`.
