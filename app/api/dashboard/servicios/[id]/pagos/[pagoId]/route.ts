import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; pagoId: string }> }
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id, pagoId } = await params
  const { error } = await supabaseAdmin
    .from('servicio_pagos')
    .delete()
    .eq('id', pagoId)
    .eq('servicio_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await recalcularEstadoPago(id)
  return NextResponse.json({ ok: true })
}
