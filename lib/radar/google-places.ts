const GOOGLE_PLACES_BASE = 'https://maps.googleapis.com/maps/api/place'

export const API_COST = {
  TEXT_SEARCH: 0.017,
  PLACE_DETAILS: 0.017,
  NEARBY_SEARCH: 0.017,
} as const

interface PlaceTextSearchParams {
  query?: string
  radius?: number
  location?: { lat: number; lng: number }
  pagetoken?: string
  maxResults?: number
}

interface PlaceResult {
  place_id: string
  name: string
  formatted_address?: string
  geometry?: { location: { lat: number; lng: number } }
  rating?: number
  user_ratings_total?: number
  types?: string[]
  business_status?: string
  vicinity?: string
}

export interface GooglePlaceDetails {
  place_id: string
  name: string
  formatted_address?: string
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  geometry?: { location: { lat: number; lng: number } }
  rating?: number
  user_ratings_total?: number
  types?: string[]
  business_status?: string
  formatted_phone_number?: string
  website?: string
  url?: string
  opening_hours?: { weekday_text?: string[] }
  international_phone_number?: string
}

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY no configurada')
  return key
}

export async function textSearch(
  params: PlaceTextSearchParams
): Promise<{ results: PlaceResult[]; nextPageToken?: string | null; error?: string }> {
  const key = getApiKey()
  const url = new URL(`${GOOGLE_PLACES_BASE}/textsearch/json`)
  url.searchParams.set('key', key)

  if (params.pagetoken) {
    url.searchParams.set('pagetoken', params.pagetoken)
  } else {
    url.searchParams.set('query', params.query!)
    url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,rating,user_ratings_total,types,business_status')
    if (params.radius) url.searchParams.set('radius', String(params.radius))
    if (params.location) url.searchParams.set('location', `${params.location.lat},${params.location.lng}`)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    return { results: [], error: `Google Places API error: ${response.status}` }
  }

  const data = await response.json()
  if (data.status === 'ZERO_RESULTS') {
    return { results: [], nextPageToken: null }
  }
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return { results: [], error: `Google Places API: ${data.status} - ${data.error_message ?? ''}` }
  }

  const results = (data.results ?? []).slice(0, params.maxResults ?? 20)
  const lastToken = data.next_page_token ?? null
  return { results, nextPageToken: lastToken ? String(lastToken) : null }
}

export async function nearbySearch(params: {
  location: { lat: number; lng: number }
  radius: number
  keyword?: string
  type?: string
  maxResults?: number
}): Promise<{ results: PlaceResult[]; error?: string }> {
  const key = getApiKey()
  const url = new URL(`${GOOGLE_PLACES_BASE}/nearbysearch/json`)
  url.searchParams.set('location', `${params.location.lat},${params.location.lng}`)
  url.searchParams.set('radius', String(params.radius))
  url.searchParams.set('key', key)
  if (params.keyword) url.searchParams.set('keyword', params.keyword)
  if (params.type && params.type !== 'all') url.searchParams.set('type', params.type)

  const allResults: PlaceResult[] = []
  let nextPageToken: string | null = null

  do {
    const response = await fetch(url.toString())
    if (!response.ok) return { results: [], error: `Google Places API error: ${response.status}` }

    const data = await response.json()
    if (data.status === 'ZERO_RESULTS') break
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return { results: [], error: `Google Places API: ${data.status} - ${data.error_message ?? ''}` }
    }

    if (data.results) allResults.push(...data.results)
    nextPageToken = data.next_page_token ?? null

    if (nextPageToken && allResults.length < (params.maxResults ?? 50)) {
      url.searchParams.set('pagetoken', nextPageToken)
      await new Promise((r) => setTimeout(r, 1500))
    } else {
      nextPageToken = null
    }
  } while (nextPageToken)

  const max = params.maxResults ?? 50
  return { results: allResults.slice(0, max) }
}

export async function getPlaceDetails(placeId: string): Promise<{ details?: GooglePlaceDetails; error?: string }> {
  const key = getApiKey()
  const url = new URL(`${GOOGLE_PLACES_BASE}/details/json`)
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('key', key)
  url.searchParams.set('fields', 'place_id,name,formatted_address,address_components,geometry,rating,user_ratings_total,types,business_status,formatted_phone_number,international_phone_number,website,url,opening_hours/weekday_text')

  const response = await fetch(url.toString())
  if (!response.ok) return { error: `Google Places API error: ${response.status}` }

  const data = await response.json()
  if (data.status !== 'OK') {
    return { error: `Google Places API: ${data.status} - ${data.error_message ?? ''}` }
  }

  return { details: data.result as GooglePlaceDetails }
}

export function extractAddressComponents(
  details: GooglePlaceDetails
): { country?: string; province?: string; city?: string; postal_code?: string } {
  const result: { country?: string; province?: string; city?: string; postal_code?: string } = {}

  for (const comp of details.address_components ?? []) {
    if (comp.types.includes('country')) result.country = comp.long_name
    if (comp.types.includes('administrative_area_level_1')) result.province = comp.long_name
    if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) result.city = comp.long_name
    if (comp.types.includes('postal_code')) result.postal_code = comp.long_name
  }

  return result
}
