import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const pathname = req.nextUrl.pathname

  if (
    pathname.startsWith('/dashboard/admin') &&
    session?.user.role !== 'Administrador'
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  if (
    (pathname === '/auth/signin' || pathname === '/auth/registro') &&
    session
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
