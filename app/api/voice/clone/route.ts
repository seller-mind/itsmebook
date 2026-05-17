/**
 * 声音克隆API - 睡前魔法书
 * POST /api/voice/clone
 * 
 * 使用阿里云百炼CosyVoice声音复刻API
 * 端点: POST https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization
 * 
 * 注意事项：
 * - prefix只允许数字和英文字母，不超过10字符
 * - 音频只接受WAV/MP3/M4A格式（webm不行，需要转换）
 * - 音频要求：10-20秒推荐，≥16kHz，至少5秒连续清晰人声
 * - target_model必须与TTS模型一致（cosyvoice-v3.5-flash）
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

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

    // 验证音频大小（最大10MB）
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "音频文件过大，请控制在10MB以内" },
        { status: 400 }
      );
    }

    if (audioFile.size < 10000) {
      return NextResponse.json(
        { success: false, message: "录音时间太短，请录制至少5秒" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "未配置TTS服务" },
        { status: 500 }
      );
    }

    // prefix只允许数字和英文字母，不超过10字符
    const randomStr = Math.random().toString(36).substring(2, 8);
    const voicePrefix = `pv${randomStr}`; // 如 pv3a7f2b，6+2=8字符

    // 上传音频到Supabase Storage获取公网URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let audioUrl = "";

    if (supabaseUrl && supabaseKey) {
      // 确保bucket存在
      await ensureBucket(supabaseUrl, supabaseKey);

      // 确定文件扩展名 - 浏览器录音通常是webm，但百炼不支持
      // 需要转为mp3或wav。这里用原始格式上传，如果百炼拒绝再处理
      // 实际上前端录音是webm格式，百炼不支持webm
      // 解决方案：将文件扩展名保存为实际格式，但百炼需要mp3/wav
      // 由于服务端没有ffmpeg，我们改为：让前端录音时使用wav格式
      // 如果前端传来的是webm，我们先尝试上传，如果百炼报错就告知用户
      
      const originalName = audioFile.name || "";
      let ext = "webm";
      if (originalName.endsWith(".wav")) ext = "wav";
      else if (originalName.endsWith(".mp3")) ext = "mp3";
      else if (originalName.endsWith(".m4a")) ext = "m4a";
      
      // 检测MIME类型
      const mimeType = audioFile.type || "";
      if (mimeType.includes("wav")) ext = "wav";
      else if (mimeType.includes("mp3") || mimeType.includes("mpeg")) ext = "mp3";
      else if (mimeType.includes("m4a") || mimeType.includes("mp4")) ext = "m4a";
      else if (mimeType.includes("webm")) ext = "webm";

      const fileName = `${voicePrefix}.${ext}`;
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 上传到Supabase Storage
      const uploadResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/voice-recordings/${fileName}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": audioFile.type || "audio/webm",
            upsert: "true",
          },
          body: buffer,
        }
      );

      if (uploadResponse.ok) {
        audioUrl = `${supabaseUrl}/storage/v1/object/public/voice-recordings/${fileName}`;
        console.log("[Clone] 上传成功，URL:", audioUrl, "格式:", ext);
      } else {
        const errText = await uploadResponse.text();
        console.error("[Clone] Supabase上传失败:", uploadResponse.status, errText);
      }
    }

    if (!audioUrl) {
      return NextResponse.json(
        { success: false, message: "音频上传失败，请稍后重试" },
        { status: 500 }
      );
    }

    // 如果是webm格式，百炼不支持，需要特别处理
    // webm格式无法在服务端转换（没有ffmpeg），所以需要前端录音时用wav格式
    // 临时方案：即使文件是webm，也先尝试调用百炼API
    // 如果失败，返回提示让前端重新用wav格式录制
    
    // 调用百炼CosyVoice声音复刻API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const cloneResponse = await fetch(
        "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "voice-enrollment",
            input: {
              action: "create_voice",
              target_model: "cosyvoice-v3.5-flash",
              prefix: voicePrefix,
              url: audioUrl,
              language_hints: ["zh"],
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!cloneResponse.ok) {
        const errorText = await cloneResponse.text();
        console.error("[Clone] 百炼API错误:", cloneResponse.status, errorText);
        
        // 如果是400错误，根据具体原因给出友好提示
        if (cloneResponse.status === 400) {
          let userMessage = "录音无法使用，请重新录制";
          
          // 解析百炼错误信息，匹配常见原因
          const lowerText = errorText.toLowerCase();
          if (lowerText.includes("duration") || lowerText.includes("too short") || lowerText.includes("长度") || lowerText.includes("过短") || lowerText.includes("时间")) {
            userMessage = "录音时间太短，请至少录制5秒以上";
          } else if (lowerText.includes("format") || lowerText.includes("unsupported") || lowerText.includes("格式")) {
            userMessage = "录音格式不支持，请重新录制";
          } else if (lowerText.includes("quality") || lowerText.includes("noise") || lowerText.includes("质量") || lowerText.includes("噪声")) {
            userMessage = "录音质量不佳，请在安静环境下重新录制";
          } else if (lowerText.includes("silence") || lowerText.includes("静音") || lowerText.includes("无人声")) {
            userMessage = "未检测到有效人声，请对着麦克风说话重新录制";
          }
          
          return NextResponse.json({
            success: false,
            message: userMessage,
          });
        }
        
        return NextResponse.json({
          success: false,
          message: `声音克隆失败: ${cloneResponse.status}`,
        });
      }

      const result = await cloneResponse.json();
      console.log("[Clone] 克隆成功:", JSON.stringify(result).substring(0, 300));

      // 提取voice_id
      const voiceId = result?.output?.voice_id;

      if (!voiceId) {
        // 可能返回的key名不同，尝试其他字段
        const altVoiceId = result?.output?.voice || result?.voice_id;
        if (!altVoiceId) {
          console.error("[Clone] 无法提取voice_id，完整响应:", JSON.stringify(result));
          return NextResponse.json({
            success: false,
            message: "声音克隆响应格式异常",
          });
        }
        
        return NextResponse.json({
          success: true,
          voiceId: altVoiceId,
          audioUrl,
          message: "声音克隆成功",
        });
      }

      return NextResponse.json({
        success: true,
        voiceId,
        audioUrl,
        message: "声音克隆成功",
      });
    } catch (apiError: any) {
      clearTimeout(timeoutId);

      if (apiError.name === "AbortError") {
        return NextResponse.json(
          { success: false, message: "声音克隆请求超时，请稍后重试" },
          { status: 504 }
        );
      }
      throw apiError;
    }
  } catch (error: any) {
    console.error("[Clone] 处理失败:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "声音克隆失败",
    });
  }
}

// 确保voice-recordings bucket存在且为public
async function ensureBucket(supabaseUrl: string, supabaseKey: string) {
  try {
    const bucketResponse = await fetch(
      `${supabaseUrl}/storage/v1/bucket/voice-recordings`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${supabaseKey}` },
      }
    );

    if (bucketResponse.ok) {
      const bucketData = await bucketResponse.json();
      if (!bucketData.public) {
        await fetch(`${supabaseUrl}/storage/v1/bucket/voice-recordings`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public: true }),
        });
      }
    } else {
      // bucket不存在，创建
      await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "voice-recordings",
          name: "voice-recordings",
          public: true,
        }),
      });
    }
  } catch (e) {
    console.error("[Clone] bucket检查失败:", e);
  }
}
