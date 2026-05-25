/**
 * 服务端绘本生成API - 是我呀
 * POST /api/story/server-generate
 * 在服务端执行整个生成流程，不受浏览器生命周期影响
 * 通过SSE流式推送进度给客户端
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 允许60秒执行时间
export const maxDuration = 60;

// ==================== 参数映射（从story.ts复制） ====================

const AGE_INSTRUCTIONS: Record<string, string> = {
  "2-3": "每页1-2句短句，大量拟声词（嗖——、吧嗒吧嗒），重复句式，简单直观的故事",
  "4-6": "每页2-3句，简单情节+对话，有起承转合，可以有小悬念",
  "7-9": "每页3-4句，更丰富的情感描写和内心独白，有挑战和成长",
};

const ANIMAL_NAMES: Record<string, string> = {
  dog: "小狗", cat: "小猫", dinosaur: "小恐龙", rabbit: "小兔子",
  bear: "小熊", dolphin: "小海豚", unicorn: "独角兽", monkey: "小猴子",
};

const COLOR_NAMES: Record<string, string> = {
  red: "红色", orange: "橙色", yellow: "黄色", green: "绿色",
  blue: "蓝色", purple: "紫色", pink: "粉色",
};

const PERSONALITY_NAMES: Record<string, string> = {
  brave: "勇敢", curious: "好奇", shy: "害羞", lively: "活泼", gentle: "温柔", stubborn: "倔强",
};

const LOCATION_NAMES: Record<string, string> = {
  underwater: "海底", ocean: "海底", space: "太空", castle: "城堡",
  volcano: "火山", forest: "森林", island: "岛屿", circus: "马戏团", garden: "花园", cloud: "云端",
};

const LIFE_EVENT_NAMES: Record<string, string> = {
  kindergarten: "上幼儿园", "new-friends": "交新朋友", "fear-dark": "怕黑",
  moving: "搬家", "new-sibling": "有了弟弟妹妹", "learning-bike": "学骑车",
};

const WAN_STYLE_MAP: Record<string, string> = {
  watercolor: "专业水彩绘本风格，柔和的水洗效果，细腻的笔触，温暖的色调",
  oil: "专业油画绘本风格，浓郁的色彩，厚涂肌理质感，温暖饱和色调",
  anime: "经典日式动画绘本风格，温暖光影，精致背景，生动角色",
  chinese: "中国传统水墨绘本风格，宣纸质感，淡雅笔墨，含蓄留白",
  pastoral: "温暖田园绘本风格，金色光线，柔和阴影，田园牧歌氛围",
  fantasy: "梦幻童话绘本风格，如梦似幻的氛围，虹彩色调，魔法光影",
  minimalist: "现代简约绘本风格，大胆几何造型，有限色彩，干净构图",
  nordic: "北欧经典绘本风格，简洁线条，柔和冷色调，温馨极简",
};

const IMAGE_STYLE_PROMPTS: Record<string, string> = {
  watercolor: "专业儿童绘本插画，水彩画风格，柔和的水洗效果，细腻的笔触，温暖的色调，肌理丰富可见，有纸张纹理，柔和的光影，温馨雅致，手绘质感，没有塑料光滑感，艺术品质",
  oil: "专业儿童绘本插画，油画风格在画布上，厚重的肌理质感，浓郁可见的笔触，温暖饱和的色彩，戏剧性的光影，经典欧式绘本插画风格，手绘质感，没有塑料光滑感，艺术品质",
  anime: "专业儿童绘本插画，经典日式动画风格，温暖的金色时光效果，精致细腻的自然背景，表情丰富的角色，手绘水彩感，没有塑料3D渲染感，艺术品质",
  chinese: "专业儿童绘本插画，传统中国水墨画风格，宣纸质感，优雅流畅的笔触，细腻的墨色晕染从浓到淡，含蓄的留白，赭红色点缀，米黄色背景，经典中国水墨绘本风格，手绘质感，艺术品质",
  pastoral: "专业儿童绘本插画，温暖的田园水彩风格，金色的时光效果，柔和的长阴影，温馨的英式乡村氛围，茅草屋顶小屋和花园，可见的水彩纹理和纸张颗粒，经典英式乡村绘本风格，手绘质感，艺术品质",
  fantasy: "专业儿童绘本插画，梦幻童话现实主义风格，如梦似幻的氛围，漂浮的光粒子，彩虹般闪烁的色彩，魔法光影与可见光线，经典奇幻绘本风格，手绘质感带微妙魔法光晕，没有塑料光滑感，艺术品质",
  minimalist: "专业儿童绘本插画，现代简约风格，大胆干净的几何形状，有限的3-4种色彩调色板，慷慨的留白，平面设计带微妙肌理，现代简约绘本风格，干净优雅的构图，手工质感，艺术品质",
  nordic: "专业儿童绘本插画，北欧斯堪的纳维亚风格，简洁温柔的墨线带水彩晕染，柔和的冷色调带温暖点缀，温馨的极简氛围，可见的手绘线条质感，手绘质感，艺术品质",
};

const STORY_THEMES = [
  { id: "animal", name: "小动物" }, { id: "family", name: "温馨家庭" }, { id: "fantasy", name: "奇幻冒险" },
  { id: "princess", name: "公主王子" }, { id: "bedtime", name: "睡前催眠" }, { id: "space", name: "太空探险" },
  { id: "ocean", name: "海洋世界" }, { id: "dinosaur", name: "恐龙时代" }, { id: "friendship", name: "友谊故事" },
  { id: "bravery", name: "勇敢成长" }, { id: "seasons", name: "四季变化" }, { id: "fairytale", name: "梦幻童话" },
];

// 生成prompt模板
const STORY_GENERATION_PROMPT = `你是顶级儿童绘本作家。请根据以下信息创作一个专属儿童绘本故事，只输出JSON，不要输出其他任何内容。

主角信息：
- 名字：{childName}
- 年龄段：{ageGroup}
- 最喜欢的动物：{favoriteAnimal}（作为故事中的伙伴角色）
- 最喜欢的颜色：{favoriteColor}（融入角色服装和场景）
- 性格特征：{personality}
- 故事主题：{themeName}
- 最想去的地方：{location}（故事场景）
- 正在经历的事：{lifeEvent}（作为情感隐喻融入故事）

年龄适配要求：
{ageInstruction}

创作要求：
- 8页绘本，每页30-80字，优美凝练，适合朗读
- 纯中文输出，不包含任何英文单词或短语
- 主角名字在故事中自然出现8-12次
- 选的动物作为伙伴角色出现，至少4个页面
- 选的颜色融入角色服装或关键物品
- 性格特征驱动角色行为和情节走向
- 地点作为故事场景
- 正在经历的事作为情感隐喻自然融入
- 结尾温馨美好，给孩子勇气和温暖
- 严禁模仿任何已有IP角色（如迪士尼、漫威、小猪佩奇等）

输出JSON格式：
{
  "title": "故事标题（5字以内）",
  "pages": [
    {
      "pageNumber": 1,
      "text": "页面文字（30-80字，中文，不含英文）",
      "imagePrompt": "英文绘本插画提示词，{wanStyle}，温馨柔和的色调，专业儿童绘本插画，手绘质感，艺术品质，无多余手指，比例正确"
    }
  ]
}`;

// 获取Supabase服务客户端（服务端用service_role_key）
function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(url, serviceKey);
}

// 更新Supabase进度
async function updateGenerationProgress(sessionId: string, data: {
  status?: string;
  progress?: number;
  step?: string;
  result?: any;
}) {
  try {
    const supabase = getServiceSupabase();
    await supabase
      .from("story_generations")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);
  } catch (err) {
    console.error("[ServerGenerate] Failed to update progress:", err);
  }
}

// 发送SSE消息
function sendSSE(controller: ReadableStreamDefaultController, data: object) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const {
      childName, themeId, customPrompt, styleId = "watercolor", ageGroup = "4-6",
      favoriteAnimal, favoriteColor, personality, location, lifeEvent,
      voiceId = "longhuhu_v3", isClassic = false, classicPages, classicTitle, sessionId
    } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "缺少sessionId" }, { status: 400 });
    }

    // 创建可读流返回SSE
    const readable = new ReadableStream({
      async start(controller) {
        let storyData: any = null;
        let pages: any[] = [];

        try {
          // ============ 0. 在Supabase创建生成记录 ============
          try {
            const supabase = getServiceSupabase();
            await supabase.from("story_generations").upsert({
              session_id: sessionId,
              status: "generating",
              progress: 0,
              step: "正在生成故事文本...",
              params: body,
            }, { onConflict: "session_id" });
          } catch (dbErr) {
            console.error("[ServerGenerate] Failed to create generation record:", dbErr);
            // 不中断生成，继续
          }

          // ============ 1. 生成故事文本 ============
          sendSSE(controller, { type: "progress", step: "正在生成故事文本...", progress: 10 });
          await updateGenerationProgress(sessionId, { status: "generating", progress: 10, step: "正在生成故事文本..." });

          if (isClassic && classicPages) {
            // 经典故事 - 直接使用预置内容
            storyData = {
              title: classicTitle || "经典故事",
              pages: classicPages.map((p: any, i: number) => ({
                pageNumber: i + 1,
                text: p.text,
                imagePrompt: p.imagePrompt || p.text,
                imageUrl: p.imageUrl || "",
              })),
            };
          } else {
            // AI生成故事
            const apiKey = process.env.DOUBAO_API_KEY || process.env.VOLCENGINE_API_KEY;
            const endpoint = process.env.DOUBAO_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
            const modelId = process.env.DOUBAO_MODEL_ID || "ep-20260515144642-96m6k";

            if (!apiKey) {
              throw new Error("DOUBAO_API_KEY not configured");
            }

            const theme = STORY_THEMES.find(t => t.id === themeId) || STORY_THEMES[0];
            const wanStyle = WAN_STYLE_MAP[styleId] || WAN_STYLE_MAP.watercolor;
            const ageInstruction = AGE_INSTRUCTIONS[ageGroup] || AGE_INSTRUCTIONS["4-6"];

            let resolvedAnimal = favoriteAnimal || "";
            if (resolvedAnimal && ANIMAL_NAMES[resolvedAnimal]) resolvedAnimal = ANIMAL_NAMES[resolvedAnimal];

            let resolvedColor = favoriteColor || "";
            if (resolvedColor && COLOR_NAMES[resolvedColor]) resolvedColor = COLOR_NAMES[resolvedColor];

            const personalityArr = Array.isArray(personality) ? personality : [];
            const personalityList = personalityArr.map((p: string) => PERSONALITY_NAMES[p] || p).filter(Boolean);
            const resolvedPersonality = personalityList.length > 0 ? personalityList.join("、") : "可爱";

            let resolvedLocation = location || "";
            if (resolvedLocation && LOCATION_NAMES[resolvedLocation]) resolvedLocation = LOCATION_NAMES[resolvedLocation];

            let resolvedLifeEvent = lifeEvent || "";
            if (resolvedLifeEvent && LIFE_EVENT_NAMES[resolvedLifeEvent]) resolvedLifeEvent = LIFE_EVENT_NAMES[resolvedLifeEvent];

            const prompt = STORY_GENERATION_PROMPT
              .replace(/{childName}/g, childName || "小宝贝")
              .replace(/{ageGroup}/g, ageGroup)
              .replace(/{favoriteAnimal}/g, resolvedAnimal || "可爱的小动物")
              .replace(/{favoriteColor}/g, resolvedColor || "温暖的色彩")
              .replace(/{personality}/g, resolvedPersonality)
              .replace(/{themeName}/g, theme.name)
              .replace(/{location}/g, resolvedLocation || "一个奇妙的地方")
              .replace(/{lifeEvent}/g, resolvedLifeEvent || "")
              .replace(/{ageInstruction}/g, ageInstruction)
              .replace(/{wanStyle}/g, wanStyle);

            // 调用Doubao API
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
              body: JSON.stringify({
                model: modelId,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8,
                max_tokens: 4000,
              }),
            });

            if (!response.ok) {
              const errText = await response.text().catch(() => "");
              throw new Error(`故事生成API错误(${response.status}): ${errText.slice(0, 200)}`);
            }

            const result = await response.json();
            const content = result.choices?.[0]?.message?.content;

            if (!content) {
              throw new Error("AI未返回故事内容");
            }

            // 解析JSON
            const jsonStr = content.replace(/^```json\s*/g, "").replace(/^```\s*/g, "").replace(/\s*```$/g, "").trim();
            storyData = JSON.parse(jsonStr);

            if (!storyData.title) storyData.title = `${childName}的睡前故事`;
            if (!storyData.pages || storyData.pages.length === 0) {
              throw new Error("故事页数为空");
            }
          }

          pages = storyData.pages;
          sendSSE(controller, { type: "progress", step: `故事文本生成完成，共${pages.length}页`, progress: 25 });
          await updateGenerationProgress(sessionId, { progress: 25, step: "故事文本生成完成" });

          // ============ 2. 生成语音 ============
          const dashscopeKey = process.env.DASHSCOPE_API_KEY;
          const ttsVoice = voiceId || "longhuhu_v3";

          for (let i = 0; i < pages.length; i++) {
            sendSSE(controller, { type: "progress", step: `正在生成语音 (${i + 1}/${pages.length})...`, progress: 25 + Math.round((i / pages.length) * 20) });
            await updateGenerationProgress(sessionId, { progress: 25 + Math.round((i / pages.length) * 20), step: `正在生成语音 (${i + 1}/${pages.length})...` });

            if (dashscopeKey && pages[i].text) {
              try {
                const maxLength = 500;
                const truncatedText = pages[i].text.length > maxLength ? pages[i].text.substring(0, maxLength) + "..." : pages[i].text;

                const ttsResponse = await fetch("https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer", {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${dashscopeKey}`, "Content-Type": "application/json" },
                  body: JSON.stringify({
                    model: "cosyvoice-v3-flash",
                    input: { text: truncatedText, voice: ttsVoice, format: "mp3", sample_rate: 24000, rate: 0.9, volume: 50, language_hints: ["zh"] },
                  }),
                });

                if (ttsResponse.ok) {
                  const ttsData = await ttsResponse.json();
                  if (ttsData.output?.audio?.url) {
                    pages[i].audioUrl = ttsData.output.audio.url;
                  }
                }
              } catch (ttsErr) {
                console.error(`[ServerGenerate] TTS error for page ${i + 1}:`, ttsErr);
              }
            }
          }

          sendSSE(controller, { type: "progress", step: "语音生成完成", progress: 45 });
          await updateGenerationProgress(sessionId, { progress: 45, step: "语音生成完成" });

          // ============ 3. 生成配图 ============
          const stylePrompt = IMAGE_STYLE_PROMPTS[styleId] || IMAGE_STYLE_PROMPTS.watercolor;

          for (let i = 0; i < pages.length; i++) {
            sendSSE(controller, { type: "progress", step: `正在生成配图 (${i + 1}/${pages.length})...`, progress: 45 + Math.round((i / pages.length) * 50) });
            await updateGenerationProgress(sessionId, { progress: 45 + Math.round((i / pages.length) * 50), step: `正在生成配图 (${i + 1}/${pages.length})...` });

            if (!pages[i].imageUrl || pages[i].imageUrl === "") {
              if (dashscopeKey && pages[i].imagePrompt) {
                try {
                  const fullPrompt = `${pages[i].imagePrompt}，${stylePrompt}`;

                  // 使用万相2.7 API
                  const imageResponse = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${dashscopeKey}` },
                    body: JSON.stringify({
                      model: "wan2.7-image",
                      input: { messages: [{ role: "user", content: [{ text: fullPrompt }] }] },
                      parameters: { size: "768*768", n: 1 },
                    }),
                  });

                  if (imageResponse.ok) {
                    const imageData = await imageResponse.json();
                    const imageUrl = imageData.output?.choices?.[0]?.message?.content?.[0]?.image;
                    if (imageUrl) {
                      pages[i].imageUrl = imageUrl;
                    }
                  }
                } catch (imgErr) {
                  console.error(`[ServerGenerate] Image error for page ${i + 1}:`, imgErr);
                }
              }

              // 如果没有图片URL，使用占位图
              if (!pages[i].imageUrl) {
                const colors = ["FF6B6B", "4ECDC4", "45B7D1", "96CEB4", "FFEAA7", "DDA0DD", "98D8C8", "F7DC6F"];
                const bg = colors[i % colors.length];
                pages[i].imageUrl = `https://placehold.co/800x800/${bg}/ffffff?text=Page+${i + 1}`;
              }
            }
          }

          sendSSE(controller, { type: "progress", step: "配图生成完成", progress: 95 });
          await updateGenerationProgress(sessionId, { progress: 95, step: "配图生成完成" });

          // ============ 4. 完成 ============
          storyData.pages = pages;
          storyData.childName = childName || "小宝贝";

          sendSSE(controller, { type: "progress", step: "生成完成!", progress: 100 });
          await updateGenerationProgress(sessionId, { status: "completed", progress: 100, step: "生成完成", result: storyData });

          // 发送完整结果
          sendSSE(controller, { type: "complete", storyData });

        } catch (error: any) {
          console.error("[ServerGenerate] Error:", error);
          sendSSE(controller, { type: "error", message: error.message || "生成失败" });
          await updateGenerationProgress(sessionId, { status: "failed", step: `生成失败: ${error.message}` });
        }

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "服务端生成失败" }, { status: 500 });
  }
}
