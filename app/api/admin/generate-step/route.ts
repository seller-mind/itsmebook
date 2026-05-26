/**
 * 分步生成API - 是我呀
 * POST /api/admin/generate-step
 * 
 * 每次调用只执行一个短步骤（<30秒），解决Vercel Hobby 60秒超时问题
 * 前端串联调用：init → story → images(0-3) → images(4-7) → complete
 * 
 * 步骤：
 * - init: 创建Supabase记录，返回sessionId
 * - story: 生成故事文本（~5秒）
 * - images: 生成4页图片（~20秒）
 * - complete: 保存最终绘本
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// 风格配置
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const step = body.step;
    const sessionId = body.sessionId;

    if (!step) {
      return NextResponse.json({ success: false, message: "缺少step参数" }, { status: 400 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    switch (step) {
      case "init": {
        // 创建生成记录
        const { error } = await supabase.from("story_generations").upsert({
          session_id: sessionId,
          status: "generating",
          progress: 0,
          step: "准备开始生成...",
          params: body.params || {},
          result: null,
        }, { onConflict: "session_id" });

        if (error) console.error("init upsert error:", error);
        return NextResponse.json({ success: true, step: "init", progress: 0, sessionId });
      }

      case "story": {
        // 生成故事文本（~5秒）
        const { childName, childAge, childGender, themeId, pageCount } = body;
        const apiKey = process.env.DOUBAO_API_KEY;
        const endpoint = process.env.DOUBAO_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
        const modelId = process.env.DOUBAO_MODEL_ID || "ep-20260515174520-v8rzv";

        if (!apiKey) throw new Error("缺少故事生成API密钥");

        const theme = STORY_THEMES.find(t => t.id === themeId) || STORY_THEMES[0];
        const genderWord = childGender === "boy" ? "他" : "她";
        const genderWord2 = childGender === "boy" ? "男孩" : "女孩";

        await supabase.from("story_generations").update({
          progress: 10, step: "正在生成故事文本..."
        }).eq("session_id", sessionId);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              {
                role: "system",
                content: `你是专业儿童绘本作家，擅长创作温馨感人的儿童故事。

写作要求：
- 主角是名叫"${childName}"的${genderWord2}，年龄${childAge}岁
- ${theme.prompt}
- ${pageCount}页故事，封面+${pageCount - 2}页内容+封底
- 语言童趣可爱，避免说教

输出格式（严格JSON，不要任何其他文字）：
{"title": "故事标题", "pages": [{"page_number": 1, "text": "封面文字", "image_prompt": "封面配图描述"}, ...]}`
              },
              {
                role: "user",
                content: `请为${childName}创作一个温馨的${theme.name}故事，${pageCount}页。只要JSON，不要其他文字。`
              },
            ],
            temperature: 0.8,
            max_tokens: 3000,
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`故事生成API错误: ${response.status}`);
        }

        const result = await response.json();
        let content = result.choices?.[0]?.message?.content;
        if (!content) throw new Error("故事生成返回为空");

        // 解析JSON（增强版）
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

        if (!story?.pages || story.pages.length === 0) {
          throw new Error("故事生成结果为空");
        }

        // 保存故事到Supabase
        const currentResult = {
          title: story.title,
          pages: story.pages.map((pg: any) => ({ ...pg, image_url: null, audio_url: null }))
        };
        await supabase.from("story_generations").update({
          progress: 20, step: "故事生成完成", result: currentResult
        }).eq("session_id", sessionId);

        return NextResponse.json({ success: true, step: "story", progress: 20, story: { title: story.title, pages: story.pages } });
      }

      case "images": {
        // 生成指定范围的图片
        const fromIndex = body.fromIndex ?? 0;
        const toIndex = body.toIndex ?? 3;
        const pages = body.pages;
        const styleId = body.styleId || "watercolor";
        const refImageBase64 = body.refImageBase64;

        if (!pages || !Array.isArray(pages)) {
          return NextResponse.json({ success: false, message: "缺少页面数据" }, { status: 400 });
        }

        const styleConfig = STYLE_CONFIGS[styleId] || STYLE_CONFIGS.watercolor;
        const apiKey = process.env.DASHSCOPE_API_KEY;
        if (!apiKey) throw new Error("缺少图片生成API密钥");

        const useProModel = !!refImageBase64;
        const model = useProModel ? "wan2.7-image-pro" : "wan2.7-image";
        const updatedPages = [...pages];

        for (let i = fromIndex; i <= Math.min(toIndex, pages.length - 1); i++) {
          const page = pages[i];
          if (!page.image_prompt) continue;

          const progressPercent = 20 + Math.floor(((i + 1) / pages.length) * 60);

          await supabase.from("story_generations").update({
            progress: progressPercent,
            step: `正在生成配图 (${i + 1}/${pages.length})...`
          }).eq("session_id", sessionId);

          try {
            const fullPrompt = `${page.image_prompt}，${styleConfig.chinesePrompt}`;
            const contentParts: any[] = [{ text: fullPrompt }];
            if (refImageBase64) contentParts.push({ image: refImageBase64 });

            const imgResponse = await fetch(
              "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
              {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
                body: JSON.stringify({
                  model,
                  input: { messages: [{ role: "user", content: contentParts }] },
                  parameters: { size: "768*768", n: 1 },
                }),
                signal: AbortSignal.timeout(30000),
              }
            );

            if (imgResponse.ok) {
              const imgResult = await imgResponse.json();
              const imageUrl = imgResult.output?.choices?.[0]?.message?.content?.[0]?.image;
              updatedPages[i] = { ...page, image_url: imageUrl || `https://placehold.co/768x768/FFB6C1/ffffff?text=Page+${i + 1}` };
            } else {
              updatedPages[i] = { ...page, image_url: `https://placehold.co/768x768/FFB6C1/ffffff?text=Page+${i + 1}` };
            }
          } catch (imgErr) {
            console.error(`第${i + 1}页图片生成失败:`, imgErr);
            updatedPages[i] = { ...page, image_url: `https://placehold.co/768x768/FFB6C1/ffffff?text=Page+${i + 1}` };
          }
        }

        // 更新Supabase中的结果
        const { data: current } = await supabase.from("story_generations")
          .select("result").eq("session_id", sessionId).single();
        const existingResult = current?.result || {};
        const existingPages = existingResult.pages || pages;
        // 合并：用新生成的替换旧的
        const mergedPages = existingPages.map((pg: any, idx: number) => {
          if (idx >= fromIndex && idx <= toIndex && updatedPages[idx]?.image_url) {
            return updatedPages[idx];
          }
          return pg;
        });

        const doneProgress = 20 + Math.floor(((Math.min(toIndex, pages.length - 1) + 1) / pages.length) * 60);
        await supabase.from("story_generations").update({
          progress: doneProgress,
          step: `配图进度 (${Math.min(toIndex + 1, pages.length)}/${pages.length})`,
          result: { ...existingResult, pages: mergedPages }
        }).eq("session_id", sessionId);

        return NextResponse.json({
          success: true, step: "images",
          progress: doneProgress,
          fromIndex, toIndex,
          pages: mergedPages
        });
      }

      case "complete": {
        // 保存最终绘本
        const finalPages = body.pages;
        const title = body.title;
        const bookParams = body.params || {};

        const bookId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const { error: bookError } = await supabase.from("books").insert({
          id: bookId,
          user_id: "admin",
          title: title || "我的绘本",
          character_name: bookParams.childName || "",
          character_age: bookParams.childAge || 5,
          theme: bookParams.themeId || "",
          style: bookParams.styleId || "",
          pages: finalPages,
          status: "completed",
        });
        if (bookError) console.error("保存books失败:", bookError);

        await supabase.from("story_generations").update({
          status: "completed", progress: 100, step: "生成完成",
          result: { bookId, title, pages: finalPages }
        }).eq("session_id", sessionId);

        return NextResponse.json({
          success: true, step: "complete", progress: 100,
          bookId, title, pages: finalPages
        });
      }

      default:
        return NextResponse.json({ success: false, message: `未知步骤: ${step}` }, { status: 400 });
    }

  } catch (error: any) {
    console.error(`生成步骤失败:`, error);

    // 更新失败状态
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      // 尝试从请求中获取sessionId
      const failSessionId = request.headers.get("x-session-id");
      if (failSessionId) {
        await supabase.from("story_generations").update({
          status: "failed", step: `生成失败: ${error.message}`
        }).eq("session_id", failSessionId);
      }
    } catch {}

    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
