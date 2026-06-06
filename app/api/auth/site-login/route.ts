import { NextRequest, NextResponse } from 'next/server'

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'itsmebook2026'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === SITE_PASSWORD) {
      const response = NextResponse.json({ success: true })
      // Set cookie for 30 days
      response.cookies.set('itsmebook_auth', SITE_PASSWORD, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })
      return response
    }

    return NextResponse.json({ success: false, message: '密码错误' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, message: '请求失败' }, { status: 400 })
  }
}
