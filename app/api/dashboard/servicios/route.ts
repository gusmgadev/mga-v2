import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  activo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['INGRESADO', 'EN PROCESO', 'CANCELADO', 'RECHAZADO', 'TERMINADO', 'PRESUPUESTADO']),
  estado_pago: z.enum(['PENDIENTE', 'SIN CARGO', 'GARANTIA', 'PAGO PARCIAL', 'PAGADO']),
  valor: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  presupuesto_id: z.number().int().positive().nullable().optional(),
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
  const estadoPago = searchParams.get('estado_pago')

  let query = supabaseAdmin
    .from('servicios')
    .select('*, clientes(nombre), activos(nombre)')
    .order('fecha', { ascending: false, nullsFirst: false })

  if (clienteId) query = query.eq('cliente_id', Number(clienteId))
  if (estado) query = query.eq('estado', estado)
  if (estadoPago) query = query.eq('estado_pago', estadoPago)

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
    .from('servicios')
    .insert(parsed.data)
    .select('*, clientes(nombre), activos(nombre)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
