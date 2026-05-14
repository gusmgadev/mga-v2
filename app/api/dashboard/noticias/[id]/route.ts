import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const updateSchema = z.object({
  titulo: z.string().min(2).optional(),
  resumen: z.string().min(2).optional(),
  contenido: z.string().min(2).optional(),
  imagen_card: z.string().nullable().optional(),
  imagen_portada: z.string().nullable().optional(),
  publicada: z.boolean().optional(),
  orden: z.number().int().min(0).optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('noticias')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params

  const { data: noticia } = await supabaseAdmin
    .from('noticias')
    .select('imagen_card, imagen_portada')
    .eq('id', Number(id))
    .single()

  const { error } = await supabaseAdmin
    .from('noticias')
    .delete()
    .eq('id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Eliminar imágenes del storage si existen
  const toDelete: string[] = []
  const bucket = 'noticias-imagenes'
  const extractPath = (url: string | null) => {
    if (!url) return null
    const marker = `/${bucket}/`
    const idx = url.indexOf(marker)
    return idx !== -1 ? url.slice(idx + marker.length) : null
  }
  const pathCard = extractPath(noticia?.imagen_card ?? null)
  const pathPortada = extractPath(noticia?.imagen_portada ?? null)
  if (pathCard) toDelete.push(pathCard)
  if (pathPortada) toDelete.push(pathPortada)
  if (toDelete.length > 0) {
    await supabaseAdmin.storage.from(bucket).remove(toDelete)
  }

  return NextResponse.json({ ok: true })
}
