import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  cliente_id: z.number().int().positive(),
  servicio_id: z.number().int().positive().nullable().optional(),
  tipo: z.enum(['CARGO', 'PAGO', 'NOTA_CREDITO']),
  concepto: z.string().min(2),
  monto: z.number().positive(),
  fecha: z.string().min(1),
  metodo_pago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO']).nullable().optional(),
  notas: z.string().nullable().optional(),
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
  const cliente_id = searchParams.get('cliente_id')
  const tipo = searchParams.get('tipo')

  let query = supabaseAdmin
    .from('cobranzas')
    .select('*, clientes(name), servicios(titulo)')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (cliente_id) query = query.eq('cliente_id', Number(cliente_id))
  if (tipo) query = query.eq('tipo', tipo)

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
    .from('cobranzas')
    .insert(parsed.data)
    .select('*, clientes(name), servicios(titulo)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
