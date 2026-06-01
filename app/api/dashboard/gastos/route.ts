import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020),
  categoria: z.string().min(1),
  descripcion: z.string().min(1),
  monto_estimado: z.number().nullable().optional(),
  notas: z.string().nullable().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const mes = searchParams.get('mes')
  const anio = searchParams.get('anio')

  let query = supabaseAdmin
    .from('gastos')
    .select('*, tarjetas(id, nombre, tipo, banco)')
    .order('categoria')
    .order('created_at')

  if (mes) query = query.eq('mes', Number(mes))
  if (anio) query = query.eq('anio', Number(anio))

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('gastos')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
