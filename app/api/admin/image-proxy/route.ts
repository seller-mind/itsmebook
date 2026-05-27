/**
 * 图片代理API - 是我呀
 * GET /api/admin/image-proxy?url=XXX
 * POST /api/admin/image-proxy  body: { url: "XXX" }
 * 
 * 解决dashscope OSS图片不支持CORS的问题
 * 服务端中转图片并添加CORS头，使Canvas可以读取图片数据
 * 
 * 推荐使用POST方式传递URL，避免GET query中OSS签名参数被截断
 */

import { NextRequest, NextResponse } from "next/server";

// 校验URL是否来自允许的域名
function isUrlAllowed(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedPatterns = [
      "dashscope-result-bj.oss-cn-beijing.aliyuncs.com",
      "dashscope-7c2c.oss-accelerate.aliyuncs.com",
      ".oss-cn-beijing.aliyuncs.com",
      ".oss-accelerate.aliyuncs.com",
      ".aliyuncs.com",
      "placehold.co",
      "images.unsplash.com",
    ];
    return allowedPatterns.some(pattern => urlObj.hostname.includes(pattern));
  } catch {
    return false;
  }
}

// 实际获取图片的逻辑
async function fetchImage(url: string) {
  if (!isUrlAllowed(url)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ItsMeBook/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: response.status });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Max-Age": "86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Image fetch failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  let url = request.nextUrl.searchParams.get("url");
  const b64 = request.nextUrl.searchParams.get("b64");
  
  // 优先用base64编码的URL（避免OSS签名参数被截断）
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

// POST方式：body中传URL，避免GET query中OSS签名参数被截断
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

// 处理CORS预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Max-Age": "86400",
    },
  });
}
