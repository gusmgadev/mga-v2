// ─────────────────────────────────────────────────────────────────────────────
// types/radar.ts — Radar de Oportunidades
// ─────────────────────────────────────────────────────────────────────────────

// Estados
export type SearchStatus =
  | 'pending'
  | 'searching'
  | 'saving_results'
  | 'enriching'
  | 'scoring'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled'

export type ProspectAnalysisStatus =
  | 'pending_analysis'
  | 'analyzing'
  | 'ready'
  | 'analysis_failed'
  | 'excluded'

export type ProspectCommercialStatus =
  | 'new'
  | 'reviewed'
  | 'to_contact'
  | 'contacted'
  | 'interested'
  | 'meeting'
  | 'proposal_sent'
  | 'won'
  | 'lost'
  | 'discarded'
  | 'do_not_contact'
  | 'existing_customer'

export type OpportunityLevel =
  | 'very_low'
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high'

export type JobType =
  | 'places_search'
  | 'place_details'
  | 'website_analysis'
  | 'pagespeed_analysis'
  | 'crux_analysis'
  | 'score_calculation'
  | 'summary_generation'
  | 'csv_export'

export type JobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

// Filtros de búsqueda
export interface ProspectSearchFilters {
  province?: string
  city?: string
  radiusKm?: number
  category?: string
  keywords?: string[]
  maxResults?: number
  serviceId?: number
  websiteFilter?: 'all' | 'with_website' | 'without_website'
  phoneRequired?: boolean
  emailRequired?: boolean
  minRating?: number
  minReviewCount?: number
  businessStatus?: 'all' | 'operational'
}

// Razón de puntaje
export interface ScoreReason {
  code: string
  label: string
  impact: number
  category: 'commercial_activity' | 'digital_need' | 'contactability' | 'service_fit'
}

// Servicio configurable
export type ProspectService = {
  id: number
  user_id: string
  name: string
  description: string | null
  target_categories: string[]
  target_keywords: string[]
  problems_solved: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// Búsqueda
export type ProspectSearch = {
  id: number
  user_id: string
  service_id: number | null
  province: string | null
  city: string | null
  category: string | null
  keywords: string[]
  radius_km: number | null
  max_results: number
  website_filter: string
  phone_required: boolean
  email_required: boolean
  min_rating: number | null
  min_review_count: number | null
  business_status_filter: string
  status: SearchStatus
  total_found: number
  total_saved: number
  total_analyzed: number
  progress: number
  error_message: string | null
  last_pagetoken: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// Prospecto
export type Prospect = {
  id: number
  user_id: string
  google_place_id: string | null
  name: string
  normalized_name: string | null
  category: string | null
  categories: string[]
  rubro: string | null
  description: string | null
  country: string | null
  province: string | null
  city: string | null
  address: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  normalized_phone: string | null
  email: string | null
  whatsapp: string | null
  website: string | null
  website_domain: string | null
  google_maps_url: string | null
  rating: number | null
  review_count: number | null
  business_status: string | null
  opening_hours: Record<string, unknown> | null
  commercial_activity_score: number
  digital_need_score: number
  contactability_score: number
  service_fit_score: number
  opportunity_score: number
  opportunity_level: OpportunityLevel | null
  recommended_service_id: number | null
  recommended_service_name: string | null
  opportunity_summary: string | null
  opportunity_reasons: ScoreReason[]
  analysis_status: ProspectAnalysisStatus
  commercial_status: ProspectCommercialStatus
  do_not_contact: boolean
  exclusion_reason: string | null
  excluded_at: string | null
  source: string
  source_url: string | null
  source_data: Record<string, unknown> | null
  existing_client_id: number | null
  existing_servicio_id: number | null
  existing_client_notes: string | null
  closed_at: string | null
  last_verified_at: string | null
  analyzed_at: string | null
  created_at: string
  updated_at: string
}

// Relación búsqueda-prospecto
export type ProspectSearchResult = {
  id: number
  search_id: number
  prospect_id: number
  position: number | null
  matched_query: string | null
  created_at: string
}

// Análisis web
export type WebsiteAnalysis = {
  id: number
  prospect_id: number
  url: string
  final_url: string | null
  reachable: boolean | null
  http_status: number | null
  has_ssl: boolean | null
  is_mobile_friendly: boolean | null
  has_ecommerce: boolean | null
  has_catalog: boolean | null
  has_booking_system: boolean | null
  has_contact_form: boolean | null
  has_whatsapp: boolean | null
  has_customer_portal: boolean | null
  has_live_chat: boolean | null
  detected_emails: string[]
  detected_phones: string[]
  detected_social_links: Record<string, unknown>
  detected_technologies: string[]
  detected_keywords: string[]
  performance_score: number | null
  accessibility_score: number | null
  seo_score: number | null
  best_practices_score: number | null
  crux_available: boolean
  crux_data: Record<string, unknown> | null
  analysis_summary: string | null
  raw_data: Record<string, unknown> | null
  analyzed_at: string
}

// Interacción
export type ProspectInteraction = {
  id: number
  prospect_id: number
  user_id: string
  interaction_type: string
  channel: string | null
  notes: string | null
  interaction_date: string
  next_follow_up_at: string | null
  created_at: string
}

// Trabajo
export type ProspectJob = {
  id: number
  user_id: string
  search_id: number | null
  prospect_id: number | null
  job_type: JobType
  status: JobStatus
  attempts: number
  max_attempts: number
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  error_message: string | null
  scheduled_at: string
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// Uso de API externa (tracking de costos)
export type ApiUsageType = 'text_search' | 'place_details' | 'nearby_search'

export type RadarApiUsage = {
  id: number
  user_id: string
  search_id: number | null
  api_type: ApiUsageType
  query_summary: string | null
  result_count: number | null
  estimated_cost: number
  created_at: string
}

export interface ApiUsageSummary {
  text_search_count: number
  place_details_count: number
  total_cost: number
  usage: RadarApiUsage[]
}

// Parámetros de scoring
export interface ScoringWeights {
  commercial_activity: number
  digital_need: number
  contactability: number
  service_fit: number
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  commercial_activity: 0.30,
  digital_need: 0.35,
  contactability: 0.15,
  service_fit: 0.20,
}
