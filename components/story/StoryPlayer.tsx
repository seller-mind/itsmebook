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

  const currentPageData = pages[currentPage];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base">{title}</h1>
            <p className="text-xs text-gray-500">第 {currentPage + 1} / {totalPages} 页</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="分享"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 绘本区域 - 支持滑动翻页 */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-4">
        {/* 绘本画面 - 添加touch事件 */}
        <div
          className="w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-xl bg-white select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <img
            src={currentPageData.imageUrl}
            alt={`第${currentPage + 1}页`}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.dataset.fallbackUsed) {
                img.dataset.fallbackUsed = "true";
                const gradients = [
                  ["#FFB6C1", "#FFC0CB", "#FF69B4"],
                  ["#87CEEB", "#ADD8E6", "#B0E0E6"],
                  ["#DDA0DD", "#EE82EE", "#DA70D6"],
                  ["#98FB98", "#90EE90", "#7CFC00"],
                  ["#F0E68C", "#EEE8AA", "#BDB76B"],
                ];
                const colors = gradients[currentPage % gradients.length];
                const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='${colors[0]}'/><stop offset='50%25' stop-color='${colors[1]}'/><stop offset='100%25' stop-color='${colors[2]}'/></linearGradient></defs><rect width='800' height='800' fill='url(#g)' rx='40'/><text x='400' y='420' font-size='180' text-anchor='middle' dominant-baseline='middle'>📖</text></svg>`;
                img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
              }
            }}
          />
        </div>

        {/* 页码指示器 */}
        <div className="flex items-center gap-1.5">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage
                  ? "w-6 bg-primary-orange"
                  : i < currentPage
                  ? "w-3 bg-orange-300"
                  : "w-3 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* 文字内容 */}
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md">
          {isAudioLoading ? (
            <div className="flex items-center justify-center py-4">
              <svg className="w-6 h-6 animate-spin text-primary-orange mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-500 text-sm">正在生成语音...</span>
            </div>
          ) : showStoryEnd ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🌙</p>
              <p className="text-gray-700 leading-relaxed text-base text-center font-wenkai">
                故事讲完了，晚安🌙
              </p>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed text-base text-center font-wenkai">
              {currentPageData.text}
            </p>
          )}
        </div>

        {/* 播放控制 */}
        <div className="w-full max-w-lg flex items-center justify-center gap-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="p-5 rounded-full bg-gradient-to-br from-primary-orange to-primary-dark shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            {isAudioLoading ? (
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* 音量控制 */}
        <div className="w-full max-w-lg flex items-center gap-3 px-2">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (currentAudioRef.current) {
                currentAudioRef.current.volume = parseFloat(e.target.value);
              }
            }}
            className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-orange"
          />
          <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* 睡前模式区域 */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <div>
              <p className="font-medium text-gray-900 text-sm">睡前模式</p>
              {bedtimeMode && remainingTime !== null && (
                <p className="text-xs text-primary-orange">
                  剩余 {formatTime(remainingTime)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bedtimeMode ? (
              <button
                onClick={stopBedtimeMode}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                关闭
              </button>
            ) : (
              <button
                onClick={() => setShowBedtimeSet(!showBedtimeSet)}
                className="text-xs text-primary-orange hover:text-primary-dark transition-colors"
              >
                开启
              </button>
            )}
          </div>
        </div>

        {showBedtimeSet && (
          <div className="flex gap-2">
            {[5, 10, 15, 30].map((min) => (
              <button
                key={min}
                onClick={() => startBedtimeMode(min)}
                className="flex-1 py-2 rounded-full border border-primary-orange text-primary-orange text-sm hover:bg-primary-orange hover:text-white transition-colors"
              >
                {min}分钟
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onGenerateVideo}
            className="flex-1 btn-secondary py-3 text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            生成分享视频
          </button>
          <button
            onClick={onShare}
            className="flex-1 btn-outline py-3 text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享故事
          </button>
        </div>
      </div>
    </div>
  );
}
