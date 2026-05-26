"use client";

import { useState, useEffect, useCallback } from "react";
import StoryPlayer, { StoryPage } from "@/components/story/StoryPlayer";
import MagicVideoGenerator from "@/components/story/MagicVideoGenerator";

// ============ 工具函数 ============

/**
 * 通过代理加载图片（解决dashscope OSS不支持CORS的问题）
 * 返回已加载完成的HTMLImageElement，可直接用于Canvas drawImage
 */
const loadImageViaProxy = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (!url) { reject(new Error("No URL")); return; }
    // placehold.co 占位图不需要代理
    const needsProxy = url.includes("aliyuncs.com") || url.includes("dashscope");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = needsProxy
      ? `/api/admin/image-proxy?url=${encodeURIComponent(url)}`
      : url;
    const timeout = setTimeout(() => reject(new Error("Image load timeout")), 12000);
    img.onload = () => {
      clearTimeout(timeout);
      if (img.naturalWidth > 0) resolve(img);
      else reject(new Error("Image has no dimensions"));
    };
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Image load failed"));
    };
  });
};

/**
 * Canvas中文自动换行绘制
 */
const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 6
): number => {
  const chars = text.split("");
  let lines: string[] = [];
  let currentLine = "";
  for (const char of chars) {
    const testLine = currentLine + char;
    if (ctx.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  let y = startY;
  for (const line of lines.slice(0, maxLines)) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
};

// ============ 页面组件 ============

export default function StoryPlayerPage() {
  const [story, setStory] = useState<{
    title: string;
    childName: string;
    pages: StoryPage[];
    voiceUrl: string;
    isFreeUser?: boolean;
  } | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoExportProgress, setVideoExportProgress] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  // 加载故事数据
  useEffect(() => {
    if (typeof window === "undefined") return;

    let storyStr = sessionStorage.getItem("bedtime_story");
    if (!storyStr) {
      storyStr = localStorage.getItem("itsmebook_last_story");
      if (storyStr) {
        sessionStorage.setItem("bedtime_story", storyStr);
      }
    }
    if (storyStr) {
      try {
        const storyData = JSON.parse(storyStr);
        setStory(storyData);
        setIsFreeUser(storyData.isFreeUser || false);
      } catch {
        loadDemoStory();
      }
    } else {
      loadDemoStory();
    }
  }, []);

  const loadDemoStory = () => {
    const demoStory = {
      title: "小宝贝的睡前故事",
      childName: "小宝贝",
      voiceUrl: "",
      pages: [
        { pageNumber: 1, text: "夜幕降临，月亮慢慢爬上了天空。小宝贝躺在床上，闭上眼睛，听妈妈讲今晚的故事。", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop" },
        { pageNumber: 2, text: "从前，在一片美丽的大森林里，住着一只小白兔。它的毛色雪白雪白的，眼睛亮晶晶的，最喜欢在月亮升起的时候去森林里玩。", imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop" },
        { pageNumber: 3, text: "小兔子最喜欢的事情，就是在月亮升起的时候，去森林里找星星玩。星星们住在很高很高的天上，眨着眼睛，就像一盏盏小灯笼。", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop" },
        { pageNumber: 4, text: "\"星星星星，你们今晚要去哪里玩呀？\"小兔子轻轻地问。星星们眨眨眼睛说：\"今晚我们一起去小宝贝的梦里玩！\"", imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop" },
        { pageNumber: 5, text: "小兔子听了，好羡慕呀。它也想和小宝贝一起玩。就在这时，一阵温柔的风吹过，轻轻地对小兔子说：\"快去吧，小宝贝已经做好梦的准备了。\"", imageUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=800&fit=crop" },
        { pageNumber: 6, text: "小兔子轻轻地走进了小宝贝的梦里。它们一起在云朵上跳舞，在星星间捉迷藏，开心极了。", imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=800&fit=crop" },
        { pageNumber: 7, text: "小宝贝睡得好香好香，嘴角露出了甜甜的笑容。小兔子轻轻地趴在小宝贝的枕头边，也闭上了眼睛。", imageUrl: "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800&h=800&fit=crop" },
        { pageNumber: 8, text: "月亮轻轻地说：\"晚安小宝贝，晚安小兔子。做个好梦，明天见。\"星星们眨眨眼睛，也在旁边安静地睡着了。", imageUrl: "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&h=800&fit=crop" },
      ] as StoryPage[],
    };
    setStory(demoStory as any);
  };

  const handleShare = () => setShowShare(true);
  const handleGenerateVideo = () => setShowVideo(true);

  // 旧版HTML下载（保留兼容）
  const handleDownload = async () => {
    if (!story) return;
    try {
      const res = await fetch("/api/story/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: story.title, childName: story.childName, pages: story.pages }),
      });
      if (!res.ok) throw new Error("下载失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${story.title}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("下载失败，请重试");
    }
  };

  const getShareText = () => {
    const childNameText = story?.childName || "孩子";
    return `给孩子生成了一本专属绘本，太惊喜了！

故事里叫着${childNameText}的名字，连喜欢的恐龙都变成了好朋友！孩子一听就知道"这是我呀！"

#睡前故事 #AI绘本 #育儿好物 #是我呀`;
  };
  const shareText = getShareText();

  // ============ 下载功能1：高清图片 ============
  const downloadImagesWithText = async () => {
    if (!story) return;
    setShowDownloadOptions(false);
    setExportStatus("正在生成图片...");
    setIsGeneratingPDF(true);

    try {
      for (let i = 0; i < story.pages.length; i++) {
        const page = story.pages[i];
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d")!;

        // 背景
        ctx.fillStyle = "#fff8f0";
        ctx.fillRect(0, 0, 1024, 1024);

        // 图片（上方70%区域）
        if (page.imageUrl) {
          try {
            const img = await loadImageViaProxy(page.imageUrl);
            const maxW = 900, maxH = 640;
            const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;
            const x = (1024 - w) / 2;
            const y = 50;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 16);
            ctx.clip();
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
          } catch {
            // 图片加载失败，画占位
            ctx.fillStyle = "#f3f4f6";
            ctx.fillRect(62, 50, 900, 640);
            ctx.fillStyle = "#9ca3af";
            ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif';
            ctx.textAlign = "center";
            ctx.fillText("图片加载失败", 512, 370);
          }
        }

        // 文字（下方30%区域）
        ctx.fillStyle = "#fff8f0";
        ctx.fillRect(0, 710, 1024, 314);
        ctx.fillStyle = "#333333";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = '32px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
        drawWrappedText(ctx, page.text || "", 512, 730, 900, 44, 5);

        // 页码
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "20px sans-serif";
        ctx.fillText(`${i + 1} / ${story.pages.length}`, 512, 990);

        // 下载
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${story.title}_${i + 1}.png`;
        link.click();

        // 间隔避免浏览器拦截
        if (i < story.pages.length - 1) {
          setExportStatus(`正在生成图片 ${i + 2}/${story.pages.length}...`);
          await new Promise(r => setTimeout(r, 600));
        }
      }
    } catch (err) {
      console.error("图片下载失败:", err);
      alert("图片下载失败，请重试");
    } finally {
      setIsGeneratingPDF(false);
      setExportStatus("");
    }
  };

  // ============ 下载功能2：PDF绘本 ============
  const downloadPDF = async () => {
    if (!story) return;
    setShowDownloadOptions(false);
    setExportStatus("正在生成PDF...");
    setIsGeneratingPDF(true);

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = 297;
      const pageHeight = 210;

      for (let i = 0; i < story.pages.length; i++) {
        if (i > 0) pdf.addPage();

        const page = story.pages[i];
        const isCoverOrBack = i === 0 || i === story.pages.length - 1;

        // 创建Canvas渲染这一页（中文用Canvas原生渲染，不存在乱码问题）
        const canvas = document.createElement("canvas");
        canvas.width = 1440;
        canvas.height = 1018; // A4横向比例 297:210 ≈ 1.414:1
        const ctx = canvas.getContext("2d")!;

        // 背景
        ctx.fillStyle = isCoverOrBack ? "#fff5eb" : "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 图片（上方65%区域）
        if (page.imageUrl) {
          try {
            const img = await loadImageViaProxy(page.imageUrl);
            const maxW = canvas.width - 80;
            const maxH = canvas.height * 0.6;
            const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;
            const x = (canvas.width - w) / 2;
            const y = 25;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 12);
            ctx.clip();
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
          } catch {
            ctx.fillStyle = "#f3f4f6";
            ctx.fillRect(40, 25, canvas.width - 80, canvas.height * 0.6);
          }
        }

        // 文字（下方35%区域）
        ctx.fillStyle = "#333333";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        if (isCoverOrBack) {
          ctx.font = 'bold 52px "PingFang SC", "Microsoft YaHei", sans-serif';
          drawWrappedText(ctx, page.text || "", canvas.width / 2, canvas.height * 0.67, canvas.width - 160, 64, 3);
          // 副标题
          if (i === 0 && story.childName) {
            ctx.font = '36px "PingFang SC", "Microsoft YaHei", sans-serif';
            ctx.fillStyle = "#666666";
            ctx.fillText(`${story.childName} 的专属绘本`, canvas.width / 2, canvas.height * 0.82);
          }
        } else {
          ctx.font = '34px "PingFang SC", "Microsoft YaHei", sans-serif';
          drawWrappedText(ctx, page.text || "", canvas.width / 2, canvas.height * 0.67, canvas.width - 160, 46, 5);
        }

        // 页码
        if (!isCoverOrBack) {
          ctx.fillStyle = "#cccccc";
          ctx.font = '20px sans-serif';
          ctx.fillText(`${i + 1} / ${story.pages.length}`, canvas.width / 2, canvas.height - 22);
        }

        // AI标注
        ctx.fillStyle = "#dddddd";
        ctx.font = '14px sans-serif';
        ctx.fillText("AI Generated Content | AI生成内容  itsmebook.com", canvas.width / 2, canvas.height - 6);

        // 将Canvas转为JPEG添加到PDF（整页铺满，无需中文字体）
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

        setExportStatus(`正在生成PDF ${i + 1}/${story.pages.length}...`);
      }

      pdf.save(`${story.title}.pdf`);
    } catch (err) {
      console.error("PDF生成失败:", err);
      alert("PDF生成失败，请重试");
    } finally {
      setIsGeneratingPDF(false);
      setExportStatus("");
    }
  };

  // ============ 下载功能3：有声视频 ============
  const exportVideo = useCallback(async () => {
    if (!story || !story.pages || story.pages.length === 0) return;

    setShowDownloadOptions(false);
    setIsExportingVideo(true);
    setVideoExportProgress(0);
    setExportStatus("准备导出视频...");

    try {
      const pages = story.pages;

      // ====== 第1步：预渲染所有页面到Canvas ======
      setExportStatus("正在渲染画面...");
      const pageCanvases: HTMLCanvasElement[] = [];
      for (let i = 0; i < pages.length; i++) {
        const pc = document.createElement("canvas");
        pc.width = 1080;
        pc.height = 1080;
        const pctx = pc.getContext("2d")!;

        // 温暖背景
        pctx.fillStyle = "#FFF5EB";
        pctx.fillRect(0, 0, 1080, 1080);

        // 图片（上方78%，通过代理加载解决CORS）
        if (pages[i].imageUrl) {
          try {
            const img = await loadImageViaProxy(pages[i].imageUrl);
            const imgMaxH = 1080 * 0.78;
            const scale = Math.min(1080 / img.naturalWidth, imgMaxH / img.naturalHeight);
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;
            const x = (1080 - w) / 2;
            const y = (imgMaxH - h) / 2;
            pctx.drawImage(img, x, y, w, h);
          } catch {
            pctx.fillStyle = "#f3f4f6";
            pctx.fillRect(0, 0, 1080, 1080 * 0.78);
          }
        }

        // 文字区域（下方22%）
        pctx.fillStyle = "rgba(255,255,255,0.95)";
        pctx.fillRect(0, 1080 * 0.78, 1080, 1080 * 0.22);
        pctx.fillStyle = "#333";
        pctx.textAlign = "center";
        pctx.textBaseline = "top";
        pctx.font = '30px "PingFang SC", "Microsoft YaHei", sans-serif';
        drawWrappedText(pctx, pages[i].text || "", 540, 1080 * 0.78 + 20, 960, 42, 4);

        // 页码
        pctx.font = "18px sans-serif";
        pctx.fillStyle = "#aaa";
        pctx.fillText(`${i + 1} / ${pages.length}`, 540, 1060);
        // 品牌
        pctx.font = "14px sans-serif";
        pctx.fillStyle = "#ccc";
        pctx.fillText("itsmebook.com", 540, 20);

        pageCanvases.push(pc);
        setVideoExportProgress(Math.round(((i + 1) / pages.length) * 20));
      }

      // ====== 第2步：预生成TTS音频URL ======
      setExportStatus("正在生成配音...");
      setVideoExportProgress(22);
      const audioUrls: (string | null)[] = new Array(pages.length).fill(null);
      for (let i = 0; i < pages.length; i++) {
        try {
          const ttsRes = await fetch("/api/voice/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: pages[i].text }),
          });
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            if (ttsData.success && ttsData.audioUrl) audioUrls[i] = ttsData.audioUrl;
          }
        } catch {}
        setVideoExportProgress(22 + Math.round(((i + 1) / pages.length) * 18));
      }

      // ====== 第3步：录制视频+音频 ======
      setExportStatus("正在录制视频...");
      setVideoExportProgress(42);

      const recordCanvas = document.createElement("canvas");
      recordCanvas.width = 1080;
      recordCanvas.height = 1080;
      const recordCtx = recordCanvas.getContext("2d")!;

      // 创建AudioContext用于音频录制
      const audioCtx = new AudioContext();
      await audioCtx.resume();
      const audioDest = audioCtx.createMediaStreamDestination();

      // 合并视频流和音频流
      const videoStream = recordCanvas.captureStream(1);
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);

      // 选择最佳格式
      let mimeType = "video/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) mimeType = "video/mp4;codecs=avc1";
        else if (MediaRecorder.isTypeSupported("video/mp4")) mimeType = "video/mp4";
        else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) mimeType = "video/webm;codecs=vp9,opus";
        else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) mimeType = "video/webm;codecs=vp8,opus";
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordingDone = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };
        recorder.onerror = () => reject(new Error("MediaRecorder error"));
      });

      recorder.start(1000);

      // ====== 第4步：逐页播放 ======
      for (let i = 0; i < pages.length; i++) {
        recordCtx.drawImage(pageCanvases[i], 0, 0);
        setVideoExportProgress(45 + Math.round((i / pages.length) * 50));
        setExportStatus(`正在录制第 ${i + 1}/${pages.length} 页...`);

        if (audioUrls[i]) {
          // 有音频：播放Audio元素，用createMediaElementSource捕获到录制流
          try {
            const audio = new Audio(audioUrls[i]!);
            const source = audioCtx.createMediaElementSource(audio);
            source.connect(audioDest);
            source.connect(audioCtx.destination);

            await new Promise<void>((resolve) => {
              audio.oncanplaythrough = () => {
                audio.play().then(resolve).catch(resolve);
              };
              audio.onerror = () => resolve();
              setTimeout(resolve, 5000); // 超时5秒
            });

            // 等音频播完
            await new Promise<void>((resolve) => {
              audio.onended = () => resolve();
              setTimeout(resolve, 15000); // 保底15秒
            });
          } catch {
            await new Promise(r => setTimeout(r, 5000));
          }
        } else {
          // 没音频：默认5秒
          await new Promise(r => setTimeout(r, 5000));
        }
      }

      // 停止录制
      setVideoExportProgress(96);
      recorder.stop();
      const videoBlob = await recordingDone;
      audioCtx.close();

      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${story.title}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      setVideoExportProgress(100);
      setExportStatus("");
      setIsExportingVideo(false);
    } catch (err) {
      console.error("视频导出失败:", err);
      setIsExportingVideo(false);
      setExportStatus("");
      alert("视频导出失败，请重试");
    }
  }, [story]);

  // ============ UI事件处理 ============

  const handleDownloadClick = () => setShowDownloadOptions(true);

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert("已复制到剪贴板！");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title || "是我呀-专属绘本",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("分享失败:", err);
        }
      }
    } else {
      copyToClipboard();
    }
  };

  // ============ 渲染 ============

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 播放器 */}
      <StoryPlayer
        pages={story.pages}
        title={story.title}
        childName={story.childName}
        voiceAudioUrl={story.voiceUrl || undefined}
        onShare={handleShare}
        onGenerateVideo={handleGenerateVideo}
        isFreeUser={isFreeUser}
        onDownload={handleDownloadClick}
      />

      {/* 分享弹窗 */}
      {showShare && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">分享故事</h3>
              <button onClick={() => setShowShare(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-2">一键分享</p>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{shareText}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={handleNativeShare} className="flex-1 py-2.5 rounded-xl bg-primary-orange text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享
                </button>
                <button onClick={copyToClipboard} className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制文案
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">分享到朋友圈，可解锁1个免费完整故事</p>
          </div>
        </div>
      )}

      {/* 魔法视频弹窗 */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">保存故事卡片</h3>
              <button onClick={() => setShowVideo(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MagicVideoGenerator pages={story.pages} title={story.title} childName={story.childName} voiceAudioUrl={story.voiceUrl || undefined} />
          </div>
        </div>
      )}

      {/* 下载选项弹窗 */}
      {showDownloadOptions && !isExportingVideo && !isGeneratingPDF && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowDownloadOptions(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">保存方式</h3>
              <button onClick={() => setShowDownloadOptions(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {/* 1. 带文字的高清图片 */}
              <button onClick={downloadImagesWithText} className="w-full py-4 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl flex items-center gap-3 hover:opacity-90 transition-opacity active:scale-[0.98]">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🖼️</div>
                <div className="text-left">
                  <p className="font-bold">下载高清图片</p>
                  <p className="text-sm text-white/70">每页图片+文字合成</p>
                </div>
              </button>
              {/* 2. PDF绘本 */}
              <button onClick={downloadPDF} className="w-full py-4 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center gap-3 hover:opacity-90 transition-opacity active:scale-[0.98]">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">📄</div>
                <div className="text-left">
                  <p className="font-bold">下载PDF绘本</p>
                  <p className="text-sm text-white/70">A4横向，可直接打印</p>
                </div>
              </button>
              {/* 3. 有声视频 */}
              <button onClick={exportVideo} className="w-full py-4 px-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-2xl flex items-center gap-3 hover:opacity-90 transition-opacity active:scale-[0.98]">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🎬</div>
                <div className="text-left">
                  <p className="font-bold">导出有声视频</p>
                  <p className="text-sm text-white/70">配音+字幕+翻页动画</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF生成中弹窗 */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <h3 className="font-bold text-gray-900 text-lg mb-2">正在生成</h3>
            <p className="text-sm text-gray-500">{exportStatus || "请稍候..."}</p>
          </div>
        </div>
      )}

      {/* 视频导出中弹窗 */}
      {isExportingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#video-grad)" strokeWidth="6" strokeDasharray={`${videoExportProgress * 2.83} 283`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                <defs>
                  <linearGradient id="video-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-700">{videoExportProgress}%</span>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">正在导出视频</h3>
            <p className="text-sm text-gray-500">{exportStatus || "请稍候，不要关闭页面"}</p>
          </div>
        </div>
      )}
    </>
  );
}
