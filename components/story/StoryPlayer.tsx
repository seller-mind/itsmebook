"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl: string;
  audioUrl?: string;
}

interface StoryPlayerProps {
  pages: StoryPage[];
  title: string;
  childName: string;
  voiceAudioUrl?: string;
  onShare?: () => void;
  onGenerateVideo?: () => void;
}

export default function StoryPlayer({
  pages,
  title,
  childName,
  voiceAudioUrl,
  onShare,
  onGenerateVideo,
}: StoryPlayerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [bedtimeMode, setBedtimeMode] = useState(false);
  const [bedtimeMinutes, setBedtimeMinutes] = useState(15);
  const [showBedtimeSet, setShowBedtimeSet] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<NodeJS.Timeout | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [showStoryEnd, setShowStoryEnd] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimer, setControlsTimer] = useState<NodeJS.Timeout | null>(null);

  // TTS音频URL缓存：pageIndex -> audioUrl
  const audioCacheRef = useRef<Record<number, string>>({});
  // 预创建的Audio元素缓存：pageIndex -> HTMLAudioElement（已加载好，随时可play）
  const audioElementCacheRef = useRef<Record<number, HTMLAudioElement>>({});
  // 正在预加载的页
  const preloadingRef = useRef<Set<number>>(new Set());
  // 所有活跃的Audio元素，用于彻底清理
  const activeAudiosRef = useRef<Set<HTMLAudioElement>>(new Set());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const whiteNoiseRef = useRef<HTMLAudioElement | null>(null);
  const totalPages = pages.length;
  // 用ref跟踪播放状态，避免闭包陷阱
  const isPlayingRef = useRef(false);
  const currentPageRef = useRef(0);

  // 同步ref
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  // 彻底清理所有音频
  const cleanupAllAudio = useCallback(() => {
    // 停止所有活跃的Audio元素
    activeAudiosRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.oncanplay = null;
      audio.onended = null;
      audio.onerror = null;
      audio.src = "";
    });
    activeAudiosRef.current.clear();
    currentAudioRef.current = null;

    // 停止Web Speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // 只停当前播放的音频（翻页用）
  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current.oncanplay = null;
      currentAudioRef.current.onended = null;
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.src = "";
      activeAudiosRef.current.delete(currentAudioRef.current);
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // 初始化
  useEffect(() => {
    if (typeof window !== "undefined") {
      whiteNoiseRef.current = new Audio();
      whiteNoiseRef.current.loop = true;
    }
    return () => {
      cleanupAllAudio();
      if (whiteNoiseRef.current) {
        whiteNoiseRef.current.pause();
      }
      if (sleepTimer) {
        clearTimeout(sleepTimer);
      }
    };
  }, [sleepTimer, cleanupAllAudio]);

  // 预加载单页TTS音频并创建Audio元素
  const preloadPageAudio = useCallback(async (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    if (audioCacheRef.current[pageIndex]) return; // 已有URL缓存
    if (preloadingRef.current.has(pageIndex)) return; // 正在加载

    preloadingRef.current.add(pageIndex);
    try {
      const pageText = pages[pageIndex].text;
      const customVoiceId = sessionStorage.getItem("bedtime_voice_id");

      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pageText,
          voice: customVoiceId || undefined,
        }),
      });
      const data = await res.json();

      if (data.success && data.audioUrl) {
        audioCacheRef.current[pageIndex] = data.audioUrl;
        // 立即创建Audio元素并预加载，翻页时可直接play
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = data.audioUrl;
        audio.volume = volume;
        // 缓存Audio元素
        audioElementCacheRef.current[pageIndex] = audio;
      }
    } catch {
      // 预加载失败，播放时再处理
    } finally {
      preloadingRef.current.delete(pageIndex);
    }
  }, [pages, totalPages, volume]);

  // 一次性预加载所有页面的TTS音频
  const preloadAllPages = useCallback(() => {
    for (let i = 0; i < totalPages; i++) {
      if (!audioCacheRef.current[i] && !preloadingRef.current.has(i)) {
        preloadPageAudio(i);
      }
    }
  }, [totalPages, preloadPageAudio]);

  // 播放指定页的TTS音频（优先用已缓存的Audio元素，实现瞬间播放）
  const playPageAudio = useCallback(async (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= totalPages) return;

    // 先停止当前音频
    stopCurrentAudio();

    const pageText = pages[pageIndex].text;

    // 优先使用已预创建的Audio元素（翻页即播的关键）
    const cachedAudio = audioElementCacheRef.current[pageIndex];
    if (cachedAudio) {
      cachedAudio.currentTime = 0;
      cachedAudio.volume = volume;
      activeAudiosRef.current.add(cachedAudio);
      currentAudioRef.current = cachedAudio;

      cachedAudio.onended = () => {
        activeAudiosRef.current.delete(cachedAudio);
        if (isPlayingRef.current && currentPageRef.current === pageIndex && pageIndex < totalPages - 1) {
          setTimeout(() => {
            if (isPlayingRef.current) {
              const next = pageIndex + 1;
              setCurrentPage(next);
            }
          }, 800);
        } else if (pageIndex >= totalPages - 1) {
          setIsPlaying(false);
          setShowStoryEnd(true);
        }
      };

      cachedAudio.onerror = () => {
        activeAudiosRef.current.delete(cachedAudio);
        delete audioElementCacheRef.current[pageIndex];
        delete audioCacheRef.current[pageIndex];
        playWithWebSpeech(pageText, pageIndex);
      };

      try {
        await cachedAudio.play();
      } catch {
        activeAudiosRef.current.delete(cachedAudio);
        playWithWebSpeech(pageText, pageIndex);
      }
      return;
    }

    // 没有缓存的Audio元素，检查URL缓存
    let audioUrl = audioCacheRef.current[pageIndex];

    if (!audioUrl) {
      setIsAudioLoading(true);
      try {
        const customVoiceId = sessionStorage.getItem("bedtime_voice_id");

        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: pageText,
            voice: customVoiceId || undefined,
          }),
        });
        const data = await res.json();

        if (data.success && data.audioUrl) {
          audioUrl = data.audioUrl;
          audioCacheRef.current[pageIndex] = audioUrl;
        } else {
          setIsAudioLoading(false);
          playWithWebSpeech(pageText, pageIndex);
          return;
        }
      } catch {
        setIsAudioLoading(false);
        playWithWebSpeech(pageText, pageIndex);
        return;
      }
      setIsAudioLoading(false);
    }

    if (!audioUrl) {
      playWithWebSpeech(pageText, pageIndex);
      return;
    }

    // 用URL创建Audio播放，同时缓存Audio元素
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    activeAudiosRef.current.add(audio);
    currentAudioRef.current = audio;
    audioElementCacheRef.current[pageIndex] = audio;

    audio.oncanplay = () => {
      if (currentPageRef.current !== pageIndex) {
        audio.pause();
        activeAudiosRef.current.delete(audio);
        return;
      }
      try {
        audio.play().catch(() => {
          cleanupAllAudio();
          playWithWebSpeech(pageText, pageIndex);
        });
      } catch {
        cleanupAllAudio();
        playWithWebSpeech(pageText, pageIndex);
      }
    };

    audio.onended = () => {
      activeAudiosRef.current.delete(audio);
      if (isPlayingRef.current && currentPageRef.current === pageIndex && pageIndex < totalPages - 1) {
        setTimeout(() => {
          if (isPlayingRef.current) {
            const next = pageIndex + 1;
            setCurrentPage(next);
          }
        }, 800);
      } else if (pageIndex >= totalPages - 1) {
        setIsPlaying(false);
        setShowStoryEnd(true);
      }
    };

    audio.onerror = () => {
      activeAudiosRef.current.delete(audio);
      delete audioElementCacheRef.current[pageIndex];
      delete audioCacheRef.current[pageIndex];
      stopCurrentAudio();
      playWithWebSpeech(pageText, pageIndex);
    };
  }, [pages, totalPages, volume, stopCurrentAudio, cleanupAllAudio]);

  // Web Speech API降级方案
  const playWithWebSpeech = useCallback((text: string, pageIndex: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.volume = volume;

    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes("zh"));
    if (zhVoice) utterance.voice = zhVoice;

    utterance.onend = () => {
      if (isPlayingRef.current && currentPageRef.current === pageIndex && pageIndex < totalPages - 1) {
        setTimeout(() => {
          if (isPlayingRef.current) {
            const next = pageIndex + 1;
            setCurrentPage(next);
          }
        }, 800);
      } else if (pageIndex >= totalPages - 1) {
        setIsPlaying(false);
        setShowStoryEnd(true);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [volume, totalPages]);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      cleanupAllAudio();
      setIsPlaying(false);
    } else {
      setShowStoryEnd(false);
      setIsPlaying(true);
      // 立即播放当前页
      playPageAudio(currentPage);
      // 预加载所有页面TTS（翻页即播的关键）
      preloadAllPages();
    }
  }, [isPlaying, currentPage, cleanupAllAudio, playPageAudio, preloadAllPages]);

  // 翻页
  const goToPage = useCallback((page: number) => {
    stopCurrentAudio();
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(newPage);
    setShowStoryEnd(false);

    if (isPlayingRef.current) {
      playPageAudio(newPage);
      preloadAllPages();
    }
  }, [totalPages, stopCurrentAudio, playPageAudio, preloadAllPages]);

  // ====== 滑动翻页 ======
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // 水平滑动距离 > 50px，垂直偏移不超过水平的一半，且在500ms内完成
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaTime < 500) {
      if (deltaX < 0 && currentPage < totalPages - 1) {
        // 左滑 → 下一页
        goToPage(currentPage + 1);
      } else if (deltaX > 0 && currentPage > 0) {
        // 右滑 → 上一页
        goToPage(currentPage - 1);
      }
    }

    touchStartRef.current = null;
  }, [currentPage, totalPages, goToPage]);

  // 睡前模式
  const startBedtimeMode = useCallback((minutes: number) => {
    setBedtimeMode(true);
    setBedtimeMinutes(minutes);
    setShowBedtimeSet(false);
    setRemainingTime(minutes * 60);

    if (whiteNoiseRef.current) {
      whiteNoiseRef.current.src = "/sounds/rain.mp3";
      whiteNoiseRef.current.volume = 0.3;
      whiteNoiseRef.current.play().catch(() => {});
    }

    const timer = setTimeout(() => {
      stopBedtimeMode();
    }, minutes * 60 * 1000);
    setSleepTimer(timer);

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopBedtimeMode = () => {
    setBedtimeMode(false);
    setRemainingTime(null);
    if (sleepTimer) {
      clearTimeout(sleepTimer);
      setSleepTimer(null);
    }
    if (whiteNoiseRef.current) {
      whiteNoiseRef.current.pause();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 点击屏幕切换控制条
  const toggleControls = useCallback(() => {
    setShowControls(prev => {
      if (!prev) {
        // 显示控制条，3秒后自动隐藏
        if (controlsTimer) clearTimeout(controlsTimer);
        const t = setTimeout(() => setShowControls(false), 3000);
        setControlsTimer(t);
      } else {
        if (controlsTimer) clearTimeout(controlsTimer);
      }
      return !prev;
    });
  }, [controlsTimer]);

  // 播放时自动隐藏控制条
  useEffect(() => {
    if (isPlaying && showControls) {
      if (controlsTimer) clearTimeout(controlsTimer);
      const t = setTimeout(() => setShowControls(false), 3000);
      setControlsTimer(t);
    }
    return () => {
      if (controlsTimer) clearTimeout(controlsTimer);
    };
  }, [isPlaying]);

  const currentPageData = pages[currentPage];

  return (
    <div
      className="fixed inset-0 z-50 bg-black select-none"
      onClick={toggleControls}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 全屏绘本画面 */}
      <img
        src={currentPageData.imageUrl}
        alt={`第${currentPage + 1}页`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (!img.dataset.fallbackUsed) {
            img.dataset.fallbackUsed = "true";
            const colors = [
              ["#2c1810", "#1a1a2e", "#0f3460"],
              ["#1a1a2e", "#16213e", "#0f3460"],
              ["#0f3460", "#1a1a2e", "#2c1810"],
              ["#16213e", "#0f3460", "#1a1a2e"],
              ["#2c1810", "#0f3460", "#16213e"],
            ];
            const c = colors[currentPage % colors.length];
            const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='${c[0]}'/><stop offset='50%25' stop-color='${c[1]}'/><stop offset='100%25' stop-color='${c[2]}'/></linearGradient></defs><rect width='1080' height='1920' fill='url(#g)'/><text x='540' y='960' font-size='200' text-anchor='middle' dominant-baseline='middle'>🌙</text></svg>`;
            img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
          }
        }}
      />

      {/* 底部渐变遮罩（文字区域） */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)",
        height: "55%",
      }} />

      {/* 页码指示器 */}
      <div className={`absolute left-0 right-0 flex items-center justify-center gap-1.5 transition-all duration-300 ${showControls ? "bottom-[280px]" : "bottom-[200px]"}`} style={{ pointerEvents: "auto" }}>
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); goToPage(i); }}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentPage ? "w-5 bg-white" : i < currentPage ? "w-2.5 bg-white/50" : "w-2.5 bg-white/25"
            }`}
          />
        ))}
      </div>

      {/* 故事文字 */}
      <div className={`absolute left-0 right-0 px-6 transition-all duration-300 ${showControls ? "bottom-[200px]" : "bottom-[120px]"}`}>
        {isAudioLoading ? (
          <div className="flex items-center justify-center py-2">
            <svg className="w-5 h-5 animate-spin text-white/70 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white/70 text-sm">正在生成语音...</span>
          </div>
        ) : showStoryEnd ? (
          <div className="text-center py-2">
            <p className="text-3xl mb-2">🌙</p>
            <p className="text-white/90 leading-relaxed text-lg text-center font-wenkai">故事讲完了，晚安🌙</p>
          </div>
        ) : (
          <p className="text-white/95 leading-relaxed text-lg text-center font-wenkai" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {currentPageData.text}
          </p>
        )}
      </div>

      {/* 控制条（自动隐藏） */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-10 pb-6 px-6 transition-all duration-300 ${showControls ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: showControls ? "auto" : "none" }}
      >
        {/* 播放控制 */}
        <div className="flex items-center justify-center gap-8 mb-4">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} className="p-2 rounded-full disabled:opacity-30 transition-all">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </button>
          <button onClick={togglePlay} className="p-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all active:scale-95">
            {isAudioLoading ? (
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1} className="p-2 rounded-full disabled:opacity-30 transition-all">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>

        {/* 底部功能行 */}
        <div className="flex items-center justify-between">
          <button onClick={() => history.back()} className="flex items-center gap-1 text-white/60 hover:text-white/90 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="text-xs">返回</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => { setVolume(parseFloat(e.target.value)); if (currentAudioRef.current) currentAudioRef.current.volume = parseFloat(e.target.value); }} className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white" />
            </div>
            <button onClick={() => bedtimeMode ? stopBedtimeMode() : setShowBedtimeSet(!showBedtimeSet)} className="text-xs text-white/60 hover:text-white/90 transition-colors">
              {bedtimeMode ? `🌙 ${formatTime(remainingTime || 0)}` : "🌙 睡前"}
            </button>
            <button onClick={onShare} className="text-xs text-white/60 hover:text-white/90 transition-colors">分享</button>
          </div>
        </div>

        {/* 睡前模式时间选择 */}
        {showBedtimeSet && (
          <div className="flex gap-2 mt-3">
            {[5, 10, 15, 30].map((min) => (
              <button key={min} onClick={() => startBedtimeMode(min)} className="flex-1 py-2 rounded-full border border-white/30 text-white/80 text-xs hover:bg-white/10 transition-colors">{min}分钟</button>
            ))}
          </div>
        )}
      </div>

      {/* 顶部信息条（自动隐藏） */}
      <div className={`absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent pb-6 px-4 pt-3 transition-all duration-300 ${showControls ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white/80 font-medium text-sm">{title}</span>
            <span className="text-white/50 text-xs">第 {currentPage + 1} / {totalPages} 页</span>
          </div>
          <button onClick={onGenerateVideo} className="text-white/60 hover:text-white/90 text-xs transition-colors">📷 卡片</button>
        </div>
      </div>
    </div>
  );
