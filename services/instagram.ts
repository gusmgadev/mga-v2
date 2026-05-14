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

export async function postNoticiaToInstagram(noticia: NoticiaInstagram): Promise<InstagramResult> {
  const userId = process.env.INSTAGRAM_USER_ID
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!userId || !token) return { posted: false }

  const caption =
    `${noticia.titulo}\n\n` +
    `${noticia.resumen}\n\n` +
    `📰 Nota completa: https://mgadigital.com.ar/noticias - Link en la Bio\n\n` +
    `#MGAInformatica #Noticias #Tecnologia`

  const authHeader = { 'Authorization': `Bearer ${token}` }

  const containerParams = new URLSearchParams({
    image_url: noticia.imagen_card,
    caption,
  })
  const containerRes = await fetch(`${IG_API}/${userId}/media`, {
    method: 'POST',
    headers: authHeader,
    body: containerParams,
  })
  const container = await containerRes.json()
  if (!containerRes.ok || !container.id) {
    const msg = container?.error?.message ?? 'Error al crear container'
    console.error('[Instagram] Error al crear container:', container)
    return { posted: false, error: msg }
  }

  // Esperar que Instagram procese la imagen antes de publicar
  const maxAttempts = 8
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
  let ready = false
  for (let i = 0; i < maxAttempts; i++) {
    await delay(3000)
    const statusRes = await fetch(
      `${IG_API}/${container.id}?fields=status_code`,
      { headers: authHeader }
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
  })
  if (!publishRes.ok) {
    const err = await publishRes.json()
    const msg = err?.error?.message ?? 'Error al publicar'
    console.error('[Instagram] Error al publicar:', err)
    return { posted: false, error: msg }
  }

  return { posted: true }
}
