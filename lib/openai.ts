// OpenAI 客户端配置
// 使用GPT-4o-mini生成故事文本, DALL-E 3生成插图

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

// 风格配置映射 - 结构化对象
const STYLE_CONFIGS: Record<string, { 
  chinese: string;       // 中文风格名+描述，用于故事prompt
  english: string;       // 英文风格描述，用于DALL-E prompt
  dalleStyle: string;    // DALL-E专用风格指令
}> = {
  watercolor: {
    chinese: "专业水彩绘本风格，柔和的水洗效果，精致的笔触，温柔的色调，灵感来自《彼得兔》比阿特丽克斯·波特",
    english: "professional watercolor painting, soft washes, delicate brushwork, gentle pastel palette, inspired by Beatrix Potter",
    dalleStyle: "professional children's picture book illustration, watercolor painting on textured paper, soft color washes, visible brush strokes and water marks, gentle pastel palette, delicate details, inspired by Beatrix Potter's The Tale of Peter Rabbit, hand-painted quality, no plastic smooth surfaces, fine art quality"
  },
  oil: {
    chinese: "专业油画绘本风格，浓郁的色彩，厚涂肌理质感，温暖饱和色调",
    english: "professional oil painting illustration, rich impasto texture, warm saturated colors, visible brush strokes",
    dalleStyle: "professional children's picture book illustration, oil painting on canvas, rich impasto texture with visible thick paint strokes, warm saturated colors, chiaroscuro lighting, inspired by classic European oil painting picture books, hand-painted quality, no plastic smooth surfaces, fine art quality"
  },
  anime: {
    chinese: "吉卜力工作室风格，温暖光影，精致背景，生动角色，治愈系",
    english: "Studio Ghibli inspired anime style, warm cinematic lighting, detailed backgrounds, expressive characters",
    dalleStyle: "professional children's picture book illustration, Studio Ghibli inspired anime art, warm golden hour lighting, highly detailed nature backgrounds, expressive character faces, cel-shading with hand-painted watercolor feel, inspired by Hayao Miyazaki, no plastic 3D rendering, fine art quality"
  },
  chinese: {
    chinese: "中国传统水墨绘本风格，宣纸质感，淡雅笔墨，含蓄留白，灵感来自《小蝌蚪找妈妈》",
    english: "traditional Chinese ink wash painting on xuan paper, elegant brushwork, subtle ink gradients",
    dalleStyle: "professional children's picture book illustration, traditional Chinese ink wash painting on xuan rice paper, elegant flowing brushwork, subtle ink wash gradients from dense to light, muted earth tones with occasional vermillion red accents, generous use of blank space (liubai), inspired by classic Chinese animated films like Tadpoles Looking for Their Mother, hand-painted quality, fine art quality"
  },
  pastoral: {
    chinese: "温暖田园绘本风格，金色光线，柔和阴影，田园牧歌氛围，灵感来自英式乡村绘本",
    english: "warm pastoral watercolor, golden hour lighting, soft shadows, cozy countryside atmosphere",
    dalleStyle: "professional children's picture book illustration, warm pastoral watercolor, golden hour lighting with long soft shadows, cozy English countryside atmosphere, thatched cottages and flower gardens, inspired by Beatrix Potter and classic English countryside picture books, visible watercolor texture and paper grain, hand-painted quality, fine art quality"
  },
  fantasy: {
    chinese: "梦幻童话绘本风格，如梦似幻的氛围，虹彩色调，魔法光影，灵感来自《极地特快》",
    english: "magical fantasy illustration, dreamy ethereal atmosphere, iridescent colors, enchanted lighting",
    dalleStyle: "professional children's picture book illustration, magical fantasy realism, dreamy ethereal atmosphere with floating light particles, iridescent shimmering colors, enchanted lighting with visible light rays, inspired by Chris Van Allsburg's The Polar Express, hand-painted quality with subtle magical glow effects, no plastic smooth surfaces, fine art quality"
  },
  minimalist: {
    chinese: "现代简约绘本风格，大胆几何造型，有限色彩，干净构图，灵感来自布鲁诺·穆纳里",
    english: "modern minimalist illustration, bold geometric shapes, limited color palette, clean composition",
    dalleStyle: "professional children's picture book illustration, modern minimalist style, bold clean geometric shapes, limited color palette of 3-4 colors, generous white space, flat design with subtle texture, inspired by Bruno Munari, clean and elegant composition, hand-crafted quality, fine art quality"
  },
  nordic: {
    chinese: "北欧绘本风格，姆明一族托芙·扬松风格，简洁线条，柔和冷色调，温馨极简",
    english: "Scandinavian illustration, Tove Jansson Moomin inspired, clean gentle lines, muted cool tones",
    dalleStyle: "professional children's picture book illustration, Scandinavian style, inspired by Tove Jansson's Moomin books, clean gentle ink lines with watercolor wash, muted cool tones with warm accents, cozy minimalist atmosphere, visible hand-drawn line quality, hand-painted quality, fine art quality"
  }
};

// 主题配置映射
const THEME_CONFIGS: Record<string, {
  chinese: string;
  english: string;
  storyAngle: string;  // 给GPT的故事切入角度
}> = {
  adventure: { 
    chinese: "冒险探索", 
    english: "adventure and exploration",
    storyAngle: "不是去征服世界，而是在冒险中发现自己的勇气和力量。每一步未知都藏着成长的礼物。"
  },
  friendship: { 
    chinese: "友谊分享", 
    english: "friendship and sharing",
    storyAngle: "真正的友谊不是完美无缺，而是在彼此的不完美中找到温暖。分享不是因为富余，而是因为在乎。"
  },
  growth: { 
    chinese: "成长接纳", 
    english: "growth and self-acceptance",
    storyAngle: "成长不是变成别人期待的样子，而是接纳自己的不完美，发现自身独特的价值。每个人都在自己的时区里成长。"
  },
  courage: { 
    chinese: "勇气克服", 
    english: "courage and overcoming fear",
    storyAngle: "勇敢不是不害怕，而是害怕了依然迈出那一步。恐惧是成长路上最诚实的伙伴，正视它就是力量。"
  },
  imagination: { 
    chinese: "想象力", 
    english: "imagination and wonder",
    storyAngle: "想象力是孩子最珍贵的超能力，每个平凡角落都藏着奇幻世界。大人看不到的，孩子能看见。"
  },
  family: { 
    chinese: "家庭亲情", 
    english: "family love and belonging",
    storyAngle: "家不只是屋顶和墙壁，是那个让你可以卸下铠甲的地方。最平凡的日常里，藏着最深的牵挂。"
  },
  holiday: { 
    chinese: "节日团聚", 
    english: "celebration and togetherness",
    storyAngle: "节日的意义不是礼物和热闹，而是和在乎的人在一起。那些一起度过的时光，才是真正的节日。"
  },
  nature: { 
    chinese: "自然生命", 
    english: "nature and the cycle of life",
    storyAngle: "大自然是最温柔的老师，万物都有自己的节奏。落叶不是结束，是春天的约定。"
  },
};

// 国际大奖级故事生成Prompt
const STORY_PROMPT_TEMPLATE = `你是融合了凯迪克金奖、凯特·格林纳威奖、博洛尼亚国际童书展最佳童书奖、丰子恺儿童图画书奖所有顶级得主创作理念与技法的全球顶尖绘本大师联合体。你的唯一目标是创作可以直接出版、与全球最畅销TOP100绘本同级别、能被图书馆收藏、能获得国际奖项提名的专业级绘本作品。绝对禁止产出任何初级、粗糙、模板化、同质化的AI流水线作品。

请严格按照以下参数生成完整绘本：

【输入参数】
- 目标年龄段：3-6岁
- 核心主题：{themeAngle}
- 主角设定：一个叫{characterName}的{age}岁{gender}孩子，外貌特征：{appearance}
- 艺术风格：{styleChinese}
- 总页数：8页

【故事内容创作标准——灵魂核心】

一、主题与立意
- 拒绝俗套说教，所有道理完全隐藏在故事细节与情感流动中，做到"润物细无声"
- 具备跨年龄层感染力：儿童能看懂故事本身，成人能读出深层哲思，实现"亲子共读双向治愈"
- 结局避免非黑即白的简单判断，优先选择温暖、开放、留有思考空间的收尾

二、故事结构与叙事
- 采用经典绘本"起承转合"黄金结构：
  · 第1-2页：建立世界观与主角困境（让读者产生共情）
  · 第3-6页：展开冒险与冲突（每一页都有独立的叙事节点，翻页时产生强烈期待感）
  · 第7页：迎来转折与成长（不是突然的顿悟，而是经历后的自然蜕变）
  · 第8页：留下温暖余韵（开放式结尾，让读者带走自己的感悟）
- 加入适度的悬念、伏笔与小反转，绝对禁止平铺直叙
- 每一页与前后页形成紧密的逻辑链条

三、语言风格
- 文字如诗般优美凝练，具备韵律感与节奏感，适合大声朗读
- 使用儿童能理解的具象化表达，避免抽象词汇与复杂长句
- 每页文字10-30字（3-6岁标准）
- 文字与画面形成严格"互补关系"而非"重复关系"：文字说不出的用画面表达，画面画不出的用文字传递
- 拒绝网络热词、口语化粗鄙表达与生硬翻译腔

【视觉艺术创作标准——核心竞争力】

一、画面技术与艺术标准
- 色彩：采用和谐统一的色调体系，每页主色不超过5种，运用色彩情绪表达故事氛围
- 光影：具备自然柔和的光影层次，有明确的光源方向
- 质感：必须模拟真实手绘笔触质感，绝对禁止塑料感、AI感的光滑画面
- 构图：运用黄金分割、三分法等专业技法，合理运用留白，避免元素堆砌
- 细节：画面中加入与故事相关的隐藏细节，增加反复阅读乐趣

二、角色与场景标准
- 主角外貌在所有页面100%统一：五官、发型、服装、身高比例、肤色完全一致
- 表情与动作完全符合当前情节情绪
- 角色与背景自然融合，有明确前后景层次，禁止"贴上去"的割裂感

【绝对禁止的低级错误】
- 禁止AI常见畸形：多手指/少手指、五官错位、肢体扭曲、比例失调
- 禁止故事逻辑混乱、前后矛盾、情节跳脱、结尾仓促
- 禁止风格混搭：同一绘本内风格100%统一
- 禁止文字生硬说教、空洞无物
- 禁止角色形象前后不一致、服装道具穿帮
- 禁止文字与画面完全重复

【输出格式】
请以JSON格式输出：
{
  "title": "中文故事标题（5字以内，有诗意有画面感）",
  "appearanceEnglish": "A {age}-year-old {genderEnglish} Chinese child with {appearance的英文翻译，要具体：发型、脸型、眼睛、肤色、穿着}",
  "pages": [
    {
      "pageNumber": 1,
      "text": "中文文字（10-30字，优美凝练有诗意）",
      "imagePrompt": "English illustration prompt（必须极其详细）"
    }
  ]
}

【imagePrompt格式要求——极其重要，直接决定画面质量】
每页imagePrompt必须严格按以下格式：
"[角色外貌英文描述，必须与appearanceEnglish完全一致], [当前页的动作和表情], [场景描述，包含前景中景背景], [氛围和情绪], [光影描述], [构图技法], {dalleStyle}, professional children's picture book illustration, hand-painted texture, warm natural lighting, fine art quality, no extra fingers, no deformed hands, correct body proportions, consistent character design throughout all pages"

示例（第1页）：
"A 5-year-old boy Chinese child with short black hair, round face with rosy cheeks, big bright curious eyes, fair skin, wearing a blue hoodie and brown shorts, standing at the edge of a misty ancient forest, looking up with wonder and slight nervousness, towering old trees with twisted roots in foreground, soft mist swirling in midground, dappled golden morning light filtering through canopy creating god rays, low angle shot emphasizing the grand scale of trees, {dalleStyle}, professional children's picture book illustration, hand-painted texture, warm natural lighting, fine art quality, no extra fingers, no deformed hands, correct body proportions, consistent character design throughout all pages"

关键规则：
1. 每个imagePrompt开头的角色外貌描述必须与appearanceEnglish字段一字不差
2. imagePrompt必须全英文
3. 每个prompt必须包含具体的构图指导（low angle / bird's eye / close-up / wide shot / over-the-shoulder 等）
4. 每个prompt必须包含具体的情绪表达和光影描述
5. 8页的构图要有多样性：远景→中景→特写→俯视→仰视等交替`;

/**
 * 生成绘本故事
 * @param characterName 角色名字
 * @param age 年龄
 * @param theme 主题
 * @param style 风格
 * @param gender 性别
 * @param appearance 外貌描述
 * @returns 故事JSON
 */
export async function generateStory(
  characterName: string,
  age: number,
  theme: string,
  style: string,
  gender: string,
  appearance: string
): Promise<{
  title: string;
  appearanceEnglish: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
}> {
  // 如果没有配置API Key，返回mock数据
  if (!process.env.OPENAI_API_KEY) {
    return getMockStory(characterName, age, theme, style, gender, appearance);
  }

  const client = getOpenAIClient();
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.adventure;
  
  // 性别英文映射
  const genderEnglish = gender === "男孩" ? "boy" : "girl";
  
  // 生成appearanceEnglish
  const appearanceEnglish = `A ${age}-year-old ${genderEnglish} Chinese child with ${appearance}`;

  // 替换prompt中的占位符
  const prompt = STORY_PROMPT_TEMPLATE
    .replace("{characterName}", characterName)
    .replace("{age}", String(age))
    .replace("{gender}", gender)
    .replace("{genderEnglish}", genderEnglish)
    .replace("{appearance}", appearance)
    .replace("{appearanceEnglish}", appearanceEnglish)
    .replace("{themeAngle}", themeConfig.storyAngle)
    .replace("{styleChinese}", styleConfig.chinese)
    .replace("{dalleStyle}", styleConfig.dalleStyle);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "你是一位获得过凯迪克金奖的国际顶级绘本大师。你的作品应该能直接出版，被图书馆收藏，被国际奖项提名。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.85,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate story");
  }

  const result = JSON.parse(content);
  
  // 确保appearanceEnglish被正确返回
  if (!result.appearanceEnglish) {
    result.appearanceEnglish = appearanceEnglish;
  }
  
  // 替换所有页面prompt中的{dalleStyle}占位符
  if (result.pages) {
    result.pages = result.pages.map((page: any) => ({
      ...page,
      imagePrompt: page.imagePrompt.replace(/\{dalleStyle\}/g, styleConfig.dalleStyle)
    }));
  }

  return result;
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
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;

  // prompt已包含完整风格指令，无需再拼接
  const fullPrompt = imagePrompt;

  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: fullPrompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Failed to generate image");
  }

  return imageUrl;
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

// Mock故事数据（带角色外貌）
function getMockStory(
  characterName: string, 
  age: number, 
  theme: string, 
  style: string,
  gender: string,
  appearance: string
): {
  title: string;
  appearanceEnglish: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
} {
  const genderEnglish = gender === "男孩" ? "boy" : "girl";
  const appearanceEnglish = `A ${age}-year-old ${genderEnglish} Chinese child with ${appearance}`;
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;
  
  const stories: Record<string, any> = {
    adventure: {
      title: `${characterName}的星空探险`,
      pages: [
        { pageNumber: 1, text: `${characterName}住在一个宁静的小村庄，夜晚总是仰望星空发呆。`, imagePrompt: `${appearanceEnglish}, standing in a peaceful countryside village at dusk, gazing up at a starlit sky with wonder, warm evening light, rolling hills in background, cozy cottage with smoke from chimney, wide shot, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 2, text: `一天晚上，一颗流星划过天空，落在村外的森林里。`, imagePrompt: `${appearanceEnglish}, watching a bright meteor streak across the night sky with amazement, fireflies glowing in foreground, dark mysterious forest silhouette in background, dramatic lighting, over-the-shoulder composition, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 3, text: `${characterName}带上灯笼，走进森林寻找那颗神奇的星星。`, imagePrompt: `${appearanceEnglish}, walking through a mystical forest holding a glowing lantern, curious expression, ancient twisted trees with glowing mushrooms, soft lantern light creating warm pool around character, medium shot from behind, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 4, text: `森林里，${characterName}遇到了一只会发光的小狐狸。`, imagePrompt: `${appearanceEnglish}, meeting a small glowing fox in the forest clearing, fox emitting soft golden light, surprised but gentle expression, flowers blooming around clearing, soft moonlight filtering through trees, close-up on both characters, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 5, text: `小狐狸领着${characterName}穿过竹林，越过小溪。`, imagePrompt: `${appearanceEnglish}, following a glowing fox through a bamboo forest, fox running ahead playfully, sparkling stream crossing path, dappled sunlight, dynamic medium shot showing movement, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 6, text: `他们找到了那颗星星——它变成了一个迷路的小精灵。`, imagePrompt: `${appearanceEnglish}, discovering a tiny lost fairy sitting sadly next to the fallen star, fairy with translucent wings glowing softly, emotional scene, scattered star fragments around them, warm golden light emanating from fairy, emotional close-up, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 7, text: `${characterName}轻轻握住小精灵的手："我送你回家吧。"`, imagePrompt: `${appearanceEnglish}, gently holding a tiny glowing fairy's hand, kind and determined expression, fairy looking up with grateful eyes, path of glowing star dust leading upward, gentle warm light surrounding both, tender moment, medium shot, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 8, text: `小精灵飞上天空，化作最亮的那颗星，永远守护着村庄。`, imagePrompt: `${appearanceEnglish}, standing in a meadow looking up at the sky, the brightest star twinkling with loving warmth, peaceful smile, village visible in distance below, vast starry sky with gentle aurora, inspirational wide shot, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
      ],
    },
    friendship: {
      title: `${characterName}和星星兔`,
      pages: [
        { pageNumber: 1, text: `${characterName}在花园里发现了一只受伤的小兔子，轻轻地为它包扎。`, imagePrompt: `${appearanceEnglish}, gently tending to an injured small bunny in a flower garden, caring hands carefully wrapping a bandage, soft morning light, colorful flowers surrounding, gentle expression, close-up on hands and bunny, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 2, text: `小兔子渐渐康复，它们成了最好的朋友。`, imagePrompt: `${appearanceEnglish}, happily playing with a healed bunny in the garden, both laughing joyfully, flowers swaying gently, butterflies fluttering around, warm golden afternoon light, dynamic medium shot showing friendship, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 3, text: `小兔子告诉${characterName}一个秘密——它其实是一只会飞的星星兔！`, imagePrompt: `${appearanceEnglish}, listening intently to a bunny with amazed expression, bunny revealing small shimmering wings, secret whispered moment, magical sparkles appearing, cozy bedroom setting, intimate close-up, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 4, text: `它们一起飞上天空，看最美的星星。`, imagePrompt: `${appearanceEnglish}, flying through a magical starry sky holding onto a winged bunny, exhilarating joy, clouds floating below, shooting stars in distance, vast cosmic background, dynamic bird's eye shot, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 5, text: `星星兔说："谢谢你救了我，我会永远记得你的善良。"`, imagePrompt: `${appearanceEnglish}, hugging a glowing fairy bunny with heartfelt gratitude, bunny's wings creating rainbow light, emotional tender moment, floating on cloud near giant moon, soft ethereal lighting, warm close-up, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 6, text: `${characterName}明白了，真正的友谊是最珍贵的宝藏。`, imagePrompt: `${appearanceEnglish}, sitting thoughtfully on a hilltop watching sunrise, bunny sleeping peacefully beside, realization dawning, golden morning light washing over landscape, peaceful contemplative mood, silhouette against colorful sky, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 7, text: `从此，每次${characterName}仰望星空，都能看到星星兔在对他眨眼睛。`, imagePrompt: `${appearanceEnglish}, lying on soft grass at night gazing at starry sky, bunny nestled beside, stars twinkling as if winking, peaceful happy expression, village lights in far distance, dreamy atmospheric wide shot, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 8, text: `而那颗最亮的星星，永远守护着他们的友谊。`, imagePrompt: `${appearanceEnglish}, standing in garden waving to the brightest star, bunny waving too with tiny paw, star sending down warm beam of light, full circle composition showing journey, heartwarming ending scene, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
      ],
    },
    growth: {
      title: `${characterName}的勇气花园`,
      pages: [
        { pageNumber: 1, text: `${characterName}看到小鸟们自由飞翔，非常羡慕，希望自己也能飞。`, imagePrompt: `${appearanceEnglish}, watching birds soaring freely in sky with longing expression, standing in a sunny meadow, birds forming graceful patterns above, light breeze moving hair, wistful mood, upward camera angle, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 2, text: `${characterName}试着挥动手臂跳起来，却怎么也飞不起来。`, imagePrompt: `${appearanceEnglish}, jumping and flapping arms energetically but staying on ground, comedic but determined expression, small plants bouncing around feet, dust cloud effect, humorous close-up, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 3, text: `爷爷微笑着说："每个人都有属于自己的翅膀。"`, imagePrompt: `${appearanceEnglish}, listening to wise grandfather with thoughtful expression, grandfather gesturing gently to sky, cozy garden setting, warm afternoon light, loving intergenerational moment, medium shot, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 4, text: `${characterName}开始练习跑步、跳跃、攀登，越来勇敢。`, imagePrompt: `${appearanceEnglish}, climbing a tree confidently, reaching for higher branch with determination, autumn forest background, leaves falling gracefully, sense of accomplishment, dynamic upward angle, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 5, text: `一天，${characterName}爬上山顶，看到了一片从未见过的美景。`, imagePrompt: `${appearanceEnglish}, standing triumphantly on mountain peak, breathtaking panoramic view below, wind blowing hair dramatically, arms spread wide in joy, clouds floating around, sense of achievement and freedom, inspirational wide shot, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 6, text: `他明白了，勇敢做自己，就是最美的飞翔。`, imagePrompt: `${appearanceEnglish}, spreading arms like wings on mountain peak, feeling wind embrace body, metaphorical wings of confidence visible as flowing light, golden sunset lighting, transformational moment, dramatic silhouette against sky, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 7, text: `回到村庄，${characterName}把自己画成一只快乐的小鸟。`, imagePrompt: `${appearanceEnglish}, painting a self-portrait as a happy little bird on canvas, proud satisfied expression, art supplies around, painting coming to life with subtle magical glow, creative scene, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
        { pageNumber: 8, text: `从那以后，${characterName}知道自己已经很棒了。`, imagePrompt: `${appearanceEnglish}, happily dancing in meadow with birds circling overhead, carefree joyful expression, flowers blooming all around, warm spring light, confident and content, celebratory wide shot, ${styleConfig.dalleStyle}, professional children's picture book illustration, hand-painted texture, fine art quality` },
      ],
    },
  };

  // 默认返回冒险故事
  const mockStory = stories[theme] || stories.adventure;
  
  // 确保appearanceEnglish被包含
  if (!mockStory.appearanceEnglish) {
    mockStory.appearanceEnglish = appearanceEnglish;
  }
  
  return mockStory;
}
