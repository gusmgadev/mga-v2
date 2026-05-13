import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  nombre: z.string().min(2),
  codigo: z.string().nullable().optional(),
  marca: z.string().nullable().optional(),
  unidad: z.string().min(1).default('unidad'),
  rubro: z.string().nullable().optional(),
  subrubro: z.string().nullable().optional(),
  stock_actual: z.number().default(0),
  costo: z.number().positive().nullable().optional(),
  precio_venta: z.number().positive().nullable().optional(),
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
  const q = searchParams.get('q')

  let query = supabaseAdmin
    .from('productos')
    .select('*')
    .order('nombre')

  if (activo !== null) query = query.eq('activo', activo === 'true')
  if (q) query = query.ilike('nombre', `%${q}%`)

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
    .from('productos')
    .insert(parsed.data)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
