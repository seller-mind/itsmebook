/**
 * 服务端视频生成API - 是我呀
 * POST /api/admin/export-video
 * 
 * 使用Canvas + 服务端渲染生成视频
 * 由于Vercel serverless没有ffmpeg，我们采用另一种方案：
 * 返回带音频的图片列表，让前端用MediaRecorder合成
 * 
 * 但这里我们做一个改进：生成一个HTML页面，包含所有资源和播放脚本
 * 用户可以在浏览器中打开并录制
 * 
 * 实际方案：前端生成WebM后，调用此API用ffmpeg转换
 * 但Vercel没有ffmpeg，所以：
 * - 方案A：前端直接生成MP4（不可行，浏览器不支持MP4编码）
 * - 方案B：返回WebM（iOS不支持）
 * - 方案C：使用第三方API转换（需要付费）
 * - 方案D：在admin页面用StoryPlayer直接播放+录屏
 * 
 * 最实际方案：前端生成WebM，提供说明iOS用户可以用在线转换工具
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pages, title, pageDuration = 4 } = body;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ success: false, message: "缺少绘本数据" }, { status: 400 });
    }

    // 下载所有音频文件，返回base64（避免CORS问题）
    const audioData: Record<number, string> = {};
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].audioUrl) {
        try {
          const res = await fetch(pages[i].audioUrl, { signal: AbortSignal.timeout(15000) });
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            audioData[i] = `data:audio/mpeg;base64,${buf.toString("base64")}`;
          }
        } catch {
          // 忽略单个音频加载失败
        }
      }
    }

    return NextResponse.json({
      success: true,
      audioData,
      config: {
        title,
        pageDuration,
        totalPages: pages.length,
      },
    });

  } catch (error: any) {
    console.error("视频资源准备失败:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
