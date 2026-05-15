import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/ai";

// Vercel serverless函数最大执行时间设为60秒
export const maxDuration = 60;

// POST /api/generate-image
// 生成绘本插图
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePrompt, style, pageNumber, totalPages } = body;

    // 参数验证
    if (!imagePrompt || !style) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 生成图像
    const imageUrl = await generateImage(imagePrompt, style);

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        pageNumber: pageNumber || 1,
        totalPages: totalPages || 8,
      },
    });
  } catch (error: any) {
    console.error("Image generation error:", error);

    // 如果是API未配置错误，返回placeholder
    if (error.message?.includes("not configured")) {
      const { getPlaceholderImage } = await import("@/lib/ai");
      const body = await request.clone().json();
      const placeholderUrl = getPlaceholderImage(body.style);
      return NextResponse.json({
        success: true,
        data: {
          imageUrl: placeholderUrl,
          pageNumber: body.pageNumber || 1,
          totalPages: body.totalPages || 8,
        },
        mock: true,
      });
    }

    return NextResponse.json(
      { error: error.message || "生成图像失败，请稍后重试" },
      { status: 500 }
    );
  }
}
