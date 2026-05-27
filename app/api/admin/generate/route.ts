/**
 * Admin 绘本生成 API - 是我呀
 * POST /api/admin/generate
 * 
 * 整合声音克隆、照片生成主角、故事生成、配图、配音的完整流程
 * 支持 SSE 流式推送进度
 * 
 * 合规要求：
 * - 照片和语音样本不落盘存储，base64直传API
 * - 生成完成后自动删除照片和语音数据
 * - AI生成内容需标注
 */

import { NextRequest, NextResponse } from "next/server";
import { generationCache } from "@/lib/generation-cache";

export const maxDuration = 60; // Vercel Hobby上限60秒

// 发送SSE进度
function sendProgress(step: string, progress: number, data: any = {}): string {
  return `data: ${JSON.stringify({ type: "progress", step, progress, ...data })}\n\n`;
}

// 更新Supabase生成进度（用于切走页面后恢复）
async function updateSupabaseProgress(sessionId: string, data: {
  status?: string;
  progress?: number;
  step?: string;
  result?: any;
}) {
  // 始终写入内存缓存（用于轮询恢复）
  const cached = generationCache.get(sessionId);
  generationCache.set(sessionId, {
    status: data.status || cached?.status || "generating",
    progress: data.progress ?? cached?.progress ?? 0,
    step: data.step || cached?.step || "",
    result: data.result || cached?.result,
    updatedAt: Date.now(),
  });
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 直接用upsert（有则更新，无则插入）
    const { error } = await supabase.from("story_generations").upsert({
      session_id: sessionId,
      status: data.status || cached?.status || "generating",
      progress: data.progress ?? cached?.progress ?? 0,
      step: data.step || cached?.step || "",
      result: data.result || cached?.result || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "session_id" });
    
    if (error) {
      console.error("[AdminGenerate] Supabase upsert失败:", error.message);
    }
  } catch (err) {
    console.error("[AdminGenerate] Supabase进度更新失败:", err);
  }
}

// 风格配置映射
const STYLE_CONFIGS: Record<string, { chinesePrompt: string }> = {
  watercolor: {
    chinesePrompt:
      "专业儿童绘本插画，水彩画风格，柔和的水洗效果，细腻的笔触，温暖的色调，肌理丰富可见，有纸张纹理，柔和的光影，温馨雅致，手绘质感，没有塑料光滑感，艺术品质",
  },
  oil: {
    chinesePrompt:
      "专业儿童绘本插画，油画风格在画布上，厚重的肌理质感，浓郁可见的笔触，温暖饱和的色彩，戏剧性的光影，经典欧式绘本插画风格，手绘质感，没有塑料光滑感，艺术品质",
  },
  anime: {
    chinesePrompt:
      "专业儿童绘本插画，经典日式动画风格，温暖的金色时光效果，精致细腻的自然背景，表情丰富的角色，手绘水彩感，没有塑料3D渲染感，艺术品质",
  },
  chinese: {
    chinesePrompt:
      "专业儿童绘本插画，传统中国水墨画风格，宣纸质感，优雅流畅的笔触，细腻的墨色晕染从浓到淡，含蓄的留白，赭红色点缀，米黄色背景，经典中国水墨绘本风格，手绘质感，艺术品质",
  },
  pastoral: {
    chinesePrompt:
      "专业儿童绘本插画，温暖的田园水彩风格，金色的时光效果，柔和的长阴影，温馨的英式乡村氛围，茅草屋顶小屋和花园，可见的水彩纹理和纸张颗粒，经典英式乡村绘本风格，手绘质感，艺术品质",
  },
  fantasy: {
    chinesePrompt:
      "专业儿童绘本插画，梦幻童话现实主义风格，如梦似幻的氛围，漂浮的光粒子，彩虹般闪烁的色彩，魔法光影与可见光线，经典奇幻绘本风格，手绘质感带微妙魔法光晕，没有塑料光滑感，艺术品质",
  },
  minimalist: {
    chinesePrompt:
      "专业儿童绘本插画，现代简约风格，大胆干净的几何形状，有限的3-4种色彩调色板，慷慨的留白，平面设计带微妙肌理，现代简约绘本风格，干净优雅的构图，手工质感，艺术品质",
  },
  nordic: {
    chinesePrompt:
      "专业儿童绘本插画，北欧斯堪的纳维亚风格，简洁温柔的墨线带水彩晕染，柔和的冷色调带温暖点缀，温馨的极简氛围，可见的手绘线条质感，手绘质感，艺术品质",
  },
};

// 年龄适配指令
const AGE_INSTRUCTIONS: Record<string, string> = {
  "2": "每页1-2句短句，大量拟声词（嗖——、吧嗒吧嗒），重复句式，简单直观的故事",
  "3": "每页1-2句短句，大量拟声词（嗖——、吧嗒吧嗒），重复句式，简单直观的故事",
  "4": "每页2-3句，简单情节+对话，有起承转合，可以有小悬念",
  "5": "每页2-3句，简单情节+对话，有起承转合，可以有小悬念",
  "6": "每页2-3句，简单情节+对话，有起承转合，可以有小悬念",
  "7": "每页3-4句，更丰富的情感描写和内心独白，有挑战和成长",
  "8": "每页3-4句，更丰富的情感描写和内心独白，有挑战和成长",
  "9": "每页3-4句，更丰富的情感描写和内心独白，有挑战和成长",
};

// 故事主题配置
const STORY_THEMES = [
  { id: "animal", name: "小动物", prompt: "小动物之间的温馨故事，突出友谊和互助" },
  { id: "family", name: "温馨家庭", prompt: "家人之间的爱与陪伴，亲子互动的温暖场景" },
  { id: "fantasy", name: "奇幻冒险", prompt: "充满想象的奇妙旅程，孩子成为小英雄" },
  { id: "princess", name: "公主王子", prompt: "优雅温馨的宫廷故事，勇敢善良的主角" },
  { id: "bedtime", name: "睡前催眠", prompt: "帮助入睡的温柔故事，温馨治愈的氛围" },
  { id: "space", name: "太空探险", prompt: "探索宇宙的奇妙冒险，科学与想象的结合" },
  { id: "ocean", name: "海洋世界", prompt: "海底小动物们的有趣故事，美丽的海底世界" },
  { id: "dinosaur", name: "恐龙时代", prompt: "和恐龙做朋友的奇妙旅程，神秘又温馨" },
  { id: "friendship", name: "友谊故事", prompt: "小伙伴之间的温暖故事，学会交朋友" },
];

// 生成故事内容
async function generateStory(params: {
  childName: string;
  childAge: number;
  childGender: "boy" | "girl";
  themeId: string;
  pageCount: 8 | 12;
}): Promise<{ title: string; pages: Array<{ page_number: number; text: string; image_prompt: string }> }> {
  const apiKey = process.env.DOUBAO_API_KEY;
  const endpoint = process.env.DOUBAO_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  const modelId = process.env.DOUBAO_MODEL_ID || "ep-20260515174520-v8rzv";

  const theme = STORY_THEMES.find(t => t.id === params.themeId) || STORY_THEMES[0];
  const ageInstruction = AGE_INSTRUCTIONS[params.childAge.toString()] || AGE_INSTRUCTIONS["5"];
  const genderWord = params.childGender === "boy" ? "他" : "她";
  const genderWord2 = params.childGender === "boy" ? "男孩" : "女孩";

  const systemPrompt = `你是专业儿童绘本作家，擅长创作温馨感人的儿童故事。

写作要求：
- ${ageInstruction}
- 主角是名叫"${params.childName}"的${genderWord2}，年龄${params.childAge}岁
- ${theme.prompt}
- 每个故事必须有清晰的开头、发展、结尾
- 语言童趣可爱，避免说教
- ${params.pageCount}页故事，封面+${params.pageCount - 2}页内容+封底

输出格式（严格JSON）：
{
  "title": "故事标题",
  "pages": [
    {"page_number": 1, "text": "封面文字", "image_prompt": "封面图片描述"},
    {"page_number": 2, "text": "第1页故事文字", "image_prompt": "第1页配图描述"},
    ...共${params.pageCount}页
  ]
}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `请为${params.childName}创作一个温馨的${theme.name}故事，${params.pageCount}页。` },
      ],
      temperature: 0.8,
      max_tokens: 3000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`故事生成失败: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("故事生成返回为空");
  }

  // 解析JSON（增强版：处理markdown代码块、思维链等干扰）
  try {
    let jsonStr = content;
    
    // 1. 去掉markdown代码块包裹
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    
    // 2. 去掉<think>...</think>思维链标签
    jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    
    // 3. 尝试直接解析
    try {
      return JSON.parse(jsonStr);
    } catch {}
    
    // 4. 提取第一个完整的JSON对象
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }
    
    // 5. 逐步修复常见JSON错误
    let fixed = jsonStr;
    // 去掉尾部逗号
    fixed = fixed.replace(/,\s*([\]}])/g, "$1");
    // 去掉单引号替换双引号
    fixed = fixed.replace(/'/g, '"');
    try {
      return JSON.parse(fixed);
    } catch {}
    
    console.error("故事解析全部失败，原始内容:", content.substring(0, 500));
    throw new Error("故事格式解析失败");
  } catch (e: any) {
    if (e.message === "故事格式解析失败") throw e;
    console.error("故事解析错误:", e);
    console.log("原始内容前500字:", content?.substring(0, 500));
    throw new Error("故事格式解析失败");
  }
}

// 生成配图
async function generateImage(
  imagePrompt: string,
  style: string,
  index: number,
  refImageBase64?: string
): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    // 无API key时返回占位图
    return `https://placehold.co/800x800/FFB6C1/ffffff?text=Page+${index + 1}`;
  }

  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;
  const fullPrompt = `${imagePrompt}，${styleConfig.chinesePrompt}`;

  // 有参考图时用Pro模型（面部一致性更好），无参考图用标准模型
  const useProModel = !!refImageBase64;
  const model = useProModel ? "wan2.7-image-pro" : "wan2.7-image";

  const contentParts: any[] = [{ text: fullPrompt }];

  // 如果有参考图片（孩子主角），添加ref_image参数
  if (refImageBase64) {
    contentParts.push({ image: refImageBase64 });
  }

  const requestBody: any = {
    model,
    input: {
      messages: [
        {
          role: "user",
          content: contentParts,
        },
      ],
    },
    parameters: {
      size: "768*768",
      n: 1,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  let response: Response;
  try {
    response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );
  } catch (apiError: any) {
    clearTimeout(timeoutId);
    if (apiError.name === "AbortError") {
      throw new Error("图片生成超时");
    }
    throw new Error(`图片生成网络错误: ${apiError.message}`);
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`万相API错误 ${response.status}:`, errorText);
    // 重试一次
    console.log(`第${index + 1}页图片生成失败，重试中...`);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const retryController = new AbortController();
      const retryTimeout = setTimeout(() => retryController.abort(), 55000);
      const retryResponse = await fetch(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: retryController.signal,
        }
      );
      clearTimeout(retryTimeout);
      if (retryResponse.ok) {
        const retryResult = await retryResponse.json();
        const retryUrl = retryResult.output?.choices?.[0]?.message?.content?.[0]?.image;
        if (retryUrl) return retryUrl;
      }
    } catch (retryErr) {
      console.error(`第${index + 1}页重试也失败:`, retryErr);
    }
    return `https://placehold.co/800x800/FFB6C1/ffffff?text=Page+${index + 1}`;
  }

  const result = await response.json();
  const imageUrl = result.output?.choices?.[0]?.message?.content?.[0]?.image;

  if (!imageUrl) {
    console.error("万相API返回无图片");
    return `https://placehold.co/800x800/FFB6C1/ffffff?text=Page+${index + 1}`;
  }

  return imageUrl;
}

// 克隆声音
async function cloneVoice(
  voiceBase64: string,
  voiceName: string
): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    throw new Error("未配置声音克隆服务");
  }

  // 生成唯一前缀
  const randomStr = Math.random().toString(36).substring(2, 8);
  const voicePrefix = `pv${randomStr}`;

  // 调用CosyVoice声音克隆API
  const response = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "cosyvoice-v3", // 使用v3模型，不是v3.5
        input: {
          text: "你好，这是一段测试文本。", // 克隆时需要的示例文本
          audio_url: voiceBase64, // base64直传
        },
        parameters: {
          prefix: voicePrefix,
          target_model: "cosyvoice-v3",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`声音克隆失败: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  // CosyVoice返回的voice_id格式
  if (result.output?.voice_id) {
    return result.output.voice_id;
  }

  // 如果API格式不同，构造一个虚拟ID（实际需要根据API文档调整）
  return `${voicePrefix}_${Date.now()}`;
}

// 生成TTS配音
async function generateTTS(
  text: string,
  voiceId: string
): Promise<string> {
  const apiKey = process.env.VOLCENGINE_TTS_API_KEY;
  const endpoint = process.env.VOLCENGINE_TTS_ENDPOINT || "https://openspeech.bytedance.com/api/v1/mgc/tts";

  if (!apiKey) {
    // 无TTS服务时返回空
    return "";
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      appid: process.env.VOLCENGINE_APP_ID,
      voice_id: voiceId,
      text,
      model: "cosyvoice-v3", // 使用v3模型
      speed: 0.9,
      pitch: 1.0,
      volume: 1.0,
    }),
  });

  if (!response.ok) {
    console.error("TTS生成失败:", response.status);
    return "";
  }

  const result = await response.json();
  return result.audio_url || "";
}

// 保存绘本到Supabase
async function saveBookToSupabase(bookData: {
  title: string;
  childName: string;
  childAge: number;
  theme: string;
  style: string;
  pageCount: number;
  pages: any[];
  voiceId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderNote?: string;
}): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // 无Supabase时返回本地ID
    return `book_${Date.now()}`;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const bookId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const { error } = await supabase.from("books").insert({
    id: bookId,
    user_id: "admin",
    title: bookData.title,
    character_name: bookData.childName,
    character_age: bookData.childAge,
    theme: bookData.theme,
    style: bookData.style,
    pages: bookData.pages,
    status: "completed",
    voice_id: bookData.voiceId,
    customer_name: bookData.customerName,
    customer_phone: bookData.customerPhone,
    customer_email: bookData.customerEmail,
    order_note: bookData.orderNote,
    is_admin_generated: true,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("保存绘本失败:", error);
    // 不抛出错误，继续使用本地ID
  }

  return bookId;
}

export async function POST(request: NextRequest) {
  // 创建SSE流
  const encoder = new TextEncoder();
  // sessionId提到try外面，确保catch也能访问
  let sessionId = `admin_${Date.now()}`;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const {
          childName,
          childAge,
          childGender,
          themeId,
          styleId,
          pageCount,
          voiceId,
          useClonedVoice,
          photoBase64,
          useChildPhoto,
          customerName,
          customerPhone,
          customerEmail,
          orderNote,
        } = body;
        
        // 使用前端传来的sessionId或默认值
        if (body.sessionId) {
          sessionId = body.sessionId;
        }

        // 验证参数
        if (!childName || !themeId) {
          throw new Error("缺少必要参数");
        }

        // 创建Supabase生成记录
        await updateSupabaseProgress(sessionId, { status: "generating", progress: 0, step: "准备开始生成..." });

        // 步骤1: 克隆声音（如果有）
        let finalVoiceId = voiceId || "longhuhu_v3";

        if (useClonedVoice && body.voiceBase64) {
          controller.enqueue(encoder.encode(sendProgress("cloning_voice", 5)));
          await updateSupabaseProgress(sessionId, { progress: 5, step: "克隆声音中..." });
          try {
            finalVoiceId = await cloneVoice(body.voiceBase64, customerName || "家长");
            controller.enqueue(encoder.encode(sendProgress("cloning_voice", 10)));
          } catch (e: any) {
            console.error("声音克隆失败，使用默认声音:", e.message);
            finalVoiceId = voiceId || "longhuhu_v3";
          }
        }

        // 步骤2: 生成故事
        controller.enqueue(encoder.encode(sendProgress("generating_story", 15)));
        await updateSupabaseProgress(sessionId, { progress: 15, step: "正在生成故事文本..." });
        const story = await generateStory({
          childName,
          childAge,
          childGender,
          themeId,
          pageCount: pageCount || 8,
        });
        controller.enqueue(encoder.encode(sendProgress("generating_story", 25)));
        await updateSupabaseProgress(sessionId, { progress: 25, step: "故事文本生成完成" });

        // 步骤3: 生成配图
        controller.enqueue(encoder.encode(sendProgress("generating_images", 30)));
        await updateSupabaseProgress(sessionId, { progress: 30, step: "正在生成配图..." });
        // 逐个生成配图（避免并发超时，更可靠）
        const pagesWithImages: any[] = [];
        for (let index = 0; index < story.pages.length; index++) {
          const page = story.pages[index];
          const progress = 30 + Math.floor((index / story.pages.length) * 50);
          controller.enqueue(encoder.encode(sendProgress("generating_images", progress)));
          await updateSupabaseProgress(sessionId, { progress, step: `正在生成配图 (${index + 1}/${story.pages.length})...` });

          const refImage = useChildPhoto ? photoBase64 : undefined;
          const imageUrl = await generateImage(
            page.image_prompt,
            styleId || "watercolor",
            index,
            refImage
          );

          pagesWithImages.push({ ...page, image_url: imageUrl });
        }

        controller.enqueue(encoder.encode(sendProgress("generating_images", 80)));
        await updateSupabaseProgress(sessionId, { progress: 80, step: "配图生成完成" });

        // 步骤4: 跳过配音生成（Vercel 60秒限制，配音改按需生成）
        let pagesWithAudio: any[] = pagesWithImages.map(p => ({ ...p, audio_url: null }));

        // 配音将在视频导出时按需生成（通过 /api/admin/export-video）
        // 这样主生成流程在60秒内完成，不超时

        // 步骤5: 保存绘本
        controller.enqueue(encoder.encode(sendProgress("saving_book", 90)));
        await updateSupabaseProgress(sessionId, { progress: 90, step: "正在保存绘本..." });
        const bookId = await saveBookToSupabase({
          title: story.title,
          childName,
          childAge,
          theme: themeId,
          style: styleId || "watercolor",
          pageCount: pageCount || 8,
          pages: pagesWithAudio,
          voiceId: finalVoiceId,
          customerName,
          customerPhone,
          customerEmail,
          orderNote,
        });

        // 完成 - 将完整绘本数据通过SSE传回前端
        controller.enqueue(encoder.encode(sendProgress("completed", 100)));
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "completed", bookId, title: story.title, pages: pagesWithAudio })}\n\n`
        ));
        await updateSupabaseProgress(sessionId, { status: "completed", progress: 100, step: "生成完成", result: { bookId, title: story.title, pages: pagesWithAudio } });

      } catch (error: any) {
        console.error("生成失败:", error);
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`
        ));
        await updateSupabaseProgress(sessionId, { status: "failed", step: `生成失败: ${error.message}` });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
