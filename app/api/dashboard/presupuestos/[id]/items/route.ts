import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const itemSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  cantidad: z.number().positive('Debe ser mayor a 0'),
  precio_unitario: z.number().min(0, 'No puede ser negativo'),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const parsed = itemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('presupuesto_items')
    .insert({ ...parsed.data, presupuesto_id: Number(id) })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
