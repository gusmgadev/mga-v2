import { normalizeUrl } from './normalization'

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico']

export function extractEmailsFromHtml(html: string): string[] {
  const found = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = EMAIL_REGEX.exec(html))) {
    const email = match[0].toLowerCase()
    const extension = email.split('@')[0].split('.').pop() ?? ''
    if (IMAGE_EXTENSIONS.includes(`.${extension}`)) continue
    found.add(email)
    if (found.size >= 5) break
  }
  return [...found]
}

export async function fetchWebsiteEmails(url?: string | null): Promise<string[]> {
  if (!url) return []
  const normalized = normalizeUrl(url)
  if (!normalized) return []

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(normalized, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MGA Radar/1.0)' },
    })

    clearTimeout(timeout)
    if (!res.ok) return []

    const text = await res.text()
    return extractEmailsFromHtml(text)
  } catch {
    return []
  }
}
