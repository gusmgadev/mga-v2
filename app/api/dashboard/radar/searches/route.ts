import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { searchCreateSchema } from '@/lib/radar/validations'
import { textSearch, getPlaceDetails, extractAddressComponents, API_COST } from '@/lib/radar/google-places'
import { normalizePhone, extractDomain, normalizeName, getDominantCategory } from '@/lib/radar/normalization'
import { findDuplicate } from '@/lib/radar/deduplication'
import { calculateAllScores } from '@/lib/radar/scoring'
import { fetchWebsiteEmails } from '@/lib/radar/website'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)
  const status = searchParams.get('status')

  let query = supabaseAdmin
    .from('prospect_searches')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)

  const { data } = await query
  return NextResponse.json(data ?? [])
}

async function logApiUsage(
  userId: string,
  searchId: number,
  apiType: 'text_search' | 'place_details' | 'nearby_search',
  querySummary: string,
  resultCount: number,
) {
  const cost = apiType === 'text_search' ? API_COST.TEXT_SEARCH
    : apiType === 'place_details' ? API_COST.PLACE_DETAILS
    : API_COST.NEARBY_SEARCH

  await supabaseAdmin.from('radar_api_usage').insert({
    user_id: userId,
    search_id: searchId,
    api_type: apiType,
    query_summary: querySummary.slice(0, 200),
    result_count: resultCount,
    estimated_cost: cost,
  }).maybeSingle()
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = searchCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const filters = parsed.data

  const { data: search, error: searchError } = await supabaseAdmin
    .from('prospect_searches')
    .insert({
      user_id: session.user.id,
      service_id: filters.serviceId ?? null,
      province: filters.province ?? null,
      city: filters.city ?? null,
      category: filters.category ?? null,
      keywords: filters.keywords ?? [],
      radius_km: filters.radiusKm ?? null,
      max_results: filters.maxResults ?? 50,
      website_filter: filters.websiteFilter ?? 'all',
      phone_required: filters.phoneRequired ?? false,
      email_required: filters.emailRequired ?? false,
      min_rating: filters.minRating ?? null,
      min_review_count: filters.minReviewCount ?? null,
      business_status_filter: filters.businessStatus ?? 'all',
      status: 'searching',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (searchError) return NextResponse.json({ error: searchError.message }, { status: 500 })
  const searchId = search.id

  try {
    const queries = buildQueries(filters)
    const targetMax = filters.maxResults ?? 50

    const { data: existingProspects } = await supabaseAdmin
      .from('prospects')
      .select('google_place_id, phone, website_domain, normalized_name, city, address')
    .eq('user_id', session.user.id)

    const userId = session.user.id

    async function logUsage(apiType: 'text_search' | 'place_details', summary: string, count: number) {
      await logApiUsage(userId, searchId, apiType, summary, count)
    }

    type QueryState = { query: string; pagetoken: string | null; exhausted: boolean }
    const queryStates: QueryState[] = queries.map((q) => ({ query: q, pagetoken: null, exhausted: false }))

    let savedCount = 0
    let analyzedCount = 0
    let position = 0
    let lastPagetoken: string | null = null
    const processedPlaceIds = new Set<string>()

    async function processResult(r: { place_id: string; name: string }, matchedQuery: string): Promise<void> {
      if (processedPlaceIds.has(r.place_id)) return
      if (savedCount >= targetMax) return

      const { details, error: detailsError } = await getPlaceDetails(r.place_id)
      await logApiUsage(userId, searchId, 'place_details', r.name, detailsError || !details ? 0 : 1)
      if (detailsError || !details) return

      const addressInfo = extractAddressComponents(details)
      const phone = details.formatted_phone_number ?? details.international_phone_number ?? null
      const website = details.website ?? null
      const categories = details.types ?? []

      let email: string | null = null
      const requiresPhone = !!filters.phoneRequired
      const requiresEmail = !!filters.emailRequired
      if (requiresEmail && website) {
        const emails = await fetchWebsiteEmails(website)
        email = emails[0] ?? null
      }

      const hasPhone = !!phone
      const hasEmail = !!email
      const passesContactFilter = !requiresPhone && !requiresEmail
        ? true
        : requiresPhone && requiresEmail
          ? hasPhone || hasEmail
          : requiresPhone
            ? hasPhone
            : hasEmail
      if (!passesContactFilter) {
        processedPlaceIds.add(r.place_id)
        return
      }

      const duplicate = findDuplicate(
        {
          google_place_id: details.place_id,
          phone,
          website,
          name: details.name,
          city: addressInfo.city,
          address: details.formatted_address,
        },
        existingProspects ?? []
      )

      if (duplicate) {
        processedPlaceIds.add(r.place_id)
        return
      }

      const domain = extractDomain(website)
      const normalizedName = normalizeName(details.name)
      const dominantCategory = getDominantCategory(categories)

      const scoringInput = {
        reviewCount: details.user_ratings_total ?? null,
        rating: details.rating ?? null,
        isOperational: details.business_status === 'OPERATIONAL',
        hasPhone: !!phone,
        hasWebsite: !!website,
        hasOpeningHours: !!details.opening_hours,
        hasAddress: !!details.formatted_address,
        prospectCategories: categories,
      }

      const scores = calculateAllScores(scoringInput)

      let recommendedServiceName: string | null = null
      if (filters.serviceId) {
        const { data: svc } = await supabaseAdmin
          .from('prospect_services')
          .select('name')
          .eq('id', filters.serviceId)
          .single()
        recommendedServiceName = svc?.name ?? null
      }

      const { data: prospect, error: prospectError } = await supabaseAdmin
        .from('prospects')
        .insert({
          user_id: userId,
          google_place_id: details.place_id,
          name: details.name,
          normalized_name: normalizedName,
          category: dominantCategory,
          categories,
          rubro: filters.category,
          country: addressInfo.country ?? null,
          province: addressInfo.province ?? null,
          city: addressInfo.city ?? null,
          address: details.formatted_address ?? null,
          postal_code: addressInfo.postal_code ?? null,
          latitude: details.geometry?.location?.lat ?? null,
          longitude: details.geometry?.location?.lng ?? null,
          phone,
          normalized_phone: normalizePhone(phone),
          whatsapp: phone ? normalizePhone(phone) : null,
          email,
          website,
          website_domain: domain,
          google_maps_url: details.url ?? null,
          rating: details.rating ?? null,
          review_count: details.user_ratings_total ?? null,
          business_status: details.business_status ?? null,
          opening_hours: details.opening_hours ?? null,
          commercial_activity_score: scores.commercialActivityScore,
          digital_need_score: scores.digitalNeedScore,
          contactability_score: scores.contactabilityScore,
          service_fit_score: scores.serviceFitScore,
          opportunity_score: scores.opportunityScore,
          opportunity_level: scores.opportunityLevel,
          recommended_service_id: filters.serviceId ?? null,
          recommended_service_name: recommendedServiceName,
          opportunity_reasons: JSON.stringify(scores.allReasons),
          analysis_status: 'ready',
          source: 'google_places',
          last_verified_at: new Date().toISOString(),
          analyzed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (prospectError) return

      await supabaseAdmin
        .from('prospect_search_results')
        .insert({
          search_id: searchId,
          prospect_id: prospect.id,
          position: ++position,
          matched_query: matchedQuery,
        })

      processedPlaceIds.add(r.place_id)
      savedCount++
      analyzedCount++
    }

    // First pass: fetch first page from all queries
    for (const qs of queryStates) {
      if (savedCount >= targetMax) break

      const { results, nextPageToken, error } = await textSearch({
        query: qs.query,
        radius: filters.radiusKm ? filters.radiusKm * 1000 : undefined,
        maxResults: 20,
      })
      await logApiUsage(userId, searchId, 'text_search', qs.query, results?.length ?? 0)

      if (error) { qs.exhausted = true; continue }
      qs.pagetoken = nextPageToken ?? null
      if (!nextPageToken) qs.exhausted = true
      lastPagetoken = nextPageToken ?? null

      for (const r of results) {
        if (savedCount >= targetMax) break
        await processResult(r, qs.query)
      }

      const progress = Math.min(Math.round((savedCount / targetMax) * 100), 99)
      await supabaseAdmin
        .from('prospect_searches')
        .update({
          total_found: position,
          total_saved: savedCount,
          total_analyzed: analyzedCount,
          progress,
          status: savedCount > 0 ? 'saving_results' : 'searching',
        })
        .eq('id', searchId)
    }

    // Pagination loop: re-fill with more pages until we reach targetMax
    const MAX_PAGE_ATTEMPTS = 10
    let pageAttempts = 0

    while (savedCount < targetMax && pageAttempts < MAX_PAGE_ATTEMPTS) {
      pageAttempts++
      const active = queryStates.find((qs) => !qs.exhausted && qs.pagetoken)
      if (!active) break

      await new Promise((r) => setTimeout(r, 1500))

      const { results, nextPageToken, error } = await textSearch({
        pagetoken: active.pagetoken ?? undefined,
        maxResults: 20,
      })
      await logApiUsage(
        userId, searchId, 'text_search',
        `${active.query} (página ${pageAttempts + 1})`,
        results?.length ?? 0,
      )

      if (error) { active.exhausted = true; continue }
      active.pagetoken = nextPageToken ?? null
      if (!nextPageToken) active.exhausted = true
      lastPagetoken = nextPageToken ?? null

      for (const r of results) {
        if (savedCount >= targetMax) break
        await processResult(r, active.query)
      }

      const progress = Math.min(Math.round((savedCount / targetMax) * 100), 99)
      await supabaseAdmin
        .from('prospect_searches')
        .update({
          total_found: position,
          total_saved: savedCount,
          total_analyzed: analyzedCount,
          progress,
        })
        .eq('id', searchId)
    }

    const finalStatus = savedCount > 0 ? 'completed' : 'partial'
    await supabaseAdmin
      .from('prospect_searches')
      .update({
        status: finalStatus,
        total_found: position,
        total_saved: savedCount,
        total_analyzed: analyzedCount,
        last_pagetoken: lastPagetoken,
        progress: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('id', searchId)

    const { data: finalSearch } = await supabaseAdmin
      .from('prospect_searches')
      .select('*')
      .eq('id', searchId)
      .single()

    return NextResponse.json(finalSearch, { status: 201 })
  } catch (err) {
    await supabaseAdmin
      .from('prospect_searches')
      .update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : 'Error desconocido',
        completed_at: new Date().toISOString(),
      })
      .eq('id', searchId)

    return NextResponse.json({
      error: 'Error al procesar la búsqueda',
      searchId,
    }, { status: 500 })
  }
}

function buildQueries(filters: {
  province?: string
  city?: string
  category?: string
  keywords?: string[]
}): string[] {
  const queries: string[] = []
  const location = [filters.city, filters.province].filter(Boolean).join(', ')

  if (filters.category) {
    queries.push(location ? `${filters.category} en ${location}` : filters.category)
  }

  for (const kw of filters.keywords ?? []) {
    if (!kw.trim()) continue
    queries.push(location ? `${kw.trim()} en ${location}` : kw.trim())
  }

  if (queries.length === 0 && location) {
    queries.push(`lugares en ${location}`)
  }

  return queries.length > 0 ? queries : ['lugares']
}
