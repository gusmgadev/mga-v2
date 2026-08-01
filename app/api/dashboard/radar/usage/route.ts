import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const searchId = searchParams.get('searchId')

  let query = supabaseAdmin
    .from('radar_api_usage')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(500)

  if (searchId) query = query.eq('search_id', Number(searchId))

  const { data: usage } = await query

  const textSearchCount = (usage ?? []).filter((u) => u.api_type === 'text_search').length
  const placeDetailsCount = (usage ?? []).filter((u) => u.api_type === 'place_details').length
  const totalCost = (usage ?? []).reduce((sum, u) => sum + Number(u.estimated_cost), 0)

  return NextResponse.json({
    text_search_count: textSearchCount,
    place_details_count: placeDetailsCount,
    total_cost: Math.round(totalCost * 1000000) / 1000000,
    usage: usage ?? [],
  })
}
