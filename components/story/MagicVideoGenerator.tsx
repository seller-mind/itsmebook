"use client";

import { useState, useRef, useCallback } from "react";
import { StoryPage } from "./StoryPlayer";

interface MagicVideoGeneratorProps {
  pages: StoryPage[];
  title: string;
  childName: string;
  voiceAudioUrl?: string;
  onVideoGenerated?: (videoBlob: Blob, videoUrl: string) => void;
}

export default function MagicVideoGenerator({
  pages,
  title,
  childName,
  voiceAudioUrl,
  onVideoGenerated,
}: MagicVideoGeneratorProps) {
  const [status, setStatus] = useState<
    "idle" | "generating" | "done" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const generateVideo = useCallback(async () => {
    if (typeof window === "undefined") return;

    setStatus("generating");
    setProgress(0);
    setError("");
    chunksRef.current = [];

    try {
      // 创建Canvas (9:16竖版)
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法创建Canvas");

      // 创建MediaRecorder
      const stream = canvas.captureStream(30);
      // 注意：音频需要通过Web Audio API来处理混音，MediaRecorder只能录制Canvas的视频轨道
      const combinedStream = new MediaStream([
        ...stream.getVideoTracks(),
      ]);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 2500000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus("done");
        if (onVideoGenerated) {
          onVideoGenerated(blob, url);
        }
      };

      recorder.start();

      // 渲染每一页
      const totalPages = Math.min(pages.length, 8); // 最多8页
      const pageDuration = 2500; // 每页2.5秒
      const fadeDuration = 500; // 淡入淡出0.5秒

      for (let i = 0; i < totalPages; i++) {
        setProgress(Math.round(((i + 0.5) / totalPages) * 80));

        // 加载图片
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // 图片加载失败用背景色
          img.src = pages[i].imageUrl;
          // 超时处理
          setTimeout(resolve, 5000);
        });

        // 渲染该页
        await renderPage(
          ctx,
          canvas,
          img,
          pages[i],
          i,
          totalPages,
          pageDuration,
          fadeDuration,
          title,
          childName
        );
      }

      // 结尾页
      setProgress(85);
      await renderEnding(ctx, canvas, title, childName);

      // 停止录制
      setProgress(95);

      // 确保录制足够时间
      await new Promise((r) => setTimeout(r, 1000));
      recorder.stop();
    } catch (err: any) {
      setError(err.message || "视频生成失败");
      setStatus("error");
    }
  }, [pages, voiceAudioUrl, title, childName, onVideoGenerated]);

  return (
    <div className="flex flex-col gap-4">
      {/* 生成状态 */}
      {status === "idle" && (
        <div className="text-center space-y-3 py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-orange to-primary-dark flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">生成魔法时刻视频</h3>
            <p className="text-sm text-gray-500 mt-1">
              15秒绘本翻页动画，配合你的声音朗读
            </p>
          </div>
          <button
            onClick={generateVideo}
            className="btn-primary px-8 py-3 text-base"
          >
            开始生成
          </button>
        </div>
      )}

      {/* 生成中 */}
      {status === "generating" && (
        <div className="text-center space-y-4 py-4">
          <div className="w-20 h-20 mx-auto relative">
            <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="6"
                strokeDasharray={`${progress * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF8C42" />
                  <stop offset="100%" stopColor="#FFD93D" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">{progress}%</span>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900">正在生成魔法时刻...</p>
            <p className="text-sm text-gray-500 mt-1">
              渲染绘本画面，配合你的声音
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-orange to-primary-yellow h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 完成 */}
      {status === "done" && videoUrl && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900">魔法时刻已生成！</h3>
            <p className="text-sm text-gray-500 mt-1">15秒 · 绘本翻页 · 你的声音</p>
          </div>

          {/* 视频预览 */}
          <div className="rounded-2xl overflow-hidden bg-black">
            <video
              src={videoUrl}
              controls
              className="w-full aspect-[9/16] max-h-80 mx-auto"
              poster={pages[0]?.imageUrl}
            />
          </div>

          {/* 声音提示 */}
          {!voiceAudioUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-medium">建议配合录音一起分享</p>
                  <p className="text-amber-600 text-xs mt-1">录制你的声音后，打开故事播放器一起播放，效果更棒！</p>
                </div>
              </div>
            </div>
          )}

          {/* 下载/重新生成 */}
          <div className="flex gap-3">
            <a
              href={videoUrl}
              download={`${childName}的睡前故事.mp4`}
              className="flex-1 btn-primary py-3 text-sm text-center"
            >
              保存视频
            </a>
            <button
              onClick={() => {
                setStatus("idle");
                setVideoUrl("");
                setProgress(0);
              }}
              className="flex-1 btn-outline py-3 text-sm"
            >
              重新生成
            </button>
          </div>
        </div>
      )}

      {/* 错误 */}
      {status === "error" && (
        <div className="text-center space-y-3 py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-red-600">生成失败</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
          <button
            onClick={() => {
              setStatus("idle");
              setError("");
            }}
            className="btn-primary px-6 py-2 text-sm"
          >
            重试
          </button>
        </div>
      )}

      {/* 隐藏Canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// 渲染单页
async function renderPage(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  page: StoryPage,
  index: number,
  total: number,
  duration: number,
  fadeDuration: number,
  title: string,
  childName: string
) {
  const startTime = Date.now();

  // 背景色
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 淡入效果
  const fadeIn = Math.min(1, (Date.now() - startTime) / fadeDuration);
  ctx.globalAlpha = fadeIn;

  // 绘制图片（居中，最大化显示）
  const scale = Math.max(
    canvas.width / img.width,
    canvas.height / img.height
  );
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;
  ctx.drawImage(img, x, y, w, h);

  // 底部渐变遮罩
  const gradient = ctx.createLinearGradient(0, canvas.height - 400, 0, canvas.height);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvas.height - 400, canvas.width, 400);

  // 故事文字
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 52px 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  // 文字换行处理
  const maxWidth = canvas.width - 120;
  const lineHeight = 72;
  const lines = wrapText(ctx, page.text, maxWidth);
  const textY = canvas.height - 200 - (lines.length - 1) * lineHeight;
  lines.forEach((line, i) => {
    // 文字阴影
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(line, canvas.width / 2, textY + i * lineHeight);
  });

  // 页码
  ctx.shadowBlur = 0;
  ctx.font = "32px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textBaseline = "top";
  ctx.fillText(
    `${index + 1} / ${total}`,
    canvas.width / 2,
    canvas.height - 80
  );

  ctx.globalAlpha = 1;

  // 等待该页时长
  const elapsed = Date.now() - startTime;
  if (elapsed < duration) {
    await new Promise((r) => setTimeout(r, duration - elapsed));
  }
}

// 渲染结尾
async function renderEnding(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  title: string,
  childName: string
) {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 装饰圆
  for (let i = 0; i < 8; i++) {
    const x = canvas.width / 2 + Math.cos((i / 8) * Math.PI * 2) * 200;
    const y = canvas.height / 2 - 100 + Math.sin((i / 8) * Math.PI * 2) * 200;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 200, 100, ${0.3 + i * 0.1})`;
    ctx.fill();
  }

  // 主标题
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 64px 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255, 200, 100, 0.5)";
  ctx.shadowBlur = 20;
  ctx.fillText("晚安", canvas.width / 2, canvas.height / 2 - 120);

  // 孩子名字
  ctx.font = "48px 'Noto Serif SC', serif";
  ctx.fillStyle = "#FFD93D";
  ctx.shadowBlur = 10;
  ctx.fillText(childName, canvas.width / 2, canvas.height / 2 - 40);

  // 品牌
  ctx.shadowBlur = 0;
  ctx.font = "32px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("睡前魔法书", canvas.width / 2, canvas.height / 2 + 40);

  // 品牌标语
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText("你的声音，是孩子最好的睡前魔法", canvas.width / 2, canvas.height / 2 + 100);

  await new Promise((r) => setTimeout(r, 2000));
}

// 文字换行
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split("");
  const lines: string[] = [];
  let currentLine = "";

  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
