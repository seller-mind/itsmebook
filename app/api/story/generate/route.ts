/**
 * AI专属儿童绘本生成API - 是我呀V2
 * POST /api/story/generate
 * 生成故事文本和配图（使用流式响应避免Vercel 10秒超时）
 */

import { NextRequest, NextResponse } from "next/server";
import { STORY_THEMES, STORY_GENERATION_PROMPT } from "@/lib/story";

// ==================== 个性化参数映射（与story.ts保持一致） ====================

// 年龄适配指令
const AGE_INSTRUCTIONS: Record<string, string> = {
  "2-3": "每页1-2句短句，大量拟声词（嗖——、吧嗒吧嗒），重复句式，简单直观的故事",
  "4-6": "每页2-3句，简单情节+对话，有起承转合，可以有小悬念",
  "7-9": "每页3-4句，更丰富的情感描写和内心独白，有挑战和成长",
};

// 动物名称映射
const ANIMAL_NAMES: Record<string, string> = {
  dog: "小狗",
  cat: "小猫",
  dinosaur: "小恐龙",
  rabbit: "小兔子",
  bear: "小熊",
  dolphin: "小海豚",
  unicorn: "独角兽",
  monkey: "小猴子",
};

// 颜色名称映射
const COLOR_NAMES: Record<string, string> = {
  red: "红色",
  orange: "橙色",
  yellow: "黄色",
  green: "绿色",
  blue: "蓝色",
  purple: "紫色",
  pink: "粉色",
};

// 性格名称映射
const PERSONALITY_NAMES: Record<string, string> = {
  brave: "勇敢",
  curious: "好奇",
  shy: "害羞",
  lively: "活泼",
  gentle: "温柔",
  stubborn: "倔强",
};

// 地点名称映射
const LOCATION_NAMES: Record<string, string> = {
  underwater: "海底",
  space: "太空",
  castle: "城堡",
  volcano: "火山",
  forest: "森林",
  island: "岛屿",
  circus: "马戏团",
};

// 生活经历映射
const LIFE_EVENT_NAMES: Record<string, string> = {
  kindergarten: "上幼儿园",
  "new-friends": "交新朋友",
  "fear-dark": "怕黑",
  moving: "搬家",
  "new-sibling": "有了弟弟妹妹",
  "learning-bike": "学骑车",
};

// 万相风格映射
const WAN_STYLE_MAP: Record<string, string> = {
  watercolor:
    "专业水彩绘本风格，柔和的水洗效果，细腻的笔触，温暖的色调",
  oil: "专业油画绘本风格，浓郁的色彩，厚涂肌理质感，温暖饱和色调",
  anime: "经典日式动画绘本风格，温暖光影，精致背景，生动角色",
  chinese: "中国传统水墨绘本风格，宣纸质感，淡雅笔墨，含蓄留白",
  pastoral: "温暖田园绘本风格，金色光线，柔和阴影，田园牧歌氛围",
  fantasy: "梦幻童话绘本风格，如梦似幻的氛围，虹彩色调，魔法光影",
  minimalist: "现代简约绘本风格，大胆几何造型，有限色彩，干净构图",
  nordic: "北欧经典绘本风格，简洁线条，柔和冷色调，温馨极简",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      childName,
      themeId,
      styleId = "watercolor",
      ageGroup,
      favoriteAnimal,
      favoriteColor,
      personality,
      location,
      lifeEvent,
    } = body;

    if (!childName || !themeId) {
      return NextResponse.json(
        { success: false, message: "缺少必要参数" },
        { status: 400 }
      );
    }

    const theme = STORY_THEMES.find((t) => t.id === themeId) || STORY_THEMES[0];
    const wanStyle = WAN_STYLE_MAP[styleId] || WAN_STYLE_MAP.watercolor;

    // 解析个性化参数，使用映射表转换为中文
    const resolvedAgeGroup = ageGroup || "4-6";
    const ageInstruction = AGE_INSTRUCTIONS[resolvedAgeGroup] || AGE_INSTRUCTIONS["4-6"];

    // 处理动物参数
    let resolvedAnimal = favoriteAnimal || "";
    if (resolvedAnimal && ANIMAL_NAMES[resolvedAnimal]) {
      resolvedAnimal = ANIMAL_NAMES[resolvedAnimal];
    }

    // 处理颜色参数
    let resolvedColor = favoriteColor || "";
    if (resolvedColor && COLOR_NAMES[resolvedColor]) {
      resolvedColor = COLOR_NAMES[resolvedColor];
    }

    // 处理性格参数
    const personalityArr = personality || [];
    const personalityList = personalityArr
      .map((p: string) => PERSONALITY_NAMES[p] || p)
      .filter(Boolean);
    const resolvedPersonality = personalityList.length > 0 ? personalityList.join("、") : "可爱";

    // 处理地点参数
    let resolvedLocation = location || "";
    if (resolvedLocation && LOCATION_NAMES[resolvedLocation]) {
      resolvedLocation = LOCATION_NAMES[resolvedLocation];
    }

    // 处理生活经历参数
    let resolvedLifeEvent = lifeEvent || "";
    if (resolvedLifeEvent && LIFE_EVENT_NAMES[resolvedLifeEvent]) {
      resolvedLifeEvent = LIFE_EVENT_NAMES[resolvedLifeEvent];
    }

    const prompt = STORY_GENERATION_PROMPT
      .replace("{childName}", childName)
      .replace("{ageGroup}", resolvedAgeGroup)
      .replace("{favoriteAnimal}", resolvedAnimal || "可爱的小动物")
      .replace("{favoriteColor}", resolvedColor || "温暖的色彩")
      .replace("{personality}", resolvedPersonality)
      .replace("{themeName}", theme.name)
      .replace("{location}", resolvedLocation || "一个奇妙的地方")
      .replace("{lifeEvent}", resolvedLifeEvent || "")
      .replace("{ageInstruction}", ageInstruction)
      .replace("{wanStyle}", wanStyle);

    // 调用Doubao故事生成
    const apiKey =
      process.env.DOUBAO_API_KEY || process.env.VOLCENGINE_API_KEY;
    const endpoint =
      process.env.DOUBAO_ENDPOINT ||
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    const modelId =
      process.env.DOUBAO_MODEL_ID ||
      process.env.VOLCENGINE_ENDPOINT_ID ||
      "ep-20260515144642-96m6k";

    if (!apiKey) {
      // 没有API key时，返回演示数据
      return NextResponse.json({
        success: true,
        isDemo: true,
        story: getDemoStory(childName, theme, resolvedAgeGroup, favoriteAnimal, favoriteColor),
      });
    }

    // 立即开始流式响应，避免Vercel 10秒超时杀进程
    // 关键：先返回Response，再在流内部请求Doubao API
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        // 先发一个心跳，让Vercel知道连接还活着
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: "connecting" })}\n\n`));

        let doubaoReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
        let fullContent = "";

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: modelId,
              messages: [{ role: "user", content: prompt }],
              stream: true,
              temperature: 0.8,
              max_tokens: 4000,
            }),
          });

          if (!response.ok) {
            const errText = await response.text().catch(() => "");
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ success: false, message: `故事生成API错误(${response.status}): ${errText.slice(0, 200)}` })}\n\n`)
            );
            controller.close();
            return;
          }

          if (!response.body) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ success: false, message: "API未返回数据流" })}\n\n`)
            );
            controller.close();
            return;
          }

          doubaoReader = response.body.getReader();

          while (true) {
            const { done, value } = await doubaoReader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  // 流结束，发送完整内容
                  try {
                    const jsonStr = fullContent
                      .replace(/^```json\s*/g, "")
                      .replace(/^```\s*/g, "")
                      .replace(/\s*```$/g, "")
                      .trim();
                    
                    const storyData = JSON.parse(jsonStr);
                    
                    if (!storyData.title) {
                      storyData.title = `${childName}的睡前故事`;
                    }
                    if (!storyData.pages || storyData.pages.length === 0) {
                      throw new Error("故事页数为空");
                    }
                    
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ success: true, story: storyData })}\n\n`)
                    );
                  } catch (parseError: any) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ success: false, message: "故事格式解析失败: " + (parseError.message || "").slice(0, 100) })}\n\n`)
                    );
                  }
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    fullContent += delta;
                  }
                } catch {
                  // 忽略解析错误的行
                }
              }
            }
          }

          // 流正常结束但没收到[DONE]，尝试解析已有内容
          if (fullContent) {
            try {
              const jsonStr = fullContent
                .replace(/^```json\s*/g, "")
                .replace(/^```\s*/g, "")
                .replace(/\s*```$/g, "")
                .trim();
              const storyData = JSON.parse(jsonStr);
              if (!storyData.title) storyData.title = `${childName}的睡前故事`;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ success: true, story: storyData })}\n\n`)
              );
            } catch {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ success: false, message: "故事生成不完整，请重试" })}\n\n`)
              );
            }
          } else {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ success: false, message: "AI未返回任何内容，请重试" })}\n\n`)
            );
          }
          controller.close();
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ success: false, message: `生成失败: ${(error.message || "未知错误").slice(0, 100)}` })}\n\n`)
          );
          controller.close();
        } finally {
          if (doubaoReader) {
            try { doubaoReader.releaseLock(); } catch {}
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "故事生成失败" },
      { status: 500 }
    );
  }
}

// 演示数据
function getDemoStory(
  childName: string,
  theme: (typeof STORY_THEMES)[0],
  ageGroup: string = "4-6",
  favoriteAnimal?: string,
  favoriteColor?: string
) {
  const name = childName || "小宝贝";
  const animalName = favoriteAnimal || "小兔子";
  const colorName = favoriteColor || "粉色";

  // 根据动物参数选择合适的角色
  const animalEmoji: Record<string, string> = {
    dog: "🐶 小狗",
    cat: "🐱 小猫",
    dinosaur: "🦕 小恐龙",
    rabbit: "🐰 小兔子",
    bear: "🐻 小熊",
    dolphin: "🐬 小海豚",
    unicorn: "🦄 独角兽",
    monkey: "🐵 小猴子",
  };
  const animalDisplay = animalEmoji[favoriteAnimal || "rabbit"] || animalEmoji.rabbit;

  return {
    title: `${name}的奇幻之旅`,
    pages: [
      {
        pageNumber: 1,
        text: `${name}收到了一封神秘的来信，邀请她去参加一场特别的冒险。信封上画着可爱的${animalDisplay}，还有闪闪发光的星星。`,
        imagePrompt: `温馨的儿童房间，${name}好奇地拆开信封，专业水彩绘本风格，柔和光线，温暖色调，专业儿童插画，手绘质感`,
      },
      {
        pageNumber: 2,
        text: `${name}穿上了一件${colorName}的漂亮裙子，带上她最喜欢的小背包。"${animalDisplay}，我们一起去冒险吧！"她兴奋地说。`,
        imagePrompt: `${name}穿着${colorName}裙子，背着小背包，专业水彩绘本风格，阳光明媚，专业儿童插画，手绘质感`,
      },
      {
        pageNumber: 3,
        text: `${animalDisplay}从信中跳了出来，眼睛亮晶晶的："欢迎来到${theme.name}世界！我等了你好久啦！"${name}开心地拍了拍手。`,
        imagePrompt: `${animalDisplay}从魔法信封中跳出来，专业水彩绘本风格，梦幻光效，专业儿童插画，手绘质感`,
      },
      {
        pageNumber: 4,
        text: `他们一起踏上了彩虹桥。彩虹桥通向一个神奇的${theme.name}世界，那里有各种奇妙的事情等着他们去发现。`,
        imagePrompt: `彩虹桥通向神奇的${theme.name}世界，专业水彩绘本风格，彩虹色光芒，专业儿童插画，手绘质感`,
      },
      {
        pageNumber: 5,
        text: `${name}和${animalDisplay}在${theme.name}世界里遇到了许多新朋友。他们一起唱歌、跳舞，度过了最快乐的时光。`,
        imagePrompt: `${name}和${animalDisplay}与新朋友们在${theme.name}世界玩耍，专业水彩绘本风格，欢乐氛围，专业儿童插画，手绘质感`,
      },
      {
        pageNumber: 6,
        text: `太阳快要落山了，${animalDisplay}温柔地说："${name}，今天是最棒的冒险！明天我们还会再见面的哦。"`,
        imagePrompt: `夕阳下的${theme.name}世界，${name}和${animalDisplay}道别，专业水彩绘本风格，温馨日落，专业儿童插画，手绘质感`,
      },
      {
        pageNumber: 7,
        text: `${name}轻轻地说："${animalDisplay}，谢谢你带我来到这么美好的地方。我会一直记得今天的！"${animalDisplay}开心地笑了。`,
        imagePrompt: `${name}和${animalDisplay}拥抱道别，专业水彩绘本风格，温情时刻，专业儿童插画，手绘质感`,
      },
      {
        pageNumber: 8,
        text: `${name}回到了温暖的家，躺在床上，脸上带着甜甜的笑容。窗外，月亮和星星眨着眼睛，仿佛在说："晚安，${name}，做个好梦。"`,
        imagePrompt: `${name}在家里温馨的床上安睡，月光洒进窗户，专业水彩绘本风格，宁静温馨，专业儿童插画，手绘质感`,
      },
    ],
  };
}
