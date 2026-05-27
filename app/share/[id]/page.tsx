"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

// 获取图片URL（Supabase Storage无需代理）
const getImageSrc = (url: string | null | undefined): string => {
  if (!url) return "";
  // Supabase Storage图片直接使用
  if (url.includes("sdeduzqplvsyttvnolxm.supabase.co")) return url;
  // 旧dashscope URL走代理
  if (url.includes("aliyuncs.com") || url.includes("dashscope")) {
    try {
      const b64 = btoa(url);
      return `/api/admin/image-proxy?b64=${encodeURIComponent(b64)}`;
    } catch {
      return url;
    }
  }
  return url;
};

// 绘本页面类型
interface BookPage {
  page_number: number;
  text: string;
  image_prompt?: string;
  image_url: string;
  imageUrl?: string;
  audio_url?: string;
  audioUrl?: string;
}

// 绘本类型
interface Book {
  id: string;
  title: string;
  character_name: string;
  character_age: number;
  theme?: string;
  style?: string;
  pages: BookPage[];
  created_at?: string;
}

// 从sessionStorage解析绘本数据
function parseSessionStorage(bookId: string): Book | null {
  try {
    const cachedStory = sessionStorage.getItem("bedtime_story");
    if (!cachedStory) return null;
    
    const parsed = JSON.parse(cachedStory);
    if (!parsed || !parsed.pages || parsed.pages.length === 0) return null;

    return {
      id: parsed.id || bookId,
      title: parsed.title || "我的绘本",
      character_name: parsed.childName || parsed.character_name || "",
      character_age: parsed.childAge || parsed.character_age || 5,
      theme: parsed.theme || "",
      style: parsed.style || "",
      pages: parsed.pages.map((p: any, i: number) => ({
        page_number: p.pageNumber || p.page_number || i + 1,
        text: p.text,
        image_prompt: p.image_prompt || "",
        image_url: p.imageUrl || p.image_url || "",
        audio_url: p.audioUrl || p.audio_url,
      })),
      created_at: parsed.createdAt || new Date().toISOString(),
    };
  } catch (e) {
    console.error("sessionStorage解析失败:", e);
    return null;
  }
}

// 基础版/精品版/孩子主角版/自由高阶版：纯图片翻页模式
function PlainBookView({ book, currentPage, setCurrentPage }: {
  book: Book;
  currentPage: number;
  setCurrentPage: (fn: number | ((prev: number) => number)) => void;
}) {
  const page = book.pages[currentPage];
  const isCover = currentPage === 0;
  const isEnd = currentPage === book.pages.length - 1;
  const totalPages = book.pages.length;

  const prevPage = () => setCurrentPage(p => typeof p === 'number' ? Math.max(0, p - 1) : Math.max(0, p - 1));
  const nextPage = () => setCurrentPage(p => typeof p === 'number' ? Math.min(totalPages - 1, p + 1) : Math.min(totalPages - 1, p + 1));

  const imageUrl = page?.image_url || page?.imageUrl || "";
  const showPlaceholder = !imageUrl || imageUrl.includes("placehold.co");

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate">{book.title}</h1>
            <p className="text-xs text-gray-500">主角：{book.character_name}</p>
          </div>
          <a href="/" className="ml-3 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors whitespace-nowrap">
            📖 创作我的
          </a>
        </div>
      </div>

      {/* 绘本内容 */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* 图片区域 */}
          <div className="relative aspect-square bg-gray-100">
            {!showPlaceholder ? (
              <img
                src={getImageSrc(imageUrl)}
                alt={`第${currentPage + 1}页`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.fallbackUsed) {
                    img.dataset.fallbackUsed = "true";
                    img.src = `https://placehold.co/800x800/FFB6C1/ffffff?text=Page+${currentPage + 1}`;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                <div className="text-center">
                  <div className="text-5xl mb-2">🖼️</div>
                  <p className="text-gray-400 text-sm">第{currentPage + 1}页</p>
                </div>
              </div>
            )}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
              <span>✨</span><span>AI生成</span>
            </div>
          </div>

          {/* 文字区域 */}
          <div className="p-6 min-h-[100px] flex flex-col justify-center">
            <p className={`text-gray-800 leading-relaxed ${isCover ? 'text-center text-lg font-medium' : ''}`}>
              {page?.text || ""}
            </p>
          </div>

          {/* 页码 */}
          <div className="px-6 pb-4 flex items-center justify-between">
            <span className="text-sm text-gray-400">{currentPage + 1} / {totalPages}</span>
            {!isCover && !isEnd && <span className="text-xs text-gray-300">左右滑动翻页</span>}
          </div>
        </div>

        {/* 翻页按钮 */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <button onClick={prevPage} disabled={currentPage === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${currentPage === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white shadow-md text-gray-700 hover:bg-orange-50 active:scale-95"}`}>
            ‹
          </button>
          <div className="text-lg font-bold text-orange-500">{currentPage + 1}</div>
          <button onClick={nextPage} disabled={isEnd}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isEnd ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white shadow-md text-gray-700 hover:bg-orange-50 active:scale-95"}`}>
            ›
          </button>
        </div>

        {/* 页面指示器 */}
        <div className="mt-4 flex justify-center gap-1.5">
          {book.pages.map((_, index) => (
            <button key={index} onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentPage ? "bg-orange-500 w-6" : "bg-gray-300 hover:bg-gray-400"}`} />
          ))}
        </div>

        {/* 品牌 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            由 <a href="/" className="text-orange-500 hover:underline">是我呀</a> AI 绘本生成
          </p>
        </div>
      </div>
    </div>
  );
}

// 有声版/亲子朗读版：带音频播放
function AudioBookView({ book, currentPage, setCurrentPage }: {
  book: Book;
  currentPage: number;
  setCurrentPage: (fn: number | ((prev: number) => number)) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pageTimerRef = useRef<NodeJS.Timeout | null>(null);

  const page = book.pages[currentPage];
  const isEnd = currentPage === book.pages.length - 1;
  const totalPages = book.pages.length;
  const audioUrl = page?.audio_url || page?.audioUrl;
  const hasAudio = !!audioUrl;

  // 播放当前页配音
  useEffect(() => {
    // 停止之前的
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (pageTimerRef.current) {
      clearTimeout(pageTimerRef.current);
      pageTimerRef.current = null;
    }

    if (!isPlaying || !hasAudio) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setAudioDuration(audio.duration);
    audio.ontimeupdate = () => setAudioProgress(audio.currentTime);
    audio.onended = () => {
      setAudioProgress(0);
      pageTimerRef.current = setTimeout(() => {
        setCurrentPage((prev: number) => {
          if (prev < totalPages - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1000);
    };
    audio.play().catch(console.error);

    return () => { audio.pause(); };
  }, [isPlaying, currentPage, hasAudio, audioUrl]);

  // 页面变化时停止播放
  useEffect(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioProgress(0);
  }, [currentPage]);

  const stopPlaying = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const prevPage = () => { stopPlaying(); setCurrentPage((p: number) => Math.max(0, p - 1)); };
  const nextPage = () => { stopPlaying(); setCurrentPage((p: number) => Math.min(totalPages - 1, p + 1)); };
  const togglePlay = () => { isPlaying ? stopPlaying() : setIsPlaying(true); };

  const imageUrl = page?.image_url || page?.imageUrl || "";
  const showPlaceholder = !imageUrl || imageUrl.includes("placehold.co");

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate">{book.title}</h1>
            <p className="text-xs text-gray-500">主角：{book.character_name} · 🎧 有声绘本</p>
          </div>
          <a href="/" className="ml-3 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors whitespace-nowrap">
            📖 创作我的
          </a>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* 图片 */}
          <div className="relative aspect-square bg-gray-100">
            {!showPlaceholder ? (
              <img
                src={getImageSrc(imageUrl)}
                alt={`第${currentPage + 1}页`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                <div className="text-center">
                  <div className="text-5xl mb-2">🖼️</div>
                  <p className="text-gray-400 text-sm">第{currentPage + 1}页</p>
                </div>
              </div>
            )}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
              {currentPage + 1} / {totalPages}
            </div>
          </div>

          {/* 文字 */}
          <div className="p-6 min-h-[100px] flex flex-col justify-center">
            <p className="text-gray-800 leading-relaxed">{page?.text || ""}</p>
          </div>

          {/* 音频进度条 */}
          {isPlaying && hasAudio && (
            <div className="px-6 pb-4">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 transition-all" style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={prevPage} disabled={currentPage === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${currentPage === 0 ? "bg-gray-200 text-gray-400" : "bg-white shadow-md text-gray-700 hover:bg-orange-50"}`}>
            ‹
          </button>
          <button onClick={togglePlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${isPlaying ? "bg-red-500 text-white shadow-lg" : "bg-orange-500 text-white shadow-lg hover:bg-orange-600"}`}>
            {isPlaying ? "⏸️" : "▶️"}
          </button>
          <button onClick={nextPage} disabled={isEnd}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isEnd ? "bg-gray-200 text-gray-400" : "bg-white shadow-md text-gray-700 hover:bg-orange-50"}`}>
            ›
          </button>
        </div>

        {/* 页面指示器 */}
        <div className="mt-6 flex justify-center gap-1.5">
          {book.pages.map((_, index) => (
            <button key={index} onClick={() => { stopPlaying(); setCurrentPage(index); }}
              className={`w-2 h-2 rounded-full transition-all ${index === currentPage ? "bg-orange-500 w-6" : "bg-gray-300 hover:bg-gray-400"}`} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            由 <a href="/" className="text-orange-500 hover:underline">是我呀</a> AI 绘本生成
          </p>
        </div>
      </div>
    </div>
  );
}

// 主页面
export default function SharePage() {
  const params = useParams();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // 判断是否有音频
  const hasAudio = book?.pages?.some(p => !!p.audio_url || !!p.audioUrl) ?? false;

  // 加载绘本数据
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);

        // 1. 优先从sessionStorage读取（个人中心跳转时数据已存入）
        const cachedBook = parseSessionStorage(bookId);
        if (cachedBook) {
          setBook(cachedBook);
          setLoading(false);
          return;
        }

        // 2. fallback: 从Supabase获取（分享链接场景）
        const response = await fetch(`/api/share/${bookId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("绘本不存在或已过期");
          throw new Error("加载失败");
        }
        const data = await response.json();
        if (!data.book) throw new Error("绘本数据为空");
        setBook(data.book);
      } catch (err: any) {
        console.error("加载绘本失败:", err);
        setError(err.message || "加载失败");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) fetchBook();
  }, [bookId]);

  // 加载中
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

  // 错误
  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">绘本不存在</h1>
          <p className="text-gray-500">{error || "链接已过期或不存在"}</p>
          <a href="/" className="mt-6 inline-block px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors">创建新绘本</a>
        </div>
      </div>
    );
  }

  // 有声版
  if (hasAudio) {
    return <AudioBookView book={book} currentPage={currentPage} setCurrentPage={setCurrentPage} />;
  }

  // 基础版/精品版/孩子主角版/自由高阶版：纯翻页
  return <PlainBookView book={book} currentPage={currentPage} setCurrentPage={setCurrentPage} />;
}
