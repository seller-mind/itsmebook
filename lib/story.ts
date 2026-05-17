/**
 * 睡前故事生成 - 睡前魔法书
 * 故事主题配置和生成逻辑
 */

// 故事主题（睡前魔法书专用）
export const STORY_THEMES = [
  {
    id: "animal",
    name: "小动物",
    emoji: "🐰",
    description: "小动物们的温馨故事",
    color: "from-pink-100 to-rose-200",
  },
  {
    id: "family",
    name: "温馨家庭",
    emoji: "🏠",
    description: "家人之间的爱与陪伴",
    color: "from-amber-100 to-orange-200",
  },
  {
    id: "fantasy",
    name: "奇幻冒险",
    emoji: "🦋",
    description: "充满想象的奇妙旅程",
    color: "from-purple-100 to-violet-200",
  },
  {
    id: "princess",
    name: "公主王子",
    emoji: "👸",
    description: "优雅温馨的宫廷故事",
    color: "from-rose-100 to-pink-200",
  },
  {
    id: "bedtime",
    name: "睡前催眠",
    emoji: "🌙",
    description: "帮助入睡的温柔故事",
    color: "from-indigo-100 to-blue-200",
  },
  {
    id: "space",
    name: "太空探险",
    emoji: "⭐",
    description: "探索宇宙的奇妙冒险",
    color: "from-slate-100 to-zinc-200",
  },
];

// 故事生成Prompt模板
export const STORY_GENERATION_PROMPT = `你是顶级儿童绘本作家，专门创作睡前哄睡故事。请根据以下信息创作一个温馨的睡前故事，只输出JSON，不要输出其他任何内容。

要求：
- 故事适合3-8岁儿童，是睡前哄睡场景
- 温馨、柔和、慢节奏，帮助孩子平静入睡
- 主角名字：{childName}
- 故事主题：{themeName}
- 8-10页，每页30-80字，优美凝练，适合朗读
- 纯中文输出，不包含任何英文单词或短语
- 结尾要温馨平静，孩子听着听着就能入睡
- 严禁使用"然而"、"但是"、"突然"等转折或激烈词汇
- 严禁模仿任何已有IP角色（如迪士尼、漫威、小猪佩奇等）

主题说明：{themeDescription}

输出JSON格式：
{
  "title": "故事标题（5字以内）",
  "pages": [
    {
      "pageNumber": 1,
      "text": "页面文字（30-80字，中文，不含英文）",
      "imagePrompt": "中文绘本插画提示词，{wansStyle}，温馨柔和的色调，睡前氛围，暖色光线，专业儿童绘本插画，手绘质感，艺术品质，无多余手指，比例正确"
    }
  ]
}`;

/**
 * 生成故事
 * @param childName 孩子名字
 * @param themeId 主题ID
 * @returns 故事数据
 */
export async function generateStory(
  childName: string,
  themeId: string,
  styleId: string = "watercolor"
): Promise<{
  title: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
}> {
  const apiKey = process.env.DOUBAO_API_KEY || process.env.VOLCENGINE_API_KEY;
  const endpoint = process.env.DOUBAO_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  const modelId = process.env.DOUBAO_MODEL_ID || "doubao-pro-32k";

  const theme = STORY_THEMES.find((t) => t.id === themeId) || STORY_THEMES[0];

  // 万相风格映射
  const wanStyleMap: Record<string, string> = {
    watercolor: "专业水彩绘本风格，柔和的水洗效果，细腻的笔触，温暖的色调",
    oil: "专业油画绘本风格，浓郁的色彩，厚涂肌理质感，温暖饱和色调",
    anime: "经典日式动画绘本风格，温暖光影，精致背景，生动角色",
    chinese: "中国传统水墨绘本风格，宣纸质感，淡雅笔墨，含蓄留白",
    pastoral: "温暖田园绘本风格，金色光线，柔和阴影，田园牧歌氛围",
    fantasy: "梦幻童话绘本风格，如梦似幻的氛围，虹彩色调，魔法光影",
    minimalist: "现代简约绘本风格，大胆几何造型，有限色彩，干净构图",
    nordic: "北欧经典绘本风格，简洁线条，柔和冷色调，温馨极简",
  };

  const wanStyle = wanStyleMap[styleId] || wanStyleMap.watercolor;

  const prompt = STORY_GENERATION_PROMPT
    .replace("{childName}", childName || "小宝贝")
    .replace("{themeName}", theme.name)
    .replace("{themeDescription}", theme.description)
    .replace("{wansStyle}", wanStyle);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
        temperature: 0.8,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });
  } catch (apiError: any) {
    clearTimeout(timeoutId);
    if (apiError.name === "AbortError") throw new Error("故事生成超时");
    throw new Error(`故事生成失败: ${apiError.message}`);
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`故事生成API错误: ${response.status} - ${errText.substring(0, 100)}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("故事生成返回为空");
  }

  // 解析JSON
  try {
    // 清理markdown代码块
    const jsonStr = content
      .replace(/^```json\s*/g, "")
      .replace(/^```\s*/g, "")
      .replace(/\s*```$/g, "")
      .trim();

    const storyData = JSON.parse(jsonStr);

    // 验证并补充数据
    if (!storyData.title) storyData.title = `${childName || "小宝贝"}的睡前故事`;
    if (!storyData.pages || storyData.pages.length === 0) {
      throw new Error("故事页数为空");
    }

    return storyData;
  } catch (parseError) {
    console.error("JSON解析失败:", parseError, "原始内容:", content);
    throw new Error("故事格式解析失败");
  }
}
