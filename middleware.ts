import { NextRequest, NextResponse } from 'next/server'

const locales = ['zh', 'en']
const defaultLocale = 'zh'

function getLocale(request: NextRequest): string {
  // 1. 检查cookie中是否已选择语言
  const langCookie = request.cookies.get('itsmebook_lang')?.value
  if (langCookie && locales.includes(langCookie)) {
    return langCookie
  }
  
  // 2. 从Accept-Language头检测
  const acceptLang = request.headers.get('accept-language')
  if (acceptLang) {
    const preferred = acceptLang.split(',')[0].split('-')[0].toLowerCase()
    if (locales.includes(preferred)) {
      return preferred
    }
  }
  
  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 检查是否已有语言前缀
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) {
    // 已有语言前缀，检查/create路由的登录保护
    const langMatch = pathname.match(/^\/(zh|en)/)
    const lang = langMatch ? langMatch[1] : defaultLocale
    
    if (pathname.includes('/create')) {
      const token = request.cookies.get('itsmebook_token')?.value
      if (!token) {
        const signInUrl = new URL(`/${lang}/sign-in`, request.url)
        signInUrl.searchParams.set('redirect_url', pathname)
        return NextResponse.redirect(signInUrl)
      }
    }
    return NextResponse.next()
  }
  
  // API路由、静态文件不重定向
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/sample-books') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }
  
  // 根路径或无语言前缀的路径，重定向到对应语言
  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: ['/((?!api|_next|icons|favicon|manifest|sw|sample-books|og-image|placeholder).*?)'],
}
