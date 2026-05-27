/**
 * 图片代理API - 是我呀 V2（兼容层）
 * 
 * 主要用途：兼容旧数据中的dashscope临时URL
 * 新生成的图片已存储在Supabase Storage，直接访问无需代理
 * 
 * GET /api/admin/image-proxy?url=XXX
 * GET /api/admin/image-proxy?b64=XXX  (base64编码的URL，避免&参数截断)
 * 
 * 使用说明：
 * - 新图片：存储在Supabase Storage，有CORS支持，直接使用无需代理
 * - 旧图片：dashscope临时URL走此代理解决CORS问题
 */

import { NextRequest, NextResponse } from "next/server";

// 允许的域名
const ALLOWED_HOSTS = [
  "dashscope-result-bj.oss-cn-beijing.aliyuncs.com",
  "dashscope-7c2c.oss-accelerate.aliyuncs.com",
  ".oss-cn-beijing.aliyuncs.com",
  ".oss-accelerate.aliyuncs.com",
  ".aliyuncs.com",
  "dashscope",
];

// 校验URL是否来自允许的域名
function isUrlAllowed(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    return ALLOWED_HOSTS.some(pattern => hostname.includes(pattern));
  } catch {
    return false;
  }
}

// 获取图片数据
async function fetchImage(url: string): Promise<NextResponse> {
  if (!isUrlAllowed(url)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ItsMeBook/1.0)",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream fetch failed: ${response.status}` },
        { status: response.status }
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: "Image fetch timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Image fetch failed" }, { status: 500 });
  }
}

// GET方式：支持url参数或base64编码的b64参数
export async function GET(request: NextRequest) {
  let url = request.nextUrl.searchParams.get("url");
  const b64 = request.nextUrl.searchParams.get("b64");

  // 优先用base64编码的URL（避免OSS签名参数&被截断）
  if (b64) {
    try {
      url = Buffer.from(b64, "base64url").toString("utf-8");
    } catch {
      return NextResponse.json({ error: "Invalid base64 URL" }, { status: 400 });
    }
  }

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  return fetchImage(url);
}

// POST方式：body中传URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url;
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }
    return fetchImage(url);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// CORS预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
