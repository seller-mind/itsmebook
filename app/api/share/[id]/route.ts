/**
 * 分享绘本获取API - 是我呀
 * GET /api/share/[id]
 * 
 * 获取分享的绘本数据，无需登录
 * 优先从books表读取，如果books表不存在则从story_generations表读取
 */

import { NextRequest, NextResponse } from "next/server";

interface BookPage {
  page_number: number;
  text: string;
  image_url: string;
  image_prompt?: string;
}

interface BookData {
  id: string;
  title: string;
  character_name: string;
  character_age: number;
  theme: string;
  style: string;
  pages: BookPage[];
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params: routeParams }: { params: { id: string } }
) {
  try {
    const bookId = routeParams.id;

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

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 优先从books表读取
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (book && !bookError) {
      const bookResult: BookData = {
        id: book.id,
        title: book.title,
        character_name: book.character_name || "",
        character_age: book.character_age || 5,
        theme: book.theme || "",
        style: book.style || "",
        pages: book.pages || [],
        created_at: book.created_at,
      };
      return NextResponse.json({ success: true, book: bookResult });
    }

    // 2. Fallback: 从story_generations表通过bookId查找
    const { data: generations, error: genError } = await supabase
      .from("story_generations")
      .select("result, params, created_at")
      .eq("status", "completed")
      .limit(50);

    if (genError || !generations) {
      return NextResponse.json(
        { success: false, message: "绘本不存在" },
        { status: 404 }
      );
    }

    // 在结果中查找匹配的bookId
    const matchedGen = generations.find(
      (g: any) => g.result?.bookId === bookId
    );

    if (!matchedGen || !matchedGen.result) {
      return NextResponse.json(
        { success: false, message: "绘本不存在或已过期" },
        { status: 404 }
      );
    }

    const result = matchedGen.result;
    const genParams = matchedGen.params || {};

    const bookResult: BookData = {
      id: bookId,
      title: result.title || "我的绘本",
      character_name: genParams.childName || "",
      character_age: genParams.childAge || 5,
      theme: genParams.themeId || "",
      style: genParams.styleId || "",
      pages: (result.pages || []).map((p: any) => ({
        page_number: p.page_number || p.pageNumber,
        text: p.text,
        image_url: p.image_url || p.imageUrl || "",
        image_prompt: p.image_prompt || "",
      })),
      created_at: matchedGen.created_at,
    };

    return NextResponse.json({ success: true, book: bookResult });

  } catch (error: any) {
    console.error("获取绘本失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "获取失败" },
      { status: 500 }
    );
  }
}
