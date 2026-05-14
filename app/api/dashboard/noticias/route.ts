import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { postNoticiaToInstagram } from '@/services/instagram'
import { z } from 'zod'

const createSchema = z.object({
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  resumen: z.string().min(2, 'Mínimo 2 caracteres'),
  contenido: z.string().min(2, 'Mínimo 2 caracteres'),
  imagen_card: z.string().nullable().optional(),
  imagen_portada: z.string().nullable().optional(),
  publicada: z.boolean(),
  orden: z.number().int().min(0),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin
    .from('noticias')
    .select('*')
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('noticias')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let _instagram = undefined
  if (data.publicada && data.imagen_card) {
    _instagram = await postNoticiaToInstagram(data)
  }

  return NextResponse.json({ ...data, _instagram }, { status: 201 })
}
