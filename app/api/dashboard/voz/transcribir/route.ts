import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import type { ProductoDetectado, ProductoConMatch } from '@/types/stock'

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

const EXTRACCION_PROMPT = `Analizá el siguiente texto dictado para un sistema de ingreso de stock.
Extraé todos los productos mencionados.

Palabras clave opcionales que actúan como SEPARADORES y aportan datos del producto que las precede:
- "cantidad N"           → la cantidad es N
- "codigo X"            → el código del producto es X (alfanumérico, tal cual se dice)
- "costo N"             → el costo unitario es N
- "precio de costo N"   → ídem anterior
- "venta N"             → el precio de venta es N
- "precio de venta N"   → ídem anterior

Cada palabra clave señala que terminó el nombre del producto anterior. Son todas opcionales y pueden combinarse.

La cantidad también puede ir ANTES del nombre (sin palabra clave):
- "15 bolsas alimento Excellent cachorro" → cantidad: 15, unidad: "bolsa"

Ejemplos:
- "pendrive kingston 128gb cantidad 5"
  → {nombre: "pendrive kingston 128gb", codigo: null, cantidad: 5}
- "mouse logitech codigo ML200 cantidad 3 costo 1500 venta 2500"
  → {nombre: "mouse logitech", codigo: "ML200", cantidad: 3, costo: 1500, precio_venta: 2500}
- "15 bolsas alimento Excellent cachorro 20 kilos precio de costo 8000 precio de venta 12000"
  → {nombre: "alimento Excellent cachorro 20 kilos", codigo: null, cantidad: 15, unidad: "bolsa", costo: 8000, precio_venta: 12000}
- "shampoo Petys cantidad 2 teclado genius cantidad 1 costo 800"
  → dos productos: shampoo Petys (cantidad 2) y teclado genius (cantidad 1, costo 800)
- "shampoo Petys"
  → {nombre: "shampoo Petys", codigo: null, cantidad: 1, cantidad_asumida: true}

Texto: "{transcripcion}"

Devolvé ÚNICAMENTE este JSON sin texto adicional:
{
  "productos": [
    {
      "nombre_detectado": string,
      "codigo_detectado": string | null,
      "cantidad": number,
      "cantidad_asumida": boolean,
      "unidad": string | null,
      "costo": number | null,
      "precio_venta": number | null
    }
  ]
}

Reglas de unidades: kilo/kg→"kg", bolsa/s→"bolsa", caja/s→"caja", sin unidad→"unidad"
Si no hay cantidad explícita: cantidad 1, cantidad_asumida: true
Si no se dice "codigo": codigo_detectado: null`

export async function POST(req: Request) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 })
  }

  const formData = await req.formData()
  const audioBlob = formData.get('audio') as File | null
  const remitoId = formData.get('remito_id') as string | null

  if (!audioBlob) return NextResponse.json({ error: 'Audio requerido' }, { status: 400 })

  // 1. Subir audio a Supabase Storage
  const fileName = `${remitoId ?? 'tmp'}/${Date.now()}.webm`
  const audioBuffer = Buffer.from(await audioBlob.arrayBuffer())

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('remitos-audio')
    .upload(fileName, audioBuffer, { contentType: 'audio/webm', upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('remitos-audio')
    .getPublicUrl(uploadData.path)

  // 2. Transcribir con Groq Whisper
  const whisperForm = new FormData()
  whisperForm.append('file', audioBlob, 'audio.webm')
  whisperForm.append('model', 'whisper-large-v3')
  whisperForm.append('language', 'es')

  const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: whisperForm,
  })

  if (!whisperRes.ok) {
    const err = await whisperRes.text()
    return NextResponse.json({ error: `Error Whisper: ${err}` }, { status: 500 })
  }

  const { text: transcripcion } = await whisperRes.json()

  // 3. Extraer productos con Llama 3.3
  const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: EXTRACCION_PROMPT.replace('{transcripcion}', transcripcion) }],
      response_format: { type: 'json_object' },
    }),
  })

  if (!llmRes.ok) {
    const err = await llmRes.text()
    return NextResponse.json({ error: `Error LLM: ${err}` }, { status: 500 })
  }

  const llmData = await llmRes.json()
  let productosDetectados: ProductoDetectado[] = []
  try {
    const parsed = JSON.parse(llmData.choices[0].message.content)
    productosDetectados = parsed.productos ?? []
  } catch {
    return NextResponse.json({ error: 'Error al parsear respuesta del LLM' }, { status: 500 })
  }

  // 4. Buscar matches para cada producto detectado
  const itemsConMatch: ProductoConMatch[] = []
  for (const prod of productosDetectados) {
    let bestMatch: { id: string; nombre: string; codigo: string | null; marca: string | null; unidad: string; stock_actual: number; costo: number | null; precio_venta: number | null; confianza: number } | null = null

    // Intento 0: coincidencia exacta de código (confianza 100%)
    // "codigo" es opcional — si no se dijo, prueba nombre_detectado como código
    const codigoExplicito = prod.codigo_detectado?.trim() ?? null
    const codigoImplicito = prod.nombre_detectado.trim()
    const codigoQuery = codigoExplicito ?? codigoImplicito
    // Versión normalizada: sin espacios ni guiones (cubre variaciones de transcripción)
    const codigoNorm = codigoQuery.replace(/[\s\-\.]/g, '')

    if (codigoQuery.length > 0) {
      const { data: codeExact } = await supabaseAdmin
        .from('productos')
        .select('id, nombre, codigo, marca, unidad, stock_actual, costo, precio_venta')
        .eq('activo', true)
        .ilike('codigo', codigoQuery)
        .limit(1)
        .maybeSingle()
      if (codeExact) {
        bestMatch = { ...codeExact, codigo: codeExact.codigo ?? null, confianza: 1.0 }
      }
    }

    // Intento 0b: código normalizado (cubre "KB 2400" → "KB2400", etc.)
    if (!bestMatch && codigoNorm.length > 0 && codigoNorm !== codigoQuery) {
      const { data: codeNorm } = await supabaseAdmin
        .from('productos')
        .select('id, nombre, codigo, marca, unidad, stock_actual, costo, precio_venta')
        .eq('activo', true)
        .ilike('codigo', codigoNorm)
        .limit(1)
        .maybeSingle()
      if (codeNorm) {
        bestMatch = { ...codeNorm, codigo: codeNorm.codigo ?? null, confianza: 1.0 }
      }
    }

    if (!bestMatch) {
      // Intento 1: búsqueda por similaridad (pg_trgm) — la función busca por nombre Y código
      const { data: matches, error: rpcError } = await supabaseAdmin.rpc('buscar_productos_por_nombre', {
        p_nombre: prod.nombre_detectado,
        p_limit: 1,
      })

      if (!rpcError && matches?.[0]) {
        bestMatch = { ...matches[0], codigo: matches[0].codigo ?? null, confianza: Number(matches[0].confianza) }
      } else {
        // Fallback ILIKE (cuando pg_trgm no está disponible): busca por nombre y también por código
        const palabras = prod.nombre_detectado.trim().split(/\s+/).filter((w) => w.length > 2)
        if (palabras.length > 0) {
          const { data: fallbackNombre } = await supabaseAdmin
            .from('productos')
            .select('id, nombre, codigo, marca, unidad, stock_actual, costo, precio_venta')
            .eq('activo', true)
            .ilike('nombre', `%${palabras[0]}%`)
            .limit(1)
            .maybeSingle()
          if (fallbackNombre) {
            bestMatch = { ...fallbackNombre, codigo: fallbackNombre.codigo ?? null, confianza: 0.5 }
          }
        }
        // Si no encontró por nombre, buscar por código (con el texto normalizado)
        if (!bestMatch && codigoNorm.length > 0) {
          const { data: fallbackCodigo } = await supabaseAdmin
            .from('productos')
            .select('id, nombre, codigo, marca, unidad, stock_actual, costo, precio_venta')
            .eq('activo', true)
            .ilike('codigo', codigoNorm)
            .limit(1)
            .maybeSingle()
          if (fallbackCodigo) {
            bestMatch = { ...fallbackCodigo, codigo: fallbackCodigo.codigo ?? null, confianza: 0.8 }
          }
        }
      }
    }

    itemsConMatch.push({
      ...prod,
      confianza: bestMatch ? bestMatch.confianza : 0,
      es_producto_nuevo: !bestMatch,
      producto_match: bestMatch
        ? {
            id: bestMatch.id,
            nombre: bestMatch.nombre,
            codigo: bestMatch.codigo,
            marca: bestMatch.marca,
            unidad: bestMatch.unidad,
            stock_actual: bestMatch.stock_actual,
            costo: bestMatch.costo,
            precio_venta: bestMatch.precio_venta,
          }
        : undefined,
    })
  }

  // 5. Actualizar remito con audio_url y transcripción si hay remitoId
  if (remitoId) {
    await supabaseAdmin
      .from('remitos')
      .update({ audio_url: publicUrl, transcripcion })
      .eq('id', remitoId)
  }

  return NextResponse.json({ audio_url: publicUrl, transcripcion, items: itemsConMatch })
}
