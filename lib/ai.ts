// AI 客户端配置
// 使用Doubao-Seed-2.0-Pro生成故事文本, 万相2.7生成插图

import OpenAI from 'openai';

// 创建Doubao文本模型客户端（OpenAI兼容格式）
let doubaoClient: OpenAI | null = null;

export function getDoubaoClient(): OpenAI {
  if (!doubaoClient) {
    const apiKey = process.env.VOLCENGINE_API_KEY;
    if (!apiKey) {
      throw new Error('VOLCENGINE_API_KEY is not configured');
    }
    doubaoClient = new OpenAI({
      apiKey,
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    });
  }
  return doubaoClient;
}

// 风格配置映射 - 结构化对象（适配万相中文prompt）
const STYLE_CONFIGS: Record<string, { 
  chinese: string;       // 中文风格名+描述，用于故事prompt和万相图片
  chinesePrompt: string; // 万相中文图片prompt，更符合中文绘本审美
}> = {
  watercolor: {
    chinese: "专业水彩绘本风格，柔和的水洗效果，精致的笔触，温柔的色调，灵感来自《彼得兔》比阿特丽克斯·波特",
    chinesePrompt: "专业儿童绘本插画，水彩画风格，柔和的水洗效果，细腻的笔触，温暖的色调，肌理丰富可见，有纸张纹理，柔和的光影，如同《彼得兔》般温馨雅致，手绘质感，没有塑料光滑感，艺术品质"
  },
  oil: {
    chinese: "专业油画绘本风格，浓郁的色彩，厚涂肌理质感，温暖饱和色调",
    chinesePrompt: "专业儿童绘本插画，油画风格在画布上，厚重的肌理质感，浓郁可见的笔触，温暖饱和的色彩，戏剧性的光影，经典欧式绘本插画风格，手绘质感，没有塑料光滑感，艺术品质"
  },
  anime: {
    chinese: "吉卜力工作室风格，温暖光影，精致背景，生动角色，治愈系",
    chinesePrompt: "专业儿童绘本插画，吉卜力动画风格，温暖的金色时光效果，精致细腻的自然背景，表情丰富的角色，赛璐璐着色但有手绘水彩感，宫崎骏动画风格，没有塑料3D渲染感，艺术品质"
  },
  chinese: {
    chinese: "中国传统水墨绘本风格，宣纸质感，淡雅笔墨，含蓄留白，灵感来自《小蝌蚪找妈妈》",
    chinesePrompt: "专业儿童绘本插画，传统中国水墨画风格，宣纸质感，优雅流畅的笔触，细腻的墨色晕染从浓到淡，含蓄的留白，赭红色点缀，米黄色背景，经典中国动画《小蝌蚪找妈妈》风格，手绘质感，艺术品质"
  },
  pastoral: {
    chinese: "温暖田园绘本风格，金色光线，柔和阴影，田园牧歌氛围，灵感来自英式乡村绘本",
    chinesePrompt: "专业儿童绘本插画，温暖的田园水彩风格，金色的时光效果，柔和的长阴影，温馨的英式乡村氛围，茅草屋顶小屋和花园，可见的水彩纹理和纸张颗粒，比阿特丽克斯·波特风格，手绘质感，艺术品质"
  },
  fantasy: {
    chinese: "梦幻童话绘本风格，如梦似幻的氛围，虹彩色调，魔法光影，灵感来自《极地特快》",
    chinesePrompt: "专业儿童绘本插画，梦幻童话现实主义风格，如梦似幻的氛围，漂浮的光粒子，彩虹般闪烁的色彩，魔法光影与可见光线，《极地特快》克里斯·范·艾尔斯堡风格，手绘质感带微妙魔法光晕，没有塑料光滑感，艺术品质"
  },
  minimalist: {
    chinese: "现代简约绘本风格，大胆几何造型，有限色彩，干净构图，灵感来自布鲁诺·穆纳里",
    chinesePrompt: "专业儿童绘本插画，现代简约风格，大胆干净的几何形状，有限的3-4种色彩调色板，慷慨的留白，平面设计带微妙肌理，布鲁诺·穆纳里风格，干净优雅的构图，手工质感，艺术品质"
  },
  nordic: {
    chinese: "北欧绘本风格，姆明一族托芙·扬松风格，简洁线条，柔和冷色调，温馨极简",
    chinesePrompt: "专业儿童绘本插画，北欧斯堪的纳维亚风格，托芙·扬松《姆明一族》灵感，简洁温柔的墨线带水彩晕染，柔和的冷色调带温暖点缀，温馨的极简氛围，可见的手绘线条质感，手绘质感，艺术品质"
  }
};

// 主题配置映射
const THEME_CONFIGS: Record<string, {
  chinese: string;
  english: string;
  storyAngle: string;  // 给故事模型的故事切入角度
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

// 国际大奖级故事生成Prompt（适配Doubao）
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
重要：你必须且只能输出纯JSON格式，不要输出任何其他文字、解释或markdown标记。请直接输出以下JSON结构：
{
  "title": "中文故事标题（5字以内，有诗意有画面感）",
  "appearanceChinese": "外貌描述（具体：发型、脸型、眼睛、肤色、穿着，用于中文图片prompt）",
  "pages": [
    {
      "pageNumber": 1,
      "text": "中文文字（10-30字，优美凝练有诗意）",
      "imagePrompt": "中文图片prompt（详细描述角色外貌、动作表情、场景、氛围、光影、构图，使用{wanchineseStyle}风格）"
    }
  ]
}

【imagePrompt格式要求——极其重要，直接决定画面质量】
每页imagePrompt必须严格按以下格式：
"[角色外貌中文描述，必须与appearanceChinese字段一致], [当前页的动作和表情], [场景描述，包含前景中景背景], [氛围和情绪], [光影描述], [构图技法], {wanchineseStyle}, 专业儿童绘本插画，手绘质感，温暖自然光，艺术品质，无多余手指，无畸形手，比例正确，所有页面角色一致"

示例（第1页）：
"一个{age}岁的{genderChinese}孩子，有{appearanceHair}，{appearanceFace}，{appearanceEyes}，{appearanceSkin}，穿着{appearanceClothes}，站在朦胧古老森林边缘，仰头望着天空，眼睛里满是好奇和微微的紧张，前景是盘根错节的老树根系，中景是轻轻飘动的薄雾，后景是透过树冠洒下的斑驳金色晨光，低角度拍摄突出树木的宏大，{wanchineseStyle}，专业儿童绘本插画，手绘质感，温暖自然光，艺术品质，无多余手指，无畸形手，比例正确，所有页面角色一致"

关键规则：
1. 每个imagePrompt开头的角色外貌描述必须与appearanceChinese字段对应
2. imagePrompt使用中文，因为万相原生支持中文
3. 每个prompt必须包含具体的构图指导（低角度/鸟瞰/特写/全景/过肩等交替）
4. 每个prompt必须包含具体的情绪表达和光影描述
5. 8页的构图要有多样性：远景→中景→特写→俯视→仰视等交替`;

/**
 * 生成绘本故事（使用Doubao-Seed-2.0-Pro）
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
  appearanceChinese: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
}> {
  // 如果没有配置API Key，返回mock数据
  if (!process.env.VOLCENGINE_API_KEY) {
    return getMockStory(characterName, age, theme, style, gender, appearance);
  }

  const client = getDoubaoClient();
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.adventure;
  
  // 性别中文映射
  const genderChinese = gender === "男孩" ? "男孩" : "女孩";
  
  // 生成appearanceChinese
  const appearanceChinese = `${age}岁的${genderChinese}孩子，${appearance}`;

  // 替换prompt中的占位符
  const prompt = STORY_PROMPT_TEMPLATE
    .replace("{characterName}", characterName)
    .replace("{age}", String(age))
    .replace("{gender}", gender)
    .replace("{genderChinese}", genderChinese)
    .replace("{appearance}", appearance)
    .replace("{appearanceChinese}", appearanceChinese)
    .replace("{themeAngle}", themeConfig.storyAngle)
    .replace("{styleChinese}", styleConfig.chinese)
    .replace("{wanchineseStyle}", styleConfig.chinesePrompt);

  // 获取endpoint ID，默认使用doubao-seed-2.0-pro
  const endpointId = process.env.VOLCENGINE_ENDPOINT_ID || 'doubao-seed-2.0-pro';

  const response = await client.chat.completions.create({
    model: endpointId,
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
    temperature: 0.85,
    max_tokens: 4000,
  }, {
    timeout: 50000, // 50秒超时
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate story from Doubao");
  }

  // 清理可能的markdown代码块包裹
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const result = JSON.parse(jsonStr);
  
  // 确保appearanceChinese被正确返回
  if (!result.appearanceChinese) {
    result.appearanceChinese = appearanceChinese;
  }
  
  // 替换所有页面prompt中的{wanchineseStyle}占位符
  if (result.pages) {
    result.pages = result.pages.map((page: any) => ({
      ...page,
      imagePrompt: page.imagePrompt.replace(/\{wanchineseStyle\}/g, styleConfig.chinesePrompt)
    }));
  }

  return result;
}

/**
 * 生成插图（使用万相2.7-image-pro）
 * @param imagePrompt 中文图片描述
 * @param style 风格
 * @returns 图片URL
 */
export async function generateImage(
  imagePrompt: string,
  style: string
): Promise<string> {
  // 如果没有配置API Key，返回placeholder
  if (!process.env.DASHSCOPE_API_KEY) {
    return getPlaceholderImage(style);
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;

  // 构建万相API请求（wan2.7同步调用需要messages格式）
  const requestBody = {
    model: "wan2.7-image-pro",
    input: {
      messages: [
        {
          role: "user",
          content: [
            { text: imagePrompt }
          ]
        }
      ]
    },
    parameters: {
      size: "1024*1024",
      n: 1
    }
  };

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`万相API错误: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    // wan2.7同步调用成功：output.choices[].message.content[].image
    if (data.output?.choices?.[0]?.message?.content?.[0]?.image) {
      return data.output.choices[0].message.content[0].image;
    }

    // 如果返回finished但没找到图片
    if (data.output?.finished === true) {
      throw new Error(`万相API返回完成但未找到图片URL: ${JSON.stringify(data.output)}`);
    }

    // 如果是PENDING状态，需要轮询异步任务
    if (data.output?.task_status === 'PENDING' || data.output?.task_id) {
      const taskId = data.output.task_id || data.request_id;
      if (taskId) {
        return await pollWanxiangTask(taskId, apiKey);
      }
    }

    // 如果返回其他状态，尝试轮询
    if (data.request_id) {
      return await pollWanxiangTask(data.request_id, apiKey);
    }

    throw new Error(`万相API返回未知状态: ${JSON.stringify(data)}`);
  } catch (error: any) {
    if (error.message.includes('万相')) {
      throw error;
    }
    throw new Error(`生成图片失败: ${error.message}`);
  }
}

/**
 * 轮询万相异步任务状态
 */
async function pollWanxiangTask(taskId: string, apiKey: string, maxRetries: number = 60): Promise<string> {
  const pollUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒轮询间隔

    const response = await fetch(pollUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`轮询万相任务失败: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    if (data.output?.task_status === 'SUCCEEDED') {
      const imageUrl = data.output.results?.[0]?.url;
      if (!imageUrl) {
        throw new Error("万相任务完成但未找到图片URL");
      }
      return imageUrl;
    }

    if (data.output?.task_status === 'FAILED') {
      throw new Error(`万相图片生成失败: ${data.output?.error?.message || '未知错误'}`);
    }

    // 继续轮询
    console.log(`万相任务进行中... (${i + 1}/${maxRetries})`);
  }

  throw new Error('万相图片生成超时');
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

// Mock故事数据（适配新格式）
function getMockStory(
  characterName: string, 
  age: number, 
  theme: string, 
  style: string,
  gender: string,
  appearance: string
): {
  title: string;
  appearanceChinese: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
} {
  const genderChinese = gender === "男孩" ? "男孩" : "女孩";
  const appearanceChinese = `${age}岁的${genderChinese}孩子，${appearance}`;
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;
  
  const stories: Record<string, any> = {
    adventure: {
      title: `${characterName}的星空探险`,
      pages: [
        { pageNumber: 1, text: `${characterName}住在一个宁静的小村庄，夜晚总是仰望星空发呆。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，站在宁静的小村庄，夜晚仰望星空，眼睛里满是好奇和向往，村庄小屋和远处起伏的山丘，温馨宁静的氛围，温暖的晚霞余晖，全景构图，${styleConfig.chinesePrompt}` },
        { pageNumber: 2, text: `一天晚上，一颗流星划过天空，落在村外的森林里。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，惊讶地看着流星划过夜空，前景是萤火虫闪闪发光，远处是黑暗神秘的森林剪影，戏剧性光影，过肩构图，${styleConfig.chinesePrompt}` },
        { pageNumber: 3, text: `${characterName}带上灯笼，走进森林寻找那颗神奇的星星。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，提着发光的灯笼走进神秘森林，表情好奇，古代扭曲的树木和发光蘑菇，柔和的灯笼光芒在周围形成温暖光圈，中景跟随拍摄，${styleConfig.chinesePrompt}` },
        { pageNumber: 4, text: `森林里，${characterName}遇到了一只会发光的小狐狸。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，在森林空地上遇见一只发光的小狐狸，小狐狸发出柔和的金色光芒，惊讶但温柔的表情，空地四周花朵盛开，柔和月光透过树木，特写两只角色，${styleConfig.chinesePrompt}` },
        { pageNumber: 5, text: `小狐狸领着${characterName}穿过竹林，越过小溪。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，跟着发光的狐狸穿过竹林，狐狸在前方欢快地跑着，闪烁的小溪穿过小路，斑驳的阳光，动态中景展示动感，${styleConfig.chinesePrompt}` },
        { pageNumber: 6, text: `他们找到了那颗星星——它变成了一个迷路的小精灵。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，发现一个坐在坠落星星旁伤心的小精灵，精灵有半透明的翅膀微微发光，周围散落着星星碎片，温暖的黄金色光芒从精灵身上散发，情感特写，${styleConfig.chinesePrompt}` },
        { pageNumber: 7, text: `${characterName}轻轻握住小精灵的手："我送你回家吧。"`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，轻轻握着发光小精灵的手，表情充满关爱和决心，精灵抬头眼中满是感激，通往天空的星星尘埃之路，温暖的光芒包围着两者，温馨时刻，中景，${styleConfig.chinesePrompt}` },
        { pageNumber: 8, text: `小精灵飞上天空，化作最亮的那颗星，永远守护着村庄。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，站在草地上仰望天空，那颗最亮的星星闪烁着温暖的爱意，宁静的微笑，远处可见村庄，远大星空带柔和极光，励志全景，${styleConfig.chinesePrompt}` },
      ],
    },
    friendship: {
      title: `${characterName}和星星兔`,
      pages: [
        { pageNumber: 1, text: `${characterName}在花园里发现了一只受伤的小兔子，轻轻地为它包扎。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，在花园里温柔地照顾一只受伤的小兔子，双手小心地包扎绷带，柔和的晨光，色彩缤纷的花朵环绕，温柔的表情，手和小兔子的特写，${styleConfig.chinesePrompt}` },
        { pageNumber: 2, text: `小兔子渐渐康复，它们成了最好的朋友。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，和康复的小兔子在花园里开心地玩耍，两者都欢快地笑着，花朵轻轻摇曳，蝴蝶飞舞，温暖的金色午后阳光，动态中景展示友谊，${styleConfig.chinesePrompt}` },
        { pageNumber: 3, text: `小兔子告诉${characterName}一个秘密——它其实是一只会飞的星星兔！`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，专注地听兔子说话，表情惊讶，兔子展示了小小的闪烁翅膀，秘密私语的时刻，魔法火花出现，温馨的卧室场景，亲密特写，${styleConfig.chinesePrompt}` },
        { pageNumber: 4, text: `它们一起飞上天空，看最美的星星。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，抱着一只长翅膀的兔子在神奇的星空飞翔，极度喜悦，云朵飘浮在下方，远处有流星，浩瀚宇宙背景，鸟瞰动态镜头，${styleConfig.chinesePrompt}` },
        { pageNumber: 5, text: `星星兔说："谢谢你救了我，我会永远记得你的善良。"`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，拥抱发光的小兔子，充满真挚的感激，兔子的翅膀创造彩虹光芒，情感温馨时刻，漂浮在云端靠近巨大的月亮，柔和空灵光影，温暖特写，${styleConfig.chinesePrompt}` },
        { pageNumber: 6, text: `${characterName}明白了，真正的友谊是最珍贵的宝藏。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，若有所思地坐在山顶看日出，兔子在身旁安静睡着，渐渐领悟，晨光洒满大地，宁静沉思的情绪，剪影映在多彩天空，${styleConfig.chinesePrompt}` },
        { pageNumber: 7, text: `从此，每次${characterName}仰望星空，都能看到星星兔在对他眨眼睛。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，夜晚躺在柔软的草地上仰望星空，兔子依偎在身旁，星星眨眼仿佛在问候，宁静幸福的表情，远处有村庄灯火，梦幻氛围全景，${styleConfig.chinesePrompt}` },
        { pageNumber: 8, text: `而那颗最亮的星星，永远守护着他们的友谊。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，站在花园里向最亮的星星挥手，兔子也用小爪子挥手，星星向下投射温暖的光束，完整圆形构图展示旅程，温情结尾场景，${styleConfig.chinesePrompt}` },
      ],
    },
    growth: {
      title: `${characterName}的勇气花园`,
      pages: [
        { pageNumber: 1, text: `${characterName}看到小鸟们自由飞翔，非常羡慕，希望自己也能飞。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，羡慕地看着鸟儿自由翱翔，站在阳光明媚的草地，仰望天空，小鸟在头顶形成优雅的队形，微风吹动头发，渴望的神情，仰视角度，${styleConfig.chinesePrompt}` },
        { pageNumber: 2, text: `${characterName}试着挥动手臂跳起来，却怎么也飞不起来。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，用力跳起来挥动手臂但仍然站在地面，喜剧但坚定的表情，周围小植物弹跳，尘土飞扬效果，幽默特写，${styleConfig.chinesePrompt}` },
        { pageNumber: 3, text: `爷爷微笑着说："每个人都有属于自己的翅膀。"`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，认真听智慧爷爷说话，爷爷温和地指向天空，温馨的花园场景，温暖的午后阳光，爱的代际时刻，中景，${styleConfig.chinesePrompt}` },
        { pageNumber: 4, text: `${characterName}开始练习跑步、跳跃、攀登，越来越勇敢。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，自信地爬树，伸手够向更高的树枝，决心满满，秋天森林背景，树叶优雅飘落，成就感，动态仰角，${styleConfig.chinesePrompt}` },
        { pageNumber: 5, text: `一天，${characterName}爬上山顶，看到了一片从未见过的美景。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，胜利地站在山顶，脚下是壮丽的全景，风吹动头发戏剧性扬起，双臂张开，满是欢乐，无限风光尽收眼底，云朵环绕，成功感和自由感，励志全景，${styleConfig.chinesePrompt}` },
        { pageNumber: 6, text: `他明白了，勇敢做自己，就是最美的飞翔。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，在山顶展开双臂如翅膀，感受风拥抱身体，象征自信的翅膀以流动光芒呈现，黄金日落光影，蜕变的时刻，戏剧剪影映天空，${styleConfig.chinesePrompt}` },
        { pageNumber: 7, text: `回到村庄，${characterName}把自己画成一只快乐的小鸟。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，在画布上画自己作为快乐小鸟的自画像，自豪满足的表情，画材散落周围，画作带有微妙魔法光芒渐渐鲜活，创意场景，${styleConfig.chinesePrompt}` },
        { pageNumber: 8, text: `从那以后，${characterName}知道自己已经很棒了。`, imagePrompt: `一个${age}岁的${genderChinese}孩子，有${appearance}，开心地在草地舞蹈，鸟儿在头顶盘旋，自由喜悦的表情，花儿在周围盛开，温暖的春日阳光，自信满足，庆祝全景，${styleConfig.chinesePrompt}` },
      ],
    },
  };

  // 默认返回冒险故事
  const mockStory = stories[theme] || stories.adventure;
  
  // 确保appearanceChinese被包含
  if (!mockStory.appearanceChinese) {
    mockStory.appearanceChinese = appearanceChinese;
  }
  
  return mockStory;
}

// 保持向后兼容的导出
export { STYLE_CONFIGS, THEME_CONFIGS, STORY_PROMPT_TEMPLATE };
