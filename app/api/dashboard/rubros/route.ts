import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').trim(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('rubros')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('rubros')
    .upsert({ nombre: parsed.data.nombre }, { onConflict: 'nombre' })
    .select('id, nombre')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
