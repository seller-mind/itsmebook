import { NextRequest, NextResponse } from 'next/server'

// Site-wide password protection (private use only)
// Accessible from China - password-protected for owner's personal use only
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'itsmebook2026'

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow these paths without password
  const publicPaths = ['/login', '/api/auth/site-login']
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Allow static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  // Check password cookie
  const authCookie = request.cookies.get('itsmebook_auth')?.value
  
  if (authCookie === SITE_PASSWORD) {
    return NextResponse.next()
  }

  // Redirect to login
  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
