import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'
import { recalcularEstadoPago } from '../../route'

const imputarSchema = z.object({
  servicio_id: z.number().int().positive(),
  monto: z.number().positive(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = imputarSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { servicio_id, monto } = parsed.data

  const { data: original, error: fetchError } = await supabaseAdmin
    .from('cobranzas')
    .select('*')
    .eq('id', Number(id))
    .single()

  if (fetchError || !original) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
  if (original.tipo !== 'PAGO') return NextResponse.json({ error: 'Solo se pueden imputar pagos' }, { status: 400 })
  if (original.servicio_id !== null) return NextResponse.json({ error: 'El pago ya está asignado a un servicio' }, { status: 400 })
  if (monto > Number(original.monto) + 0.001) return NextResponse.json({ error: 'El monto supera el saldo del pago' }, { status: 400 })

  const esTotal = Math.abs(monto - Number(original.monto)) < 0.01

  let pagoImputado: Record<string, unknown>
  let pagoRestante: Record<string, unknown> | null = null

  if (esTotal) {
    const { data, error } = await supabaseAdmin
      .from('cobranzas')
      .update({ servicio_id })
      .eq('id', Number(id))
      .select('*, clientes(nombre), servicios(titulo)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    pagoImputado = data
  } else {
    // Imputación parcial: reducir original + crear nuevo vinculado al servicio
    const montoRestante = Number(original.monto) - monto

    const { data: reducido, error: errorReducir } = await supabaseAdmin
      .from('cobranzas')
      .update({ monto: montoRestante })
      .eq('id', Number(id))
      .select('*, clientes(nombre), servicios(titulo)')
      .single()

    if (errorReducir) return NextResponse.json({ error: errorReducir.message }, { status: 500 })
    pagoRestante = reducido

    const { data: nuevo, error: errorNuevo } = await supabaseAdmin
      .from('cobranzas')
      .insert({
        cliente_id: original.cliente_id,
        servicio_id,
        tipo: 'PAGO',
        concepto: original.concepto,
        monto,
        fecha: original.fecha,
        metodo_pago: original.metodo_pago,
        notas: original.notas,
      })
      .select('*, clientes(nombre), servicios(titulo)')
      .single()

    if (errorNuevo) return NextResponse.json({ error: errorNuevo.message }, { status: 500 })
    pagoImputado = nuevo
  }

  await recalcularEstadoPago(servicio_id)

  return NextResponse.json({ pago_imputado: pagoImputado, pago_restante: pagoRestante })
}
