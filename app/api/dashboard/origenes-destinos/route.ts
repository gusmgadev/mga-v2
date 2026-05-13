import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  tipo: z.enum(['proveedor', 'sucursal', 'deposito', 'cliente', 'otro']),
  nombre: z.string().min(2),
  activo: z.boolean().default(true),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function GET(req: Request) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const activo = searchParams.get('activo')

  let query = supabaseAdmin
    .from('origenes_destinos')
    .select('*')
    .order('nombre')

  if (activo !== null) query = query.eq('activo', activo === 'true')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('origenes_destinos')
    .insert(parsed.data)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
