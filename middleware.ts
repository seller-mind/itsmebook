import { clerkMiddleware } from '@clerk/nextjs/server'

// Plan B: 所有路由放行，不再强制登录
// Clerk 组件仍然保留，只是移除路由级别的保护
export default clerkMiddleware(async () => {
  // 不拦截任何路由，允许匿名访问
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
