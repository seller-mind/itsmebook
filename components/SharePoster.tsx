"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface SharePosterProps {
  bookData: {
    coverImage: string;
    childName: string;
    styleName: string;
    bookTitle?: string;
  };
  referralCode?: string;
  onClose: () => void;
}

export default function SharePoster({ bookData, referralCode, onClose }: SharePosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 根据风格获取颜色配置
  const getStyleColors = (style: string): { gradient: string[]; accent: string } => {
    const styleMap: Record<string, { gradient: string[]; accent: string }> = {
      watercolor: { gradient: ["#FFB6C1", "#E6E6FA", "#FFA07A"], accent: "#FF69B4" },
      oil: { gradient: ["#FFD700", "#FF8C00", "#FF6347"], accent: "#8B4513" },
      chinese: { gradient: ["#98D8C8", "#7FDBDA", "#90EE90"], accent: "#2E8B57" },
      fantasy: { gradient: ["#DDA0DD", "#E6E6FA", "#87CEEB"], accent: "#9370DB" },
      pastoral: { gradient: ["#F0E68C", "#98FB98", "#87CEEB"], accent: "#556B2F" },
      anime: { gradient: ["#ADD8E6", "#87CEFA", "#B0E0E6"], accent: "#4169E1" },
      minimalist: { gradient: ["#E0E0E0", "#F5F5F5", "#DCDCDC"], accent: "#333333" },
      nordic: { gradient: ["#E6F3FF", "#CCE5FF", "#B3D9FF"], accent: "#4169E1" },
    };
    return styleMap[style] || styleMap.watercolor;
  };

  // 生成海报
  useEffect(() => {
    const generatePoster = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        // 设置画布尺寸 1080x1440 (3:4)
        const width = 1080;
        const height = 1440;
        canvas.width = width;
        canvas.height = height;

        const { gradient, accent } = getStyleColors(bookData.styleName);

        // 1. 绘制渐变背景
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, gradient[0]);
        bgGradient.addColorStop(0.5, gradient[1]);
        bgGradient.addColorStop(1, gradient[2]);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // 2. 添加装饰元素
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.arc(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 100 + 20,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = accent;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 3. 加载并绘制封面图
        const coverSize = 700;
        const coverX = (width - coverSize) / 2;
        const coverY = 200;

        // 封面图边框阴影
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;

        // 绘制圆角矩形作为封面背景
        const radius = 30;
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, radius);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.shadowColor = "transparent";

        // 加载封面图片
        try {
          const coverImg = new Image();
          coverImg.crossOrigin = "anonymous";
          
          await new Promise<void>((resolve, reject) => {
            coverImg.onload = () => resolve();
            coverImg.onerror = () => reject(new Error("封面加载失败"));
            coverImg.src = bookData.coverImage;
          });

          // 裁剪为正方形
          const imgSize = Math.min(coverImg.width, coverImg.height);
          const sx = (coverImg.width - imgSize) / 2;
          const sy = (coverImg.height - imgSize) / 2;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(coverX + 15, coverY + 15, coverSize - 30, coverSize - 30, radius - 5);
          ctx.clip();
          ctx.drawImage(coverImg, sx, sy, imgSize, imgSize, coverX + 15, coverY + 15, coverSize - 30, coverSize - 30);
          ctx.restore();
        } catch (imgError) {
          // 如果封面加载失败，绘制占位图
          ctx.fillStyle = "#F0F0F0";
          ctx.fillRect(coverX + 15, coverY + 15, coverSize - 30, coverSize - 30);
          ctx.fillStyle = "#999";
          ctx.font = "48px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("📖", width / 2, coverY + coverSize / 2);
        }

        // 4. 绘制标题
        ctx.fillStyle = "#333333";
        ctx.font = "bold 52px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("✨ 我在「睡前魔法书」", width / 2, 1020);
        
        ctx.font = "bold 48px sans-serif";
        ctx.fillText("为宝贝做了专属绘本", width / 2, 1090);

        // 5. 绘制书名和风格
        ctx.fillStyle = accent;
        ctx.font = "36px sans-serif";
        const displayTitle = bookData.bookTitle || `${bookData.childName}的奇妙故事`;
        ctx.fillText(`📖 ${displayTitle}`, width / 2, 1160);
        
        ctx.fillStyle = "#666666";
        ctx.font = "32px sans-serif";
        ctx.fillText(`🎨 ${bookData.styleName}`, width / 2, 1210);

        // 6. 绘制二维码
        const qrSize = 160;
        const qrX = (width - qrSize) / 2 - 100;
        const qrY = height - 280;

        // 生成推荐链接的二维码
        const referralLink = referralCode 
          ? `https://www.itsmebook.com/?ref=${referralCode}`
          : "https://www.itsmebook.com";

        try {
          const qrDataUrl = await QRCode.toDataURL(referralLink, {
            width: qrSize,
            margin: 2,
            color: {
              dark: "#333333",
              light: "#FFFFFF",
            },
          });

          const qrImg = new Image();
          await new Promise<void>((resolve, reject) => {
            qrImg.onload = () => resolve();
            qrImg.onerror = () => reject(new Error("二维码加载失败"));
            qrImg.src = qrDataUrl;
          });

          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch (qrError) {
          // 二维码生成失败，绘制占位
          ctx.fillStyle = "#F0F0F0";
          ctx.fillRect(qrX, qrY, qrSize, qrSize);
        }

        // 7. 绘制二维码下方文字
        ctx.fillStyle = "#333333";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("扫码为你的孩子", qrX + qrSize + 30, qrY + 50);
        ctx.fillText("也做一本", qrX + qrSize + 30, qrY + 90);

        // 8. 绘制品牌水印
        ctx.fillStyle = "#999999";
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("睡前魔法书 AI绘本 | itsmebook.com", width / 2, height - 60);

        setIsGenerating(false);
      } catch (err) {
        console.error("生成海报失败:", err);
        setError("海报生成失败，请重试");
        setIsGenerating(false);
      }
    };

    generatePoster();
  }, [bookData, referralCode]);

  // 下载海报
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = canvasRef.current;
      
      // 转换为blob并下载
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `睡前魔法书绘本_${bookData.childName}_${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");

      // 关闭弹窗
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error("下载失败:", err);
      alert("下载失败，请重试");
    } finally {
      setIsDownloading(false);
    }
  };

  // 复制分享链接
  const handleCopyLink = async () => {
    const shareLink = referralCode 
      ? `https://www.itsmebook.com/?ref=${referralCode}`
      : "https://www.itsmebook.com";
    
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("分享链接已复制到剪贴板！");
    } catch (err) {
      console.error("复制失败:", err);
      alert("复制失败，请手动复制");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-orange-500 to-pink-500">
          <h3 className="text-white font-bold text-lg">生成分享海报</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 海报预览 */}
        <div className="p-4 overflow-auto max-h-[60vh]">
          {isGenerating ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-4">🎨</div>
                <p className="text-gray-500">正在生成海报...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center text-red-500">
                <p className="text-4xl mb-4">😢</p>
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                  重试
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-xl shadow-lg"
                style={{ maxHeight: "50vh" }}
              />
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="p-4 border-t space-y-3">
          <button
            onClick={handleDownload}
            disabled={isGenerating || isDownloading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                保存中...
              </>
            ) : (
              <>
                📥 保存到相册
              </>
            )}
          </button>
          
          <button
            onClick={handleCopyLink}
            disabled={isGenerating}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            🔗 复制分享链接
          </button>

          {/* 分享文案提示 */}
          <div className="mt-4 p-3 bg-orange-50 rounded-xl text-sm text-gray-600">
            <p className="font-medium text-orange-600 mb-2">💡 分享文案：</p>
            <p className="leading-relaxed">
              我用AI给孩子做了一本专属绘本，孩子居然是故事的主角！🎉
              注册就送1次免费体验，用我的链接注册，咱俩都能多得1次👇
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
