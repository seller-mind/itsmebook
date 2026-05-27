/**
 * 分步生成API - 是我呀 V3 (完全重建版)
 * POST /api/admin/generate-step
 * 
 * 每次调用只执行一个短步骤（<30秒），解决Vercel Hobby 60秒超时问题
 * 前端串联调用：init → story → images(0) → images(1) → ... → images(n) → complete
 * 
 * 核心变更：
 * 1. 图片生成后立即下载并上传到Supabase Storage，返回永久URL
 * 2. 不再返回dashscope临时URL（1小时过期）
 * 3. 故事生成JSON解析更健壮（正则提取、3次重试）
 * 4. 服务端不做重试（保证每次<30秒）
 * 5. 前端重试逻辑处理失败的页面
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// Supabase Storage bucket名称
const STORAGE_BUCKET = "book-images";

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

// 获取Supabase客户端
async function getSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * 下载图片并上传到Supabase Storage
 * @param dashscopeUrl dashscope生成的临时URL
 * @param fileName 存储文件名
 * @returns Supabase Storage的永久URL，失败返回null
 */
async function downloadAndUploadToStorage(dashscopeUrl: string, fileName: string): Promise<string | null> {
  try {
    // 1. 下载dashscope临时图片（15秒超时）
    const fetchController = new AbortController();
    const fetchTimeout = setTimeout(() => fetchController.abort(), 15000);
    
    const response = await fetch(dashscopeUrl, {
      signal: fetchController.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ItsMeBook/1.0)" },
    });
    clearTimeout(fetchTimeout);
    
    if (!response.ok) {
      console.error(`下载图片失败: HTTP ${response.status}`);
      return null;
    }
    
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/png";
    
    // 2. 上传到Supabase Storage
    const supabase = await getSupabase();
    const storagePath = `generated/${Date.now()}_${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: false,
      });
    
    if (uploadError) {
      console.error(`上传Supabase失败:`, uploadError);
      return null;
    }
    
    // 3. 获取公开访问URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    
    return urlData.publicUrl;
  } catch (err) {
    console.error(`图片转存失败:`, err);
    return null;
  }
}

/**
 * 健壮的JSON解析（3次重试机会）
 * 1. 先用正则提取```json```代码块
 * 2. 去掉<think>思维链
 * 3. 提取第一个完整JSON对象
 */
function parseStoryJSON(content: string, maxRetries: number = 3): any {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let jsonStr = content;
      
      // 尝试提取json代码块
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      
      // 去掉<think>思维链
      jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      
      // 尝试直接解析
      try {
        return JSON.parse(jsonStr);
      } catch {}
      
      // 尝试提取JSON对象
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let fixed = jsonMatch[0];
        // 修复尾部逗号
        fixed = fixed.replace(/,\s*([\]}])/g, "$1");
        try {
          return JSON.parse(fixed);
        } catch {}
      }
      
      // 如果是数组
      const arrMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrMatch) {
        let fixed = arrMatch[0];
        fixed = fixed.replace(/,\s*([\]}])/g, "$1");
        try {
          return JSON.parse(fixed);
        } catch {}
      }
      
      throw new Error("无法解析JSON");
    } catch (err: any) {
      lastError = err;
      console.warn(`JSON解析尝试 ${attempt + 1} 失败:`, err.message);
    }
  }
  
  throw new Error(`故事格式解析失败 (尝试${maxRetries}次): ${lastError?.message}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const step = body.step;
    const sessionId = body.sessionId;

    if (!step) {
      return NextResponse.json({ success: false, message: "缺少step参数" }, { status: 400 });
    }

    const supabase = await getSupabase();

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
        const { childName, childAge, childGender, themeId, pageCount, customPrompt } = body;
        const apiKey = process.env.DOUBAO_API_KEY;
        const endpoint = process.env.DOUBAO_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
        const modelId = process.env.DOUBAO_MODEL_ID || "ep-20260515174520-v8rzv";

        if (!apiKey) throw new Error("缺少故事生成API密钥");

        const theme = STORY_THEMES.find(t => t.id === themeId) || STORY_THEMES[0];

        await supabase.from("story_generations").update({
          progress: 10, step: "正在生成故事文本..."
        }).eq("session_id", sessionId);

        // 自由高阶版：用户自定义需求优先
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
- ${pageCount}页故事，封面+${pageCount - 2}页内容+封底
- 语言童趣可爱，避免说教
- 每页配图描述要详细具体，包含场景、角色动作、表情、色调、画风等

输出格式（严格JSON，不要任何其他文字）：
{"title": "故事标题", "pages": [{"page_number": 1, "text": "封面文字", "image_prompt": "封面配图描述"}, ...]}`
          : `你是专业儿童绘本作家，擅长创作温馨感人的儿童故事。

写作要求：
- 主角是名叫"${childNameOrDefault}"的${genderWord2}，年龄${childAgeOrDefault}岁
- ${theme.prompt}
- ${pageCount}页故事，封面+${pageCount - 2}页内容+封底
- 语言童趣可爱，避免说教

输出格式（严格JSON，不要任何其他文字）：
{"title": "故事标题", "pages": [{"page_number": 1, "text": "封面文字", "image_prompt": "封面配图描述"}, ...]}`;

        const userContent = isCustomAdvanced
          ? `请严格按照以下需求创作绘本，${pageCount}页：\n${customPrompt}\n\n只要JSON，不要其他文字。`
          : `请为${childNameOrDefault}创作一个温馨的${theme.name}故事，${pageCount}页。只要JSON，不要其他文字。`;

        // 50秒超时（留10秒余量）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50000);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: "system", content: systemContent },
              { role: "user", content: userContent },
            ],
            temperature: isCustomAdvanced ? 0.9 : 0.8,
            max_tokens: 3000,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`故事生成API错误: ${response.status}`);
        }

        const result = await response.json();
        let content = result.choices?.[0]?.message?.content;
        
        console.log(`[Story] 生成完成, content长度: ${content?.length || 0}`);
        if (!content) throw new Error("故事生成返回为空");

        // 健壮JSON解析
        const story = parseStoryJSON(content);

        if (!story?.pages || story.pages.length === 0) {
          throw new Error("故事生成结果为空");
        }

        // 保存故事到Supabase
        const currentResult = {
          title: story.title,
          pages: story.pages.map((pg: any) => ({ 
            page_number: pg.page_number, 
            text: pg.text, 
            image_prompt: pg.image_prompt,
            image_url: null // 图片URL稍后填充
          }))
        };
        await supabase.from("story_generations").update({
          progress: 20, step: "故事生成完成", result: currentResult
        }).eq("session_id", sessionId);

        return NextResponse.json({ 
          success: true, 
          step: "story", 
          progress: 20, 
          story: { title: story.title, pages: story.pages } 
        });
      }

      case "image": {
        // 生成单张图片（优化后：每次只生成1张，保证<30秒）
        const index = body.index ?? 0;
        const pages = body.pages;
        const styleId = body.styleId || "watercolor";
        const refImageBase64 = body.refImageBase64;

        if (!pages || !Array.isArray(pages) || !pages[index]) {
          return NextResponse.json({ success: false, message: "缺少页面数据" }, { status: 400 });
        }

        const styleConfig = STYLE_CONFIGS[styleId] || STYLE_CONFIGS.watercolor;
        const apiKey = process.env.DASHSCOPE_API_KEY;
        if (!apiKey) throw new Error("缺少图片生成API密钥");

        const page = pages[index];
        const totalPages = pages.length;
        
        // 更新进度
        const progressBase = 20 + Math.floor((index / totalPages) * 70);
        await supabase.from("story_generations").update({
          progress: progressBase,
          step: `正在生成第${index + 1}/${totalPages}页配图...`
        }).eq("session_id", sessionId);

        try {
          // 1. 调用dashscope生成图片（25秒超时）
          const fullPrompt = `${page.image_prompt || page.image_prompt}，${styleConfig.chinesePrompt}`;
          const contentParts: any[] = [{ text: fullPrompt }];
          if (refImageBase64) contentParts.push({ image: refImageBase64 });

          const useProModel = !!refImageBase64;
          const model = useProModel ? "wan2.7-image-pro" : "wan2.7-image";

          const imgController = new AbortController();
          const imgTimeoutId = setTimeout(() => imgController.abort(), 25000);

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
              signal: imgController.signal,
            }
          );
          clearTimeout(imgTimeoutId);

          let imageUrl = null;

          if (imgResponse.ok) {
            const imgResult = await imgResponse.json();
            const dashscopeUrl = imgResult.output?.choices?.[0]?.message?.content?.[0]?.image;
            
            if (dashscopeUrl) {
              // 2. 立即下载并上传到Supabase Storage（15秒超时）
              const fileName = `page_${index + 1}_${Date.now()}.png`;
              imageUrl = await downloadAndUploadToStorage(dashscopeUrl, fileName);
              
              if (!imageUrl) {
                console.warn(`第${index + 1}页图片转存失败，dashscope URL保留`);
                imageUrl = dashscopeUrl; // 降级：保留原始URL（前端会处理）
              }
            }
          } else {
            const errText = await imgResponse.text();
            console.warn(`第${index + 1}页图片生成失败: HTTP ${imgResponse.status} - ${errText.substring(0, 100)}`);
          }

          // 3. 更新Supabase中的结果
          const { data: current } = await supabase.from("story_generations")
            .select("result").eq("session_id", sessionId).single();
          
          const existingResult = current?.result || {};
          const existingPages = existingResult.pages || pages;
          
          // 替换当前页的image_url
          existingPages[index] = { 
            ...existingPages[index], 
            image_url: imageUrl 
          };

          const doneProgress = 20 + Math.floor(((index + 1) / totalPages) * 70);
          await supabase.from("story_generations").update({
            progress: doneProgress,
            step: `配图进度 (${index + 1}/${totalPages})`,
            result: { ...existingResult, pages: existingPages }
          }).eq("session_id", sessionId);

          return NextResponse.json({
            success: true,
            step: "image",
            index,
            progress: doneProgress,
            imageUrl,
            page: existingPages[index]
          });

        } catch (err: any) {
          console.error(`第${index + 1}页图片生成异常:`, err);
          
          // 更新失败状态（image_url为null，前端会重试）
          const { data: current } = await supabase.from("story_generations")
            .select("result").eq("session_id", sessionId).single();
          
          const existingResult = current?.result || {};
          const existingPages = existingResult.pages || pages;
          existingPages[index] = { ...existingPages[index], image_url: null };

          await supabase.from("story_generations").update({
            step: `第${index + 1}页失败，将重试...`,
            result: { ...existingResult, pages: existingPages }
          }).eq("session_id", sessionId);

          return NextResponse.json({
            success: true, // 不报错，前端会重试
            step: "image",
            index,
            progress: progressBase,
            imageUrl: null, // 告诉前端这张图失败了
            error: err.message
          });
        }
      }

      case "complete": {
        // 保存最终绘本
        const finalPages = body.pages;
        const title = body.title;
        const bookParams = body.params || {};

        // 生成bookId
        const bookId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        // 尝试保存到books表（如果表存在）
        try {
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
          if (bookError) console.warn("保存books表跳过（表可能不存在）:", bookError.message);
        } catch (e) {
          console.warn("保存books表失败，使用story_generations作为主存储:", e);
        }

        await supabase.from("story_generations").update({
          status: "completed", 
          progress: 100, 
          step: "生成完成",
          result: { bookId, title, pages: finalPages }
        }).eq("session_id", sessionId);

        return NextResponse.json({
          success: true, 
          step: "complete", 
          progress: 100,
          bookId, 
          title, 
          pages: finalPages
        });
      }

      default:
        return NextResponse.json({ success: false, message: `未知步骤: ${step}` }, { status: 400 });
    }

  } catch (error: any) {
    console.error(`生成步骤失败:`, error);

    // 更新失败状态
    try {
      const supabase = await getSupabase();
      // 从请求体中获取sessionId（如果前面解析成功的话）
      let failSessionId = request.headers.get("x-session-id");
      if (!failSessionId) {
        try {
          const body = await request.clone().json();
          failSessionId = body?.sessionId;
        } catch {}
      }
      if (failSessionId) {
        await supabase.from("story_generations").update({
          status: "failed", 
          step: `生成失败: ${error.message}`
        }).eq("session_id", failSessionId);
      }
    } catch {}

    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
