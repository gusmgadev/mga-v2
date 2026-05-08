import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string(),
  metodo: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO']),
  notas: z.string().optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

async function recalcularEstadoPago(servicioId: string) {
  const { data: servicio } = await supabaseAdmin
    .from('servicios')
    .select('valor, estado_pago')
    .eq('id', servicioId)
    .single()
  if (!servicio) return
  if (servicio.estado_pago === 'SIN CARGO' || servicio.estado_pago === 'GARANTIA') return

  const { data: pagos } = await supabaseAdmin
    .from('servicio_pagos')
    .select('monto')
    .eq('servicio_id', servicioId)
  const total = pagos?.reduce((sum, p) => sum + Number(p.monto), 0) ?? 0
  const valor = Number(servicio.valor)

  const nuevoPago = total === 0 ? 'PENDIENTE' : total >= valor ? 'PAGADO' : 'PAGO PARCIAL'
  await supabaseAdmin
    .from('servicios')
    .update({ estado_pago: nuevoPago, updated_at: new Date().toISOString() })
    .eq('id', servicioId)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('servicio_pagos')
    .insert({ ...parsed.data, servicio_id: Number(id) })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await recalcularEstadoPago(id)
  return NextResponse.json(data, { status: 201 })
}
