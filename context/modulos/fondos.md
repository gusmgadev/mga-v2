# Módulo Fondos — Contexto

> Cubre el módulo del grupo **Fondos** en el dashboard: Cobranzas.

---

## Tablas de base de datos

```sql
-- Cobranzas (pagos y cargos unificados)
public.cobranzas {
  id, cliente_id (FK), servicio_id (FK nullable),
  tipo ('CARGO'|'PAGO'), monto (numeric), fecha (date),
  metodo ('EFECTIVO'|'TRANSFERENCIA'|'TARJETA'|'CHEQUE'|'OTRO' — solo para tipo PAGO),
  descripcion (nullable), notas (nullable),
  created_at
}
-- servicio_pagos fue eliminada. Todos los pagos viven en cobranzas con tipo='PAGO'.
-- Pagos vinculados a servicio tienen servicio_id != null.
-- "Pagos a cuenta" (sin servicio) tienen servicio_id = null.
```

---

## Lógica de negocio

**`recalcularEstadoPago(servicio_id)`** — función exportada desde `app/api/dashboard/cobranzas/route.ts`.
- Suma todos los cargos del servicio y todos los pagos vinculados
- Actualiza `servicios.estado_pago` en consecuencia
- Se reutiliza desde `[id]/route.ts` e `[id]/imputar/route.ts`

**Imputar pago a cuenta:** `POST /api/dashboard/cobranzas/[id]/imputar` con `{ servicio_id, monto }`.
- Si el pago a cuenta es parcial: reduce el monto del original y crea un nuevo registro vinculado al servicio
- `ServicioDetalleClient` carga `initialPagos` (cobranzas del servicio) y `pagosACuenta` (del mismo cliente sin servicio) como props separados desde `page.tsx`

---

## Estado del módulo

- ✅ Lista con filtros por cliente y tipo
- ✅ Crear cargo/pago
- ✅ Eliminar (DELETE)
- ❌ Editar — solo existe DELETE. Si se ingresó mal un monto hay que borrar y recrear.
- ✅ Resumen cargos/pagado/saldo

---

## Notas importantes — Fondos

- **Cobranzas — tabla única de pagos** — `servicio_pagos` fue eliminada. Todos los pagos viven en `cobranzas` con `tipo='PAGO'`. Pagos vinculados a servicio tienen `servicio_id != null`; "pagos a cuenta" tienen `servicio_id = null`. `recalcularEstadoPago` está en `app/api/dashboard/cobranzas/route.ts` (exportada) y se reutiliza desde `[id]/route.ts` e `[id]/imputar/route.ts`.
- **Imputar pago a cuenta** — `POST /api/dashboard/cobranzas/[id]/imputar` con `{ servicio_id, monto }`. Si es parcial, reduce el original y crea un nuevo registro vinculado. `ServicioDetalleClient` carga `initialPagos` (cobranzas del servicio) y `pagosACuenta` (del mismo cliente sin servicio) como props separados desde `page.tsx`.
