/**
 * 声音文件上传API - 睡前魔法书
 * POST /api/upload/voice
 * 接收录音文件，转存到Supabase Storage（Vercel不支持本地文件写入）
 * 如果Supabase不可用，返回base64编码供后续使用
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, message: "请上传录音" },
        { status: 400 }
      );
    }

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `voice_${userId || "guest"}_${timestamp}_${randomStr}.webm`;

    // 方案1: 尝试上传到Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse = await fetch(
          `${supabaseUrl}/storage/v1/object/voice-recordings/${fileName}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "audio/webm",
              upsert: "true",
            },
            body: buffer,
          }
        );

        if (uploadResponse.ok) {
          const audioUrl = `${supabaseUrl}/storage/v1/object/public/voice-recordings/${fileName}`;
          return NextResponse.json({
            success: true,
            audioUrl,
            fileName,
            storage: "supabase",
          });
        }
      } catch (uploadError) {
        console.error("Supabase上传失败，回退到base64:", uploadError);
      }
    }

    // 方案2: 回退到base64编码（内存中处理，不写本地文件）
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      audioUrl: `data:audio/webm;base64,${base64Audio}`,
      fileName,
      storage: "base64",
      audioBase64: base64Audio,
    });
  } catch (error: any) {
    console.error("声音上传失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "声音上传失败" },
      { status: 500 }
    );
  }
}
