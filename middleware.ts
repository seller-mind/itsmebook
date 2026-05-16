import { NextRequest, NextResponse } from 'next/server'

// 中间件：拦截未登录用户访问/create
// 通过cookie检查登录状态（登录时同步写入cookie）
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/create' || pathname.startsWith('/create/')) {
    const token = request.cookies.get('itsmebook_token')?.value
    
    if (!token) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/create/:path*'],
}
