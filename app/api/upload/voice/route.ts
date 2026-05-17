/**
 * 声音文件上传API - 睡前魔法书
 * POST /api/upload/voice
 * 接收并存储录音文件
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
    const filePath = path.join(process.cwd(), "public", "uploads", "voices");

    // 确保目录存在
    await mkdir(filePath, { recursive: true });

    // 保存文件
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fullPath = path.join(filePath, fileName);
    await writeFile(fullPath, buffer);

    // 返回可访问的URL
    const audioUrl = `/uploads/voices/${fileName}`;

    return NextResponse.json({
      success: true,
      audioUrl,
      fileName,
    });
  } catch (error: any) {
    console.error("声音上传失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "声音上传失败" },
      { status: 500 }
    );
  }
}
