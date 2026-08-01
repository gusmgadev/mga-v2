import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

const ALLOWED_SORTS = [
  'opportunity_score', 'name', 'rating', 'review_count',
  'city', 'province', 'commercial_activity_score',
  'digital_need_score', 'email', 'phone', 'whatsapp',
  'commercial_status', 'opportunity_level', 'created_at',
  'rubro', 'category',
]

function applyFilters(query: any, params: URLSearchParams, userId: string) {
  query = query.eq('user_id', userId)

  const city = params.get('city')
  const rubro = params.get('rubro')
  const province = params.get('province')
  const minScore = params.get('minOpportunityScore')
  const commercialStatus = params.get('commercialStatus')
  const excludeStatus = params.get('excludeStatus')
  const hasWebsite = params.get('hasWebsite')
  const hasPhone = params.get('hasPhone')
  const hasEmail = params.get('hasEmail')
  const hasWhatsApp = params.get('hasWhatsApp')
  const minRating = params.get('minRating')
  const search = params.get('search')

  if (city) query = query.ilike('city', `%${city}%`)
  if (province) query = query.ilike('province', `%${province}%`)
  if (rubro) query = query.ilike('rubro', `%${rubro}%`)
  if (minScore) query = query.gte('opportunity_score', Number(minScore))
  if (commercialStatus) query = query.eq('commercial_status', commercialStatus)
  if (excludeStatus) query = query.neq('commercial_status', excludeStatus)
  if (hasWebsite === 'true') query = query.not('website', 'is', null)
  if (hasWebsite === 'false') query = query.is('website', null)
  if (hasPhone === 'true') query = query.not('phone', 'is', null)
  if (hasPhone === 'false') query = query.is('phone', null)
  if (hasEmail === 'true') query = query.not('email', 'is', null)
  if (hasEmail === 'false') query = query.is('email', null)
  if (hasWhatsApp === 'true') query = query.not('whatsapp', 'is', null)
  if (hasWhatsApp === 'false') query = query.is('whatsapp', null)
  if (minRating) query = query.gte('rating', Number(minRating))
  if (search) query = query.or(`name.ilike.%${search}%,rubro.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)

  return query
}

function applySort(query: any, params: URLSearchParams) {
  const sortBy = params.get('sortBy') || 'created_at'
  const sortDirection = params.get('sortDirection') || 'desc'
  const safeSort = ALLOWED_SORTS.includes(sortBy) ? sortBy : 'created_at'
  const safeDir = sortDirection === 'asc' ? 'asc' : 'desc'
  return query.order(safeSort, { ascending: safeDir === 'asc' })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const searchId = searchParams.get('searchId')
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 50))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  if (searchId) {
    const { data: resultIds } = await supabaseAdmin
      .from('prospect_search_results')
      .select('prospect_id')
      .eq('search_id', searchId)

    if (!resultIds || resultIds.length === 0) {
      return NextResponse.json({ data: [], total: 0, page, pageSize })
    }

    const ids = resultIds.map((r: { prospect_id: number }) => r.prospect_id)

    let query = supabaseAdmin
      .from('prospects')
      .select('*', { count: 'exact' })
      .in('id', ids)

    query = applyFilters(query, searchParams, session.user.id)
    query = applySort(query, searchParams)
    query = query.range(from, to)

    const { data, count } = await query
    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, pageSize })
  }

  let query = supabaseAdmin
    .from('prospects')
    .select('*', { count: 'exact' })

  query = applyFilters(query, searchParams, session.user.id)
  query = applySort(query, searchParams)
  query = query.range(from, to)

  const { data, count } = await query
  return NextResponse.json({ data: data ?? [], total: count ?? 0, page, pageSize })
}
