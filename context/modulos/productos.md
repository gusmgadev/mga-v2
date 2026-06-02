# Módulo Productos — Contexto

> Módulo del grupo **Altas** en el dashboard. Catálogo de productos con marca, rubro y stock.

---

## Tablas de base de datos

```sql
public.marcas { id, nombre, activo (bool), created_at }
public.rubros_productos { id, nombre, activo (bool), created_at }

public.productos {
  id, codigo (nullable), nombre, marca (nullable), rubro (nullable), subrubro (nullable),
  unidad ('unidad'|'kg'|'bolsa'|'caja'|...), stock_actual (numeric),
  costo (nullable), precio_venta (nullable), activo (bool), created_at
}
```

---

## CatalogoCombobox

`CatalogoCombobox` en `components/dashboard/CatalogoCombobox.tsx`:
- Filtra opciones existentes mientras se tipea
- Permite crear una nueva opción con "+" guardando vía `onNewOption(valor)` (POST a la API)
- Usado en el modal de crear/editar producto para los campos **Marca** y **Rubro**
- También disponible en el modal "Crear producto" dentro de `RemitoDetalleClient`

Para agregar marca/rubro nuevo desde el modal de remitos: `POST /api/dashboard/marcas` y `POST /api/dashboard/rubros-productos`.

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/productos` | GET + POST | Lista / crear |
| `/api/dashboard/productos/[id]` | GET + PUT + DELETE | Detalle / editar / eliminar |
| `/api/dashboard/marcas` | GET + POST | Catálogo de marcas |
| `/api/dashboard/rubros-productos` | GET + POST | Catálogo de rubros |

---

## Notas importantes

- **`stock_actual`** — se actualiza automáticamente al confirmar un remito (vía `movimientos_stock`). No modificar directamente desde el módulo de productos.
- **`codigo`** nullable — si se dicta en voz para remitos, se usa para búsqueda exacta antes que el nombre (confianza 1.0 vs pg_trgm).
