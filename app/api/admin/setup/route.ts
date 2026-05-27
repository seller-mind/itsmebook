/**
 * 数据库初始化 API
 * POST /api/admin/setup
 * 自动创建缺失的数据库表
 * 
 * 使用方式：部署后调用一次 POST /api/admin/setup
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const results: string[] = [];

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if books table exists by trying to query it
    const { error: booksError } = await supabase
      .from("books")
      .select("id")
      .limit(1);

    if (booksError && (booksError.message.includes("does not exist") || booksError.code === "42P01")) {
      results.push("books表不存在，需要手动创建");
      
      return NextResponse.json({
        success: false,
        message: "需要在Supabase Dashboard SQL Editor中执行以下SQL来创建books表",
        sql: `-- 创建books表
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  character_name TEXT DEFAULT '',
  character_age INTEGER DEFAULT 5,
  theme TEXT DEFAULT '',
  style TEXT DEFAULT '',
  pages JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Service role完全访问权限
CREATE POLICY "Service role full access" ON public.books
  FOR ALL USING (auth.role() = 'service_role');

-- 公开读取权限（分享链接需要）
CREATE POLICY "Public read" ON public.books
  FOR SELECT USING (true);`,
        dashboardUrl: "https://supabase.com/dashboard/project/sdeduzqplvsyttvnolxm/sql"
      });
    } else if (booksError) {
      results.push(`books表检查出错: ${booksError.message}`);
    } else {
      results.push("books表已存在 ✅");
    }

    // Check storage bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const bookImagesBucket = buckets?.find(b => b.name === "book-images");
    if (bookImagesBucket) {
      results.push("book-images Storage桶已存在 ✅");
    } else {
      results.push("book-images Storage桶不存在，需要创建");
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
      results
    }, { status: 500 });
  }
}
