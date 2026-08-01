import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data: prospect } = await supabaseAdmin
    .from('prospects')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!prospect) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { data: analysis } = await supabaseAdmin
    .from('website_analyses')
    .select('*')
    .eq('prospect_id', id)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: interactions } = await supabaseAdmin
    .from('prospect_interactions')
    .select('*')
    .eq('prospect_id', id)
    .order('interaction_date', { ascending: false })

  return NextResponse.json({
    ...prospect,
    website_analysis: analysis ?? null,
    interactions: interactions ?? [],
  })
}
