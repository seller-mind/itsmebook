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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const whiteNoiseRef = useRef<HTMLAudioElement | null>(null);
  const totalPages = pages.length;

  // 初始化音频
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      whiteNoiseRef.current = new Audio();
      whiteNoiseRef.current.loop = true;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (whiteNoiseRef.current) {
        whiteNoiseRef.current.pause();
      }
      if (sleepTimer) {
        clearTimeout(sleepTimer);
      }
    };
  }, []);

  // 播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // 如果有语音URL，播放语音
      if (voiceAudioUrl) {
        audioRef.current.src = voiceAudioUrl;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  // 翻页
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
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
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop";
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
          <p className="text-gray-700 leading-relaxed text-base text-center font-serif">
            {currentPageData.text}
          </p>
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
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
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
