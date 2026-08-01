import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { convertToClientSchema } from '@/lib/radar/validations'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = convertToClientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { data: prospect } = await supabaseAdmin
    .from('prospects')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()
  if (!prospect) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  let servicioId: number | null = null
  if (parsed.data.servicio) {
    const { data: sv, error: svErr } = await supabaseAdmin
      .from('servicios')
      .insert({
        ...parsed.data.servicio,
        cliente_id: parsed.data.cliente_id,
        estado: 'INGRESADO',
        estado_pago: 'PENDIENTE',
      })
      .select()
      .single()
    if (svErr) return NextResponse.json({ error: svErr.message }, { status: 500 })
    servicioId = sv.id
  }

  let presupuestoId: number | null = null
  if (parsed.data.presupuesto) {
    const { data: pp, error: ppErr } = await supabaseAdmin
      .from('presupuestos')
      .insert({
        ...parsed.data.presupuesto,
        cliente_id: parsed.data.cliente_id,
        estado: 'BORRADOR',
        fecha: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()
    if (ppErr) return NextResponse.json({ error: ppErr.message }, { status: 500 })
    presupuestoId = pp.id
  }

  const { data, error } = await supabaseAdmin
    .from('prospects')
    .update({
      existing_client_id: parsed.data.cliente_id,
      existing_servicio_id: servicioId,
      existing_client_notes: parsed.data.notas || null,
      closed_at: new Date().toISOString(),
      commercial_status: 'existing_customer',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ prospect: data, servicio_id: servicioId, presupuesto_id: presupuestoId })
}
