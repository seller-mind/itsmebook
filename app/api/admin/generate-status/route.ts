/**
 * 生成状态查询 - 是我呀
 * GET /api/admin/generate-status?sessionId=XXX
 * 
 * 从 Supabase 查询当前生成进度，供前端轮询使用。
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ success: false, message: "缺少sessionId" }, { status: 400 });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("story_generations")
      .select("status, progress, step, result, params")
      .eq("session_id", sessionId)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: "未找到生成记录" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: data.status,       // "generating" | "completed" | "failed"
      progress: data.progress,    // 0-100
      step: data.step,           // 当前步骤描述
      result: data.result,       // 生成结果（包含pages等）
      params: data.params,       // 原始参数
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
