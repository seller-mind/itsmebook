/**
 * 生成状态查询API - 是我呀
 * GET /api/story/generation-status?sessionId=xxx
 * 
 * Supabase优先（跨实例可靠），内存缓存作为补充
 */

import { NextRequest, NextResponse } from "next/server";

// 内存中的生成状态缓存（同进程内可靠）
export const generationCache = new Map<string, {
  status: string;
  progress: number;
  step: string;
  result?: any;
  updatedAt: number;
}>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "缺少sessionId参数" }, { status: 400 });
    }

    // 清理过期缓存
    const now = Date.now();
    generationCache.forEach((value, key) => {
      if (now - value.updatedAt > 30 * 60 * 1000) generationCache.delete(key);
    });

    // 优先从Supabase读取（跨serverless实例可靠）
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
        // 同步到内存缓存
        generationCache.set(sessionId, {
          status: data.status,
          progress: data.progress || 0,
          step: data.step || "",
          result: data.result,
          updatedAt: now,
        });
        
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
      console.error("[GenerationStatus] Supabase查询失败:", supabaseErr);
    }

    // Supabase没数据，尝试内存缓存
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

    // 都没有
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
