import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const updateItemSchema = z.object({
  producto_id: z.string().uuid().nullable().optional(),
  nombre_detectado: z.string().nullable().optional(),
  cantidad: z.number().positive().optional(),
  cantidad_asumida: z.boolean().optional(),
  unidad: z.string().nullable().optional(),
  costo: z.number().positive().nullable().optional(),
  precio_venta: z.number().positive().nullable().optional(),
  es_producto_nuevo: z.boolean().optional(),
  orden: z.number().int().optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, itemId } = await params

  const { data: remito } = await supabaseAdmin
    .from('remitos')
    .select('estado')
    .eq('id', id)
    .single()

  if (remito?.estado !== 'borrador') {
    return NextResponse.json({ error: 'Solo se pueden editar ítems de remitos en borrador' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = updateItemSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('remito_items')
    .update(parsed.data)
    .eq('id', itemId)
    .eq('remito_id', id)
    .select('*, productos(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, itemId } = await params

  const { data: remito } = await supabaseAdmin
    .from('remitos')
    .select('estado')
    .eq('id', id)
    .single()

  if (remito?.estado !== 'borrador') {
    return NextResponse.json({ error: 'Solo se pueden eliminar ítems de remitos en borrador' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('remito_items')
    .delete()
    .eq('id', itemId)
    .eq('remito_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
