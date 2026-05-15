import { NextRequest, NextResponse } from "next/server";
import { generateStory } from "@/lib/ai";

// Vercel serverless函数最大执行时间设为60秒
export const maxDuration = 60;

// POST /api/generate-story
// 生成绘本故事文本
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterName, age, theme, style, gender, appearance } = body;

    // 参数验证
    if (!characterName || !age || !theme || !style) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    if (!gender) {
      return NextResponse.json(
        { error: "请选择性别" },
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

    // 生成故事（新增gender和appearance参数）
    const story = await generateStory(
      characterName, 
      ageNum, 
      theme, 
      style,
      gender,
      appearance || `${gender}，${ageNum}岁`
    );

    return NextResponse.json({
      success: true,
      data: story,
    });
  } catch (error: any) {
    console.error("Story generation error:", error);

    // 如果是API未配置错误，返回mock数据
    if (error.message?.includes("not configured")) {
      try {
        const body = await request.clone().json();
        const { generateStory } = await import("@/lib/ai");
        const mockStory = await generateStory(
          body.characterName,
          parseInt(body.age),
          body.theme,
          body.style,
          body.gender || "男孩",
          body.appearance || `${body.gender || "男孩"}，${body.age}岁`
        );
        return NextResponse.json({
          success: true,
          data: mockStory,
          mock: true,
        });
      } catch (mockError) {
        // mock数据也生成失败，返回错误JSON
        return NextResponse.json(
          { error: "API未配置且mock数据生成失败" },
          { status: 500 }
        );
      }
    }

    // 截断过长的错误信息，避免前端解析问题
    const errorMessage = (error.message || "生成故事失败，请稍后重试").substring(0, 200);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
