import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  activo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO', 'VENCIDO']),
  fecha_vencimiento: z.string().nullable().optional(),
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
  const estado = searchParams.get('estado')

  let query = supabaseAdmin
    .from('presupuestos')
    .select('*, clientes(name), activos(nombre), presupuesto_items(id, cantidad, precio_unitario)')
    .order('created_at', { ascending: false })

  if (clienteId) query = query.eq('cliente_id', Number(clienteId))
  if (estado) query = query.eq('estado', estado)

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
    .from('presupuestos')
    .insert(parsed.data)
    .select('*, clientes(name), activos(nombre), presupuesto_items(id, cantidad, precio_unitario)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
