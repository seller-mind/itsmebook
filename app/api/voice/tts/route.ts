/**
 * 百炼CosyVoice TTS API - 睡前魔法书
 * POST /api/voice/tts
 * 使用阿里云百炼CosyVoice语音合成，将文本转为MP3音频
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // 允许60秒执行时间

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "缺少文字内容" },
        { status: 400 }
      );
    }

    // 限制文本长度（单次TTS建议不超过500字）
    const maxLength = 500;
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;

    const apiKey = process.env.DASHSCOPE_API_KEY;

    // 如果没有配置API key，返回降级标记
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "未配置TTS服务",
      });
    }

    // 调用百炼CosyVoice TTS
    // API文档: https://help.aliyun.com/zh/model-studio/non-realtime-cosyvoice-api
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    let response: Response;
    try {
      response = await fetch(
        "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "cosyvoice-v3-flash", // 使用最新的flash模型，支持中文
            input: {
              text: truncatedText,
            },
            parameters: {
              voice: "longxiaochun", // 温柔中文女声，非常适合讲故事
              format: "mp3", // 返回MP3格式
              sample_rate: 24000, // 标准采样率
              rate: 1.0, // 正常语速
              pitch: 1.0, // 正常音高
            },
          }),
          signal: controller.signal,
        }
      );
    } catch (apiError: any) {
      clearTimeout(timeoutId);
      if (apiError.name === "AbortError") {
        return NextResponse.json({
          success: false,
          fallback: true,
          message: "TTS请求超时",
        });
      }
      throw new Error(`TTS网络错误: ${apiError.message}`);
    }
    clearTimeout(timeoutId);

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error("CosyVoice TTS API error:", response.status, errorText);
      
      // 如果是配额不足或服务不可用，返回降级标记
      if (response.status === 429 || response.status === 503) {
        return NextResponse.json({
          success: false,
          fallback: true,
          message: "TTS服务暂时不可用",
        });
      }
      
      return NextResponse.json({
        success: false,
        fallback: true,
        message: `TTS API错误: ${response.status}`,
      });
    }

    // CosyVoice TTS API 返回的是音频二进制数据
    // Content-Type: audio/mpeg
    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("audio")) {
      const responseText = await response.text();
      console.error("TTS返回非音频格式:", contentType, responseText.substring(0, 200));
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "TTS返回格式异常",
      });
    }

    // 获取音频二进制数据
    const audioBuffer = await response.arrayBuffer();
    
    if (audioBuffer.byteLength === 0) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "TTS返回空音频",
      });
    }

    // 转换为base64
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    const dataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return NextResponse.json({
      success: true,
      audioUrl: dataUrl,
      duration: Math.round(audioBuffer.byteLength / 16000), // 估算时长（粗略）
    });
  } catch (error: any) {
    console.error("TTS处理失败:", error);
    return NextResponse.json({
      success: false,
      fallback: true,
      message: error.message || "TTS处理失败",
    });
  }
}
