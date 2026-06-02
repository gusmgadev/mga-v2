# Módulo Activos — Contexto

> Módulo del grupo **Servicios** en el dashboard. Equipos y hardware asociados a clientes.

---

## Tabla de base de datos

```sql
public.activos {
  id, nombre, tipo, marca, modelo, serie,
  cliente_id (FK → clientes),
  activo (bool), created_at
}
```

---

## Funcionalidad

| Feature | Estado |
|---------|--------|
| Lista | ✅ filtrable por cliente |
| Crear | ✅ |
| Editar | ✅ |
| Eliminar | ✅ |
| Quick-create desde otros módulos | ✅ |

---

## Quick-create desde otros módulos

`QuickCreateActivoModal` en `components/dashboard/QuickCreateActivoModal.tsx` permite crear un activo inline desde los formularios de nuevo servicio, nuevo presupuesto y editar presupuesto/servicio.

- Requiere `cliente_id` seleccionado previamente — botón `+` deshabilitado sin cliente (`opacity: 0.35, cursor: not-allowed`)
- Usa `createPortal(jsx, document.body)` para evitar `<form>` anidados en el DOM
- Se renderiza con `zIndex: 60` (sobre los modales padre que usan `zIndex: 50`)
- Al crear, llama `onCreated(activo)` → el formulario padre hace `form.setValue('activo_id', activo.id)`

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/activos` | GET + POST | Lista (filtrable por `cliente_id`) / crear |
| `/api/dashboard/activos/[id]` | GET + PUT + DELETE | Detalle / editar / eliminar |
