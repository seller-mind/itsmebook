/**
 * 睡前故事生成API - 睡前魔法书
 * POST /api/story/generate
 * 生成故事文本和配图（使用流式响应避免Vercel 10秒超时）
 */

import { NextRequest, NextResponse } from "next/server";
import { STORY_THEMES, STORY_GENERATION_PROMPT } from "@/lib/story";

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

// 流式调用Doubao API并返回流式响应
async function streamDoubaoStory(
  prompt: string,
  apiKey: string,
  endpoint: string,
  modelId: string
): Promise<ReadableStream> {
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
    throw new Error(`故事生成API错误: ${response.status}`);
  }

  // 返回原始流，让前端处理
  return response.body!;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childName, themeId, styleId = "watercolor" } = body;

    if (!childName || !themeId) {
      return NextResponse.json(
        { success: false, message: "缺少必要参数" },
        { status: 400 }
      );
    }

    const theme = STORY_THEMES.find((t) => t.id === themeId) || STORY_THEMES[0];
    const wanStyle = WAN_STYLE_MAP[styleId] || WAN_STYLE_MAP.watercolor;

    const prompt = STORY_GENERATION_PROMPT
      .replace("{childName}", childName)
      .replace("{themeName}", theme.name)
      .replace("{themeDescription}", theme.description)
      .replace("{wansStyle}", wanStyle);

    // 调用Doubao故事生成
    const apiKey =
      process.env.DOUBAO_API_KEY || process.env.VOLCENGINE_API_KEY;
    const endpoint =
      process.env.DOUBAO_ENDPOINT ||
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    const modelId = process.env.DOUBAO_MODEL_ID || "ep-20260515144642-96m6k";

    if (!apiKey) {
      // 没有API key时，返回演示数据
      return NextResponse.json({
        success: true,
        isDemo: true,
        story: getDemoStory(childName, theme),
      });
    }

    // 使用流式响应，避免Vercel 10秒超时
    const stream = await streamDoubaoStory(prompt, apiKey, endpoint, modelId);

    // 将Doubao的SSE流转换为Next.js的流式响应
    const encoder = new TextEncoder();
    
    const readable = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        let fullContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
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
                      encoder.encode(`data: ${JSON.stringify({ success: false, message: "故事格式解析失败" })}\n\n`)
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
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ success: false, message: "流式读取失败" })}\n\n`)
          );
          controller.close();
        } finally {
          reader.releaseLock();
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
function getDemoStory(childName: string, theme: (typeof STORY_THEMES)[0]) {
  const name = childName || "小宝贝";
  return {
    title: `${name}的睡前故事`,
    pages: [
      {
        pageNumber: 1,
        text: `夜幕降临，月亮慢慢爬上了天空。${name}躺在床上，闭上眼睛，听妈妈讲今晚的故事。`,
        imagePrompt:
          "温馨儿童卧室，月光透过窗帘，小女孩躺在床上闭眼微笑，万相水彩绘本风格，柔和光线，温暖色调，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 2,
        text: `从前，在一片美丽的大森林里，住着一只小${theme.name === "小动物" ? "兔子" : "熊"}。它的毛色${theme.name === "小动物" ? "雪白雪白的" : "金黄金黄的"}，眼睛亮晶晶的。`,
        imagePrompt:
          "美丽的大森林，金色阳光透过树叶，小动物在草丛中，万相水彩绘本风格，温暖柔和光线，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 3,
        text: `小${theme.name === "小动物" ? "兔子" : "熊"}最喜欢的事情，就是在月亮升起的时候，去森林里找星星玩。`,
        imagePrompt:
          "夜晚森林小路，月亮高挂，星星闪烁，小动物抬头望天空，万相水彩绘本风格，梦幻柔和光线，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 4,
        text: `"星星星星，你们今晚要去哪里玩呀？"小${theme.name === "小动物" ? "兔子" : "熊"}轻轻地问。`,
        imagePrompt:
          "小动物和小星星对话场景，夜空下森林草地上，万相水彩绘本风格，温馨浪漫氛围，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 5,
        text: `星星们眨眨眼睛说："今晚我们一起去${name}的梦里玩，那里有好多好玩的！"`,

        imagePrompt:
          "星星飞向远方，夜空中流星划过，万相水彩绘本风格，梦幻童趣，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 6,
        text: `小${theme.name === "小动物" ? "兔子" : "熊"}听了，好羡慕呀。它也想和${name}一起玩。`,
        imagePrompt:
          "小动物望向远方，眼中充满期待，夜空背景，万相水彩绘本风格，温馨期待氛围，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 7,
        text: `就在这时，一阵温柔的风吹过，轻轻地对小${theme.name === "小动物" ? "兔子" : "熊"}说："${name}已经做好梦的准备了，你快去吧。"`,
        imagePrompt:
          "微风吹过的森林，小动物被风托起，夜空星光，万相水彩绘本风格，温柔梦幻，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 8,
        text: `小${theme.name === "小动物" ? "兔子" : "熊"}轻轻地走进了${name}的梦里，它们一起在云朵上跳舞，在星星间捉迷藏。`,
        imagePrompt:
          "云朵上的梦境，小女孩和小动物一起跳舞，星星闪烁，万相水彩绘本风格，梦幻快乐，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 9,
        text: `${name}睡得好香好香，嘴角露出了甜甜的笑容。小${theme.name === "小动物" ? "兔子" : "熊"}轻轻地趴在${name}的枕头边，也闭上了眼睛。`,
        imagePrompt:
          "小女孩安睡，小动物陪伴在旁，月光温柔洒落，万相水彩绘本风格，宁静温馨，专业儿童插画，手绘质感",
      },
      {
        pageNumber: 10,
        text: `月亮轻轻地说："晚安${name}，晚安小${theme.name === "小动物" ? "兔子" : "熊"}。做个好梦，明天见。"`,
        imagePrompt:
          "月亮微笑，星星眨眼，温馨卧室，小女孩和小动物安睡，万相水彩绘本风格，宁静美好结尾，专业儿童插画，手绘质感",
      },
    ],
  };
}
