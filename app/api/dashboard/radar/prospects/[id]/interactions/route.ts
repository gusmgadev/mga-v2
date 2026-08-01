import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { interactionCreateSchema } from '@/lib/radar/validations'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = interactionCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { data: prospect } = await supabaseAdmin
    .from('prospects')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()
  if (!prospect) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from('prospect_interactions')
    .insert({
      prospect_id: Number(id),
      user_id: session.user.id,
      ...parsed.data,
      channel: parsed.data.channel || null,
      notes: parsed.data.notes || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
