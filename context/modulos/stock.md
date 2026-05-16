# Módulo Stock — Contexto

> Cubre el módulo del grupo **Stock** en el dashboard: Remitos.

---

## Tablas de base de datos

```sql
public.origenes_destinos {
  id, tipo ('proveedor'|'sucursal'|'deposito'|'cliente'|'otro'), nombre, activo (bool), created_at
}

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

## Remitos — ingreso de stock por voz

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

---

## Notas importantes — Stock

- **Remitos — confianza auto-insert:** el umbral es `>= 0.7`. Por debajo va al panel de pendientes, no se inserta automáticamente.
- **Remitos — tabla de ítems:** mostrar `item.productos?.nombre` primero; `item.nombre_detectado` como fallback. Nunca al revés (el nombre detectado puede ser el código dictado, no el nombre real del producto).
- **`buscar_productos_por_nombre`** — si la función RPC no está actualizada para buscar por `codigo`, el fallback ILIKE en route.ts lo cubre con confianza 0.8. Pendiente actualizar la función pg_trgm para incluir búsqueda por `codigo` (ver historial sesión 2026-05-13).
