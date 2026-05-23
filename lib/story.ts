/**
 * AI专属儿童绘本 - 是我呀V2
 * 故事主题配置和个性化生成逻辑
 */

// ==================== 故事主题配置 ====================
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
  {
    id: "ocean",
    name: "海洋世界",
    emoji: "🐬",
    description: "海底小动物们的有趣故事",
    color: "from-cyan-100 to-teal-200",
  },
  {
    id: "dinosaur",
    name: "恐龙时代",
    emoji: "🦕",
    description: "和恐龙做朋友的奇妙旅程",
    color: "from-green-100 to-emerald-200",
  },
  {
    id: "friendship",
    name: "友谊故事",
    emoji: "🤝",
    description: "小伙伴之间的温暖故事",
    color: "from-yellow-100 to-amber-200",
  },
  {
    id: "bravery",
    name: "勇敢成长",
    emoji: "💪",
    description: "鼓励孩子勇敢的小故事",
    color: "from-red-100 to-orange-200",
  },
  {
    id: "seasons",
    name: "四季变化",
    emoji: "🍂",
    description: "感受春夏秋冬的美丽",
    color: "from-lime-100 to-green-200",
  },
  {
    id: "fairytale",
    name: "梦幻童话",
    emoji: "🏰",
    description: "充满想象力的睡前故事",
    color: "from-fuchsia-100 to-pink-200",
  },
];

// ==================== 个性化参数映射 ====================

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

// ==================== 故事生成Prompt模板 ====================

export const STORY_GENERATION_PROMPT = `你是顶级儿童绘本作家。请根据以下信息创作一个专属儿童绘本故事，只输出JSON，不要输出其他任何内容。

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

/**
 * 生成故事
 * @param params 生成参数
 * @returns 故事数据
 */
export async function generateStory(params: {
  childName: string;
  themeId: string;
  styleId?: string;
  ageGroup?: string;
  favoriteAnimal?: string;
  favoriteColor?: string;
  personality?: string[];
  location?: string;
  lifeEvent?: string;
}): Promise<{
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

  const theme = STORY_THEMES.find((t) => t.id === params.themeId) || STORY_THEMES[0];

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

  const wanStyle = wanStyleMap[params.styleId || "watercolor"] || wanStyleMap.watercolor;

  // 解析个性化参数，使用映射表转换为中文
  const ageGroup = params.ageGroup || "4-6";
  const ageInstruction = AGE_INSTRUCTIONS[ageGroup] || AGE_INSTRUCTIONS["4-6"];

  // 处理动物参数（支持中文或英文）
  let favoriteAnimal = params.favoriteAnimal || "";
  if (favoriteAnimal && !ANIMAL_NAMES[favoriteAnimal] && !Object.values(ANIMAL_NAMES).includes(favoriteAnimal)) {
    // 如果不是已知的英文key，也不是中文，尝试匹配
    const foundKey = Object.entries(ANIMAL_NAMES).find(([, v]) => v === favoriteAnimal)?.[0];
    if (foundKey) favoriteAnimal = ANIMAL_NAMES[foundKey];
  } else if (ANIMAL_NAMES[favoriteAnimal]) {
    favoriteAnimal = ANIMAL_NAMES[favoriteAnimal];
  }
  // 如果是中文或空，保持原样

  // 处理颜色参数
  let favoriteColor = params.favoriteColor || "";
  if (favoriteColor && COLOR_NAMES[favoriteColor]) {
    favoriteColor = COLOR_NAMES[favoriteColor];
  }

  // 处理性格参数
  const personalityArr = params.personality || [];
  const personalityList = personalityArr
    .map((p) => PERSONALITY_NAMES[p] || p)
    .filter(Boolean);
  const personality = personalityList.length > 0 ? personalityList.join("、") : "可爱";

  // 处理地点参数
  let location = params.location || "";
  if (location && LOCATION_NAMES[location]) {
    location = LOCATION_NAMES[location];
  }

  // 处理生活经历参数
  let lifeEvent = params.lifeEvent || "";
  if (lifeEvent && LIFE_EVENT_NAMES[lifeEvent]) {
    lifeEvent = LIFE_EVENT_NAMES[lifeEvent];
  }

  const prompt = STORY_GENERATION_PROMPT
    .replace("{childName}", params.childName || "小宝贝")
    .replace("{ageGroup}", ageGroup)
    .replace("{favoriteAnimal}", favoriteAnimal || "可爱的小动物")
    .replace("{favoriteColor}", favoriteColor || "温暖的色彩")
    .replace("{personality}", personality)
    .replace("{themeName}", theme.name)
    .replace("{location}", location || "一个奇妙的地方")
    .replace("{lifeEvent}", lifeEvent || "")
    .replace("{ageInstruction}", ageInstruction)
    .replace("{wanStyle}", wanStyle);

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
    if (!storyData.title) storyData.title = `${params.childName || "小宝贝"}的专属故事`;
    if (!storyData.pages || storyData.pages.length === 0) {
      throw new Error("故事页数为空");
    }

    return storyData;
  } catch (parseError) {
    console.error("JSON解析失败:", parseError, "原始内容:", content);
    throw new Error("故事格式解析失败");
  }
}
