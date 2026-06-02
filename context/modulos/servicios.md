# Módulo Servicios — Contexto

> Módulo del grupo **Servicios** en el dashboard. Órdenes de trabajo con tareas, estados y pagos.

---

## Tablas de base de datos

```sql
public.servicios {
  id, cliente_id (FK), activo_id (FK nullable), titulo, descripcion,
  fecha (date, default CURRENT_DATE),
  estado ('INGRESADO'|'EN PROCESO'|'CANCELADO'|'RECHAZADO'|'TERMINADO'|'PRESUPUESTADO'),
  estado_pago ('PENDIENTE'|'SIN CARGO'|'GARANTIA'|'PAGO PARCIAL'|'PAGADO'),
  valor, presupuesto_id (FK nullable → presupuestos ON DELETE SET NULL),
  created_at, updated_at
}

public.servicio_tareas {
  id, servicio_id (FK cascade), descripcion,
  estado ('INICIADA'|'EN PROCESO'|'PAUSADA'|'CANCELADA'|'TERMINADA'),
  fecha (date nullable),
  created_at
}

-- Migrations pendientes:
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS presupuesto_id INTEGER REFERENCES presupuestos(id) ON DELETE SET NULL;
ALTER TABLE servicio_tareas ADD COLUMN IF NOT EXISTS fecha DATE;
```

---

## Lógica de tareas

- **Auto-terminación:** al marcar una tarea como `TERMINADA`, si TODAS las tareas del servicio están `TERMINADA`, el servicio pasa automáticamente a `TERMINADO`.
- **Auto-reinicio:** agregar una tarea a un servicio en estado `TERMINADO` lo reinicia a `EN PROCESO`.
- `servicio_tareas.fecha` — columna `date` nullable. Registra cuándo se realizó la tarea. Editable desde `ServicioDetalleClient`.

---

## Quick-create inline

Los modales de crear/editar servicio permiten crear cliente o activo sin salir del formulario.

- `QuickCreateClienteModal` y `QuickCreateActivoModal` en `components/dashboard/`
- **Usan `createPortal(jsx, document.body)`** — OBLIGATORIO para evitar `<form>` anidados en el DOM (HTML no lo permite y causa error de hidratación en React)
- Se renderizan con `zIndex: 60` (sobre los modales padre que usan `zIndex: 50`)
- El cliente que los usa mantiene el array de entidades en estado local (`localClientes`, `localActivos`) y llama `form.setValue(campo, id)` en el callback `onCreated`
- El activo requiere cliente seleccionado — botón `+` deshabilitado hasta que haya `cliente_id` (`opacity: 0.35, cursor: not-allowed`)

---

## Botón "Cargar pago" en la grilla

Botón verde por fila (`DollarSign`) en `ServiciosClient.tsx`, visible solo si `permisos.can_create`.

- Llama a `POST /api/dashboard/cobranzas` con `{ cliente_id, servicio_id, tipo: 'PAGO', monto, concepto, metodo_pago, fecha, notas }`
- **Método de pago por defecto: `TRANSFERENCIA`**
- **Monto pre-cargado con el saldo pendiente** (`Math.max(0, valor - totalPagado)`) — editable antes de confirmar
- Panel de contexto en el modal: chips Valor / Pagado / Saldo
- Actualización optimista: suma el monto a `totalPagado` y recalcula `estado_pago` en el estado local sin recargar
- Lógica optimista: `SIN CARGO` y `GARANTIA` se preservan; para el resto → `PENDIENTE → PAGO PARCIAL → PAGADO` según `totalPagado >= valor`

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/servicios` | GET + POST | Lista / crear |
| `/api/dashboard/servicios/[id]` | GET + PUT + DELETE | Detalle / editar / eliminar |
| `/api/dashboard/servicios/[id]/tareas` | GET + POST | Tareas del servicio |
| `/api/dashboard/servicios/[id]/tareas/[tareaId]` | PUT + DELETE | Editar/eliminar tarea |
| `/api/dashboard/servicios/[id]/pagos` | GET + POST | Pagos del servicio (cobranzas vinculadas) |
| `/api/dashboard/servicios/[id]/pagos/[pagoId]` | DELETE | Eliminar pago |

---

## Notas importantes

- **Campo `fecha`** — columna `date` con default `CURRENT_DATE`. En JS formatear con `const [y,m,d] = fecha.split('-')` para evitar desfase UTC. La grilla ordena descendente por `fecha`.
- **Saldo** = `Math.max(0, valor - totalPagado)` calculado en cliente desde pagos de cobranzas. No está stored en la tabla.
- **`SIN CARGO` y `GARANTIA`** se preservan en el optimistic update del pago — no se sobreescriben por la lógica de `totalPagado >= valor`.
