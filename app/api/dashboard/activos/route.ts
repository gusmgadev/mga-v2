import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  tipo: z.enum(['PC', 'NOTEBOOK', 'SERVIDOR', 'IMPRESORA', 'SISTEMA', 'DESARROLLO', 'SERVICIO', 'DISPOSITIVO', 'OTRO']),
  numero_serie: z.string().optional(),
  notas: z.string().optional(),
  activo: z.boolean(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function GET(req: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const clienteId = searchParams.get('cliente_id')

  let query = supabaseAdmin.from('activos').select('*').order('nombre')
  if (clienteId) query = query.eq('cliente_id', Number(clienteId))

  const { data, error } = await query
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
    .from('activos')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
