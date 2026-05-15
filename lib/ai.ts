// AI 客户端配置
// 使用Doubao-Seed-2.0-Lite生成故事文本（关闭深度思考模式），万相2.7生成插图

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
const STORY_PROMPT_TEMPLATE = `你是顶级儿童绘本作家。请根据以下参数创作绘本，只输出JSON，不要输出其他任何内容。

参数：主题-{themeAngle}，主角-{characterName}（{age}岁{gender}，{appearance}），风格-{styleChinese}，8页。

要求：1)不说教，道理藏在故事里 2)1-2页建立困境，3-6页冒险冲突，7页转折，8页温暖收尾 3)每页10-30字，优美凝练适合朗读 4)主角外貌所有页面一致 5)构图多样：远景/中景/特写/俯视/仰视交替。

输出JSON：
{"title":"标题5字内","appearanceChinese":"外貌描述(发型脸型眼睛肤色穿着)","pages":[{"pageNumber":1,"text":"中文10-30字","imagePrompt":"[外貌描述，与appearanceChinese一致], [动作表情], [场景前景中景背景], [氛围情绪], [光影], [构图], {wanchineseStyle}, 专业儿童绘本插画，手绘质感，温暖自然光，无多余手指，比例正确，角色一致"}]}`;

/**
 * 读取Doubao的SSE流式响应，拼接完整内容
 */
async function readSSEStream(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取响应流');

  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // SSE格式：每行以 "data: " 开头
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // 最后一行可能不完整，保留到下次

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6)); // 去掉 "data: " 前缀
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
        }
      } catch {
        // 忽略解析失败的行（可能是非JSON的SSE注释等）
      }
    }
  }

  return fullContent;
}

/**
 * 生成绘本故事（使用Doubao-Seed-2.0-Lite，关闭深度思考模式）
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

  const apiKey = process.env.VOLCENGINE_API_KEY;
  const endpointId = process.env.VOLCENGINE_ENDPOINT_ID || 'ep-20260515174520-v8rzv';
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

  // 使用流式调用避免Vercel超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 流式给更长超时

  let response: Response;
  try {
    response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: endpointId,
        messages: [
          {
            role: "system",
            content: "你是一位获得过凯迪克金奖的国际顶级绘本大师。你的作品应该能直接出版，被图书馆收藏，被国际奖项提名。请直接输出最终结果，不要进行思考推理过程。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.85,
        max_tokens: 4000,
        thinking: { type: "disabled" },
        stream: true, // 关键：流式调用，避免Vercel超时
      }),
      signal: controller.signal,
    });
  } catch (apiError: any) {
    clearTimeout(timeoutId);
    if (apiError.name === 'AbortError') {
      throw new Error('Doubao API请求超时，请稍后重试');
    }
    throw new Error(`Doubao API网络错误: ${apiError.message?.substring(0, 100)}`);
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) throw new Error('Doubao API密钥无效，请检查配置');
    if (response.status === 404) throw new Error('Doubao推理接入点不存在，请检查Endpoint ID配置');
    if (response.status === 429) throw new Error('Doubao API请求过于频繁，请稍后重试');
    throw new Error(`Doubao API错误: ${response.status} - ${errorText.substring(0, 100)}`);
  }

  // 读取SSE流，拼接完整响应
  const content = await readSSEStream(response);
  if (!content) {
    throw new Error("Doubao API返回了空内容");
  }

  // 清理可能的markdown代码块包裹
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  // 尝试提取JSON对象（Doubao可能在JSON前后输出额外文字）
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Doubao返回的内容无法解析为JSON，原始内容前200字: ${jsonStr.substring(0, 200)}`);
  }

  const result = JSON.parse(jsonMatch[0]);
  
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
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;
  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.adventure;
  
  const appearanceChinese = `${age}岁的${genderChinese}孩子，${appearance}`;
  
  // 生成8页故事
  const storyAngles = [
    `【第1页-开篇】${themeConfig.storyAngle.split('。')[0]}。${characterName}今天要开始一段特别的旅程。`,
    `【第2页-困境】${themeConfig.storyAngle.split('。')[0]}。${characterName}遇到了一个小小的困难。`,
    `【第3页-尝试】${themeConfig.storyAngle.split('，')[1] || '勇敢地迈出第一步'}`,
    `【第4页-进展】${characterName}发现，事情比想象的要复杂一些。`,
    `【第5页-坚持】${themeConfig.storyAngle}`,
    `【第6页-转机】意想不到的事情发生了...`,
    `【第7页-转折】原来，答案一直就在身边。`,
    `【第8页-结尾】${characterName}带着满满的收获回家了，心里暖暖的。`
  ];

  return {
    title: `${characterName}的奇妙之旅`,
    appearanceChinese,
    pages: storyAngles.map((text, index) => ({
      pageNumber: index + 1,
      text: text.replace(/【.*?】/g, '').trim().substring(0, 30),
      imagePrompt: `[${appearanceChinese}], [表情丰富], [温馨场景], [温暖氛围], ${styleConfig.chinesePrompt}`
    }))
  };
}
