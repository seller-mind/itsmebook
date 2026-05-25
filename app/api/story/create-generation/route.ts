/**
 * 创建生成记录API - 是我呀
 * POST /api/story/create-generation
 * 在Supabase中创建生成记录，返回sessionId
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 获取Supabase服务客户端
function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { params } = body;

    if (!params) {
      return NextResponse.json({ success: false, message: "缺少params参数" }, { status: 400 });
    }

    // 生成sessionId
    const sessionId = crypto.randomUUID();

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("story_generations")
      .insert({
        session_id: sessionId,
        status: "pending",
        progress: 0,
        step: "准备开始生成...",
        params: params,
      })
      .select()
      .single();

    if (error) {
      console.error("[CreateGeneration] Insert error:", error);
      return NextResponse.json({ success: false, message: "创建生成记录失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sessionId: data.session_id,
    });

  } catch (error: any) {
    console.error("[CreateGeneration] Error:", error);
    return NextResponse.json({ success: false, message: error.message || "创建失败" }, { status: 500 });
  }
}
