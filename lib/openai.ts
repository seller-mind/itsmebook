// OpenAI 客户端配置
// 使用GPT-4o-mini生成故事文本

import OpenAI from 'openai';

// 创建OpenAI客户端实例（延迟初始化，避免在未配置时出错）
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// 故事生成提示词模板
const STORY_PROMPT_TEMPLATE = `你是一位专业的儿童绘本作家。请为孩子创作一个温馨有趣的绘本故事。

角色信息：
- 主角名字：{characterName}
- 主角年龄：{age}岁
- 故事风格：{style}
- 故事主题：{theme}

要求：
1. 故事要有正能量，适合3-8岁儿童
2. 8-12页，每页包含简短的文字描述和插图描述
3. 文字要简洁有趣，适合大声朗读
4. 插图描述要具体，包括场景、角色表情、动作等
5. 故事要有起承转合，有趣味性

请以JSON格式输出，格式如下：
{
  "title": "故事标题",
  "pages": [
    {
      "pageNumber": 1,
      "text": "这一页的文字内容",
      "imagePrompt": "详细的插图描述，包括角色、场景、氛围等"
    }
  ]
}`;

// 主题关键词映射
const THEME_KEYWORDS: Record<string, string[]> = {
  adventure: ["冒险", "探索", "勇敢", "发现"],
  friendship: ["友谊", "朋友", "分享", "互助"],
  growth: ["成长", "学习", "进步", "自信"],
  courage: ["勇气", "克服", "挑战", "坚强"],
  imagination: ["想象", "梦想", "魔法", "奇幻"],
  family: ["家庭", "亲情", "关爱", "温馨"],
  holiday: ["节日", "庆祝", "快乐", "团聚"],
  nature: ["自然", "动物", "环保", "探索"],
};

// 风格描述映射
const STYLE_DESCRIPTIONS: Record<string, string> = {
  watercolor: "水彩风格，柔和的色彩，轻盈的笔触",
  oil: "油画风格，浓郁的色彩，厚重的质感",
  anime: "日系动漫风格，明亮的色彩，可爱的角色",
  chinese: "国风水墨风格，淡雅的色彩，古典的韵味",
  pastoral: "温暖田园风格，柔和的色彩，温馨的氛围",
  fantasy: "梦幻童话风格，绚丽的色彩，魔法般的场景",
  minimalist: "简约现代风格，干净的线条，大胆的配色",
  nordic: "北欧极简风格，清新的色彩，简洁的构图",
};

/**
 * 生成绘本故事
 * @param characterName 角色名字
 * @param age 年龄
 * @param theme 主题
 * @param style 风格
 * @returns 故事JSON
 */
export async function generateStory(
  characterName: string,
  age: number,
  theme: string,
  style: string
): Promise<{
  title: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
}> {
  // 如果没有配置API Key，返回mock数据
  if (!process.env.OPENAI_API_KEY) {
    return getMockStory(characterName, theme);
  }

  const client = getOpenAIClient();
  const styleDesc = STYLE_DESCRIPTIONS[style] || style;
  const themeKeywords = THEME_KEYWORDS[theme]?.join("、") || theme;

  const prompt = STORY_PROMPT_TEMPLATE
    .replace("{characterName}", characterName)
    .replace("{age}", String(age))
    .replace("{style}", styleDesc)
    .replace("{theme}", `${theme} (${themeKeywords})`);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "你是一位专业的儿童绘本作家，擅长创作温馨有趣的儿童故事。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate story");
  }

  return JSON.parse(content);
}

/**
 * 生成插图
 * @param imagePrompt 插图描述
 * @param style 风格
 * @returns 图片URL
 */
export async function generateImage(
  imagePrompt: string,
  style: string
): Promise<string> {
  // 如果没有配置API Key，返回placeholder
  if (!process.env.OPENAI_API_KEY) {
    return getPlaceholderImage(style);
  }

  const client = getOpenAIClient();
  const styleSuffix = getStyleSuffix(style);

  const fullPrompt = `${imagePrompt}, children's picture book illustration, ${styleSuffix}`;

  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: fullPrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Failed to generate image");
  }

  return imageUrl;
}

// 获取风格后缀
function getStyleSuffix(style: string): string {
  const suffixes: Record<string, string> = {
    watercolor: "watercolor painting style, soft colors, delicate brushwork",
    oil: "oil painting style, rich colors, textured strokes",
    anime: "Japanese anime style, vibrant colors, cute characters",
    chinese: "Chinese ink painting style, elegant, traditional",
    pastoral: "warm pastoral style, cozy atmosphere, soft lighting",
    fantasy: "magical fantasy style, dreamy colors, enchanting scene",
    minimalist: "modern minimalist style, clean lines, bold colors",
    nordic: "Scandinavian minimalist style, clean, fresh colors",
  };
  return suffixes[style] || "children's book illustration style";
}

// 获取placeholder图片
export function getPlaceholderImage(style: string): string {
  const placeholderMap: Record<string, string> = {
    watercolor: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    oil: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    anime: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
    chinese: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800",
    pastoral: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    fantasy: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
    minimalist: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800",
    nordic: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
  };
  return placeholderMap[style] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800";
}

// Mock故事数据
function getMockStory(characterName: string, theme: string): {
  title: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
} {
  const stories: Record<string, any> = {
    adventure: {
      title: `${characterName}的大冒险`,
      pages: [
        { pageNumber: 1, text: `${characterName}住在一个美丽的小村庄里。一天，他在后院发现了一张神秘的地图。`, imagePrompt: "A child discovering a mysterious map in a beautiful garden, sunny day, watercolor style" },
        { pageNumber: 2, text: `"这张地图会指引我去哪里呢？"${characterName}好奇地问。`, imagePrompt: "A curious child holding a treasure map, looking at it thoughtfully, anime style" },
        { pageNumber: 3, text: `${characterName}跟着地图，穿过了密密的竹林。`, imagePrompt: "A child walking through a bamboo forest, mysterious atmosphere, Chinese ink painting style" },
        { pageNumber: 4, text: `他来到了一座大山前，山脚下有一个闪闪发光的洞口。`, imagePrompt: "A child standing before a mountain with a glowing cave entrance, fantasy style" },
        { pageNumber: 5, text: `洞里住着一只可爱的小精灵，小精灵说："欢迎来到魔法世界！"`, imagePrompt: "A cute fairy greeting a child in a magical cave, colorful and enchanting, oil painting style" },
        { pageNumber: 6, text: `小精灵送给${characterName}一颗神奇的星星种子。`, imagePrompt: "A fairy giving a glowing star seed to a child, magical moment, pastoral warm style" },
        { pageNumber: 7, text: `${characterName}把种子种在了山顶上，种子马上发芽开花了。`, imagePrompt: "A seed blooming into a flower on a mountain top, beautiful transformation, minimalist style" },
        { pageNumber: 8, text: `整个村庄都被美丽的星光照亮了，大家都出来庆祝。`, imagePrompt: "A whole village celebrating under starry lights, joyful atmosphere, Nordic style" },
      ],
    },
    friendship: {
      title: `${characterName}和星星兔`,
      pages: [
        { pageNumber: 1, text: `${characterName}在森林里散步时，发现了一只受伤的小兔子。`, imagePrompt: "A child finding an injured bunny in the forest, gentle scene, watercolor style" },
        { pageNumber: 2, text: `"小兔子，你怎么了？"${characterName}温柔地问。`, imagePrompt: "A child comforting a small bunny, caring expression, anime style" },
        { pageNumber: 3, text: `${characterName}小心地为小兔子包扎伤口，每天都来看望它。`, imagePrompt: "A child bandaging a bunny's wound carefully, nurturing moment, Chinese style" },
        { pageNumber: 4, text: `小兔子的伤慢慢好了，它们成为了最好的朋友。`, imagePrompt: "A healed bunny and child playing together, happy friendship, fantasy style" },
        { pageNumber: 5, text: `小兔子告诉${characterName}，它其实是一只会飞的星星兔！`, imagePrompt: "A magical bunny with wings glowing like stars, magical reveal, oil painting style" },
        { pageNumber: 6, text: `它们一起飞上天空，看最美的星星。`, imagePrompt: "A child and fairy bunny flying through a starry sky, dreamy journey, pastoral style" },
        { pageNumber: 7, text: `"谢谢你救了我，"星星兔说，"我会永远记得你的善良。"`, imagePrompt: "A magical bunny thanking a child with heartfelt gratitude, emotional scene, minimalist style" },
        { pageNumber: 8, text: `${characterName}明白了，真心的友谊是最珍贵的宝藏。`, imagePrompt: "A child understanding the value of friendship, peaceful realization, Nordic style" },
      ],
    },
    growth: {
      title: `${characterName}学飞翔`,
      pages: [
        { pageNumber: 1, text: `${characterName}看到小鸟们在天空自由飞翔，非常羡慕。`, imagePrompt: "A child watching birds flying freely in the sky, dreamy expression, watercolor style" },
        { pageNumber: 2, text: `"我也想飞！"${characterName}跳起来，可是怎么也飞不起来。`, imagePrompt: "A child trying to jump and fly but failing comically, anime style" },
        { pageNumber: 3, text: `爷爷笑着说："每个生命都有自己的成长方式。"`, imagePrompt: "A wise grandfather teaching a child with love, warm family scene, Chinese style" },
        { pageNumber: 4, text: `${characterName}开始练习跑步、跳远、做运动。`, imagePrompt: "A child exercising and practicing sports energetically, active scene, oil style" },
        { pageNumber: 5, text: `慢慢地，${characterName}跑得越来越快，跳得越来越高。`, imagePrompt: "A child jumping higher and running faster, showing progress, fantasy style" },
        { pageNumber: 6, text: `一天，${characterName}发现自己虽然没有翅膀，但一样很棒！`, imagePrompt: "A confident child realizing their own strengths, self-discovery moment, pastoral style" },
        { pageNumber: 7, text: `他明白了，勇敢做自己就是最美的飞翔。`, imagePrompt: "A child embracing who they are, inner growth, minimalist style" },
        { pageNumber: 8, text: `${characterName}开心地笑了，他长大了。`, imagePrompt: "A happy child growing up with confidence, joyful ending, Nordic style" },
      ],
    },
  };

  // 默认返回冒险故事
  return stories[theme] || stories.adventure;
}
