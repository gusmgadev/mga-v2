import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('tarjetas')
    .select('*')
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  if (!body.nombre?.trim() || !body.tipo?.trim()) {
    return NextResponse.json({ error: 'Nombre y tipo son requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('tarjetas')
    .insert({
      nombre: body.nombre.trim().toUpperCase(),
      tipo: body.tipo.trim().toUpperCase(),
      banco: body.banco?.trim().toUpperCase() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
