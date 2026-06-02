# Módulo Gastos — Contexto

> Módulo del grupo **Fondos** en el dashboard. Gastos mensuales personales y de empresa con plantilla fija, navegación por mes y asociación de tarjetas.

---

## Tablas de base de datos

```sql
-- Tarjetas de pago (catálogo compartido con Gastos)
public.tarjetas {
  id, nombre (text, ej. "VISA SANTANDER"), tipo (text, ej. "VISA"),
  banco (text nullable, ej. "SANTANDER"),
  activo (bool, default true), created_at
}
-- Tarjetas iniciales: VISA SANTANDER, TARJETA NARANJA, TARJETA LA ANONIMA
-- Migration: supabase/migrations/tarjetas.sql

-- Plantilla de gastos fijos (se replica cada mes)
public.gastos_plantilla {
  id, categoria (text), descripcion (text),
  monto_estimado (numeric nullable),
  activo (bool, default true), orden (int, default 0), created_at
}

-- Gastos del mes (copia de plantilla + gastos ad-hoc)
public.gastos {
  id, plantilla_id (FK nullable → gastos_plantilla ON DELETE SET NULL),
  mes (smallint 1-12), anio (smallint),
  categoria (text), descripcion (text),
  monto_estimado (numeric nullable), monto_real (numeric nullable),
  pagado (bool, default false),
  fecha_pago (date nullable), metodo_pago (text nullable),
  tarjeta_id (FK nullable → tarjetas ON DELETE SET NULL),
  notas (text nullable),
  created_at, updated_at
}
-- INDEX idx_gastos_mes_anio ON gastos(anio, mes)
-- Migrations: supabase/migrations/gastos.sql + supabase/migrations/tarjetas.sql
```

---

## Flujo completo

1. El usuario navega al mes con flechas prev/next.
2. Si el mes no tiene gastos y hay plantillas activas → banner azul "Inicializar con gastos fijos" → `POST /api/dashboard/gastos/inicializar` copia todas las plantillas activas al mes (idempotente: si ya hay gastos no hace nada).
3. La grilla muestra gastos agrupados por `categoria`, ordenados por `orden` de la plantilla.
4. Botón ✅ **Pagar** por fila → modal que captura `monto_real`, `fecha_pago`, `metodo_pago`. Si es TARJETA → selector de tarjeta del catálogo (o crear nueva inline).
5. Botón **"+ Agregar gasto"** → modal ad-hoc con categoría (datalist autocomplete), descripción, monto, notas.
6. Botón **"Plantilla fija"** → modal CRUD de `gastos_plantilla` (categoria, descripcion, monto_estimado, orden, activo).
7. Botón **"Tarjetas"** → modal CRUD del catálogo `tarjetas` (nombre, tipo, banco, activo).
8. KPI cards: Total estimado · Total pagado · Pendiente · N° sin pagar.

---

## Módulo Tarjetas — catálogo

- CRUD desde el modal "Tarjetas" en `GastosClient`
- Campos: `nombre` (display, ej. "VISA SANTANDER"), `tipo` (ej. "VISA", "MASTERCARD"), `banco` (nullable, ej. "SANTANDER"), `activo`
- Datalists precargados: tipos = VISA/MASTERCARD/NARANJA/AMEX/MAESTRO/CABAL/LA ANONIMA/DEBITO; bancos = SANTANDER/MACRO/GALICIA/BBVA/NACION/PROVINCIA/ICBC/HSBC/SUPERVIELLE/BRUBANK/UALA
- Al pagar con TARJETA: el select muestra `nombre — banco` y permite "+ Nueva tarjeta..." inline (crea y selecciona en el acto)
- En la tabla, la columna Fecha/Método muestra `tarjetas.nombre` si hay tarjeta asociada, sino `metodo_pago`
- Las rutas POST/PUT normalizan nombre, tipo y banco con `.toUpperCase()` antes de guardar

---

## Plantilla inicial (24 gastos en supabase/migrations/gastos.sql)

| Categoría | Ítems |
|-----------|-------|
| PRESTAMOS | PRESTAMO SILVIA, PRESTAMO HIPOTECARIO, MANTNIMIENTO CTAS, MERCADO PAGO, TARJETA LA ANONIMA, TARJETA NARANJA, TARJETA VISA SANTANDER |
| SERVICIOS | AGUA CASA, LUZ CASA, IMP INOMB TERRENO, GAS CASA, MONOTRIBU, SCPL INTERNET, CELULAR, PRESTAMO |
| SEGUROS | SEGURO PARTNER Y MOTO, PATENTE OROCH, PATENTE MOTO |
| PLAN AHORRO | TOYOTA PLAN |
| GASTO GUILLE | ALQUILER GUILLE |
| GASTO | CUOTA 5 MULTA |
| GASTO TIZI | VIAJE CHENQUE, VIAJE EGRESO, FIESTA EGRESO |

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/gastos` | GET `?mes=&anio=` | Lista gastos con join `tarjetas(id,nombre,tipo,banco)` |
| `/api/dashboard/gastos` | POST | Crear gasto ad-hoc |
| `/api/dashboard/gastos/[id]` | PUT | Editar / marcar pagado (incluye `tarjeta_id`) |
| `/api/dashboard/gastos/[id]` | DELETE | Eliminar |
| `/api/dashboard/gastos/inicializar` | POST `{mes,anio}` | Copia plantillas activas al mes (idempotente) |
| `/api/dashboard/gastos/plantilla` | GET / POST | CRUD plantilla |
| `/api/dashboard/gastos/plantilla/[id]` | PUT / DELETE | CRUD plantilla |
| `/api/dashboard/gastos/tarjetas` | GET / POST | CRUD catálogo de tarjetas |
| `/api/dashboard/gastos/tarjetas/[id]` | PUT / DELETE | CRUD catálogo de tarjetas |

---

## Estado del módulo

- ✅ Lista por mes con navegación prev/next
- ✅ Crear gasto ad-hoc
- ✅ Editar gasto
- ✅ Eliminar gasto
- ✅ Marcar pagado (monto real + fecha + método + tarjeta opcional)
- ✅ Plantilla de gastos fijos (CRUD)
- ✅ Inicialización automática del mes desde plantilla (idempotente)
- ✅ Catálogo de tarjetas (CRUD + crear inline desde modal Pagar)
- ✅ KPI cards (estimado / pagado / pendiente / sin pagar)
- ✅ Permisos can_view / can_create / can_edit / can_delete

---

## Notas importantes

- **GET siempre incluye join tarjetas** — `select('*, tarjetas(id, nombre, tipo, banco)')` tanto en GET de la lista como en el PUT `[id]`. Si se agrega otro campo a tarjetas, actualizar ambos selects.
- **Inicializar es idempotente** — `POST /inicializar` primero verifica si ya hay gastos para ese mes. Si `count > 0`, devuelve `{ creados: 0 }` sin insertar nada.
- **Permisos en DB** — en `role_permissions`: Administrador tiene CRUD completo; Usuario tiene can_view+can_create+can_edit pero NO can_delete.
- **`page.tsx` fetchea tres recursos en paralelo**: gastos del mes actual, todas las plantillas, todas las tarjetas. Los tres se pasan como `initialXxx` props a `GastosClient`.
