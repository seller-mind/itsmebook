/**
 * 生成状态查询API - 是我呀
 * GET /api/story/generation-status?sessionId=xxx
 * 从Supabase查询生成进度，用于用户切走页面后返回时获取状态
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 获取Supabase客户端（使用anon key，允许客户端读取）
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "缺少sessionId参数" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("story_generations")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) {
      // 如果记录不存在，返回空状态
      if (error.code === "PGRST116") {
        return NextResponse.json({
          success: true,
          exists: false,
          status: null,
          progress: 0,
          step: "",
          result: null,
        });
      }
      console.error("[GenerationStatus] Query error:", error);
      return NextResponse.json({ success: false, message: "查询失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      status: data.status,
      progress: data.progress || 0,
      step: data.step || "",
      params: data.params,
      result: data.result,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });

  } catch (error: any) {
    console.error("[GenerationStatus] Error:", error);
    return NextResponse.json({ success: false, message: error.message || "查询失败" }, { status: 500 });
  }
}
