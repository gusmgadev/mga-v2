import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data: search } = await supabaseAdmin
    .from('prospect_searches')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!search) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { data: prospects } = await supabaseAdmin
    .from('prospect_search_results')
    .select('prospect_id, position, matched_query, prospects(*)')
    .eq('search_id', id)
    .order('position', { ascending: true })

  return NextResponse.json({
    search,
    prospects: (prospects ?? []).map((r: Record<string, unknown>) => ({
      ...(r.prospects as Record<string, unknown>),
      position: r.position,
      matched_query: r.matched_query,
    })),
  })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin
    .from('prospect_searches')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
