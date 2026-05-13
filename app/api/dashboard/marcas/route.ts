import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const schema = z.object({ nombre: z.string().min(1, 'Requerido') })

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function GET() {
  if (!(await requireSession())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { data, error } = await supabaseAdmin.from('marcas').select('*').eq('activo', true).order('nombre')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  const { data, error } = await supabaseAdmin
    .from('marcas')
    .upsert({ nombre: parsed.data.nombre }, { onConflict: 'nombre' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
