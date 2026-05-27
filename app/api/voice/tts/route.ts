/**
 * 百炼CosyVoice TTS API - 是我呀
 * POST /api/voice/tts
 * 使用阿里云百炼CosyVoice语音合成，将文本转为MP3音频
 * 
 * 支持两种模式：
 * 1. 默认模式：返回音频URL（有效期24h）
 * 2. returnAudioData=true：直接返回音频base64数据（彻底解决CORS问题）
 * 
 * API文档: https://help.aliyun.com/zh/model-studio/non-realtime-cosyvoice-api/
 * 端点: POST https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, returnAudioData } = body;

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
    const ttsVoice = voice || "longhuhu_v3";

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
            model: "cosyvoice-v3-flash",
            input: {
              text: truncatedText,
              voice: ttsVoice,
              format: "mp3",
              sample_rate: 24000,
              rate: 0.9,
              volume: 50,
              language_hints: ["zh"],
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

    // 如果请求了音频数据，服务端下载后返回base64（彻底解决CORS问题）
    if (returnAudioData) {
      try {
        console.log("[TTS] 下载音频数据用于base64返回...");
        const audioResponse = await fetch(audioUrl, {
          signal: AbortSignal.timeout(15000),
        });
        if (!audioResponse.ok) {
          throw new Error(`音频下载失败: ${audioResponse.status}`);
        }
        const arrayBuffer = await audioResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        
        console.log(`[TTS] 音频数据大小: ${arrayBuffer.byteLength} bytes, base64长度: ${base64.length}`);
        
        return NextResponse.json({
          success: true,
          audioUrl,          // 仍然返回URL，方便预览播放
          audioDataBase64: base64,  // base64编码的MP3数据
          audioFormat: "mp3",
        });
      } catch (downloadErr: any) {
        console.error("[TTS] 音频下载失败，回退到URL模式:", downloadErr);
        // 降级：返回URL，前端需要通过代理下载
        return NextResponse.json({
          success: true,
          audioUrl,
          message: "音频数据下载失败，已回退到URL模式",
        });
      }
    }

    // 默认模式：只返回URL
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
