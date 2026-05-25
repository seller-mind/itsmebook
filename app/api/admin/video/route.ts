/**
 * 视频导出API - 是我呀
 * POST /api/admin/video
 * 
 * 用于生成有声绘本视频（MP4格式）
 * 翻页动画 + 配音 + 字幕
 * 
 * 注意：由于Vercel serverless环境限制，视频渲染更适合在客户端完成
 * 此API主要用于准备资源和返回配置
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, pageDuration = 4, includeSubtitles = true } = body;

    if (!bookId) {
      return NextResponse.json(
        { success: false, message: "缺少绘本ID" },
        { status: 400 }
      );
    }

    // 从Supabase获取绘本
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, message: "服务未配置" },
        { status: 500 }
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: book, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error || !book) {
      return NextResponse.json(
        { success: false, message: "绘本不存在" },
        { status: 404 }
      );
    }

    // 返回视频渲染所需的资源和配置
    return NextResponse.json({
      success: true,
      videoConfig: {
        bookId: book.id,
        title: book.title,
        pageDuration,
        includeSubtitles,
        pages: book.pages?.map((page: any, index: number) => ({
          pageNumber: index + 1,
          imageUrl: page.image_url,
          text: page.text,
          audioUrl: page.audio_url,
        })) || [],
      },
      // 客户端渲染提示
      clientRender: true,
      message: "请使用客户端渲染导出视频",
    });

  } catch (error: any) {
    console.error("视频导出失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "导出失败" },
      { status: 500 }
    );
  }
}
