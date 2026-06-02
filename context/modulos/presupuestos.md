# Módulo Presupuestos — Contexto

> Módulo del grupo **Servicios** en el dashboard. Cotizaciones con ítems, vinculadas a oportunidades y/o servicios.

---

## Tablas de base de datos

```sql
public.presupuestos {
  id, cliente_id (FK), activo_id (FK nullable),
  titulo, descripcion,
  estado ('BORRADOR'|'ENVIADO'|'APROBADO'|'RECHAZADO'|'VENCIDO'),
  fecha (date, default CURRENT_DATE),
  fecha_vencimiento (date nullable),
  nro_tarea (int nullable),
  archivo_url (text nullable),
  servicio_id (FK nullable → servicios ON DELETE SET NULL),
  created_at, updated_at
}
-- NO tiene campo `valor` — el total se calcula desde los ítems
-- `oportunidad_id` NO es columna DB (se extrae antes del INSERT para actualizar oportunidades.presupuesto_id)

public.presupuesto_items {
  id, presupuesto_id (FK cascade), descripcion, cantidad (numeric), precio_unitario (numeric),
  orden (int, default 0), created_at
}
-- subtotal = cantidad × precio_unitario (calculado en JS, no stored)

-- Migrations pendientes:
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS fecha DATE DEFAULT CURRENT_DATE;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS nro_tarea INTEGER;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS archivo_url TEXT;
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS servicio_id INTEGER REFERENCES servicios(id) ON DELETE SET NULL;
```

---

## Flujo

- Al crear → redirige inmediatamente al detalle: `router.push('/dashboard/presupuestos/${id}')`
- `fecha` default: fecha del día, editable al crear y al editar
- El total se calcula desde ítems: `items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0)`
- Sin campo `valor` en la tabla — siempre calculado, no guardado
- `archivo_url`: URL de documento adjunto (PDF/DOC) subido a Supabase Storage bucket `presupuestos-docs` (debe existir como Public)

---

## Quick-create inline

Los modales de crear/editar presupuesto permiten crear cliente o activo sin salir del formulario.

- `QuickCreateClienteModal` y `QuickCreateActivoModal` en `components/dashboard/`
- **Usan `createPortal(jsx, document.body)`** — OBLIGATORIO para evitar `<form>` anidados en el DOM (HTML no lo permite y causa error de hidratación)
- Se renderizan con `zIndex: 60` (sobre los modales padre que usan `zIndex: 50`)
- El activo requiere cliente seleccionado — botón `+` deshabilitado hasta que haya `cliente_id` (`opacity: 0.35, cursor: not-allowed`)

---

## Generar Servicio desde Presupuesto

- Solo disponible cuando el presupuesto está en estado `APROBADO` y no hay servicio asociado
- `POST /api/dashboard/servicios` con `{ titulo, descripcion, estado, estado_pago, valor, cliente_id, activo_id, presupuesto_id: presupuesto.id }`
- Redirige al detalle del servicio creado

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/presupuestos` | GET | Lista con filtros `cliente_id`, `estado` |
| `/api/dashboard/presupuestos` | POST | Crear. Extrae `oportunidad_id` del payload, actualiza `oportunidades.presupuesto_id` |
| `/api/dashboard/presupuestos/[id]` | GET | Detalle con ítems |
| `/api/dashboard/presupuestos/[id]` | PUT | Editar. Auto-transiciona oportunidad si `estado` cambia a APROBADO/RECHAZADO |
| `/api/dashboard/presupuestos/[id]` | DELETE | Eliminar |
| `/api/dashboard/presupuestos/[id]/items` | POST | Agregar ítem |
| `/api/dashboard/presupuestos/[id]/items/[itemId]` | PUT / DELETE | Editar/eliminar ítem |
| `/api/upload/presupuesto-doc` | POST | Sube PDF/DOC a Supabase Storage (`presupuestos-docs`) |

---

## Notas importantes

- **Sin campo `valor`** — el total es calculado, no guardado. No agregar esa columna a la tabla.
- **`oportunidad_id` NO es columna DB** — aparece en el createSchema Zod para routing, pero se extrae antes del INSERT: `const { oportunidad_id, ...insertData } = parsed.data`. Se usa para actualizar `oportunidades.presupuesto_id` con el ID del presupuesto recién creado.
- **Modales dentro de `<form>`** → usar siempre `createPortal(jsx, document.body)`. HTML prohíbe `<form>` anidados; sin portal causa error de hidratación en React.
- **Auto-transición oportunidad** — `PUT /[id]` con `estado: 'APROBADO'` → oportunidad vinculada pasa a `GANADA` + setea `fecha_ultimo_estado_final`. Con `RECHAZADO` → `NO_GANADA`.
