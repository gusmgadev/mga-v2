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
  valor, presupuesto_id (FK nullable → presupuestos ON DELETE SET NULL),
  created_at, updated_at
}

public.servicio_tareas {
  id, servicio_id (FK cascade), descripcion,
  estado ('INICIADA'|'EN PROCESO'|'PAUSADA'|'CANCELADA'|'TERMINADA'),
  fecha (date nullable),
  created_at
}

-- Presupuestos (cotizaciones)
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
-- No tiene campo `valor` — el total se calcula desde los ítems
-- `oportunidad_id` NO es columna en presupuestos (ver nota en sección Notas)

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
  estado ('NUEVA'|'PRIMER_CONTACTO_WS'|'EN_PROCESO'|'PRESUPUESTADA'|'GANADA'|'NO_GANADA'|'NO_OP', default 'NUEVA'),
  tipo_op ('OP_NUEVA'|'SEGUIMIENTO'|'CROSS_SELLING', default 'OP_NUEVA'),
  notas (text nullable), motivo_cierre (text nullable),
  servicio_id (FK nullable → servicios ON DELETE SET NULL),
  presupuesto_id (FK nullable → presupuestos ON DELETE SET NULL),
  fecha_ultimo_estado_final (timestamptz nullable),
  created_at, updated_at
}

-- Iteraciones / historial de contacto por oportunidad
public.oportunidad_iteraciones {
  id, oportunidad_id (FK cascade → oportunidades),
  tipo_contacto ('telefono'|'whatsapp'|'mail'|'presencial'|'otro'),
  contacto (text nullable), detalle (text nullable),
  fecha (date), created_at
}

-- SQL migrations pendientes (aplicar en Supabase si aún no están):
--   ALTER TABLE presupuestos ADD COLUMN fecha DATE DEFAULT CURRENT_DATE;
--   ALTER TABLE presupuestos ADD COLUMN nro_tarea INTEGER;
--   ALTER TABLE presupuestos ADD COLUMN archivo_url TEXT;
--   ALTER TABLE presupuestos ADD COLUMN servicio_id INTEGER REFERENCES servicios(id) ON DELETE SET NULL;
--   ALTER TABLE servicios ADD COLUMN presupuesto_id INTEGER REFERENCES presupuestos(id) ON DELETE SET NULL;
--   ALTER TABLE servicio_tareas ADD COLUMN fecha DATE;
--   -- Actualizar CHECK constraint de oportunidades (incluye PRESUPUESTADA):
--   ALTER TABLE oportunidades DROP CONSTRAINT IF EXISTS oportunidades_estado_check;
--   ALTER TABLE oportunidades ADD CONSTRAINT oportunidades_estado_check
--     CHECK (estado IN ('NUEVA','PRIMER_CONTACTO_WS','EN_PROCESO','PRESUPUESTADA','GANADA','NO_GANADA','NO_OP'));
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

**IMPORTANTE — seguridad Groq:** nunca commitear la API key en ningún archivo del repo (incluso `.docx` en carpetas ignoradas). GitHub secret scanning detecta keys y Groq las revoca automáticamente. Si se compromete una key: crear nueva en console.groq.com, actualizar en Vercel, hacer redeploy.

---

## Módulo Oportunidades — botón WhatsApp

**Comportamiento del botón WA en la grilla/modal:**
- Si `op.estado === 'NUEVA'`:
  - Abre `wa.me/{digits}?text={WA_MENSAJE}` (mensaje pre-cargado de presentación Zoologic)
  - Crea iteración automática: `{ tipo_contacto: 'whatsapp', contacto: nombre del cliente, detalle: 'Primer contacto por whatsapp' }`
  - Transiciona el estado a `PRIMER_CONTACTO_WS` de forma optimista (actualiza UI + PATCH a la API)
- Si `op.estado !== 'NUEVA'`:
  - Abre `wa.me/{digits}` sin texto pre-cargado
  - No crea iteración ni cambia estado

**Helpers (definidos FUERA del componente, a nivel de módulo):**
```ts
const WA_MENSAJE = "Hola, ¿cómo estás?..." // mensaje completo de presentación Zoologic
function whatsappUrl(phone: string, withMessage = false): string {
  const digits = phone.replace(/\D/g, '')
  return withMessage ? `https://wa.me/${digits}?text=${encodeURIComponent(WA_MENSAJE)}` : `https://wa.me/${digits}`
}
```

**Auto-transición en `saveIteracion`:**
Si se guarda una iteración con `tipo_contacto === 'whatsapp'` Y `detalle.toLowerCase().includes('primer contacto por whatsapp')` → transiciona estado a `PRIMER_CONTACTO_WS`. De lo contrario, si la op era `NUEVA` → transiciona a `EN_PROCESO` (comportamiento anterior).

**Estados y colores:**
- `NUEVA` → gris claro
- `PRIMER_CONTACTO_WS` → verde claro (`#DCFCE7` / `#15803D`) — WhatsApp green
- `EN_PROCESO` → azul
- `PRESUPUESTADA` → violeta claro — hay presupuesto generado, pendiente de cierre
- `GANADA` / `NO_GANADA` / `NO_OP` → estado final (setan `fecha_ultimo_estado_final`)

**Estados finales:** `['GANADA', 'NO_GANADA', 'NO_OP']` — al transicionar a cualquiera se setea `fecha_ultimo_estado_final`. `PRESUPUESTADA` NO es estado final.

**Filtro `__activas__`:** incluye `NUEVA`, `PRIMER_CONTACTO_WS`, `EN_PROCESO`, `PRESUPUESTADA`.

---

## Módulo Oportunidades — generar Presupuesto / Servicio

**Generar Presupuesto desde Oportunidad (`OportunidadesClient.tsx`):**
1. Usuario hace clic en "Crear presupuesto" → modal con `genPresupuestoTarget`
2. Selecciona/crea cliente (Quick-create con datos pre-cargados de la oportunidad), título, descripción, vencimiento
3. `POST /api/dashboard/presupuestos` con `{ ...formData, estado: 'BORRADOR', fecha: hoy, oportunidad_id: op.id, nro_tarea: op.nro_tarea, archivo_url? }`
4. La API route extrae `oportunidad_id` antes del INSERT (no es columna en presupuestos) y lo usa para actualizar `oportunidades.presupuesto_id = nuevo_id`
5. El cliente luego hace `PATCH /api/dashboard/oportunidades/:id` con `{ presupuesto_id, estado: 'PRESUPUESTADA' }`
6. Redirige al detalle del presupuesto

**Generar Servicio desde Presupuesto (`PresupuestoDetalleClient.tsx`):**
- Solo disponible cuando presupuesto está en estado `APROBADO` y no hay servicio asociado
- `POST /api/dashboard/servicios` con `{ titulo, descripcion, estado, estado_pago, valor, cliente_id, activo_id, presupuesto_id: presupuesto.id }`
- Redirige al detalle del servicio creado

**Transición automática de oportunidad al editar presupuesto:**
- `PUT /api/dashboard/presupuestos/:id` con `estado: 'APROBADO'` → oportunidad vinculada pasa a `GANADA` + setea `fecha_ultimo_estado_final`
- `PUT /api/dashboard/presupuestos/:id` con `estado: 'RECHAZADO'` → oportunidad vinculada pasa a `NO_GANADA` + setea `fecha_ultimo_estado_final`

---

## Presupuestos — flujo especial

- Al crear → redirige inmediatamente al detalle (`router.push(/dashboard/presupuestos/${id})`)
- `fecha` default: fecha del día, editable al crear y al editar
- El total se calcula desde ítems: `items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0)`
- Sin campo `valor` en la tabla — siempre calculado, no guardado
- `archivo_url`: URL de documento adjunto (PDF/DOC) subido a Supabase Storage bucket `presupuestos-docs`

**API routes:**

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/presupuestos` | GET | Lista con filtros `cliente_id`, `estado` |
| `/api/dashboard/presupuestos` | POST | Crear. Extrae `oportunidad_id` del payload y actualiza `oportunidades.presupuesto_id` |
| `/api/dashboard/presupuestos/[id]` | GET | Detalle con ítems |
| `/api/dashboard/presupuestos/[id]` | PUT | Editar. Auto-transiciona oportunidad si `estado` cambia a APROBADO/RECHAZADO |
| `/api/dashboard/presupuestos/[id]` | DELETE | Eliminar |
| `/api/dashboard/presupuestos/[id]/items` | POST | Agregar ítem |
| `/api/dashboard/presupuestos/[id]/items/[itemId]` | PUT / DELETE | Editar/eliminar ítem |

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
| Crear presupuesto desde Oportunidades | + Cliente (datos pre-cargados de la oportunidad) |

**Botón `+` deshabilitado:** cuando no hay `cliente_id` seleccionado y el activo lo necesita → `opacity: 0.35, cursor: not-allowed`.

---

## Servicios — botón "Cargar pago" en la grilla

La grilla de servicios (`ServiciosClient.tsx`) tiene un botón verde por fila (`DollarSign`) que abre un modal de carga rápida de pago, visible solo si `permisos.can_create`.

- Llama a `POST /api/dashboard/cobranzas` con `{ cliente_id, servicio_id, tipo: 'PAGO', monto, concepto, metodo_pago, fecha, notas }`
- **Método de pago por defecto: `TRANSFERENCIA`**
- **Monto pre-cargado con el saldo pendiente** (`Math.max(0, valor - totalPagado)`) — editable antes de confirmar
- Panel de contexto en el modal: chips Valor / Pagado / Saldo
- Actualización optimista: suma el monto a `totalPagado` y recalcula `estado_pago` en el estado local sin recargar
- Lógica optimista: `SIN CARGO` y `GARANTIA` se preservan; para el resto → `PENDIENTE → PAGO PARCIAL → PAGADO` según `totalPagado >= valor`

---

## Notas importantes — Servicios

- **Presupuestos sin `valor`** — el total es calculado, no guardado. No agregar esa columna.
- **Presupuestos — `oportunidad_id` NO es columna DB** — aparece en el createSchema de la API para routing, pero se extrae antes del INSERT (`const { oportunidad_id, ...insertData } = parsed.data`). Se usa para actualizar `oportunidades.presupuesto_id` con el ID del presupuesto recién creado.
- **Modales dentro de `<form>`** → usar siempre `createPortal(jsx, document.body)`. HTML prohíbe `<form>` anidados; sin portal causa error de hidratación. Aplica a `QuickCreateClienteModal` y `QuickCreateActivoModal`.
- **`servicios` — campo `fecha`** — columna `date` con default `CURRENT_DATE`. En JS formatear con `const [y,m,d] = fecha.split('-')` para evitar desfase UTC. La grilla ordena descendente por `fecha`. Saldo = `Math.max(0, valor - totalPagado)` calculado en cliente desde pagos de cobranzas.
- **`servicio_tareas` — campo `fecha`** — columna `date` nullable. Registra cuándo se realizó la tarea. Editable desde `ServicioDetalleClient`.
- **Tareas — auto-terminación del servicio:** al marcar una tarea como `TERMINADA`, si TODAS las tareas del servicio están `TERMINADA`, el servicio pasa automáticamente a `TERMINADO`.
- **Servicios — auto-reinicio por nueva tarea:** agregar una tarea a un servicio en estado `TERMINADO` lo reinicia a `EN PROCESO`.
- **Oportunidades — Groq TPD vs TPM:** El regex `/try again in ([\d.]+)s/` solo captura segundos; "9m19.008s" da 19s, no 9min. La detección de TPD depende del texto "per day"/"TPD" en el mensaje, no del tiempo de espera. Al detectar TPD → `break` inmediato del loop. No confundir con TPM (espera corta, reintentar una vez).
- **Oportunidades — `p.html` es `string | false`** en mailparser. Usar `(p.html || '')` no `(p.html ?? '')` — `??` no reemplaza `false`, solo `null`/`undefined`.
- **Oportunidades — WA auto-iteración:** `handleWhatsappClick` solo actúa si `op.estado === 'NUEVA'`. La iteración se crea con detalle exacto `'Primer contacto por whatsapp'` (minúsculas) para que la detección en `saveIteracion` funcione con `.includes()`.
- **Oportunidades — filtro `__activas__`** debe incluir `NUEVA`, `PRIMER_CONTACTO_WS`, `EN_PROCESO`, `PRESUPUESTADA`.
