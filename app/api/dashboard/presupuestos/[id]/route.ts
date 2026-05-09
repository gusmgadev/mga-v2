import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const updateSchema = z.object({
  activo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres').optional(),
  descripcion: z.string().nullable().optional(),
  estado: z.enum(['BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO', 'VENCIDO']).optional(),
  fecha: z.string().optional(),
  fecha_vencimiento: z.string().nullable().optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('presupuestos')
    .select('*, clientes(name), activos(nombre), presupuesto_items(*)')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('presupuestos')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, clientes(name), activos(nombre)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await params
  const { error } = await supabaseAdmin.from('presupuestos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
