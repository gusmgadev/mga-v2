import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

const EXTRACTION_PROMPT = `Sos un asistente que extrae datos estructurados de mails de asignación de tareas/oportunidades comerciales de Zoologic.

Extraé todos los campos del mail y devolvé SOLO un JSON válido con exactamente estos campos (usa null si no está presente):
{
  "nro_tarea": número entero o null,
  "nro_oportunidad": número entero o null,
  "nro_oportunidad_origen": número entero o null,
  "titulo": string o null,
  "registrada_por": string o null,
  "fecha_inicio": "YYYY-MM-DD" o null,
  "fecha_vencimiento": "YYYY-MM-DD" o null,
  "tipo_tarea": string o null,
  "cliente_codigo": string o null,
  "cliente_nombre": string o null,
  "origen": string o null,
  "tipo_oportunidad": string o null,
  "zona_gestion": string o null,
  "primer_nombre": string o null,
  "apellido": string o null,
  "empresa": string o null,
  "provincia_ciudad": string o null,
  "telefono": string o null,
  "email_contacto": string o null,
  "comentarios": string o null
}

Patrones a detectar:
- "Te han asignado la tarea número 553502" → nro_tarea: 553502
- "Datos de la oportunidad comercial nº 58074" → nro_oportunidad: 58074
- "Título: Contactar con el cliente" → titulo: "Contactar con el cliente"
- "Título: Seguimiento de potencial cliente - Contactar Oportunidad 53228" → titulo: el texto completo, nro_oportunidad_origen: 53228
- "Título: Cross Selling de Cliente - Contactar Oportunidad 52879" → titulo: el texto completo, nro_oportunidad_origen: 52879
  (nro_oportunidad_origen: extraer el número que aparece después de "Contactar Oportunidad" en el título; null si no aplica)
- "Registrada por: PAVEGNO" → registrada_por: "PAVEGNO"
- "Fecha Inicio: 29/04/2026" → fecha_inicio: "2026-04-29"
- "Fecha Vencimiento: 30/04/2026" → fecha_vencimiento: "2026-04-30"
- "Tipo de tarea: 0103 - COM - Acciones de Seguimiento" → tipo_tarea: "0103 - COM - Acciones de Seguimiento"
- "Cliente: 50275 - Go Street" (primera mención con código numérico) → cliente_codigo: "50275", cliente_nombre: "Go Street"
- "Origen: 0195 - Onlera: Search_Dragonfish_Brand" → origen: "0195 - Onlera: Search_Dragonfish_Brand"
- "Tipo de oportunidad: 0022 - No informa" → tipo_oportunidad: "0022 - No informa"
- "Zona de gestión: CHU001 - Provincia de Chubut" → zona_gestion: "CHU001 - Provincia de Chubut"
- "Primer Nombre: Luca" → primer_nombre: "Luca"
- "Apellido: Mazzini" → apellido: "Mazzini"
- "Cliente: Go street" (sección datos de contacto, sin código numérico) → empresa: "Go street"
- "Provincia / Ciudad: Chubut trelew" → provincia_ciudad: "Chubut trelew"
- "Teléfono: 2804 779635" → telefono: "2804 779635"
- "Mail: lucamazzini2000@gmail.com" → email_contacto: "lucamazzini2000@gmail.com"
- "Comentarios: Cuáles son sus planes..." → comentarios: el texto completo
- Para mails de Seguimiento o Cross Selling, los datos de contacto pueden estar en "Notas:" u "Observaciones:" con formato:
  "Contacto: Nombre Apellido | Email: email@ejemplo.com | Tel.: 2974113042"
  → extraer primer_nombre y apellido de "Contacto:", email_contacto de "Email:", telefono de "Tel.:"

Devolvé SOLO el JSON, sin ningún texto adicional, sin markdown.`

// Groq free tier: 100k tokens/day. Truncate body to ~3000 chars (~750 tokens) so structured
// data fits without hitting per-minute limits. Task fields are always at the top of the email.
const MAX_BODY_CHARS = 3000

async function callGroq(groqKey: string, body: string, retries = 1): Promise<{ ok: boolean; data: unknown; errorMsg: string; dailyLimit?: boolean }> {
  const truncated = body.length > MAX_BODY_CHARS ? body.slice(0, MAX_BODY_CHARS) : body

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: truncated },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  })

  if (res.status === 429) {
    const errData = await res.json().catch(() => ({}))
    const msg = (errData?.error?.message ?? '') as string

    // Daily limit (TPD) — waiting minutes won't help, fail immediately
    if (msg.includes('per day') || msg.includes('TPD')) {
      return { ok: false, data: null, errorMsg: 'Límite diario de Groq agotado. Intentá mañana.', dailyLimit: true }
    }

    // Per-minute limit (TPM) — retry once after the indicated wait (capped at 30s)
    if (retries > 0) {
      const match = msg.match(/try again in ([\d.]+)s/)
      const waitSec = match ? parseFloat(match[1]) : 8
      if (waitSec <= 30) {
        await new Promise((r) => setTimeout(r, Math.ceil(waitSec) * 1000 + 500))
        return callGroq(groqKey, body, retries - 1)
      }
    }

    return { ok: false, data: null, errorMsg: msg.slice(0, 120) }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    const msg = (errData?.error?.message ?? `HTTP ${res.status}`) as string
    return { ok: false, data: null, errorMsg: msg }
  }

  const data = await res.json()
  return { ok: true, data, errorMsg: '' }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return NextResponse.json({ error: 'GROQ_API_KEY no configurado' }, { status: 503 })

  const { emails, tipo_op } = await req.json() as {
    emails: { messageId: string; subject: string; from: string; date: string; body: string }[]
    tipo_op?: string
  }
  const tipoOpFinal = (['SEGUIMIENTO', 'CROSS_SELLING'].includes(tipo_op ?? '')) ? tipo_op! : 'OP_NUEVA'

  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: 'No se enviaron emails para procesar' }, { status: 400 })
  }

  let procesados = 0
  let duplicados = 0
  let errores = 0
  const errorDetails: string[] = []

  for (const email of emails) {
    try {
      // Check duplicate by message_id
      const { data: existing } = await supabaseAdmin
        .from('oportunidades')
        .select('id')
        .eq('email_message_id', email.messageId)
        .maybeSingle()

      if (existing) { duplicados++; continue }

      // Small delay between calls to stay within TPM limits
      if (procesados + errores > 0) await new Promise((r) => setTimeout(r, 1200))

      // Extract structured data with Groq (auto-retry on TPM 429)
      const groqResult = await callGroq(groqKey, email.body)
      if (!groqResult.ok) {
        errorDetails.push(`[Groq] ${email.subject}: ${groqResult.errorMsg}`)
        errores++
        if (groqResult.dailyLimit) break  // Daily limit hit — all remaining emails will also fail
        continue
      }

      const groqData = groqResult.data as { choices: { message: { content: string } }[] }
      let extracted: Record<string, unknown>
      try {
        extracted = JSON.parse(groqData.choices[0].message.content)
      } catch {
        errorDetails.push(`[JSON parse] ${email.subject}`)
        errores++
        continue
      }

      const { error } = await supabaseAdmin.from('oportunidades').insert({
        ...extracted,
        email_subject: email.subject,
        email_from: email.from,
        email_fecha: email.date || null,
        email_message_id: email.messageId,
        tipo_op: tipoOpFinal,
      })

      if (error) {
        errorDetails.push(`[DB] ${email.subject}: ${error.message}`)
        errores++
        continue
      }
      procesados++
    } catch (e) {
      errorDetails.push(`[Exception] ${email.subject}: ${e instanceof Error ? e.message : String(e)}`)
      errores++
    }
  }

  return NextResponse.json({ procesados, duplicados, errores, errorDetails })
}
