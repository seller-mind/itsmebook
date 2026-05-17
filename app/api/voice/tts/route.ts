/**
 * 百炼CosyVoice TTS API - 睡前魔法书
 * POST /api/voice/tts
 * 使用阿里云百炼CosyVoice语音合成，将文本转为MP3音频
 * 
 * API文档: https://help.aliyun.com/zh/model-studio/non-realtime-cosyvoice-api/
 * 端点: POST https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer
 * 返回: JSON { output: { audio: { url: "..." } } } — 音频URL有效期24h
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // 允许60秒执行时间

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice } = body;

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
      console.warn("[TTS] DASHSCOPE_API_KEY not configured, returning fallback");
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "未配置TTS服务",
      });
    }

    // 调用百炼CosyVoice TTS (非流式)
    // 所有参数都在 input 对象内，不在 parameters 里
    const ttsVoice = voice || "longhuhu_v3"; // 默认用龙呼呼：天真烂漫女童(6-10岁)，最适合讲儿童睡前故事

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
            model: "cosyvoice-v3.5-flash",
            input: {
              text: truncatedText,
              voice: ttsVoice,
              format: "mp3",
              sample_rate: 24000,
              rate: 0.9, // 稍慢语速，适合讲故事
              volume: 50,
              language_hints: ["zh"], // 中文
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
      console.error("[TTS] CosyVoice API error:", response.status, errorText.substring(0, 500));
      
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

    // CosyVoice非流式API返回JSON，包含output.audio.url
    const result = await response.json();
    
    const audioUrl = result?.output?.audio?.url;
    
    if (!audioUrl) {
      console.error("[TTS] No audio URL in response:", JSON.stringify(result).substring(0, 500));
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "TTS未返回音频",
      });
    }

    // 直接返回百炼音频URL（有效期24h）
    // 前端通过<audio>标签播放，不受CORS限制
    // 不再在服务端下载转base64，节省Vercel函数运行时间
    return NextResponse.json({
      success: true,
      audioUrl: audioUrl,
    });
  } catch (error: any) {
    console.error("[TTS] 处理失败:", error);
    return NextResponse.json({
      success: false,
      fallback: true,
      message: error.message || "TTS处理失败",
    });
  }
}
