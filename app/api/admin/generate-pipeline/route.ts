/**
 * 后台生成Pipeline - 是我呀
 * POST /api/admin/generate-pipeline
 * 
 * 服务端完成全部生成流程，前端只负责轮询进度。
 * 使用 Vercel waitUntil 让函数在返回响应后继续运行，
 * 解决用户切换页面后生成中断的问题。
 */

import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

export const maxDuration = 300; // 5分钟

// 风格配置（与 generate-step 保持一致）
const STYLE_CONFIGS: Record<string, { chinesePrompt: string }> = {
  watercolor: { chinesePrompt: "专业儿童绘本插画，水彩画风格，柔和的水洗效果，细腻的笔触，温暖的色调，手绘质感" },
  oil: { chinesePrompt: "专业儿童绘本插画，油画风格，厚重的肌理质感，浓郁可见的笔触，温暖饱和的色彩" },
  anime: { chinesePrompt: "专业儿童绘本插画，日系动漫风格，明亮清新的色彩，细腻的线条，可爱的角色设计" },
  sketch: { chinesePrompt: "专业儿童绘本插画，铅笔素描风格，柔和的线条，温馨的明暗对比，简洁优雅" },
  cartoon: { chinesePrompt: "专业儿童绘本插画，卡通风格，圆润可爱的造型，鲜明的色彩，活泼有趣" },
  chinese: { chinesePrompt: "专业儿童绘本插画，中国水墨画风格，宣纸质感，淡雅的色彩，留白意境" },
  fairytale: { chinesePrompt: "专业儿童绘本插画，童话绘本风格，梦幻的色彩，柔和的光影，奇幻氛围" },
  scifi: { chinesePrompt: "专业儿童绘本插画，科幻风格，未来感，明亮的霓虹色彩，机械元素" },
};

// 主题配置
const STORY_THEMES = [
  { id: "animal", name: "动物冒险", prompt: "以可爱动物为主角，讲述温馨有趣的冒险故事" },
  { id: "space", name: "太空探索", prompt: "以太空探索为主题，讲述勇敢好奇的宇宙冒险" },
  { id: "ocean", name: "海底世界", prompt: "以海洋生物和海底世界为背景，讲述友谊与勇气的故事" },
  { id: "forest", name: "森林奇遇", prompt: "以神奇森林为场景，讲述充满想象力的奇遇故事" },
  { id: "dream", name: "梦境之旅", prompt: "以梦境为背景，讲述奇幻又温馨的梦幻之旅" },
  { id: "friendship", name: "友谊故事", prompt: "以真挚友谊为主题，讲述互相帮助共同成长的故事" },
  { id: "courage", name: "勇气成长", prompt: "以克服困难和勇气为主题，讲述自我成长的励志故事" },
  { id: "holiday", name: "节日庆典", prompt: "以节日庆典为背景，讲述欢乐温馨的节日故事" },
];

async function getSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 后台运行完整生成流程
async function runPipeline(sessionId: string, params: any) {
  console.log(`[Pipeline] 开始: sessionId=${sessionId}`);

  try {
    const supabase = await getSupabase();

    // 检查是否已有记录（支持断点续传）
    const { data: existing } = await supabase.from("story_generations")
      .select("*").eq("session_id", sessionId).single();

    let currentProgress = existing?.progress || 0;
    let storyResult: any = existing?.result || null;
    let storyTitle: string = storyResult?.title || "";
    let storyPages: any[] = storyResult?.pages || [];

    // 如果已完成，直接返回
    if (existing?.status === "completed") {
      console.log(`[Pipeline] 已完成: sessionId=${sessionId}`);
      return;
    }

    // ====== 步骤1: 初始化（如果还没有记录） ======
    if (!existing) {
      await supabase.from("story_generations").upsert({
        session_id: sessionId,
        status: "generating",
        progress: 0,
        step: "准备开始生成...",
        params,
        result: null,
      }, { onConflict: "session_id" });
    } else if (existing.status === "failed") {
      // 之前失败的，重置状态重试
      await supabase.from("story_generations").update({
        status: "generating",
        step: "重新开始生成...",
      }).eq("session_id", sessionId);
    }

    // ====== 步骤2: 生成故事（如果还没有） ======
    if (currentProgress < 20 || !storyResult?.pages?.length) {
      await supabase.from("story_generations").update({
        progress: 10, step: "正在生成故事文本..."
      }).eq("session_id", sessionId);

      const { childName, childAge, childGender, themeId, pageCount, customPrompt } = params;
      const apiKey = process.env.DOUBAO_API_KEY;
      const endpoint = process.env.DOUBAO_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
      const modelId = process.env.DOUBAO_MODEL_ID || "ep-20260515174520-v8rzv";

      if (!apiKey) throw new Error("缺少故事生成API密钥");

      const theme = STORY_THEMES.find((t: any) => t.id === themeId) || STORY_THEMES[0];
      const isCustomAdvanced = !!customPrompt && customPrompt.trim().length >= 10;
      const childNameOrDefault = childName || "小朋友";
      const childAgeOrDefault = childAge || 5;
      const genderWord = childGender === "boy" ? "他" : (childGender === "girl" ? "她" : "TA");
      const genderWord2 = childGender === "boy" ? "男孩" : (childGender === "girl" ? "女孩" : "孩子");

      const systemContent = isCustomAdvanced
        ? `你是专业儿童绘本作家，擅长根据用户的个性化需求创作独一无二的儿童故事。

用户自定义需求：
${customPrompt}

写作要求：
- 严格按照用户的自定义需求来创作故事，优先满足用户要求
- 如果用户需求中指定了主角名字/年龄/性别，请严格遵循
- 如果用户未指定主角，自行创作合适的主角
- ${pageCount || 8}页故事，封面+${(pageCount || 8) - 2}页内容+封底
- 语言童趣可爱，避免说教
- 每页配图描述要详细具体，包含场景、角色动作、表情、色调、画风等

输出格式（严格JSON，不要任何其他文字）：
{"title": "故事标题", "pages": [{"page_number": 1, "text": "封面文字", "image_prompt": "封面配图描述"}, ...]}`
        : `你是专业儿童绘本作家，擅长创作温馨感人的儿童故事。

写作要求：
- 主角是名叫"${childNameOrDefault}"的${genderWord2}，年龄${childAgeOrDefault}岁
- ${theme.prompt}
- ${pageCount || 8}页故事，封面+${(pageCount || 8) - 2}页内容+封底
- 语言童趣可爱，避免说教

输出格式（严格JSON，不要任何其他文字）：
{"title": "故事标题", "pages": [{"page_number": 1, "text": "封面文字", "image_prompt": "封面配图描述"}, ...]}`;

      const userContent = isCustomAdvanced
        ? `请严格按照以下需求创作绘本，${pageCount || 8}页：\n${customPrompt}\n\n只要JSON，不要其他文字。`
        : `请为${childNameOrDefault}创作一个温馨的${theme.name}故事，${pageCount || 8}页。只要JSON，不要其他文字。`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: userContent },
          ],
          temperature: isCustomAdvanced ? 0.9 : 0.8,
          max_tokens: 3000,
        }),
        signal: AbortSignal.timeout(50000),
      });

      if (!response.ok) throw new Error(`故事生成API错误: ${response.status}`);

      const result = await response.json();
      let content = result.choices?.[0]?.message?.content;
      if (!content) throw new Error("故事生成返回为空");

      // 解析JSON
      let story: any;
      try {
        let jsonStr = content;
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();
        jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        try { story = JSON.parse(jsonStr); } catch {}
        if (!story) {
          const m = jsonStr.match(/\{[\s\S]*\}/);
          if (m) {
            try { story = JSON.parse(m[0]); } catch {
              let fixed = m[0].replace(/,\s*([\]}])/g, "$1");
              story = JSON.parse(fixed);
            }
          }
        }
      } catch {
        throw new Error("故事格式解析失败");
      }

      if (!story?.pages || story.pages.length === 0) throw new Error("故事生成结果为空");

      storyTitle = story.title;
      storyPages = story.pages.map((pg: any) => ({ ...pg, image_url: null, audio_url: null }));

      storyResult = { title: storyTitle, pages: storyPages };
      await supabase.from("story_generations").update({
        progress: 20, step: "故事生成完成", result: storyResult
      }).eq("session_id", sessionId);
      currentProgress = 20;
    } else {
      // 已有故事结果，直接用
      storyPages = storyResult.pages;
      storyTitle = storyResult.title;
    }

    // ====== 步骤3: 生成图片（分批，检查哪些还没生成） ======
    const styleId = params.styleId || "watercolor";
    const styleConfig = STYLE_CONFIGS[styleId] || STYLE_CONFIGS.watercolor;
    const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
    if (!dashscopeApiKey) throw new Error("缺少图片生成API密钥");

    const refImageBase64 = params.refImageBase64;
    const useProModel = !!refImageBase64;
    const model = useProModel ? "wan2.7-image-pro" : "wan2.7-image";

    // 找出还没有image_url的页面
    const pagesNeedingImages = storyPages
      .map((pg: any, idx: number) => ({ page: pg, idx }))
      .filter(({ page }: any) => page.image_prompt && !page.image_url);

    if (pagesNeedingImages.length > 0) {
      const batchSize = 4;
      for (let batch = 0; batch < pagesNeedingImages.length; batch += batchSize) {
        const batchItems = pagesNeedingImages.slice(batch, batch + batchSize);

        const progressBase = 20 + Math.floor((batch / pagesNeedingImages.length) * 60);
        await supabase.from("story_generations").update({
          progress: progressBase,
          step: `正在生成配图 (${batch + 1}-${Math.min(batch + batchSize, pagesNeedingImages.length)}/${pagesNeedingImages.length})...`
        }).eq("session_id", sessionId);

        // 并行生成当前批次
        await Promise.all(batchItems.map(async ({ page, idx }: any) => {
          try {
            const fullPrompt = `${page.image_prompt}，${styleConfig.chinesePrompt}`;
            const contentParts: any[] = [{ text: fullPrompt }];
            if (refImageBase64) contentParts.push({ image: refImageBase64 });

            const imgResponse = await fetch(
              "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
              {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${dashscopeApiKey}` },
                body: JSON.stringify({
                  model,
                  input: { messages: [{ role: "user", content: contentParts }] },
                  parameters: { size: "768*768", n: 1 },
                }),
                signal: AbortSignal.timeout(25000),
              }
            );

            if (imgResponse.ok) {
              const imgResult = await imgResponse.json();
              const imageUrl = imgResult.output?.choices?.[0]?.message?.content?.[0]?.image;
              storyPages[idx] = { ...page, image_url: imageUrl || `https://placehold.co/768x768/FFB6C1/ffffff?text=Page+${idx + 1}` };
            } else {
              storyPages[idx] = { ...page, image_url: `https://placehold.co/768x768/FFB6C1/ffffff?text=Page+${idx + 1}` };
            }
          } catch (imgErr) {
            console.error(`Pipeline: 第${idx + 1}页图片生成失败:`, imgErr);
            storyPages[idx] = { ...page, image_url: `https://placehold.co/768x768/FFB6C1/ffffff?text=Page+${idx + 1}` };
          }
        }));

        // 更新Supabase中的图片进度
        storyResult = { ...storyResult, pages: storyPages };
        const doneProgress = 20 + Math.floor(((Math.min(batch + batchSize, pagesNeedingImages.length)) / pagesNeedingImages.length) * 60);
        await supabase.from("story_generations").update({
          progress: doneProgress,
          step: `配图进度 (${Math.min(batch + batchSize, pagesNeedingImages.length)}/${pagesNeedingImages.length})`,
          result: storyResult,
        }).eq("session_id", sessionId);
        currentProgress = doneProgress;
      }
    }

    // ====== 步骤4: 保存完成 ======
    const bookId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const { error: bookError } = await supabase.from("books").insert({
      id: bookId,
      user_id: "admin",
      title: storyTitle || "我的绘本",
      character_name: params.childName || "",
      character_age: params.childAge || 5,
      theme: params.themeId || "",
      style: params.styleId || "",
      pages: storyPages,
      status: "completed",
    });
    if (bookError) console.error("Pipeline: 保存books失败:", bookError);

    const finalResult = { bookId, title: storyTitle, pages: storyPages };
    await supabase.from("story_generations").update({
      status: "completed",
      progress: 100,
      step: "生成完成",
      result: finalResult,
    }).eq("session_id", sessionId);

    console.log(`[Pipeline] 完成: sessionId=${sessionId}, bookId=${bookId}`);
  } catch (error: any) {
    console.error(`[Pipeline] 失败: sessionId=${sessionId}`, error);
    try {
      const supabase = await getSupabase();
      await supabase.from("story_generations").update({
        status: "failed",
        step: `生成失败: ${error.message}`,
      }).eq("session_id", sessionId);
    } catch {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "缺少sessionId" }, { status: 400 });
    }

    // 立即返回，然后在后台继续生成
    waitUntil(runPipeline(sessionId, body.params || {}));

    return NextResponse.json({ success: true, sessionId, message: "生成已启动" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
