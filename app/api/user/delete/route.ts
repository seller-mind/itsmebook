import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 获取Supabase客户端（优先使用service_role_key绕过RLS）
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // 优先使用service_role_key，如果没有则fallback到anon_key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

// 从JWT Token获取用户ID
function getUserIdFromToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    // JWT payload decoding (base64)
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    return decoded.sub || decoded.user_id || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // 从请求体或Header获取用户ID
    let userId: string | null = null;
    
    // 优先从Authorization header获取
    userId = getUserIdFromToken(request);
    
    // 如果没有token，尝试从请求体获取（本地存储模式）
    if (!userId) {
      try {
        const body = await request.json();
        userId = body.userId || null;
      } catch {
        // 请求体为空或解析失败
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "无法确认用户身份" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 按依赖顺序删除数据（先删除子表，再删除主表）
    
    // 1. 删除chat_sessions（会话记录）
    try {
      await supabase
        .from("chat_sessions")
        .delete()
        .eq("user_id", userId);
    } catch (e) {
      console.log("chat_sessions delete skipped or failed:", e);
    }

    // 2. 删除orders（订单记录）
    try {
      await supabase
        .from("orders")
        .delete()
        .eq("user_id", userId);
    } catch (e) {
      console.log("orders delete skipped or failed:", e);
    }

    // 3. 删除subscriptions（订阅记录）
    try {
      await supabase
        .from("subscriptions")
        .delete()
        .eq("user_id", userId);
    } catch (e) {
      console.log("subscriptions delete skipped or failed:", e);
    }

    // 4. 删除books（绘本内容）- 包括关联的图片和音频
    try {
      // 先获取绘本列表
      const { data: books } = await supabase
        .from("books")
        .select("id")
        .eq("user_id", userId);
      
      if (books && books.length > 0) {
        const bookIds = books.map((b) => b.id);
        // 删除绘本页面
        await supabase
          .from("book_pages")
          .delete()
          .in("book_id", bookIds);
        // 删除绘本
        await supabase
          .from("books")
          .delete()
          .eq("user_id", userId);
      }
    } catch (e) {
      console.log("books delete skipped or failed:", e);
    }

    // 5. 删除tension_results（测评结果）
    try {
      await supabase
        .from("tension_results")
        .delete()
        .eq("user_id", userId);
    } catch (e) {
      console.log("tension_results delete skipped or failed:", e);
    }

    // 6. 删除interview_sessions（访谈记录）
    try {
      await supabase
        .from("interview_sessions")
        .delete()
        .eq("user_id", userId);
    } catch (e) {
      console.log("interview_sessions delete skipped or failed:", e);
    }

    // 7. 删除interview_reports（访谈报告）
    try {
      await supabase
        .from("interview_reports")
        .delete()
        .eq("user_id", userId);
    } catch (e) {
      console.log("interview_reports delete skipped or failed:", e);
    }

    // 8. 最后删除users表中的用户记录
    try {
      await supabase
        .from("users")
        .delete()
        .eq("id", userId);
    } catch (e) {
      console.log("users delete skipped or failed:", e);
    }

    return NextResponse.json({
      success: true,
      message: "账户及所有关联数据已删除",
      clearLocalStorage: true, // 通知前端清除localStorage
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, message: "删除失败，请稍后重试" },
      { status: 500 }
    );
  }
}
