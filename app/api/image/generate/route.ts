/**
 * 故事配图生成API - 是我呀
 * POST /api/image/generate
 * 使用万相2.7生成故事配图
 */

import { NextRequest, NextResponse } from "next/server";

// 允许60秒执行时间（万相API可能需要15-30秒）
export const maxDuration = 60;

// 风格配置映射
const STYLE_CONFIGS: Record<string, { chinesePrompt: string }> = {
  watercolor: {
    chinesePrompt:
      "专业儿童绘本插画，水彩画风格，柔和的水洗效果，细腻的笔触，温暖的色调，肌理丰富可见，有纸张纹理，柔和的光影，温馨雅致，手绘质感，没有塑料光滑感，艺术品质",
  },
  oil: {
    chinesePrompt:
      "专业儿童绘本插画，油画风格在画布上，厚重的肌理质感，浓郁可见的笔触，温暖饱和的色彩，戏剧性的光影，经典欧式绘本插画风格，手绘质感，没有塑料光滑感，艺术品质",
  },
  anime: {
    chinesePrompt:
      "专业儿童绘本插画，经典日式动画风格，温暖的金色时光效果，精致细腻的自然背景，表情丰富的角色，手绘水彩感，没有塑料3D渲染感，艺术品质",
  },
  chinese: {
    chinesePrompt:
      "专业儿童绘本插画，传统中国水墨画风格，宣纸质感，优雅流畅的笔触，细腻的墨色晕染从浓到淡，含蓄的留白，赭红色点缀，米黄色背景，经典中国水墨绘本风格，手绘质感，艺术品质",
  },
  pastoral: {
    chinesePrompt:
      "专业儿童绘本插画，温暖的田园水彩风格，金色的时光效果，柔和的长阴影，温馨的英式乡村氛围，茅草屋顶小屋和花园，可见的水彩纹理和纸张颗粒，经典英式乡村绘本风格，手绘质感，艺术品质",
  },
  fantasy: {
    chinesePrompt:
      "专业儿童绘本插画，梦幻童话现实主义风格，如梦似幻的氛围，漂浮的光粒子，彩虹般闪烁的色彩，魔法光影与可见光线，经典奇幻绘本风格，手绘质感带微妙魔法光晕，没有塑料光滑感，艺术品质",
  },
  minimalist: {
    chinesePrompt:
      "专业儿童绘本插画，现代简约风格，大胆干净的几何形状，有限的3-4种色彩调色板，慷慨的留白，平面设计带微妙肌理，现代简约绘本风格，干净优雅的构图，手工质感，艺术品质",
  },
  nordic: {
    chinesePrompt:
      "专业儿童绘本插画，北欧斯堪的纳维亚风格，简洁温柔的墨线带水彩晕染，柔和的冷色调带温暖点缀，温馨的极简氛围，可见的手绘线条质感，手绘质感，艺术品质",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePrompt, style = "watercolor", index = 0 } = body;

    if (!imagePrompt) {
      return NextResponse.json(
        { success: false, message: "缺少图片描述" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;

    // 如果没有配置API key，返回占位图
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        isDemo: true,
        imageUrl: getPlaceholderImageUrl(index),
      });
    }

    const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.watercolor;

    // 构建完整的图片prompt
    const fullPrompt = `${imagePrompt}，${styleConfig.chinesePrompt}`;

    const requestBody = {
      model: "wan2.7-image",
      input: {
        messages: [
          {
            role: "user",
            content: [{ text: fullPrompt }],
          },
        ],
      },
      parameters: {
        size: "768*768",
        n: 1,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    let response: Response;
    try {
      response = await fetch(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );
    } catch (apiError: any) {
      clearTimeout(timeoutId);
      if (apiError.name === "AbortError")
        throw new Error("万相API请求超时");
      throw new Error(`万相API网络错误: ${apiError.message?.substring(0, 100)}`);
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Image] 万相API错误 ${response.status}:`, errorText.substring(0, 300));
      return NextResponse.json({
        success: false,
        message: `图片生成失败(${response.status})，请检查阿里云百炼余额`,
        imageUrl: getPlaceholderImageUrl(index),
      });
    }

    const result = await response.json();
    const imageUrl =
      result.output?.choices?.[0]?.message?.content?.[0]?.image;

    if (!imageUrl) {
      console.error("[Image] 万相API返回无图片:", JSON.stringify(result).substring(0, 300));
      return NextResponse.json({
        success: false,
        message: "图片生成未返回结果，请检查API配置",
        imageUrl: getPlaceholderImageUrl(index),
      });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error("图片生成失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "图片生成失败" },
      { status: 500 }
    );
  }
}

// 生成占位图URL（基于渐变SVG）
function getPlaceholderImageUrl(index: number): string {
  // 主题色渐变配置，每页不同
  const gradients = [
    { colors: ["#FFB6C1", "#FFC0CB", "#FF69B4"], emoji: "🌙" },
    { colors: ["#87CEEB", "#ADD8E6", "#B0E0E6"], emoji: "⭐" },
    { colors: ["#DDA0DD", "#EE82EE", "#DA70D6"], emoji: "🌸" },
    { colors: ["#98FB98", "#90EE90", "#7CFC00"], emoji: "🌿" },
    { colors: ["#F0E68C", "#EEE8AA", "#BDB76B"], emoji: "🌻" },
    { colors: ["#FFA07A", "#FA8072", "#FF7F50"], emoji: "🔥" },
    { colors: ["#87CEFA", "#4169E1", "#6495ED"], emoji: "🌊" },
    { colors: ["#D8BFD8", "#DDA0DD", "#EE82EE"], emoji: "🌺" },
    { colors: ["#AFEEEE", "#40E0D0", "#48D1CC"], emoji: "🦋" },
    { colors: ["#FFDAB9", "#FFE4B5", "#FFA500"], emoji: "🐻" },
  ];
  
  const gradient = gradients[index % gradients.length];
  const [color1, color2, color3] = gradient.colors;
  const emoji = gradient.emoji;
  
  // 生成 SVG 占位图
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${color2};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color3};stop-opacity:1" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:white;stop-opacity:0" />
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#grad)" rx="50"/>
    <circle cx="512" cy="512" r="380" fill="url(#glow)"/>
    <text x="512" y="540" font-size="220" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="512" y="850" font-size="40" text-anchor="middle" fill="white" opacity="0.8" font-family="sans-serif">第${index + 1}页</text>
  </svg>`;
  
  // 将 SVG 转为 data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
