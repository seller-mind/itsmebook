/**
 * 生成状态查询API - 是我呀
 * GET /api/story/generation-status?sessionId=xxx
 * 
 * 优先从内存缓存读取（同进程内可靠），fallback到Supabase
 */

import { NextRequest, NextResponse } from "next/server";

// 内存中的生成状态缓存（进程内共享）
export const generationCache = new Map<string, {
  status: string;
  progress: number;
  step: string;
  result?: any;
  updatedAt: number;
}>();

// 清理超过30分钟的缓存
function cleanOldCache() {
  const now = Date.now();
  generationCache.forEach((value, key) => {
    if (now - value.updatedAt > 30 * 60 * 1000) {
      generationCache.delete(key);
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "缺少sessionId参数" }, { status: 400 });
    }

    cleanOldCache();

    // 优先从内存缓存读取
    const cached = generationCache.get(sessionId);
    if (cached) {
      return NextResponse.json({
        success: true,
        exists: true,
        status: cached.status,
        progress: cached.progress,
        step: cached.step,
        result: cached.result || null,
      });
    }

    // 内存中没有，尝试从Supabase读取
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(url, serviceKey);

      const { data, error } = await supabase
        .from("story_generations")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          exists: true,
          status: data.status,
          progress: data.progress || 0,
          step: data.step || "",
          result: data.result || null,
        });
      }
    } catch (supabaseErr) {
      // Supabase不可用，忽略
    }

    // 都没有，返回不存在
    return NextResponse.json({
      success: true,
      exists: false,
      status: null,
      progress: 0,
      step: "",
      result: null,
    });

  } catch (error: any) {
    console.error("[GenerationStatus] Error:", error);
    return NextResponse.json({ success: false, message: error.message || "查询失败" }, { status: 500 });
  }
}
