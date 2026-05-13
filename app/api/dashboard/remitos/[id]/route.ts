import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const updateSchema = z.object({
  tipo: z.enum(['entrada', 'salida']).optional(),
  numero_tipo: z.enum(['automatico', 'manual', 'proveedor']).optional(),
  numero: z.string().min(1).optional(),
  fecha: z.string().min(1).optional(),
  origen_destino_id: z.string().uuid().nullable().optional(),
  origen_destino_texto: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('remitos')
    .select('*, origenes_destinos(*), remito_items(*, productos(*))')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data: current } = await supabaseAdmin
    .from('remitos')
    .select('estado')
    .eq('id', id)
    .single()

  if (current?.estado !== 'borrador') {
    return NextResponse.json({ error: 'Solo se pueden editar remitos en estado borrador' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('remitos')
    .update(parsed.data)
    .eq('id', id)
    .select('*, origenes_destinos(*), remito_items(*, productos(*))')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
