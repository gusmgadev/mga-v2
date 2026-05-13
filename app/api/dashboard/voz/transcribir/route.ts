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
Si no hay cantidad antes del producto: cantidad 1, cantidad_asumida: true`

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
    const codigoQuery = prod.nombre_detectado.trim()
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

    if (!bestMatch) {
      // Intento 1: búsqueda por similaridad (pg_trgm)
      const { data: matches, error: rpcError } = await supabaseAdmin.rpc('buscar_productos_por_nombre', {
        p_nombre: prod.nombre_detectado,
        p_limit: 1,
      })

      if (!rpcError && matches?.[0]) {
        bestMatch = { ...matches[0], codigo: matches[0].codigo ?? null, confianza: Number(matches[0].confianza) }
      } else {
        // Fallback: búsqueda por ILIKE — divide el nombre detectado en palabras
        const palabras = prod.nombre_detectado.trim().split(/\s+/).filter((w) => w.length > 2)
        if (palabras.length > 0) {
          const { data: fallback } = await supabaseAdmin
            .from('productos')
            .select('id, nombre, codigo, marca, unidad, stock_actual, costo, precio_venta')
            .eq('activo', true)
            .ilike('nombre', `%${palabras[0]}%`)
            .limit(1)
            .maybeSingle()
          if (fallback) {
            bestMatch = { ...fallback, codigo: fallback.codigo ?? null, confianza: 0.5 }
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
