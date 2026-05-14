import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 基础中间件 - Clerk认证中间件待配置后启用
// 配置 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 后，替换为 clerkMiddleware

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
