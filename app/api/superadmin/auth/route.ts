import { NextRequest, NextResponse } from 'next/server'
import { setSuperadminCookie, clearSuperadminCookie } from '@/lib/superadmin-auth'

const SECRET = process.env.SUPERADMIN_SECRET ?? 'change-me-in-env'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== SECRET) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  return setSuperadminCookie(res as unknown as Response) as unknown as NextResponse
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  return clearSuperadminCookie(res as unknown as Response) as unknown as NextResponse
}
