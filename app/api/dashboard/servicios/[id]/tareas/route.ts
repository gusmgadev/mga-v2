import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  descripcion: z.string().min(2, 'Mínimo 2 caracteres'),
  estado: z.enum(['INICIADA', 'EN PROCESO', 'PAUSADA', 'CANCELADA', 'TERMINADA']).optional(),
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
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  // If service is TERMINADO, reset to EN PROCESO since a new pending task was added
  const { data: servicio } = await supabaseAdmin
    .from('servicios')
    .select('estado')
    .eq('id', id)
    .single()
  if (servicio?.estado === 'TERMINADO') {
    await supabaseAdmin
      .from('servicios')
      .update({ estado: 'EN PROCESO', updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  const { data, error } = await supabaseAdmin
    .from('servicio_tareas')
    .insert({ ...parsed.data, servicio_id: Number(id) })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
