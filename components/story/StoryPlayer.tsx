"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl: string;
  audioUrl?: string; // 可选，该页对应的音频URL
}

interface StoryPlayerProps {
  pages: StoryPage[];
  title: string;
  childName: string;
  voiceAudioUrl?: string; // 克隆声音的音频URL
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
  const [volume, setVolume] = useState(0.8);
  const [bedtimeMode, setBedtimeMode] = useState(false);
  const [bedtimeMinutes, setBedtimeMinutes] = useState(15);
  const [showBedtimeSet, setShowBedtimeSet] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<NodeJS.Timeout | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [showStoryEnd, setShowStoryEnd] = useState(false);

  // Web Speech API 使用音量
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const whiteNoiseRef = useRef<HTMLAudioElement | null>(null);
  const totalPages = pages.length;
  
  // Web Speech API 相关
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 清理函数
  const cleanupSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    speechRef.current = null;
    setIsSpeaking(false);
  }, []);

  // 初始化音频
  useEffect(() => {
    if (typeof window !== "undefined") {
      whiteNoiseRef.current = new Audio();
      whiteNoiseRef.current.loop = true;
    }
    return () => {
      cleanupSpeech();
      if (whiteNoiseRef.current) {
        whiteNoiseRef.current.pause();
      }
      if (sleepTimer) {
        clearTimeout(sleepTimer);
      }
    };
  }, [sleepTimer, cleanupSpeech]);

  // Web Speech API 朗读函数
  const speakText = useCallback((text: string, pageIndex: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    // 清理之前的朗读
    cleanupSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8; // 慢一点，适合睡前
    utterance.pitch = 1.1; // 稍微柔和
    utterance.volume = volume;

    // 尝试选择中文语音
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(v => v.lang.includes("zh") && v.lang.includes("CN")) ||
                          voices.find(v => v.lang.includes("zh")) ||
                          voices[0];
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      
      // 朗读完毕，自动翻到下一页
      if (isPlaying && pageIndex < totalPages - 1) {
        speechTimerRef.current = setTimeout(() => {
          const nextPage = pageIndex + 1;
          setCurrentPage(nextPage);
          // 继续朗读下一页
          speakText(pages[nextPage].text, nextPage);
        }, 800); // 停顿一下再翻页
      } else if (pageIndex >= totalPages - 1) {
        // 最后一页读完了，显示"故事讲完了，晚安"
        setIsPlaying(false);
        setShowStoryEnd(true);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [volume, isPlaying, totalPages, pages, cleanupSpeech]);

  // 停止朗读
  const stopSpeaking = useCallback(() => {
    cleanupSpeech();
    setIsPlaying(false);
  }, [cleanupSpeech]);

  // 播放/暂停 - 统一使用Web Speech API朗读故事文字
  const togglePlay = () => {
    if (isPlaying) {
      // 暂停朗读
      stopSpeaking();
    } else {
      // 开始朗读当前页
      speakText(pages[currentPage].text, currentPage);
    }
  };

  // 翻页
  const goToPage = (page: number) => {
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(newPage);
    // 翻页时重置故事结束状态
    setShowStoryEnd(false);
  };

  // 睡前模式
  const startBedtimeMode = useCallback(
    (minutes: number) => {
      setBedtimeMode(true);
      setBedtimeMinutes(minutes);
      setShowBedtimeSet(false);
      setRemainingTime(minutes * 60);

      // 播放白噪音（轻柔雨声）
      if (whiteNoiseRef.current) {
        whiteNoiseRef.current.src = "/sounds/rain.mp3";
        whiteNoiseRef.current.volume = 0.3;
        whiteNoiseRef.current.play().catch(() => {});
      }

      // 定时关闭
      const timer = setTimeout(() => {
        stopBedtimeMode();
      }, minutes * 60 * 1000);
      setSleepTimer(timer);

      // 倒计时
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    },
    []
  );

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

      {/* 绘本区域 */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-4">
        {/* 绘本画面 */}
        <div className="w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-xl bg-white">
          <img
            src={currentPageData.imageUrl}
            alt={`第${currentPage + 1}页`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 图片加载失败时，显示主题色渐变背景而不是随机风景图
              const img = e.target as HTMLImageElement;
              if (!img.dataset.fallbackUsed) {
                img.dataset.fallbackUsed = "true";
                // 使用与页码相关的主题色渐变
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
          {showStoryEnd ? (
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
            {isPlaying ? (
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
            }}
            className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-orange"
          />
          <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* 睡前模式区域 */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-4 space-y-3">
        {/* 睡前模式开关 */}
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

        {/* 定时选择 */}
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

        {/* 底部按钮 */}
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
