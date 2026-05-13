# Prompt para Claude Code
## Sistema de Remitos y Stock por Voz — Next.js + TypeScript + Supabase

---

## Cómo usar este documento

1. Abrí Claude Code en tu proyecto (`claude` en terminal o desde VS Code)
2. Pegá el prompt completo de la sección siguiente
3. Claude explorará el proyecto antes de escribir código
4. Revisá que haya entendido bien la estructura antes de que continúe
5. Si algo no coincide, corregilo antes de que avance al Paso 2

## Variables de entorno necesarias (.env.local)

```
GROQ_API_KEY=              # Conseguila gratis en console.groq.com
NEXT_PUBLIC_SUPABASE_URL=  # Ya deberías tenerla
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Ya deberías tenerla
```

---

## Prompt completo para Claude Code

```
Sos un desarrollador senior trabajando en mi proyecto Next.js + TypeScript.
Antes de escribir cualquier código, necesito que explores el proyecto y entiendas
la estructura existente.

---

## PASO 1 — EXPLORACIÓN DEL PROYECTO (hacé esto primero)

1. Revisá la estructura de carpetas completa del proyecto
2. Encontrá y leé los archivos de configuración de Supabase:
   - Buscá supabase.ts, supabaseClient.ts, o similar en /lib, /utils, /services
   - Fijate si usan @supabase/supabase-js directamente, Server Actions, o API Routes
3. Revisá cómo se hace una consulta típica a Supabase en el proyecto
   (buscá un archivo existente que haga un SELECT o INSERT como referencia)
4. Revisá la estructura de carpetas de las rutas/páginas existentes para seguir
   el mismo patrón de organización
5. Fijate qué convenciones de naming usan (camelCase, snake_case, etc.)
6. Revisá si hay un archivo de tipos TypeScript global (types.ts, index.d.ts, etc.)
7. Revisá cómo están construidos los componentes propios de UI (estructura, props, estilos)

Contame lo que encontraste antes de continuar.

---

## PASO 2 — CREAR LAS TABLAS EN SUPABASE

Una vez que entendiste la estructura, ejecutá las siguientes migraciones SQL
en Supabase (Dashboard → SQL Editor):

-- Tabla maestra de orígenes y destinos
CREATE TABLE origenes_destinos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   uuid REFERENCES empresas(id) ON DELETE CASCADE,
  tipo         text CHECK (tipo IN ('proveedor','sucursal','deposito','cliente','otro')) NOT NULL,
  nombre       text NOT NULL,
  activo       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

-- Cabecera del remito / movimiento de stock
CREATE TABLE remitos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id            uuid REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id            uuid REFERENCES usuarios(id),
  numero_tipo           text CHECK (numero_tipo IN ('automatico','manual','proveedor')) NOT NULL DEFAULT 'automatico',
  numero                text NOT NULL,
  tipo                  text CHECK (tipo IN ('entrada','salida')) NOT NULL,
  fecha                 date NOT NULL DEFAULT CURRENT_DATE,
  origen_destino_id     uuid REFERENCES origenes_destinos(id),
  origen_destino_texto  text,
  observaciones         text,
  audio_url             text,
  transcripcion         text,
  estado                text CHECK (estado IN ('borrador','confirmado','anulado')) DEFAULT 'borrador',
  confirmado_at         timestamptz,
  created_at            timestamptz DEFAULT now()
);

-- Ítems del remito
CREATE TABLE remito_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remito_id         uuid REFERENCES remitos(id) ON DELETE CASCADE,
  producto_id       uuid REFERENCES productos(id),
  nombre_detectado  text,
  cantidad          numeric NOT NULL,
  cantidad_asumida  boolean DEFAULT false,
  unidad            text,
  costo             numeric,
  precio_venta      numeric,
  confianza         numeric CHECK (confianza >= 0 AND confianza <= 1),
  es_producto_nuevo boolean DEFAULT false,
  orden             int DEFAULT 0
);

-- Movimientos de stock (se generan al CONFIRMAR el remito)
CREATE TABLE movimientos_stock (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      uuid REFERENCES empresas(id),
  producto_id     uuid REFERENCES productos(id),
  remito_id       uuid REFERENCES remitos(id),
  remito_item_id  uuid REFERENCES remito_items(id),
  tipo            text CHECK (tipo IN ('entrada','salida','ajuste')) NOT NULL,
  cantidad        numeric NOT NULL,
  costo           numeric,
  stock_antes     numeric,
  stock_despues   numeric,
  created_at      timestamptz DEFAULT now()
);

-- Tabla de productos/artículos
CREATE TABLE productos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    uuid REFERENCES empresas(id) ON DELETE CASCADE,
  codigo        text,
  nombre        text NOT NULL,
  marca         text,
  unidad        text DEFAULT 'unidad',
  rubro         text,
  subrubro      text,
  stock_actual  numeric DEFAULT 0,
  costo         numeric,
  precio_venta  numeric,
  activo        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Aliases de productos (para el matching por voz)
CREATE TABLE aliases_productos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  alias       text NOT NULL,
  empresa_id  uuid REFERENCES empresas(id),
  created_at  timestamptz DEFAULT now()
);

-- Matching aproximado con pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_productos_nombre_trgm ON productos USING GIN (nombre gin_trgm_ops);
CREATE INDEX idx_aliases_trgm ON aliases_productos USING GIN (alias gin_trgm_ops);

-- RLS por empresa
ALTER TABLE origenes_destinos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE remito_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock   ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliases_productos   ENABLE ROW LEVEL SECURITY;

-- Función para confirmar remito en transacción atómica
CREATE OR REPLACE FUNCTION confirmar_remito(p_remito_id uuid)
RETURNS void AS $$
DECLARE
  v_item        remito_items%ROWTYPE;
  v_stock_antes numeric;
  v_stock_despues numeric;
  v_tipo        text;
BEGIN
  SELECT tipo INTO v_tipo FROM remitos WHERE id = p_remito_id;

  FOR v_item IN SELECT * FROM remito_items WHERE remito_id = p_remito_id LOOP
    SELECT stock_actual INTO v_stock_antes FROM productos WHERE id = v_item.producto_id;

    IF v_tipo = 'entrada' THEN
      v_stock_despues := v_stock_antes + v_item.cantidad;
    ELSE
      v_stock_despues := v_stock_antes - v_item.cantidad;
    END IF;

    UPDATE productos SET
      stock_actual = v_stock_despues,
      costo = COALESCE(v_item.costo, costo),
      precio_venta = COALESCE(v_item.precio_venta, precio_venta)
    WHERE id = v_item.producto_id;

    INSERT INTO movimientos_stock
      (empresa_id, producto_id, remito_id, remito_item_id, tipo, cantidad, costo, stock_antes, stock_despues)
    SELECT
      r.empresa_id, v_item.producto_id, p_remito_id, v_item.id,
      v_tipo, v_item.cantidad, v_item.costo, v_stock_antes, v_stock_despues
    FROM remitos r WHERE r.id = p_remito_id;
  END LOOP;

  UPDATE remitos SET estado = 'confirmado', confirmado_at = now() WHERE id = p_remito_id;
END;
$$ LANGUAGE plpgsql;

---

## PASO 3 — TIPOS TYPESCRIPT

Creá o actualizá el archivo de tipos del proyecto (en la ubicación que
encontraste en el PASO 1) con estos tipos:

export type TipoMovimiento     = 'entrada' | 'salida'
export type EstadoRemito       = 'borrador' | 'confirmado' | 'anulado'
export type TipoOrigenDestino  = 'proveedor' | 'sucursal' | 'deposito' | 'cliente' | 'otro'
export type TipoNumeracion     = 'automatico' | 'manual' | 'proveedor'

export interface OrigenDestino {
  id: string
  empresa_id: string
  tipo: TipoOrigenDestino
  nombre: string
  activo: boolean
  created_at: string
}

export interface Producto {
  id: string
  empresa_id: string
  codigo?: string
  nombre: string
  marca?: string
  unidad: string
  rubro?: string
  subrubro?: string
  stock_actual: number
  costo?: number
  precio_venta?: number
  activo: boolean
  created_at: string
}

export interface Remito {
  id: string
  empresa_id: string
  usuario_id: string
  numero_tipo: TipoNumeracion
  numero: string
  tipo: TipoMovimiento
  fecha: string
  origen_destino_id?: string
  origen_destino_texto?: string
  observaciones?: string
  audio_url?: string
  transcripcion?: string
  estado: EstadoRemito
  confirmado_at?: string
  created_at: string
  origen_destino?: OrigenDestino
  items?: RemitoItem[]
}

export interface RemitoItem {
  id: string
  remito_id: string
  producto_id?: string
  nombre_detectado?: string
  cantidad: number
  cantidad_asumida: boolean
  unidad?: string
  costo?: number
  precio_venta?: number
  confianza?: number
  es_producto_nuevo: boolean
  orden: number
  producto?: Producto
}

export interface MovimientoStock {
  id: string
  empresa_id: string
  producto_id: string
  remito_id: string
  remito_item_id: string
  tipo: TipoMovimiento | 'ajuste'
  cantidad: number
  costo?: number
  stock_antes: number
  stock_despues: number
  created_at: string
}

export interface ProductoDetectado {
  nombre_detectado: string
  cantidad: number
  cantidad_asumida: boolean
  unidad: string | null
  costo: number | null
  precio_venta: number | null
}

export interface ProductoConMatch extends ProductoDetectado {
  producto_match?: Producto
  confianza: number
  es_producto_nuevo: boolean
}

---

## PASO 4 — FUNCIONES DE ACCESO A DATOS

Siguiendo el patrón que encontraste en el PASO 1, creá estas funciones:

1. getOriginesDestinos(empresaId)     — listar orígenes/destinos activos
2. createOrigenDestino(data)          — crear uno nuevo
3. createRemito(data)                 — crear remito en estado borrador
4. addRemitoItem(remitoId, item)      — agregar ítem al remito
5. updateRemitoItem(itemId, data)     — editar ítem (cantidad, precios, etc.)
6. deleteRemitoItem(itemId)           — eliminar ítem
7. confirmarRemito(remitoId)          — llama a la RPC confirmar_remito()
8. buscarProductosPorNombre(nombre, empresaId) — búsqueda con pg_trgm
9. getRemitos(empresaId, filtros?)    — listar con paginación
10. getRemitoById(id)                 — remito completo con items y origen_destino

Para el cliente Groq usá:

// Transcripción
const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
  body: formData  // FormData con archivo de audio y model: 'whisper-large-v3'
})

// Extracción con Llama 3.3
const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptConTranscripcion }],
    response_format: { type: 'json_object' }
  })
})

Prompt de extracción para Llama 3.3:

Analizá el siguiente texto dictado para un sistema de ingreso de stock.
Extraé todos los productos mencionados. La cantidad SIEMPRE se dice ANTES del nombre.

Patrones válidos:
- "15 bolsas alimento Excellent cachorro 20 kilos" → cantidad: 15, unidad: "bolsa"
- "5 yerbas Amanda kilo" → cantidad: 5, unidad: "kg"
- "shampoo Petys" → cantidad: 1 (asumida), cantidad_asumida: true

Texto: "{transcripcion}"

Devolvé ÚNICAMENTE este JSON sin texto adicional:
{
  "productos": [
    {
      "nombre_detectado": string,
      "cantidad": number,
      "cantidad_asumida": boolean,
      "unidad": string | null,
      "costo": number | null,
      "precio_venta": number | null
    }
  ]
}

Reglas de unidades: kilo/kg→"kg", bolsa/s→"bolsa", caja/s→"caja", sin unidad→"unidad"
Si no hay cantidad antes del producto: cantidad 1, cantidad_asumida: true

---

## PASO 5 — PÁGINAS Y COMPONENTES

### 5.1 Página: listado de remitos  (/remitos)
- Tabla: número, fecha, tipo entrada/salida, origen/destino, estado, cantidad de ítems
- Filtros: por tipo, estado, rango de fechas
- Botones: "Nuevo remito por voz" y "Nuevo remito manual"

### 5.2 Página: crear/editar remito  (/remitos/nuevo  y  /remitos/[id])

Sección 1 — Encabezado:
- Selector entrada/salida (visual, prominente, con color diferenciado)
- Tipo de numeración: automático (REM-0001) / manual / número de proveedor
- Fecha
- Tipo de origen/destino + nombre + botón "Agregar nuevo"
- Observaciones

Sección 2 — Carga de ítems por voz:
- Botón de grabación (MediaRecorder API)
- Estados visibles: grabando / procesando / listo
- Tabla editable con columnas:
  producto | cantidad (input + badge de unidad) | costo | precio venta | confianza | eliminar
- Filas con cantidad_asumida=true: destacar con fondo/borde amarillo y texto de aviso
- Botón "Agregar ítem manualmente"

Botón "Confirmar remito":
- Visible solo cuando hay al menos 1 ítem
- Pide confirmación con resumen: N productos, tipo, origen/destino
- Llama a confirmarRemito() y redirige al listado

### 5.3 Componente reutilizable: VoiceRecorder
- Graba audio con MediaRecorder API
- Al terminar envía a Server Action / API Route que:
  1. Sube el audio a Supabase Storage
  2. Transcribe con Groq Whisper
  3. Extrae productos con Groq Llama 3.3
  4. Busca cada producto en la BD con pg_trgm
  5. Retorna los ítems con match y porcentaje de confianza

---

## RESTRICCIONES IMPORTANTES

- No rompas ningún archivo existente
- Seguí exactamente la estructura de carpetas del proyecto
- Usá los componentes de UI propios que ya existen
- No instales librerías de UI nuevas
- Si encontrás algo que no coincide con lo esperado, preguntá antes de continuar
- Hacé un commit lógico por cada paso completado

---

## CONTEXTO DEL NEGOCIO

Comercios (veterinarias, ferreterías, distribuidoras) registran ingresos y
egresos de mercadería dictando por voz. Flujo completo:

1. El usuario crea un remito (tipo, fecha, origen/destino, número)
2. Dicta los productos por voz ("5 bolsas alimento Excellent cachorro...")
3. La IA transcribe y extrae productos con cantidades y precios
4. El sistema busca coincidencias en la BD por nombre aproximado
5. El usuario revisa y edita la tabla de ítems
6. Confirma el remito → stock se actualiza automáticamente con trazabilidad completa

Empezá por el PASO 1 (exploración) y contame lo que encontraste.
```
