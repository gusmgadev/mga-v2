export function normalizePhone(value?: string | null): string | null {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  return digits || null
}

export function extractDomain(url?: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

export function normalizeUrl(url?: string | null): string | null {
  if (!url) return null
  let cleaned = url.trim()
  if (!/^https?:\/\//i.test(cleaned)) cleaned = `https://${cleaned}`
  try {
    const u = new URL(cleaned)
    return u.origin + u.pathname.replace(/\/$/, '')
  } catch {
    return null
  }
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeProvince(province?: string | null): string | null {
  if (!province) return null
  const map: Record<string, string> = {
    'caba': 'Capital Federal',
    'capital federal': 'Capital Federal',
    'ciudad autonoma de buenos aires': 'Capital Federal',
    'bs as': 'Buenos Aires',
    'pcia de buenos aires': 'Buenos Aires',
    'provincia de buenos aires': 'Buenos Aires',
  }
  const key = province.toLowerCase().trim()
  return map[key] ?? province.trim()
}

export function getDominantCategory(categories: string[]): string | null {
  if (!categories || categories.length === 0) return null
  const priority = ['point_of_interest', 'establishment', 'political']
  for (const p of priority) {
    const found = categories.find((c) => c === p)
    if (found) return found
  }
  return categories[0]
}


