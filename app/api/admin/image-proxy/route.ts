/**
 * 图片代理API - 是我呀
 * GET /api/admin/image-proxy?url=XXX
 * 
 * 解决dashscope OSS图片不支持CORS的问题
 * 服务端中转图片并添加CORS头，使Canvas可以读取图片数据
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // 安全检查：只允许已知图片域名
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
    const isAllowed = allowedPatterns.some(pattern => urlObj.hostname.includes(pattern));
    if (!isAllowed) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
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
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Max-Age": "86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Image fetch failed" }, { status: 500 });
  }
}

// 处理CORS预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Max-Age": "86400",
    },
  });
}
