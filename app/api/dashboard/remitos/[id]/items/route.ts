import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createItemSchema = z.object({
  producto_id: z.string().uuid().nullable().optional(),
  nombre_detectado: z.string().nullable().optional(),
  cantidad: z.number().positive(),
  cantidad_asumida: z.boolean().default(false),
  unidad: z.string().nullable().optional(),
  costo: z.number().positive().nullable().optional(),
  precio_venta: z.number().positive().nullable().optional(),
  confianza: z.number().min(0).max(1).nullable().optional(),
  es_producto_nuevo: z.boolean().default(false),
  orden: z.number().int().default(0),
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
    .from('remito_items')
    .select('*, productos(*)')
    .eq('remito_id', id)
    .order('orden')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data: remito } = await supabaseAdmin
    .from('remitos')
    .select('estado')
    .eq('id', id)
    .single()

  if (remito?.estado !== 'borrador') {
    return NextResponse.json({ error: 'Solo se pueden agregar ítems a remitos en borrador' }, { status: 400 })
  }

  const body = await req.json()

  // Soporte para inserción de múltiples ítems (array) o uno solo (objeto)
  const items = Array.isArray(body) ? body : [body]
  const parsedItems = []
  for (const item of items) {
    const parsed = createItemSchema.safeParse(item)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    parsedItems.push({ ...parsed.data, remito_id: id })
  }

  const { data, error } = await supabaseAdmin
    .from('remito_items')
    .insert(parsedItems)
    .select('*, productos(*)')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
