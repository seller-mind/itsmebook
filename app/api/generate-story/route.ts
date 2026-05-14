import { NextRequest, NextResponse } from "next/server";
import { generateStory } from "@/lib/openai";

// POST /api/generate-story
// 生成绘本故事文本
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterName, age, theme, style } = body;

    // 参数验证
    if (!characterName || !age || !theme || !style) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 年龄验证
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 12) {
      return NextResponse.json(
        { error: "年龄需要在3-12岁之间" },
        { status: 400 }
      );
    }

    // 生成故事
    const story = await generateStory(characterName, ageNum, theme, style);

    return NextResponse.json({
      success: true,
      data: story,
    });
  } catch (error: any) {
    console.error("Story generation error:", error);

    // 如果是API未配置错误，返回mock数据
    if (error.message?.includes("not configured")) {
      const body = await request.clone().json();
      const { generateStory } = await import("@/lib/openai");
      const mockStory = await generateStory(
        body.characterName,
        parseInt(body.age),
        body.theme,
        body.style
      );
      return NextResponse.json({
        success: true,
        data: mockStory,
        mock: true,
      });
    }

    return NextResponse.json(
      { error: "生成故事失败，请稍后重试" },
      { status: 500 }
    );
  }
}
