import { normalizePhone, extractDomain, normalizeName } from './normalization'
import type { GooglePlaceDetails } from './google-places'

interface ExistingProspect {
  google_place_id: string | null
  phone: string | null
  website_domain: string | null
  normalized_name: string | null
  city: string | null
  address: string | null
}

export function findDuplicate(
  candidate: {
    google_place_id?: string | null
    phone?: string | null
    website?: string | null
    name: string
    city?: string | null
    address?: string | null
  },
  existing: ExistingProspect[]
): ExistingProspect | null {
  const candidatePhone = normalizePhone(candidate.phone)
  const candidateDomain = extractDomain(candidate.website)
  const candidateName = normalizeName(candidate.name)
  const candidateAddress = normalizeName(candidate.address ?? '')

  for (const ex of existing) {
    if (candidate.google_place_id && ex.google_place_id && candidate.google_place_id === ex.google_place_id) {
      return ex
    }

    if (candidatePhone && ex.phone) {
      const exPhone = normalizePhone(ex.phone)
      if (exPhone && candidatePhone === exPhone) return ex
    }

    if (candidateDomain && ex.website_domain && candidateDomain === ex.website_domain) {
      return ex
    }

    if (candidateName && ex.normalized_name && candidateName === ex.normalized_name &&
        candidate.city && ex.city && candidate.city.toLowerCase() === ex.city.toLowerCase()) {
      return ex
    }

    if (candidateAddress && ex.address) {
      const exAddress = normalizeName(ex.address)
      if (candidateAddress === exAddress) return ex
    }
  }

  return null
}
