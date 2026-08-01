import type { ScoreReason, ScoringWeights, OpportunityLevel } from '@/types/radar'
import { DEFAULT_SCORING_WEIGHTS } from '@/types/radar'

export interface ScoringInput {
  reviewCount?: number | null
  rating?: number | null
  isOperational?: boolean | null
  hasPhone?: boolean | null
  hasWebsite?: boolean | null
  hasOpeningHours?: boolean | null
  cruxAvailable?: boolean | null
  websiteReachable?: boolean | null
  hasSsl?: boolean | null
  isMobileFriendly?: boolean | null
  performanceScore?: number | null
  hasCatalog?: boolean | null
  hasEcommerce?: boolean | null
  hasBookingSystem?: boolean | null
  hasContactForm?: boolean | null
  hasWhatsapp?: boolean | null
  hasEmail?: boolean | null
  hasAddress?: boolean | null
  targetCategories?: string[] | null
  prospectCategories?: string[] | null
}

export function calculateCommercialActivityScore(
  input: ScoringInput
): { score: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = []
  let score = 0

  const rc = input.reviewCount ?? 0
  if (rc >= 100) { score += 30; reasons.push({ code: 'HIGH_REVIEW_COUNT', label: 'Tiene más de 100 reseñas', impact: 30, category: 'commercial_activity' }) }
  else if (rc >= 30) { score += 22; reasons.push({ code: 'MEDIUM_REVIEW_COUNT', label: 'Tiene entre 30 y 99 reseñas', impact: 22, category: 'commercial_activity' }) }
  else if (rc >= 5) { score += 12; reasons.push({ code: 'LOW_REVIEW_COUNT', label: 'Tiene entre 5 y 29 reseñas', impact: 12, category: 'commercial_activity' }) }

  const rt = input.rating ?? 0
  if (rt >= 4.5) { score += 15; reasons.push({ code: 'HIGH_RATING', label: 'Calificación excelente (4.5+)', impact: 15, category: 'commercial_activity' }) }
  else if (rt >= 4) { score += 10; reasons.push({ code: 'GOOD_RATING', label: 'Buena calificación (4.0+)', impact: 10, category: 'commercial_activity' }) }

  if (input.isOperational) { score += 15; reasons.push({ code: 'OPERATIONAL', label: 'El negocio está operativo', impact: 15, category: 'commercial_activity' }) }
  if (input.hasPhone) { score += 10; reasons.push({ code: 'HAS_PHONE', label: 'Tiene teléfono público', impact: 10, category: 'commercial_activity' }) }
  if (input.hasWebsite) { score += 10; reasons.push({ code: 'HAS_WEBSITE', label: 'Tiene sitio web', impact: 10, category: 'commercial_activity' }) }
  if (input.hasOpeningHours) { score += 10; reasons.push({ code: 'HAS_OPENING_HOURS', label: 'Tiene horarios cargados', impact: 10, category: 'commercial_activity' }) }
  if (input.cruxAvailable) { score += 10; reasons.push({ code: 'CRUX_AVAILABLE', label: 'Tiene datos CrUX disponibles', impact: 10, category: 'commercial_activity' }) }

  return { score: Math.min(score, 100), reasons }
}

export function calculateDigitalNeedScore(
  input: ScoringInput
): { score: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = []

  if (!input.hasWebsite) {
    reasons.push({ code: 'NO_WEBSITE', label: 'No se encontró sitio web', impact: 90, category: 'digital_need' })
    return { score: 90, reasons }
  }

  let score = 0

  if (input.websiteReachable === false) { score += 30; reasons.push({ code: 'WEBSITE_UNREACHABLE', label: 'El sitio web no está accesible', impact: 30, category: 'digital_need' }) }
  if (input.hasSsl === false) { score += 15; reasons.push({ code: 'NO_SSL', label: 'El sitio no tiene SSL', impact: 15, category: 'digital_need' }) }
  if (input.isMobileFriendly === false) { score += 20; reasons.push({ code: 'NOT_MOBILE_FRIENDLY', label: 'El sitio no es responsive', impact: 20, category: 'digital_need' }) }

  const ps = input.performanceScore ?? 100
  if (ps < 40) { score += 20; reasons.push({ code: 'LOW_PERFORMANCE', label: 'Rendimiento móvil muy bajo', impact: 20, category: 'digital_need' }) }
  else if (ps < 60) { score += 12; reasons.push({ code: 'MEDIUM_PERFORMANCE', label: 'Rendimiento móvil mejorable', impact: 12, category: 'digital_need' }) }

  if (!input.hasCatalog) { score += 5; reasons.push({ code: 'NO_CATALOG', label: 'No tiene catálogo online', impact: 5, category: 'digital_need' }) }
  if (!input.hasEcommerce) { score += 5; reasons.push({ code: 'NO_ECOMMERCE', label: 'No tiene e-commerce', impact: 5, category: 'digital_need' }) }
  if (!input.hasBookingSystem) { score += 5; reasons.push({ code: 'NO_BOOKING', label: 'No tiene sistema de turnos', impact: 5, category: 'digital_need' }) }
  if (!input.hasContactForm) { score += 5; reasons.push({ code: 'NO_CONTACT_FORM', label: 'No tiene formulario de contacto', impact: 5, category: 'digital_need' }) }

  return { score: Math.min(score, 100), reasons }
}

export function calculateContactabilityScore(
  input: ScoringInput
): { score: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = []
  let score = 0

  if (input.hasWhatsapp) { score += 30; reasons.push({ code: 'HAS_WHATSAPP', label: 'Tiene WhatsApp', impact: 30, category: 'contactability' }) }
  if (input.hasPhone) { score += 25; reasons.push({ code: 'HAS_PHONE', label: 'Tiene teléfono público', impact: 25, category: 'contactability' }) }
  if (input.hasEmail) { score += 25; reasons.push({ code: 'HAS_EMAIL', label: 'Tiene correo electrónico', impact: 25, category: 'contactability' }) }
  if (input.hasContactForm) { score += 10; reasons.push({ code: 'HAS_CONTACT_FORM', label: 'Tiene formulario de contacto', impact: 10, category: 'contactability' }) }
  if (input.hasAddress) { score += 10; reasons.push({ code: 'HAS_ADDRESS', label: 'Tiene dirección pública', impact: 10, category: 'contactability' }) }

  return { score: Math.min(score, 100), reasons }
}

export function calculateServiceFitScore(
  input: ScoringInput
): { score: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = []

  if (!input.targetCategories || input.targetCategories.length === 0) {
    reasons.push({ code: 'NO_TARGET_SET', label: 'No hay categorías target configuradas', impact: 0, category: 'service_fit' })
    return { score: 50, reasons }
  }

  const prospectCats = (input.prospectCategories ?? []).map((c) => c.toLowerCase())
  const targetCats = input.targetCategories.map((c) => c.toLowerCase())

  const matchCount = prospectCats.filter((pc) =>
    targetCats.some((tc) => pc.includes(tc) || tc.includes(pc))
  ).length

  if (matchCount > 0) {
    const score = Math.min(matchCount * 30, 100)
    reasons.push({
      code: 'CATEGORY_MATCH',
      label: `Coincide con ${matchCount} categoría(s) target`,
      impact: score,
      category: 'service_fit',
    })
    return { score, reasons }
  }

  reasons.push({ code: 'NO_CATEGORY_MATCH', label: 'No coincide con categorías target', impact: 20, category: 'service_fit' })
  return { score: 20, reasons }
}

export function calculateAllScores(
  input: ScoringInput,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): {
  commercialActivityScore: number
  commercialActivityReasons: ScoreReason[]
  digitalNeedScore: number
  digitalNeedReasons: ScoreReason[]
  contactabilityScore: number
  contactabilityReasons: ScoreReason[]
  serviceFitScore: number
  serviceFitReasons: ScoreReason[]
  opportunityScore: number
  opportunityLevel: OpportunityLevel
  allReasons: ScoreReason[]
} {
  const { score: caScore, reasons: caReasons } = calculateCommercialActivityScore(input)
  const { score: dnScore, reasons: dnReasons } = calculateDigitalNeedScore(input)
  const { score: ctScore, reasons: ctReasons } = calculateContactabilityScore(input)
  const { score: sfScore, reasons: sfReasons } = calculateServiceFitScore(input)

  const opportunityScore = Math.round(
    caScore * weights.commercial_activity +
    dnScore * weights.digital_need +
    ctScore * weights.contactability +
    sfScore * weights.service_fit
  )

  const opportunityLevel = getOpportunityLevel(opportunityScore)
  const allReasons = [...caReasons, ...dnReasons, ...ctReasons, ...sfReasons]

  return {
    commercialActivityScore: caScore,
    commercialActivityReasons: caReasons,
    digitalNeedScore: dnScore,
    digitalNeedReasons: dnReasons,
    contactabilityScore: ctScore,
    contactabilityReasons: ctReasons,
    serviceFitScore: sfScore,
    serviceFitReasons: sfReasons,
    opportunityScore,
    opportunityLevel,
    allReasons,
  }
}

export function getOpportunityLevel(score: number): OpportunityLevel {
  if (score >= 80) return 'very_high'
  if (score >= 65) return 'high'
  if (score >= 45) return 'medium'
  if (score >= 25) return 'low'
  return 'very_low'
}
