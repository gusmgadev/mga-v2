import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const ESTADOS_FINALES = ['GANADA', 'NO_GANADA', 'NO_OP'] as const

const patchSchema = z.object({
  estado: z.enum(['NUEVA', 'EN_PROCESO', 'GANADA', 'NO_GANADA', 'NO_OP']).optional(),
  notas: z.string().optional().nullable(),
  motivo_cierre: z.string().nullable().optional(),
  servicio_id: z.number().int().positive().nullable().optional(),
  presupuesto_id: z.number().int().positive().nullable().optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const extra: Record<string, unknown> = {}
  if (parsed.data.estado && (ESTADOS_FINALES as readonly string[]).includes(parsed.data.estado)) {
    extra.fecha_ultimo_estado_final = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('oportunidades')
    .update({ ...parsed.data, ...extra, updated_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin
    .from('oportunidades')
    .delete()
    .eq('id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
