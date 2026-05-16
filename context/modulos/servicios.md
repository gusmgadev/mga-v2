# Módulo Servicios — Contexto

> Cubre los módulos del grupo **Servicios** en el dashboard: Oportunidades, Servicios, Presupuestos, Activos.

---

## Tablas de base de datos

```sql
-- Activos (equipos del cliente)
public.activos { id, nombre, tipo, marca, modelo, serie, cliente_id (FK), activo (bool), created_at }

-- Servicios (órdenes de trabajo)
public.servicios {
  id, cliente_id (FK), activo_id (FK nullable), titulo, descripcion,
  fecha (date, default CURRENT_DATE),
  estado ('INGRESADO'|'EN PROCESO'|'CANCELADO'|'RECHAZADO'|'TERMINADO'|'PRESUPUESTADO'),
  estado_pago ('PENDIENTE'|'SIN CARGO'|'GARANTIA'|'PAGO PARCIAL'|'PAGADO'),
  valor, created_at, updated_at
}

public.servicio_tareas {
  id, servicio_id (FK cascade), descripcion,
  estado ('INICIADA'|'EN PROCESO'|'PAUSADA'|'CANCELADA'|'TERMINADA'), created_at
}

-- Presupuestos (cotizaciones)
public.presupuestos {
  id, cliente_id (FK), activo_id (FK nullable), titulo, descripcion,
  estado ('BORRADOR'|'ENVIADO'|'APROBADO'|'RECHAZADO'|'VENCIDO'),
  fecha_vencimiento (date nullable), created_at, updated_at
}
-- No tiene campo `valor` — el total se calcula desde los ítems

public.presupuesto_items {
  id, presupuesto_id (FK cascade), descripcion, cantidad (numeric), precio_unitario (numeric),
  orden (int, default 0), created_at
}
-- subtotal = cantidad × precio_unitario (calculado en JS, no stored)

-- Oportunidades comerciales (extraídas desde email con Groq Llama 3.3)
public.oportunidades {
  id, nro_tarea (int nullable), nro_oportunidad (int nullable), nro_oportunidad_origen (int nullable),
  titulo, registrada_por, fecha_inicio (date nullable), fecha_vencimiento (date nullable),
  tipo_tarea, cliente_codigo, cliente_nombre, origen, tipo_oportunidad, zona_gestion,
  primer_nombre, apellido, empresa, provincia_ciudad, telefono, email_contacto, comentarios,
  email_subject, email_from, email_fecha (timestamptz nullable),
  email_message_id (text, unique — deduplicación),
  tipo_op ('OP_NUEVA'|'SEGUIMIENTO'|'CROSS_SELLING', default 'OP_NUEVA'),
  created_at
}
-- SQL migrations (aplicar en Supabase si aún no están):
--   ALTER TABLE oportunidades ADD COLUMN tipo_op TEXT DEFAULT 'OP_NUEVA';
--   ALTER TABLE oportunidades ADD COLUMN nro_oportunidad_origen INTEGER;
```

---

## Módulo Oportunidades — extracción desde email

**Flujo completo:**
1. `OportunidadesClient` busca emails via `POST /api/dashboard/oportunidades/buscar-emails` (ImapFlow + Gmail IMAP)
2. El usuario selecciona emails y elige tipo: OP_NUEVA / SEGUIMIENTO / CROSS_SELLING
3. `POST /api/dashboard/oportunidades/extraer` procesa cada email con Groq Llama 3.3 (json_object mode)
4. Deduplicación por `email_message_id` — si ya existe se cuenta como duplicado y se salta
5. Los campos extraídos se insertan en `oportunidades` junto con metadata del email

**Comportamiento ante rate limits de Groq:**
- **TPD (tokens/día agotados):** el mensaje contiene "per day" o "TPD" → falla inmediatamente, sin espera ni reintento. El loop rompe con `break` — todos los emails restantes también se saltan.
- **TPM (tokens/minuto):** mensaje trae `try again in Xs` con X ≤ 30 → espera ese tiempo + 500ms y reintenta una vez.
- Si el wait del TPM es > 30s, se trata como error permanente (evita confundir con TPD disfrazado).
- Delay de 1.200ms entre llamadas para reducir presión sobre TPM.

**Límite práctico del free tier de Groq:**
- 100.000 tokens/día. Cada email usa ~1.000-1.500 tokens → máximo ~65-100 extracciones/día.
- **Extraer en lotes de máximo 10-12 emails** por sesión para no agotar el cupo.
- El límite diario se resetea a las 00:00 UTC.

**Campos extraídos automáticamente:** nro_tarea, nro_oportunidad, nro_oportunidad_origen (número después de "Contactar Oportunidad" en el título), titulo, registrada_por, fechas, tipo_tarea, cliente_codigo, cliente_nombre, origen, tipo_oportunidad, zona_gestion, datos de contacto, comentarios.

**Variables de entorno para Oportunidades:**
```
GMAIL_IMAP_USER=      # dirección Gmail
GMAIL_IMAP_PASSWORD=  # App Password de Google (no la contraseña real)
```
GROQ_API_KEY es compartida con el módulo de voz/remitos.

---

## Presupuestos — flujo especial

- Al crear → redirige inmediatamente al detalle (`router.push(/dashboard/presupuestos/${id})`)
- El total se calcula: `items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0)`
- Sin campo `valor` en la tabla — siempre calculado desde ítems

---

## Quick-create inline (modales dentro de formularios)

Patrón para crear entidades relacionadas sin salir del formulario actual.

**Componentes:** `QuickCreateClienteModal` y `QuickCreateActivoModal` en `components/dashboard/`.
- Reciben `onClose` y `onCreated(entidad)` como props
- **Usan `createPortal(jsx, document.body)`** — OBLIGATORIO para evitar `<form>` anidados en el DOM (HTML no lo permite y causa error de hidratación)
- Se renderizan con `zIndex: 60` (sobre los modales padre que usan `zIndex: 50`)
- El cliente que los usa mantiene el array de entidades en estado local (`localClientes`, `localActivos`) y llama `form.setValue(campo, id)` en el callback `onCreated`

**Dónde están integrados:**
| Lugar | Quick-create disponible |
|-------|------------------------|
| Nuevo presupuesto / nuevo servicio | + Cliente + Activo (activo requiere cliente seleccionado) |
| Editar presupuesto / servicio (detalle) | + Activo (cliente fijo, pre-rellenado) |
| Nuevo / editar activo | + Cliente |

**Botón `+` deshabilitado:** cuando no hay `cliente_id` seleccionado y el activo lo necesita → `opacity: 0.35, cursor: not-allowed`.

---

## Notas importantes — Servicios

- **Presupuestos sin `valor`** — el total es calculado, no guardado. No agregar esa columna.
- **Modales dentro de `<form>`** → usar siempre `createPortal(jsx, document.body)`. HTML prohíbe `<form>` anidados; sin portal causa error de hidratación. Aplica a `QuickCreateClienteModal` y `QuickCreateActivoModal`.
- **`servicios` — campo `fecha`** — columna `date` con default `CURRENT_DATE`. En JS formatear con `const [y,m,d] = fecha.split('-')` para evitar desfase UTC. La grilla ordena descendente por `fecha`. Saldo = `Math.max(0, valor - totalPagado)` calculado en cliente desde pagos de cobranzas.
- **Oportunidades — Groq TPD vs TPM:** El regex `/try again in ([\d.]+)s/` solo captura segundos; "9m19.008s" da 19s, no 9min. La detección de TPD depende del texto "per day"/"TPD" en el mensaje, no del tiempo de espera. Al detectar TPD → `break` inmediato del loop. No confundir con TPM (espera corta, reintentar una vez).
- **Oportunidades — `p.html` es `string | false`** en mailparser. Usar `(p.html || '')` no `(p.html ?? '')` — `??` no reemplaza `false`, solo `null`/`undefined`.
