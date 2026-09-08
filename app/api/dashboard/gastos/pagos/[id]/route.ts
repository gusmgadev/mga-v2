import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { recomputeGasto } from '@/lib/gasto-pagos'
import { NextRequest, NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const pagoId = Number(id)
  if (!pagoId) return NextResponse.json({ error: 'Pago inválido' }, { status: 400 })

  const { data: pagoRow, error: getErr } = await supabaseAdmin
    .from('gastos_pagos')
    .select('gasto_id')
    .eq('id', pagoId)
    .single()
  if (getErr || !pagoRow) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })

  const body = await req.json()
  const monto = body.monto !== undefined ? Number(body.monto) : undefined
  if (monto !== undefined && (!monto || monto <= 0)) {
    return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (monto !== undefined) updates.monto = monto
  if (body.fecha_pago !== undefined) updates.fecha_pago = body.fecha_pago || null
  if (body.metodo_pago !== undefined) updates.metodo_pago = body.metodo_pago || null
  if (body.tarjeta_id !== undefined) updates.tarjeta_id = body.tarjeta_id || null
  if (body.notas !== undefined) updates.notas = body.notas || null

  const { error: updErr } = await supabaseAdmin
    .from('gastos_pagos')
    .update(updates)
    .eq('id', pagoId)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  const updated = await recomputeGasto(pagoRow.gasto_id)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const pagoId = Number(id)
  if (!pagoId) return NextResponse.json({ error: 'Pago inválido' }, { status: 400 })

  const { data: pagoRow, error: getErr } = await supabaseAdmin
    .from('gastos_pagos')
    .select('gasto_id')
    .eq('id', pagoId)
    .single()
  if (getErr || !pagoRow) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })

  const { error: delErr } = await supabaseAdmin.from('gastos_pagos').delete().eq('id', pagoId)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  const updated = await recomputeGasto(pagoRow.gasto_id)
  return NextResponse.json(updated)
}