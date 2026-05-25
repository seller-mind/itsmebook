"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StoryPlayer, { StoryPage } from "@/components/story/StoryPlayer";
import MagicVideoGenerator from "@/components/story/MagicVideoGenerator";

export default function StoryPlayerPage() {
  const router = useRouter();
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

  // 加载故事数据
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 优先从sessionStorage读取，fallback到localStorage（防返回丢失）
    let storyStr = sessionStorage.getItem("bedtime_story");
    if (!storyStr) {
      storyStr = localStorage.getItem("itsmebook_last_story");
      if (storyStr) {
        // 从localStorage恢复到sessionStorage
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
    // 演示故事数据
    const demoStory = {
      title: "小宝贝的睡前故事",
      childName: "小宝贝",
      voiceUrl: "",
      pages: [
        {
          pageNumber: 1,
          text: "夜幕降临，月亮慢慢爬上了天空。小宝贝躺在床上，闭上眼睛，听妈妈讲今晚的故事。",
          imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 2,
          text: "从前，在一片美丽的大森林里，住着一只小白兔。它的毛色雪白雪白的，眼睛亮晶晶的，最喜欢在月亮升起的时候去森林里玩。",
          imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 3,
          text: "小兔子最喜欢的事情，就是在月亮升起的时候，去森林里找星星玩。星星们住在很高很高的天上，眨着眼睛，就像一盏盏小灯笼。",
          imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 4,
          text: "\"星星星星，你们今晚要去哪里玩呀？\"小兔子轻轻地问。星星们眨眨眼睛说：\"今晚我们一起去小宝贝的梦里玩！\"",
          imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 5,
          text: "小兔子听了，好羡慕呀。它也想和小宝贝一起玩。就在这时，一阵温柔的风吹过，轻轻地对小兔子说：\"快去吧，小宝贝已经做好梦的准备了。\"",
          imageUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 6,
          text: "小兔子轻轻地走进了小宝贝的梦里。它们一起在云朵上跳舞，在星星间捉迷藏，开心极了。",
          imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 7,
          text: "小宝贝睡得好香好香，嘴角露出了甜甜的笑容。小兔子轻轻地趴在小宝贝的枕头边，也闭上了眼睛。",
          imageUrl: "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 8,
          text: "月亮轻轻地说：\"晚安小宝贝，晚安小兔子。做个好梦，明天见。\"星星们眨眨眼睛，也在旁边安静地睡着了。",
          imageUrl: "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&h=800&fit=crop",
        },
      ] as StoryPage[],
    };
    setStory(demoStory as any);
  };

  const handleShare = () => {
    setShowShare(true);
  };

  const handleGenerateVideo = () => {
    setShowVideo(true);
  };

  // 下载绘本（付费用户）
  const handleDownload = async () => {
    if (!story) return;
    try {
      const res = await fetch("/api/story/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title,
          childName: story.childName,
          pages: story.pages,
        }),
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

  // 分享文案
  const getShareText = () => {
    const childNameText = story?.childName || "孩子";
    return `给孩子生成了一本专属绘本，太惊喜了！

故事里叫着${childNameText}的名字，连喜欢的恐龙都变成了好朋友！孩子一听就知道"这是我呀！"

#睡前故事 #AI绘本 #育儿好物 #是我呀`;
  };

  const shareText = getShareText();

  // ============ 视频导出功能 ============
  const exportVideo = useCallback(async () => {
    if (!story || !story.pages || story.pages.length === 0) return;
    
    setIsExportingVideo(true);
    setVideoExportProgress(0);
    
    try {
      // Canvas设置：9:16 竖屏格式
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;
      
      // 检查浏览器是否支持 MediaRecorder
      const stream = canvas.captureStream(1); // 1fps
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${story.title}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExportingVideo(false);
        setShowDownloadOptions(false);
        alert('视频已保存！如需其他格式可使用视频转换工具。');
      };
      
      recorder.onerror = () => {
        setIsExportingVideo(false);
        alert('视频导出失败，请重试');
      };

      recorder.start();
      
      const pages = story.pages;
      const SECONDS_PER_PAGE = 5; // 每页停留5秒
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        setVideoExportProgress(Math.round((i / pages.length) * 90));
        
        // 绘制背景
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a3e');
        gradient.addColorStop(1, '#2d1b4e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制星星装饰
        for (let s = 0; s < 20; s++) {
          const sx = Math.random() * canvas.width;
          const sy = Math.random() * canvas.height * 0.6;
          const sr = Math.random() * 3 + 1;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // 加载并绘制图片
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = page.imageUrl;
            // 超时处理
            setTimeout(resolve, 5000);
          });
          
          if (img.complete && img.naturalWidth > 0) {
            const imgPadding = 60;
            const imgMaxW = canvas.width - imgPadding * 2;
            const imgMaxH = canvas.height * 0.55;
            const scale = Math.min(imgMaxW / img.naturalWidth, imgMaxH / img.naturalHeight);
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;
            const x = (canvas.width - w) / 2;
            const y = 200;
            
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 24);
            ctx.clip();
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
          }
        } catch {
          // 图片加载失败，用渐变背景代替
          const imgGradient = ctx.createLinearGradient(0, 200, 0, 1256);
          imgGradient.addColorStop(0, '#4a3f6b');
          imgGradient.addColorStop(1, '#2d2a4a');
          ctx.fillStyle = imgGradient;
          ctx.fillRect(60, 200, canvas.width - 120, canvas.height * 0.55 - 200);
        }
        
        // 绘制文字区域渐变遮罩
        const textGradient = ctx.createLinearGradient(0, canvas.height * 0.65, 0, canvas.height);
        textGradient.addColorStop(0, 'rgba(0,0,0,0)');
        textGradient.addColorStop(0.3, 'rgba(0,0,0,0.5)');
        textGradient.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = textGradient;
        ctx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.35);
        
        // 绘制文字
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // 自动换行处理
        const maxWidth = canvas.width - 160;
        const lineHeight = 60;
        const fontSize = 42;
        ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
        
        const chars = page.text.split('');
        let lines: string[] = [];
        let currentLine = '';
        
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
        
        // 绘制文字行
        let textY = canvas.height * 0.7;
        for (const line of lines.slice(0, 6)) { // 最多6行
          ctx.fillText(line, canvas.width / 2, textY);
          textY += lineHeight;
        }
        
        // 绘制页码
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '28px "PingFang SC", sans-serif';
        ctx.fillText(`${i + 1} / ${pages.length}`, canvas.width / 2, canvas.height - 80);
        
        // 绘制品牌
        ctx.fillStyle = 'rgba(255,217,61,0.8)';
        ctx.font = 'bold 32px "PingFang SC", sans-serif';
        ctx.fillText('📖 是我呀', canvas.width / 2, canvas.height - 130);
        
        // 等待该页时长
        await new Promise(resolve => setTimeout(resolve, SECONDS_PER_PAGE * 1000));
      }
      
      setVideoExportProgress(95);
      recorder.stop();
    } catch (err) {
      console.error('视频导出失败:', err);
      setIsExportingVideo(false);
      alert('视频导出失败，请重试');
    }
  }, [story]);
  
  // 下载选项处理
  const handleDownloadClick = () => {
    setShowDownloadOptions(true);
  };
  
  const handleDownloadHTML = async () => {
    if (!story) return;
    setShowDownloadOptions(false);
    try {
      const res = await fetch("/api/story/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title,
          childName: story.childName,
          pages: story.pages,
        }),
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

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert("已复制到剪贴板！");
    }
  };

  // 使用Web Share API分享（支持移动端原生分享）
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title || "是我呀-专属绘本",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // 用户取消分享
        if ((err as Error).name !== "AbortError") {
          console.error("分享失败:", err);
        }
      }
    } else {
      // 不支持Web Share API时，复制文案
      copyToClipboard();
    }
  };

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
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowShare(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full sm:max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">分享故事</h3>
              <button
                onClick={() => setShowShare(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 一键分享 */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-2">一键分享</p>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {shareText}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleNativeShare}
                  className="flex-1 py-2.5 rounded-xl bg-primary-orange text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制文案
                </button>
              </div>
            </div>

            {/* 分享解锁提示 */}
            <p className="text-xs text-gray-400 text-center mt-4">
              分享到朋友圈，可解锁1个免费完整故事
            </p>
          </div>
        </div>
      )}

      {/* 魔法视频弹窗 */}
      {showVideo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">保存故事卡片</h3>
              <button
                onClick={() => setShowVideo(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MagicVideoGenerator
              pages={story.pages}
              title={story.title}
              childName={story.childName}
              voiceAudioUrl={story.voiceUrl || undefined}
            />
          </div>
        </div>
      )}

      {/* 下载选项弹窗 */}
      {showDownloadOptions && !isExportingVideo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowDownloadOptions(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full sm:max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">保存方式</h3>
              <button
                onClick={() => setShowDownloadOptions(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={exportVideo}
                className="w-full py-4 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl flex items-center gap-3 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold">导出视频</p>
                  <p className="text-sm text-white/70">生成短视频，适合分享到朋友圈</p>
                </div>
              </button>
              
              <button
                onClick={handleDownloadHTML}
                className="w-full py-4 px-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-2xl flex items-center gap-3 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold">下载绘本</p>
                  <p className="text-sm text-white/70">离线HTML文件，可添加到手机桌面</p>
                </div>
              </button>
            </div>
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
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#video-grad)"
                  strokeWidth="6"
                  strokeDasharray={`${videoExportProgress * 2.83} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
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
            <p className="text-sm text-gray-500">
              正在处理第 {Math.round((videoExportProgress / 100) * story.pages.length)} / {story.pages.length} 页
            </p>
            <p className="text-xs text-gray-400 mt-2">请稍候，不要关闭页面</p>
          </div>
        </div>
      )}
    </>
  );
}
