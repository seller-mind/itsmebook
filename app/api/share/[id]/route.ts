/**
 * 分享绘本获取API - 是我呀
 * GET /api/share/[id]
 * 
 * 获取分享的绘本数据，无需登录
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;

    if (!bookId) {
      return NextResponse.json(
        { success: false, message: "缺少绘本ID" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, message: "服务未配置" },
        { status: 500 }
      );
    }

    // 从Supabase获取绘本
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

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
        character_name: book.character_name,
        character_age: book.character_age,
        theme: book.theme,
        style: book.style,
        pages: book.pages || [],
        created_at: book.created_at,
      },
    });

  } catch (error: any) {
    console.error("获取绘本失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "获取失败" },
      { status: 500 }
    );
  }
}
