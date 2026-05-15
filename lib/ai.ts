// AI 客户端配置
// 使用Doubao-Seed-2.0-Lite生成故事文本（关闭深度思考模式），万相2.7生成插图

// 风格配置映射 - 结构化对象（适配万相中文prompt）
export const STYLE_CONFIGS: Record<string, { 
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
export const THEME_CONFIGS: Record<string, {
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
export const STORY_PROMPT_TEMPLATE = `你是顶级儿童绘本作家。请根据以下参数创作绘本，只输出JSON，不要输出其他任何内容。

参数：主题-{themeAngle}，主角-{characterName}（{age}岁{gender}，{appearance}），风格-{styleChinese}，8页。

要求：1)不说教，道理藏在故事里 2)1-2页建立困境，3-6页冒险冲突，7页转折，8页温暖收尾 3)每页10-30字，优美凝练适合朗读 4)主角外貌所有页面一致 5)构图多样：远景/中景/特写/俯视/仰视交替。

输出JSON：
{"title":"标题5字内","appearanceChinese":"外貌描述(发型脸型眼睛肤色穿着)","pages":[{"pageNumber":1,"text":"中文10-30字","imagePrompt":"[外貌描述，与appearanceChinese一致], [动作表情], [场景前景中景背景], [氛围情绪], [光影], [构图], {wanchineseStyle}, 专业儿童绘本插画，手绘质感，温暖自然光，无多余手指，比例正确，角色一致"}]}`;

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
      prompt: imagePrompt,
    },
    parameters: {
      size: "1344x960",
      extra: {
        return_url: true,
      },
    },
  };

  let response: Response;
  try {
    response = await fetch('https://dashscope.aliyuncs.com/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
  } catch (apiError: any) {
    throw new Error(`万相API网络错误: ${apiError.message?.substring(0, 100)}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) throw new Error('万相API密钥无效');
    if (response.status === 400) throw new Error(`万相API参数错误: ${errorText.substring(0, 100)}`);
    throw new Error(`万相API错误: ${response.status}`);
  }

  const result = await response.json();
  
  // 轮询任务状态获取结果
  if (result.task_id) {
    return pollWanxiangTask(result.task_id, apiKey);
  }
  
  // 同步返回
  if (result.data?.image_url) {
    return result.data.image_url;
  }
  
  throw new Error('万相API返回格式异常');
}

/**
 * 轮询万相图片生成任务状态
 */
async function pollWanxiangTask(taskId: string, apiKey: string, maxRetries = 60): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const statusRes = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (!statusRes.ok) continue;
      
      const statusData = await statusRes.json();
      
      if (statusData.status === 'succeeded') {
        return statusData.output?.image_url || getPlaceholderImage('watercolor');
      }
      
      if (statusData.status === 'failed') {
        throw new Error('万相图片生成失败');
      }
    } catch {
      // 继续重试
    }
  }
  
  return getPlaceholderImage('watercolor');
}

/**
 * 获取占位图片（API未配置时使用）
 */
function getPlaceholderImage(style: string): string {
  // 使用unsplash的占位图
  const styleKeywords: Record<string, string> = {
    watercolor: 'watercolor-art',
    oil: 'oil-painting',
    anime: 'anime-illustration',
    chinese: 'chinese-painting',
    pastoral: 'pastoral-landscape',
    fantasy: 'fantasy-art',
    minimalist: 'minimalist-art',
    nordic: 'scandinavian-design',
  };
  
  const keyword = styleKeywords[style] || 'children-illustration';
  return `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop&q=80`;
}

/**
 * 获取Mock故事数据（API未配置时使用）
 */
export function getMockStory(
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
  const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;
  const genderChinese = gender === "男孩" ? "男孩" : "女孩";
  const appearanceChinese = `${age}岁的${genderChinese}孩子，${appearance}`;
  
  return {
    title: `${characterName}的奇妙冒险`,
    appearanceChinese,
    pages: [
      { pageNumber: 1, text: `${characterName}住在一个小镇上，每天都梦想着去远方冒险。`, imagePrompt: `${appearanceChinese}, 站在小镇门口望向远方, 晴朗的天空和绿色的田野, 充满期待的氛围, 侧光, 远景构图, ${styleConfig.chinesePrompt}` },
      { pageNumber: 2, text: `一天，一只会说话的小猫出现了，它说：「跟我来，我带你去一个神奇的地方！」`, imagePrompt: `${appearanceChinese}, 惊讶地看着会说话的小猫, 神秘的森林入口, 魔法氛围, 逆光剪影, 中景构图, ${styleConfig.chinesePrompt}` },
      { pageNumber: 3, text: `他们走进了一片发光的森林，树木像水晶一样闪烁，${characterName}的眼睛都看呆了。`, imagePrompt: `${appearanceChinese}, 惊讶地仰望发光的大树, 梦幻的森林内部, 魔法光芒四射, 顶光, 仰视构图, ${styleConfig.chinesePrompt}` },
      { pageNumber: 4, text: `突然，一条小溪挡住了去路。溪水很急，${characterName}有点害怕，不知道该怎么过去。`, imagePrompt: `${appearanceChinese}, 站在湍急的小溪边, 小溪和石头, 困难氛围, 散射光, 近景, ${styleConfig.chinesePrompt}` },
      { pageNumber: 5, text: `小猫鼓励说：「你很勇敢！看看周围，有没有发现什么？」${characterName}环顾四周，发现了一些大石头。`, imagePrompt: `${appearanceChinese}和小猫一起想办法, 溪流和大石头, 思考氛围, 侧光, 中景, ${styleConfig.chinesePrompt}` },
      { pageNumber: 6, text: `他们一起跳着石头过了小溪，虽然衣服湿了一点，但${characterName}学会了遇到困难要想办法。`, imagePrompt: `${appearanceChinese}开心地跳过最后一块石头, 阳光下的溪流, 成功喜悦的氛围, 正面光, 特写, ${styleConfig.chinesePrompt}` },
      { pageNumber: 7, text: `最后，他们找到了森林深处的秘密花园。花园里开满了会发光的花朵，美得像童话一样。`, imagePrompt: `${appearanceChinese}和小猫站在发光的花园中, 神秘的秘密花园, 温馨美丽的氛围, 暖色调, 全景构图, ${styleConfig.chinesePrompt}` },
      { pageNumber: 8, text: `太阳落山了，${characterName}依依不舍地和小猫告别回家了。躺在床上，${characterName}开心地笑了，知道明天还会有新的冒险。`, imagePrompt: `${appearanceChinese}躺在床上望着窗外的星空, 温馨的卧室, 温暖幸福的氛围, 月光, 侧光, 近景, ${styleConfig.chinesePrompt}` },
    ],
  };
}
