import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { recomputeGasto } from '@/lib/gasto-pagos'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const gastoId = Number(body.gasto_id)
  const monto = Number(body.monto)
  const montoTotal = body.monto_total ? Number(body.monto_total) : null

  if (!gastoId || !monto || monto <= 0) {
    return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
  }

  if (montoTotal && montoTotal > 0) {
    await supabaseAdmin.from('gastos').update({ monto_real: montoTotal }).eq('id', gastoId)
  }

  const { error: insertErr } = await supabaseAdmin.from('gastos_pagos').insert({
    gasto_id: gastoId,
    monto,
    fecha_pago: body.fecha_pago || null,
    metodo_pago: body.metodo_pago || null,
    tarjeta_id: body.tarjeta_id || null,
    notas: body.notas || null,
  })
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  const updated = await recomputeGasto(gastoId)
  return NextResponse.json(updated)
}