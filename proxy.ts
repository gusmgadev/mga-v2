import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const pathname = req.nextUrl.pathname

  // Superadmin: proteger todas las rutas excepto /superadmin/login
  if (pathname.startsWith('/superadmin') && pathname !== '/superadmin/login') {
    const cookie = req.cookies.get('sa_session')
    const secret = process.env.SUPERADMIN_SECRET ?? 'change-me-in-env'
    if (cookie?.value !== secret) {
      return NextResponse.redirect(new URL('/superadmin/login', req.url))
    }
  }

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
