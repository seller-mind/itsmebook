/**
 * 声音克隆API - 睡前魔法书
 * POST /api/voice/clone
 * 
 * 使用阿里云百炼CosyVoice声音复刻API
 * 端点: POST https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization
 * 文档: https://help.aliyun.com/zh/model-studio/voice-enrollment-api
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // 允许60秒执行时间

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

    // 验证音频大小（最大10MB）
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "音频文件过大，请控制在10MB以内" },
        { status: 400 }
      );
    }

    // 验证音频时长（最小5秒，最小10KB）
    if (audioFile.size < 10000) {
      return NextResponse.json(
        { success: false, message: "录音时间太短，请录制至少5秒" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "未配置DASHSCOPE_API_KEY" },
        { status: 500 }
      );
    }

    // 生成唯一voice_id前缀
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const voicePrefix = `parentvoice_${userId || "guest"}_${timestamp}_${randomStr}`;

    // 方案1: 上传到Supabase Storage获取公网URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let audioUrl = "";

    if (supabaseUrl && supabaseKey) {
      try {
        const fileName = `voice-recordings/${voicePrefix}.webm`;
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 上传到Supabase Storage
        const uploadResponse = await fetch(
          `${supabaseUrl}/storage/v1/object/${fileName}`,
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
          // 获取公网访问URL
          audioUrl = `${supabaseUrl}/storage/v1/object/public/${fileName}`;
          console.log("[Clone] 上传成功，URL:", audioUrl);
        } else {
          console.error("[Clone] Supabase上传失败:", uploadResponse.status);
        }
      } catch (uploadError) {
        console.error("[Clone] Supabase上传异常:", uploadError);
      }
    }

    // 如果没有获取到公网URL，尝试使用其他方式
    if (!audioUrl) {
      // 检查是否有其他可用的公开bucket
      if (supabaseUrl && supabaseKey) {
        try {
          // 尝试上传到public bucket
          const fileName = `voice_${timestamp}_${randomStr}.webm`;
          const arrayBuffer = await audioFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // 先确保voice-recordings bucket存在且为public
          const bucketResponse = await fetch(
            `${supabaseUrl}/storage/v1/bucket/voice-recordings`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${supabaseKey}`,
              },
            }
          );

          if (bucketResponse.ok) {
            const bucketData = await bucketResponse.json();
            if (!bucketData.public) {
              // 更新bucket为public
              await fetch(
                `${supabaseUrl}/storage/v1/bucket/voice-recordings`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${supabaseKey}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ public: true }),
                }
              );
            }
          } else {
            // bucket不存在，创建并设为public
            await fetch(
              `${supabaseUrl}/storage/v1/bucket`,
              {
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
              }
            );
          }

          // 上传文件
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
            audioUrl = `${supabaseUrl}/storage/v1/object/public/voice-recordings/${fileName}`;
            console.log("[Clone] 重试上传成功，URL:", audioUrl);
          }
        } catch (retryError) {
          console.error("[Clone] 重试上传失败:", retryError);
        }
      }
    }

    if (!audioUrl) {
      return NextResponse.json(
        { success: false, message: "无法获取音频公网URL，请稍后重试" },
        { status: 500 }
      );
    }

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
              target_model: "cosyvoice-v3-flash", // 必须与TTS使用的模型一致
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
        
        return NextResponse.json(
          { success: false, message: `声音克隆失败: ${cloneResponse.status}` },
          { status: 500 }
        );
      }

      const result = await cloneResponse.json();
      console.log("[Clone] 克隆成功:", result);

      // 提取voice_id
      const voiceId = result?.output?.voice_id;

      if (!voiceId) {
        return NextResponse.json(
          { success: false, message: "声音克隆响应格式错误" },
          { status: 500 }
        );
      }

      // 注意：声音克隆是异步的，可能需要等待几秒才能使用
      return NextResponse.json({
        success: true,
        voiceId,
        audioUrl, // 返回上传的音频URL供参考
        message: "声音克隆成功，请稍等几秒后再使用",
        note: "声音复刻需要等待5-10秒生效，请稍后使用",
      });
    } catch (apiError: any) {
      clearTimeout(timeoutId);
      
      if (apiError.name === "AbortError") {
        return NextResponse.json(
          { success: false, message: "声音克隆请求超时，请稍后重试" },
          { status: 504 }
        );
      }
      
      console.error("[Clone] API调用异常:", apiError);
      return NextResponse.json(
        { success: false, message: `声音克隆失败: ${apiError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Clone] 声音克隆失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "声音克隆失败" },
      { status: 500 }
    );
  }
}
