import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE_MB = 5

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido. Usá JPG, PNG, WEBP o SVG' }, { status: 400 })
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `El archivo no puede superar ${MAX_SIZE_MB}MB` }, { status: 400 })
  }

  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { data, error } = await supabaseAdmin.storage
    .from('clientes-logos')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('clientes-logos')
    .getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl })
}
