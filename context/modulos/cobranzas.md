# Módulo Cobranzas — Contexto

> Módulo del grupo **Fondos** en el dashboard. Pagos y cargos unificados vinculados a clientes y servicios.

---

## Tabla de base de datos

```sql
public.cobranzas {
  id, cliente_id (FK), servicio_id (FK nullable),
  tipo ('CARGO'|'PAGO'|'NOTA_CREDITO'), concepto (text), monto (numeric), fecha (date),
  metodo_pago ('EFECTIVO'|'TRANSFERENCIA'|'TARJETA'|'CHEQUE'|'OTRO' — nullable, solo aplica para tipo PAGO),
  notas (nullable),
  created_at
}
-- servicio_pagos fue eliminada. Todos los pagos viven en cobranzas con tipo='PAGO'.
-- Pagos vinculados a servicio tienen servicio_id != null.
-- "Pagos a cuenta" (sin servicio) tienen servicio_id = null.
-- GET devuelve join: clientes(nombre), servicios(titulo)
```

---

## Lógica de negocio

**`recalcularEstadoPago(servicio_id)`** — función exportada desde `app/api/dashboard/cobranzas/route.ts`.
- Suma todos los cargos del servicio y todos los pagos vinculados
- Actualiza `servicios.estado_pago` en consecuencia
- Se reutiliza desde `[id]/route.ts` e `[id]/imputar/route.ts`

**Campos del POST `/api/dashboard/cobranzas`:**
```
cliente_id, servicio_id (nullable), tipo ('CARGO'|'PAGO'|'NOTA_CREDITO'),
concepto (min 2 chars), monto (positive), fecha,
metodo_pago ('EFECTIVO'|'TRANSFERENCIA'|'TARJETA'|'CHEQUE'|'OTRO' — nullable),
notas (nullable)
```

**Filtros del GET:** `cliente_id`, `tipo`, `desde` (fecha), `hasta` (fecha).

---

## Imputar pago a cuenta

`POST /api/dashboard/cobranzas/[id]/imputar` con `{ servicio_id, monto }`.
- Si el pago a cuenta es parcial: reduce el monto del original y crea un nuevo registro vinculado al servicio
- Si es total: el pago a cuenta se vincula directamente al servicio
- `ServicioDetalleClient` carga `initialPagos` (cobranzas del servicio) y `pagosACuenta` (del mismo cliente sin servicio) como props separados desde `page.tsx`

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/cobranzas` | GET + POST | Lista con filtros / crear |
| `/api/dashboard/cobranzas/[id]` | DELETE | Eliminar |
| `/api/dashboard/cobranzas/[id]/imputar` | POST | Imputar pago a cuenta a un servicio |

---

## Estado actual del módulo

- ✅ Lista con filtros por cliente, tipo, rango de fechas
- ✅ Crear cargo / pago / nota de crédito
- ✅ Eliminar (DELETE)
- ❌ Editar — solo existe DELETE. Si se ingresó mal un monto hay que borrar y recrear.
- ✅ Resumen cargos / pagado / saldo

---

## Notas importantes

- **Tabla única de pagos** — `servicio_pagos` fue eliminada. Todos los pagos viven en `cobranzas` con `tipo='PAGO'`. Pagos vinculados a servicio tienen `servicio_id != null`; "pagos a cuenta" tienen `servicio_id = null`. `recalcularEstadoPago` está en `app/api/dashboard/cobranzas/route.ts` (exportada) y se reutiliza desde `[id]/route.ts` e `[id]/imputar/route.ts`.
- **Campo `concepto`** — la columna se llama `concepto` (no `descripcion`). El campo `metodo_pago` (no `metodo`) es nullable y solo aplica para tipo PAGO.
- **Tipo `NOTA_CREDITO`** — tercer valor válido del enum, además de CARGO y PAGO.
- **Pago rápido desde grilla de servicios** — el modal pre-carga el monto con el saldo pendiente (`valor - totalPagado`) y muestra un panel de contexto con Valor / Pagado / Saldo. El usuario puede modificar el monto antes de confirmar. Método por defecto: `TRANSFERENCIA`.
