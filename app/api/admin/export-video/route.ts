/**
 * 服务端音频生成API - 是我呀
 * POST /api/admin/export-video
 * 
 * 为绘本页面生成配音音频（按需生成）
 * 返回base64编码的音频数据
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pages, voiceId } = body;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ success: false, message: "缺少绘本数据" }, { status: 400 });
    }

    const finalVoiceId = voiceId || "longhuhu_v3";
    const audioData: Record<number, string> = {};

    // 为需要配音的页面生成音频
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page.text || page.text.length < 5) continue; // 跳过太短的文字
      
      try {
        const apiKey = process.env.DASHSCOPE_API_KEY;
        if (!apiKey) continue;

        const ttsResponse = await fetch(
          "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2audio/generation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "cosyvoice-v3-flash",
              input: { text: page.text },
              parameters: {
                voice: finalVoiceId,
                format: "mp3",
              },
            }),
            signal: AbortSignal.timeout(15000),
          }
        );

        if (ttsResponse.ok) {
          const buf = Buffer.from(await ttsResponse.arrayBuffer());
          audioData[i] = `data:audio/mpeg;base64,${buf.toString("base64")}`;
        }
      } catch {
        // 单页音频失败不影响其他
      }
    }

    return NextResponse.json({
      success: true,
      audioData,
      generatedCount: Object.keys(audioData).length,
    });

  } catch (error: any) {
    console.error("音频生成失败:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
