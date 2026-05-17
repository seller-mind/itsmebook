/**
 * 声音克隆API - 睡前魔法书
 * POST /api/voice/clone
 * 上传录音并克隆声音
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 解析FormData
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, message: "请上传录音" },
        { status: 400 }
      );
    }

    // 验证音频时长（最小5秒）
    // 前端会做这个检查，这里后端也保险一下
    if (audioFile.size < 10000) {
      return NextResponse.json(
        { success: false, message: "录音时间太短，请录制至少5秒" },
        { status: 400 }
      );
    }

    const apiKey = process.env.VOLCENGINE_TTS_API_KEY;
    const endpoint =
      process.env.VOLCENGINE_TTS_ENDPOINT ||
      "https://openspeech.bytedance.com/api/v1/mgc/tts";

    // 如果配置了API key，调用真实API
    if (apiKey) {
      const audioBuffer = await audioFile.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString("base64");

      try {
        const cloneResponse = await fetch(`${endpoint}/clone`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            audio: audioBase64,
            user_id: userId || "anonymous",
            model: "cosyvoice-v1",
          }),
        });

        if (cloneResponse.ok) {
          const result = await cloneResponse.json();
          return NextResponse.json({
            success: true,
            voiceId: result.voice_id,
            status: result.status || "ready",
          });
        }
      } catch (apiError) {
        console.error("火山引擎API调用失败:", apiError);
        // API失败时，降级使用模拟voice_id
      }
    }

    // 降级：生成模拟voice_id（用于演示）
    const mockVoiceId = `voice_${userId || "guest"}_${Date.now()}`;
    return NextResponse.json({
      success: true,
      voiceId: mockVoiceId,
      status: "ready",
      isDemo: true,
    });
  } catch (error: any) {
    console.error("声音克隆失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "声音克隆失败" },
      { status: 500 }
    );
  }
}
