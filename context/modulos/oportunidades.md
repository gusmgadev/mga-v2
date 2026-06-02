# Módulo Oportunidades — Contexto

> Módulo del grupo **Servicios** en el dashboard. Gestión de oportunidades comerciales extraídas desde email con Groq Llama 3.3.

---

## Tablas de base de datos

```sql
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

public.oportunidad_iteraciones {
  id, oportunidad_id (FK cascade → oportunidades),
  tipo_contacto ('telefono'|'whatsapp'|'mail'|'presencial'|'otro'),
  contacto (text nullable), detalle (text nullable),
  fecha (date), created_at
}

-- Migration pendiente (CHECK constraint actualizado):
ALTER TABLE oportunidades DROP CONSTRAINT IF EXISTS oportunidades_estado_check;
ALTER TABLE oportunidades ADD CONSTRAINT oportunidades_estado_check
  CHECK (estado IN ('NUEVA','PRIMER_CONTACTO_WS','EN_PROCESO','PRESUPUESTADA','GANADA','NO_GANADA','NO_OP'));
```

---

## Extracción desde email

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

**Variables de entorno:**
```
GMAIL_IMAP_USER=      # dirección Gmail
GMAIL_IMAP_PASSWORD=  # App Password de Google (no la contraseña real)
GROQ_API_KEY=         # compartida con el módulo de remitos/voz
```

**IMPORTANTE — seguridad Groq:** nunca commitear la API key en ningún archivo del repo (incluso `.docx` en carpetas ignoradas). GitHub secret scanning detecta keys y Groq las revoca automáticamente. Si se compromete una key: crear nueva en console.groq.com, actualizar en Vercel, hacer redeploy.

---

## Botón WhatsApp

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
  return withMessage
    ? `https://wa.me/${digits}?text=${encodeURIComponent(WA_MENSAJE)}`
    : `https://wa.me/${digits}`
}
```

**Auto-transición en `saveIteracion`:**
- Si `tipo_contacto === 'whatsapp'` Y `detalle.toLowerCase().includes('primer contacto por whatsapp')` → transiciona a `PRIMER_CONTACTO_WS`
- Si la op era `NUEVA` y no aplica lo anterior → transiciona a `EN_PROCESO`

---

## Estados

| Estado | Color | Final |
|--------|-------|-------|
| `NUEVA` | gris claro | No |
| `PRIMER_CONTACTO_WS` | `#DCFCE7` / `#15803D` (WhatsApp green) | No |
| `EN_PROCESO` | azul | No |
| `PRESUPUESTADA` | violeta claro — hay presupuesto generado, pendiente de cierre | No |
| `GANADA` | verde | Sí |
| `NO_GANADA` | rojo | Sí |
| `NO_OP` | gris | Sí |

**Estados finales:** `['GANADA', 'NO_GANADA', 'NO_OP']` — al transicionar a cualquiera se setea `fecha_ultimo_estado_final`. `PRESUPUESTADA` NO es estado final.

**Filtro `__activas__`:** incluye `NUEVA`, `PRIMER_CONTACTO_WS`, `EN_PROCESO`, `PRESUPUESTADA`.

---

## Generar Presupuesto desde Oportunidad

1. Usuario hace clic en "Crear presupuesto" → modal con `genPresupuestoTarget`
2. Selecciona/crea cliente (Quick-create con datos pre-cargados de la oportunidad), título, descripción, vencimiento
3. `POST /api/dashboard/presupuestos` con `{ ...formData, estado: 'BORRADOR', fecha: hoy, oportunidad_id: op.id, nro_tarea: op.nro_tarea, archivo_url? }`
4. La API route extrae `oportunidad_id` antes del INSERT (no es columna en presupuestos) y lo usa para actualizar `oportunidades.presupuesto_id = nuevo_id`
5. El cliente luego hace `PATCH /api/dashboard/oportunidades/:id` con `{ presupuesto_id, estado: 'PRESUPUESTADA' }`
6. Redirige al detalle del presupuesto

**Transición automática al editar presupuesto:**
- `PUT /api/dashboard/presupuestos/:id` con `estado: 'APROBADO'` → oportunidad vinculada pasa a `GANADA` + setea `fecha_ultimo_estado_final`
- `PUT /api/dashboard/presupuestos/:id` con `estado: 'RECHAZADO'` → oportunidad vinculada pasa a `NO_GANADA` + setea `fecha_ultimo_estado_final`

---

## API routes

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/dashboard/oportunidades` | GET + POST | Lista / crear |
| `/api/dashboard/oportunidades/[id]` | PATCH + DELETE | Editar / eliminar |
| `/api/dashboard/oportunidades/[id]/iteraciones` | GET + POST | Historial de contacto |
| `/api/dashboard/oportunidades/[id]/iteraciones/[iteracionId]` | PUT + DELETE | Editar/eliminar iteración |
| `/api/dashboard/oportunidades/buscar-emails` | POST | Busca emails en Gmail IMAP |
| `/api/dashboard/oportunidades/extraer` | POST | Extrae oportunidades con Groq Llama 3.3 |

---

## Notas importantes

- **Groq TPD vs TPM:** El regex `/try again in ([\d.]+)s/` solo captura segundos; "9m19.008s" da 19s, no 9min. La detección de TPD depende del texto "per day"/"TPD" en el mensaje, no del tiempo de espera. Al detectar TPD → `break` inmediato del loop.
- **`p.html` es `string | false`** en mailparser. Usar `(p.html || '')` no `(p.html ?? '')` — `??` no reemplaza `false`, solo `null`/`undefined`.
- **WA auto-iteración:** `handleWhatsappClick` solo actúa si `op.estado === 'NUEVA'`. La iteración se crea con detalle exacto `'Primer contacto por whatsapp'` (minúsculas) para que la detección en `saveIteracion` funcione con `.includes()`.
- **Filtro `__activas__`** debe incluir `NUEVA`, `PRIMER_CONTACTO_WS`, `EN_PROCESO`, `PRESUPUESTADA`.
