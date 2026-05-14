import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'
import { recalcularEstadoPago } from '../route'

const updateSchema = z.object({
  servicio_id: z.number().int().positive().nullable().optional(),
  tipo: z.enum(['CARGO', 'PAGO', 'NOTA_CREDITO']).optional(),
  concepto: z.string().min(2).optional(),
  monto: z.number().positive().optional(),
  fecha: z.string().min(1).optional(),
  metodo_pago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO']).nullable().optional(),
  notas: z.string().nullable().optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { data: original } = await supabaseAdmin
    .from('cobranzas')
    .select('servicio_id')
    .eq('id', Number(id))
    .single()

  const { data, error } = await supabaseAdmin
    .from('cobranzas')
    .update(parsed.data)
    .eq('id', Number(id))
    .select('*, clientes(nombre), servicios(titulo)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const oldServicioId = original?.servicio_id
  const newServicioId = parsed.data.servicio_id !== undefined ? parsed.data.servicio_id : oldServicioId
  if (oldServicioId) await recalcularEstadoPago(oldServicioId)
  if (newServicioId && newServicioId !== oldServicioId) await recalcularEstadoPago(newServicioId)

  return NextResponse.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data: cobranza } = await supabaseAdmin
    .from('cobranzas')
    .select('servicio_id, tipo')
    .eq('id', Number(id))
    .single()

  const { error } = await supabaseAdmin
    .from('cobranzas')
    .delete()
    .eq('id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (cobranza?.servicio_id && cobranza.tipo === 'PAGO') {
    await recalcularEstadoPago(cobranza.servicio_id)
  }

  return NextResponse.json({ ok: true })
}
