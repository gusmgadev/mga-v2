import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const payload: Record<string, unknown> = {}
  if (body.nombre !== undefined) payload.nombre = body.nombre.trim().toUpperCase()
  if (body.tipo !== undefined) payload.tipo = body.tipo.trim().toUpperCase()
  if (body.banco !== undefined) payload.banco = body.banco?.trim().toUpperCase() || null
  if (body.activo !== undefined) payload.activo = body.activo

  const { data, error } = await supabaseAdmin
    .from('tarjetas')
    .update(payload)
    .eq('id', Number(id))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin.from('tarjetas').delete().eq('id', Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
