import { supabaseAdmin } from '@/services/supabase-admin'

const GASTO_SELECT = '*, tarjetas(id, nombre, tipo, banco), gastos_pagos(*, tarjetas(id, nombre, tipo, banco))'

export async function recomputeGasto(gastoId: number) {
  const { data: pagos } = await supabaseAdmin
    .from('gastos_pagos')
    .select('monto, fecha_pago, metodo_pago, tarjeta_id')
    .eq('gasto_id', gastoId)
    .order('fecha_pago', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const lista = pagos ?? []
  const totalPagado = lista.reduce((s, p) => s + Number(p.monto ?? 0), 0)
  const ultimo = lista[0]

  const { data: g } = await supabaseAdmin
    .from('gastos')
    .select('monto_real, monto_estimado')
    .eq('id', gastoId)
    .single()

  const total = g?.monto_real ?? g?.monto_estimado ?? 0
  await supabaseAdmin
    .from('gastos')
    .update({
      monto_pagado: totalPagado,
      pagado: total > 0 && totalPagado >= total,
      fecha_pago: ultimo?.fecha_pago ?? null,
      metodo_pago: ultimo?.metodo_pago ?? null,
      tarjeta_id: ultimo?.tarjeta_id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gastoId)

  const { data: updated } = await supabaseAdmin
    .from('gastos')
    .select(GASTO_SELECT)
    .eq('id', gastoId)
    .single()

  return updated
}