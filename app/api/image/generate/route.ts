/**
 * 故事配图生成API - 睡前魔法书
 * POST /api/image/generate
 * 使用万相2.7生成故事配图
 */

import { NextRequest, NextResponse } from "next/server";

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
      model: "wan2.7-image-pro",
      input: {
        messages: [
          {
            role: "user",
            content: [{ text: fullPrompt }],
          },
        ],
      },
      parameters: {
        size: "1024*1024",
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
      throw new Error(`万相API错误: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    const result = await response.json();
    const imageUrl =
      result.output?.choices?.[0]?.message?.content?.[0]?.image;

    if (!imageUrl) {
      throw new Error(`万相API返回格式异常`);
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

// 生成占位图URL（基于unsplash）
function getPlaceholderImageUrl(index: number): string {
  const placeholderImages = [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&h=800&fit=crop",
  ];
  return placeholderImages[index % placeholderImages.length];
}
