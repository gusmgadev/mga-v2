const IG_API = 'https://graph.facebook.com/v21.0'

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
    `🔗 mgadigital.com.ar/noticias/${noticia.id}\n\n` +
    `#MGAInformatica #Noticias #Tecnologia`

  const containerRes = await fetch(`${IG_API}/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: noticia.imagen_card, caption, access_token: token }),
  })
  const container = await containerRes.json()
  if (!containerRes.ok || !container.id) {
    const msg = container?.error?.message ?? 'Error al crear container'
    console.error('[Instagram] Error al crear container:', container)
    return { posted: false, error: msg }
  }

  const publishRes = await fetch(`${IG_API}/${userId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: container.id, access_token: token }),
  })
  if (!publishRes.ok) {
    const err = await publishRes.json()
    const msg = err?.error?.message ?? 'Error al publicar'
    console.error('[Instagram] Error al publicar:', err)
    return { posted: false, error: msg }
  }

  return { posted: true }
}
