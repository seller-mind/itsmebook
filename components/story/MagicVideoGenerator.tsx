"use client";

import { useState, useCallback } from "react";
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
}: MagicVideoGeneratorProps) {
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [cardUrl, setCardUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");

  // 分享文案
  const shareText = `我用「睡前魔法书」给${childName}讲了《${title}》，用我自己的声音读的！孩子听了一遍又一遍 🌙

快去试试，录一段你的声音，让绘本替你讲睡前故事～

#睡前故事 #AI绘本 #育儿好物 #睡前魔法书`;

  // 生成故事卡片
  const generateCard = useCallback(async () => {
    if (typeof window === "undefined") return;

    setStatus("generating");
    setProgress(0);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法创建Canvas");

      setProgress(10);

      // 背景渐变
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#1a1a3e");
      bgGradient.addColorStop(0.5, "#2d1b4e");
      bgGradient.addColorStop(1, "#1a1a2e");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setProgress(20);

      // 加载封面图
      const coverImg = new Image();
      coverImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        coverImg.onload = () => resolve();
        coverImg.onerror = () => resolve();
        coverImg.src = pages[0]?.imageUrl || "";
        setTimeout(resolve, 5000);
      });

      setProgress(40);

      // 绘制封面图（上半部分，留白边）
      if (coverImg.complete && coverImg.naturalWidth > 0) {
        const imgPadding = 60;
        const imgMaxW = canvas.width - imgPadding * 2;
        const imgMaxH = canvas.height * 0.5;
        const scale = Math.min(imgMaxW / coverImg.naturalWidth, imgMaxH / coverImg.naturalHeight);
        const w = coverImg.naturalWidth * scale;
        const h = coverImg.naturalHeight * scale;
        const x = (canvas.width - w) / 2;
        const y = 180;

        // 圆角裁剪
        ctx.save();
        roundRect(ctx, x, y, w, h, 24);
        ctx.clip();
        ctx.drawImage(coverImg, x, y, w, h);
        ctx.restore();
      }

      setProgress(60);

      // 标题
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 64px 'Noto Serif SC', 'Source Han Serif CN', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(255, 200, 100, 0.3)";
      ctx.shadowBlur = 20;
      const titleY = coverImg.complete && coverImg.naturalWidth > 0
        ? 180 + canvas.height * 0.5 + 40
        : 400;
      ctx.fillText(title, canvas.width / 2, titleY);

      // 副标题
      ctx.shadowBlur = 0;
      ctx.font = "40px 'Noto Serif SC', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`${childName}的睡前故事`, canvas.width / 2, titleY + 90);

      // 装饰星星
      drawStars(ctx, canvas.width, canvas.height);

      // 品牌区域（底部）
      const brandY = canvas.height - 240;

      // 品牌背景条
      const brandGradient = ctx.createLinearGradient(0, brandY - 20, 0, canvas.height);
      brandGradient.addColorStop(0, "rgba(255,140,66,0.1)");
      brandGradient.addColorStop(1, "rgba(255,140,66,0.05)");
      ctx.fillStyle = brandGradient;
      ctx.fillRect(80, brandY - 20, canvas.width - 160, 180);

      // 品牌logo文字
      ctx.fillStyle = "#FFD93D";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText("📖 睡前魔法书", canvas.width / 2, brandY + 20);

      // 品牌标语
      ctx.font = "30px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("你的声音，是孩子最好的睡前魔法", canvas.width / 2, brandY + 80);

      // 页数标记
      ctx.font = "26px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`共 ${pages.length} 页 · ${childName} 专属`, canvas.width / 2, brandY + 130);

      setProgress(80);

      // 导出PNG
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("导出失败"))),
          "image/png",
          1
        );
      });

      const url = URL.createObjectURL(blob);
      setCardUrl(url);
      setProgress(100);
      setStatus("done");
    } catch (err: any) {
      setError(err.message || "卡片生成失败");
      setStatus("error");
    }
  }, [pages, title, childName]);

  // 下载卡片
  const downloadCard = () => {
    if (!cardUrl) return;
    const link = document.createElement("a");
    link.href = cardUrl;
    link.download = `${childName}的睡前故事-${title}.png`;
    link.click();
  };

  // 复制分享文案
  const copyShareText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 静默失败
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 初始状态 */}
      {status === "idle" && (
        <div className="text-center space-y-3 py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-orange to-primary-dark flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">保存故事卡片</h3>
            <p className="text-sm text-gray-500 mt-1">
              生成精美故事卡片图片，分享给朋友
            </p>
          </div>
          <button
            onClick={generateCard}
            className="btn-primary px-8 py-3 text-base"
          >
            生成卡片
          </button>
        </div>
      )}

      {/* 生成中 */}
      {status === "generating" && (
        <div className="text-center space-y-4 py-4">
          <div className="w-20 h-20 mx-auto relative">
            <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="url(#card-gradient)" strokeWidth="6"
                strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round" transform="rotate(-90 50 50)"
              />
              <defs>
                <linearGradient id="card-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF8C42" />
                  <stop offset="100%" stopColor="#FFD93D" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">{progress}%</span>
            </div>
          </div>
          <p className="font-medium text-gray-900">正在生成故事卡片...</p>
        </div>
      )}

      {/* 完成 */}
      {status === "done" && cardUrl && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900">故事卡片已生成！</h3>
            <p className="text-sm text-gray-500 mt-1">长按图片可保存到手机相册</p>
          </div>

          {/* 卡片预览 */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
            <img
              src={cardUrl}
              alt="故事卡片"
              className="w-full aspect-[9/16] max-h-96 mx-auto object-contain"
            />
          </div>

          {/* 分享文案 */}
          <div className="bg-gradient-to-r from-primary-orange/10 to-primary-yellow/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 text-sm">分享文案</p>
              <button
                onClick={copyShareText}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-primary-orange text-white hover:bg-primary-dark"
                }`}
              >
                {copied ? "已复制" : "复制文案"}
              </button>
            </div>
            <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{shareText}</p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={downloadCard}
              className="flex-1 btn-primary py-3 text-sm"
            >
              保存卡片
            </button>
            <button
              onClick={() => {
                setStatus("idle");
                setCardUrl("");
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
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="font-medium text-red-600">生成失败</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => { setStatus("idle"); setError(""); }}
            className="btn-primary px-6 py-2 text-sm"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
}

// 圆角矩形路径
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// 绘制装饰星星
function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const stars = [
    { x: 120, y: 100, size: 4, alpha: 0.6 },
    { x: width - 150, y: 80, size: 3, alpha: 0.4 },
    { x: width - 80, y: 200, size: 5, alpha: 0.5 },
    { x: 200, y: height * 0.6, size: 3, alpha: 0.3 },
    { x: width - 120, y: height * 0.55, size: 4, alpha: 0.4 },
    { x: 80, y: height * 0.45, size: 3, alpha: 0.3 },
    { x: width - 200, y: height * 0.7, size: 5, alpha: 0.5 },
  ];

  for (const star of stars) {
    ctx.save();
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#FFD93D";
    ctx.beginPath();
    // 四角星
    const s = star.size;
    ctx.moveTo(star.x, star.y - s * 2);
    ctx.lineTo(star.x + s * 0.5, star.y - s * 0.5);
    ctx.lineTo(star.x + s * 2, star.y);
    ctx.lineTo(star.x + s * 0.5, star.y + s * 0.5);
    ctx.lineTo(star.x, star.y + s * 2);
    ctx.lineTo(star.x - s * 0.5, star.y + s * 0.5);
    ctx.lineTo(star.x - s * 2, star.y);
    ctx.lineTo(star.x - s * 0.5, star.y - s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
