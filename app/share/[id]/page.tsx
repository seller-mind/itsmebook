"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

// 绘本页面类型
interface BookPage {
  page_number: number;
  text: string;
  image_prompt: string;
  image_url: string;
  audio_url?: string;
}

// 绘本类型
interface Book {
  id: string;
  title: string;
  character_name: string;
  character_age: number;
  theme: string;
  style: string;
  pages: BookPage[];
  created_at: string;
}

export default function SharePage() {
  const params = useParams();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 加载绘本数据
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        
        // 从Supabase获取绘本
        const response = await fetch(`/api/share/${bookId}`);
        
        if (!response.ok) {
          throw new Error("绘本不存在或已过期");
        }
        
        const data = await response.json();
        setBook(data.book);
      } catch (err: any) {
        console.error("加载绘本失败:", err);
        setError(err.message || "加载失败");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // 播放当前页配音
  useEffect(() => {
    if (!book || !isPlaying) return;

    const currentPageData = book.pages[currentPage];
    if (!currentPageData?.audio_url) {
      // 没有配音，自动翻页
      pageTimerRef.current = setTimeout(() => {
        if (currentPage < book.pages.length - 1) {
          setCurrentPage(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 4000);
    } else {
      // 有配音，播放配音
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(currentPageData.audio_url);
      audioRef.current = audio;
      
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };

      audio.ontimeupdate = () => {
        setAudioProgress(audio.currentTime);
      };

      audio.onended = () => {
        // 配音播放完毕，等待1秒后翻页
        pageTimerRef.current = setTimeout(() => {
          if (currentPage < book.pages.length - 1) {
            setCurrentPage(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        }, 1000);
      };

      audio.play().catch(console.error);
    }

    return () => {
      if (pageTimerRef.current) {
        clearTimeout(pageTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [book, currentPage, isPlaying]);

  // 停止播放
  const stopPlaying = () => {
    setIsPlaying(false);
    if (pageTimerRef.current) {
      clearTimeout(pageTimerRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // 上一页
  const prevPage = () => {
    stopPlaying();
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // 下一页
  const nextPage = () => {
    stopPlaying();
    if (book && currentPage < book.pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // 播放/暂停
  const togglePlay = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      setIsPlaying(true);
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在加载绘本...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">绘本不存在</h1>
          <p className="text-gray-500">{error || "链接已过期或不存在"}</p>
          <a 
            href="/"
            className="mt-6 inline-block px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            创建新绘本
          </a>
        </div>
      </div>
    );
  }

  const currentPageData = book.pages[currentPage];
  const isCover = currentPage === 0;
  const isEnd = currentPage === book.pages.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900 truncate">{book.title}</h1>
            <p className="text-xs text-gray-500">主角：{book.character_name}</p>
          </div>
          <a 
            href="/"
            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
          >
            📖 创作我的
          </a>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 绘本卡片 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* 图片区域 */}
          <div className="relative aspect-square bg-gray-100">
            <img
              src={currentPageData.image_url || "/placeholder.png"}
              alt={`第${currentPage + 1}页`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/800x800/FFB6C1/ffffff?text=Page+${currentPage + 1}`;
              }}
            />
            
            {/* AI生成标注 */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
              <span>✨</span>
              <span>AI生成</span>
            </div>

            {/* 页码 */}
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
              {currentPage + 1} / {book.pages.length}
            </div>
          </div>

          {/* 文字区域 */}
          <div className="p-6 min-h-[120px] flex flex-col justify-center">
            <p className={`text-gray-800 leading-relaxed ${isCover ? 'text-center text-lg font-medium' : ''}`}>
              {currentPageData.text}
            </p>
          </div>

          {/* 音频进度条（如果有配音） */}
          {currentPageData.audio_url && isPlaying && (
            <div className="px-6 pb-4">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 transition-all"
                  style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
              currentPage === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white shadow-md text-gray-700 hover:bg-orange-50"
            }`}
          >
            ‹
          </button>

          <button
            onClick={togglePlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
              isPlaying
                ? "bg-red-500 text-white shadow-lg"
                : "bg-orange-500 text-white shadow-lg hover:bg-orange-600"
            }`}
          >
            {isPlaying ? "⏸️" : "▶️"}
          </button>

          <button
            onClick={nextPage}
            disabled={isEnd}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
              isEnd
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white shadow-md text-gray-700 hover:bg-orange-50"
            }`}
          >
            ›
          </button>
        </div>

        {/* 页面指示器 */}
        <div className="mt-6 flex justify-center gap-1.5">
          {book.pages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                stopPlaying();
                setCurrentPage(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPage
                  ? "bg-orange-500 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* 品牌标注 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            由 <a href="/" className="text-orange-500 hover:underline">是我呀</a> AI 绘本生成
          </p>
        </div>
      </div>
    </div>
  );
}
