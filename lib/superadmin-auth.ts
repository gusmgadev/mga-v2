import { cookies } from 'next/headers'

const SECRET = process.env.SUPERADMIN_SECRET ?? 'change-me-in-env'
const COOKIE = 'sa_session'

export async function isSuperadminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return store.get(COOKIE)?.value === SECRET
}

export function setSuperadminCookie(res: Response): Response {
  res.headers.set(
    'Set-Cookie',
    `${COOKIE}=${SECRET}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`
  )
  return res
}

export function clearSuperadminCookie(res: Response): Response {
  res.headers.set(
    'Set-Cookie',
    `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`
  )
  return res
}
