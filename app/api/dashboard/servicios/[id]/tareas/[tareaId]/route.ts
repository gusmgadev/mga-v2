import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const updateSchema = z.object({
  descripcion: z.string().min(2, 'Mínimo 2 caracteres').optional(),
  estado: z.enum(['INICIADA', 'EN PROCESO', 'PAUSADA', 'CANCELADA', 'TERMINADA']).optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; tareaId: string }> }
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id, tareaId } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('servicio_tareas')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', tareaId)
    .eq('servicio_id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If updated to TERMINADA, check if all tasks for this service are done
  if (parsed.data.estado === 'TERMINADA') {
    const { data: todasTareas } = await supabaseAdmin
      .from('servicio_tareas')
      .select('estado')
      .eq('servicio_id', id)
    const todasTerminadas = todasTareas?.every((t) => t.estado === 'TERMINADA') ?? false
    if (todasTerminadas) {
      await supabaseAdmin
        .from('servicios')
        .update({ estado: 'TERMINADO', updated_at: new Date().toISOString() })
        .eq('id', id)
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; tareaId: string }> }
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { id, tareaId } = await params
  const { error } = await supabaseAdmin
    .from('servicio_tareas')
    .delete()
    .eq('id', tareaId)
    .eq('servicio_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
