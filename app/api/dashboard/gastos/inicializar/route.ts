import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { mes, anio } = await req.json()
  if (!mes || !anio) return NextResponse.json({ error: 'mes y anio son requeridos' }, { status: 400 })

  // Verificar si ya hay gastos para este mes (idempotente)
  const { data: existing } = await supabaseAdmin
    .from('gastos')
    .select('id')
    .eq('mes', mes)
    .eq('anio', anio)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, creados: 0, message: 'El mes ya fue inicializado' })
  }

  // Traer plantillas activas ordenadas
  const { data: plantillas, error: errP } = await supabaseAdmin
    .from('gastos_plantilla')
    .select('*')
    .eq('activo', true)
    .order('orden')
    .order('created_at')

  if (errP) return NextResponse.json({ error: errP.message }, { status: 500 })
  if (!plantillas || plantillas.length === 0) {
    return NextResponse.json({ ok: true, creados: 0, message: 'No hay plantillas activas' })
  }

  const inserts = plantillas.map((p) => ({
    plantilla_id: p.id,
    mes,
    anio,
    categoria: p.categoria,
    descripcion: p.descripcion,
    monto_estimado: p.monto_estimado,
  }))

  const { error: errI } = await supabaseAdmin.from('gastos').insert(inserts)
  if (errI) return NextResponse.json({ error: errI.message }, { status: 500 })

  return NextResponse.json({ ok: true, creados: inserts.length })
}
