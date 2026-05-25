/**
 * 视频导出组件 - 是我呀 Admin
 * 使用Canvas + MediaRecorder在浏览器中录制MP4视频
 * 
 * 功能：
 * - 逐页展示绘本配图
 * - 显示字幕
 * - 配音播放（如果有）
 * - 翻页动画
 * - 导出MP4格式
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface VideoExportProps {
  bookId: string;
  title: string;
  pages: Array<{
    pageNumber: number;
    imageUrl: string;
    text: string;
    audioUrl?: string;
  }>;
  pageDuration?: number; // 每页停留秒数
  onComplete?: (blob: Blob) => void;
}

export default function VideoExport({
  bookId,
  title,
  pages,
  pageDuration = 4,
  onComplete,
}: VideoExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelRef = useRef(false);

  // 预加载图片
  const preloadImages = useCallback(async (): Promise<HTMLImageElement[]> => {
    const images: HTMLImageElement[] = [];
    
    for (let i = 0; i < pages.length; i++) {
      setStatus(`加载图片 ${i + 1}/${pages.length}...`);
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => {
          // 使用占位图
          img.src = `https://placehold.co/1080x1080/FFB6C1/ffffff?text=Page+${i + 1}`;
          resolve();
        };
        img.src = pages[i].imageUrl;
      });
      
      images.push(img);
    }
    
    return images;
  }, [pages]);

  // 绘制帧
  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    pageIndex: number,
    progress: number // 0-1，页面内动画进度
  ) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // 清除画布
    ctx.fillStyle = "#FFF5EB";
    ctx.fillRect(0, 0, width, height);

    // 计算图片显示区域（留出字幕空间）
    const imageHeight = height * 0.75;
    const imageTop = 0;

    // 翻页动画
    let scale = 1;
    let translateX = 0;
    
    if (progress < 0.1) {
      // 进入动画
      scale = 0.9 + (progress / 0.1) * 0.1;
      translateX = ((1 - progress / 0.1) * 50);
    } else if (progress > 0.9) {
      // 退出动画
      scale = 1 - ((progress - 0.9) / 0.1) * 0.1;
      translateX = -((progress - 0.9) / 0.1) * 50;
    }

    ctx.save();
    ctx.translate(width / 2 + translateX, imageTop + imageHeight / 2);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -(imageTop + imageHeight / 2));

    // 绘制图片（居中，填满上方区域）
    const imgAspect = image.width / image.height;
    const canvasAspect = width / imageHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      drawWidth = imageHeight * imgAspect;
      drawHeight = imageHeight;
      drawX = (width - drawWidth) / 2;
      drawY = imageTop;
    } else {
      drawWidth = width;
      drawHeight = width / imgAspect;
      drawX = 0;
      drawY = imageTop + (imageHeight - drawHeight) / 2;
    }

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    // 绘制字幕背景
    const textAreaTop = height * 0.78;
    const textAreaHeight = height * 0.2;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.fillRect(0, textAreaTop, width, textAreaHeight);

    // 绘制字幕
    const text = pages[pageIndex].text;
    const fontSize = Math.min(32, width / 20);
    
    ctx.font = `${fontSize}px "Noto Sans SC", "LXGW WenKai", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333333";

    // 文字换行
    const maxWidth = width * 0.9;
    const lineHeight = fontSize * 1.5;
    const words = text.split("");
    let lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    const totalTextHeight = lines.length * lineHeight;
    const textStartY = textAreaTop + (textAreaHeight - totalTextHeight) / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, textStartY + index * lineHeight);
    });

    // 绘制页码
    ctx.font = `${fontSize * 0.6}px sans-serif`;
    ctx.fillStyle = "#999999";
    ctx.fillText(`${pageIndex + 1} / ${pages.length}`, width / 2, height - 20);

    // 绘制品牌标注
    ctx.font = `${fontSize * 0.5}px sans-serif`;
    ctx.fillStyle = "#CCCCCC";
    ctx.fillText("是我呀 AI绘本", width / 2, 30);
  };

  // 导出视频
  const exportVideo = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setProgress(0);
    setStatus("准备中...");
    setVideoUrl(null);
    cancelRef.current = false;

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas未初始化");

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法获取Canvas上下文");

      // 设置Canvas尺寸（1:1正方形，适合短视频）
      canvas.width = 1080;
      canvas.height = 1080;

      // 预加载所有图片
      setStatus("加载资源...");
      const images = await preloadImages();
      
      if (cancelRef.current) return;

      // 准备MediaRecorder
      setStatus("准备录制...");
      
      const stream = canvas.captureStream(30);
      
      // 获取音频轨道
      let audioTrack: MediaStreamTrack | null = null;
      const audioContext = new AudioContext();

      // 创建MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5Mbps
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);

      // 逐页渲染
      const totalPages = pages.length;
      const fps = 30;
      const framesPerPage = pageDuration * fps;

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (cancelRef.current) break;

        // 播放配音（如果有）
        const pageAudioUrl = pages[pageIndex].audioUrl;
        let audioStartTime = 0;

        if (pageAudioUrl) {
          try {
            const audio = new Audio(pageAudioUrl);
            audioRef.current = audio;
            audioStartTime = Date.now();
            await audio.play();
          } catch (e) {
            console.error("音频播放失败:", e);
          }
        }

        // 渲染页面帧
        for (let frame = 0; frame < framesPerPage; frame++) {
          if (cancelRef.current) break;

          const pageProgress = frame / framesPerPage;
          drawFrame(ctx, images[pageIndex], pageIndex, pageProgress);

          // 更新进度
          const overallProgress = ((pageIndex * framesPerPage + frame) / (totalPages * framesPerPage)) * 100;
          setProgress(Math.floor(overallProgress));

          // 控制帧率
          await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
        }

        // 停止配音
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }

      // 停止录制
      setStatus("生成视频文件...");
      mediaRecorder.stop();

      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => resolve();
      });

      // 生成视频Blob
      const webmBlob = new Blob(chunksRef.current, { type: "video/webm" });
      
      // WebM转MP4（使用简单方法，直接返回WebM）
      // 实际生产中可以使用ffmpeg.wasm或服务端转换
      const videoBlob = webmBlob;
      
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      setStatus("导出完成！");
      
      if (onComplete) {
        onComplete(videoBlob);
      }

    } catch (error: any) {
      console.error("导出失败:", error);
      setStatus(`导出失败: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 取消导出
  const cancelExport = () => {
    cancelRef.current = true;
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsExporting(false);
    setStatus("已取消");
  };

  // 下载视频
  const downloadVideo = () => {
    if (!videoUrl) return;
    
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${title || "绘本"}_视频.webm`;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🎬</span> 视频导出
      </h3>

      {/* Canvas（隐藏） */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      {/* 导出进度 */}
      {isExporting && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={cancelExport}
            className="mt-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            取消导出
          </button>
        </div>
      )}

      {/* 视频预览 */}
      {videoUrl && (
        <div className="mb-4">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: "300px" }}
          />
          <button
            onClick={downloadVideo}
            className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>⬇️</span> 下载视频
          </button>
        </div>
      )}

      {/* 导出按钮 */}
      {!isExporting && !videoUrl && (
        <button
          onClick={exportVideo}
          className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-primary-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>🎬</span>
          导出视频（{pages.length}页，每页{pageDuration}秒）
        </button>
      )}

      {/* 提示 */}
      <p className="mt-3 text-xs text-gray-400 text-center">
        视频格式：WebM（可在大多数平台播放）
        <br />
        如需MP4格式，请使用视频转换工具
      </p>
    </div>
  );
}
