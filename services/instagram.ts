const IG_API = 'https://graph.instagram.com/v21.0'

interface NoticiaInstagram {
  id: number
  titulo: string
  resumen: string
  imagen_card: string
}

export interface InstagramResult {
  posted: boolean
  error?: string
}

const FETCH_TIMEOUT_MS = 10_000
const MAX_ATTEMPTS = 5
const POLL_DELAY_MS = 2_500

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function traducirError(raw: string): string {
  const t = raw.toLowerCase()
  if (
    t.includes('validating access token') ||
    t.includes('expired') ||
    t.includes('invalid') ||
    t.includes('error validating')
  ) {
    return 'El token de Instagram expiró o es inválido. Renová la variable INSTAGRAM_ACCESS_TOKEN en Vercel y redeployá.'
  }
  if (t.includes('permission') || t.includes('scope')) {
    return 'El token de Instagram no tiene permisos de publicación (instagram_content_publish). Renovalo con esos permisos.'
  }
  return raw
}

export async function postNoticiaToInstagram(noticia: NoticiaInstagram): Promise<InstagramResult> {
  const userId = process.env.INSTAGRAM_USER_ID
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!userId || !token) return { posted: false }

  try {
    return await publicar(noticia, userId, token)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error de red al publicar en Instagram'
    console.error('[Instagram] Excepción:', msg)
    return { posted: false, error: traducirError(msg) }
  }
}

async function publicar(
  noticia: NoticiaInstagram,
  userId: string,
  token: string
): Promise<InstagramResult> {
  const caption =
    `${noticia.titulo}\n\n` +
    `${noticia.resumen}\n\n` +
    `📰 Nota completa: https://mgadigital.com.ar/noticias - Link en la Bio\n\n` +
    `#MGAInformatica #Noticias #Tecnologia`

  const authHeader = { 'Authorization': `Bearer ${token}` }
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS)

  const containerParams = new URLSearchParams({
    image_url: noticia.imagen_card,
    caption,
  })
  const containerRes = await fetch(`${IG_API}/${userId}/media`, {
    method: 'POST',
    headers: authHeader,
    body: containerParams,
    signal,
  })
  const container = await containerRes.json()
  if (!containerRes.ok || !container.id) {
    const msg = container?.error?.message ?? 'Error al crear container'
    console.error('[Instagram] Error al crear container:', container)
    return { posted: false, error: traducirError(msg) }
  }

  // Esperar que Instagram procese la imagen antes de publicar
  let ready = false
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    await delay(POLL_DELAY_MS)
    const statusRes = await fetch(
      `${IG_API}/${container.id}?fields=status_code`,
      { headers: authHeader, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    )
    const status = await statusRes.json()
    if (status.status_code === 'FINISHED') { ready = true; break }
    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      console.error('[Instagram] Container en estado:', status.status_code)
      return { posted: false, error: `Error al procesar la imagen (${status.status_code})` }
    }
  }
  if (!ready) return { posted: false, error: 'Tiempo de espera agotado al procesar la imagen' }

  const publishRes = await fetch(`${IG_API}/${userId}/media_publish`, {
    method: 'POST',
    headers: authHeader,
    body: new URLSearchParams({ creation_id: container.id }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!publishRes.ok) {
    const err = await publishRes.json()
    const msg = err?.error?.message ?? 'Error al publicar'
    console.error('[Instagram] Error al publicar:', err)
    return { posted: false, error: traducirError(msg) }
  }

  return { posted: true }
}
