"use client";

import { useState } from "react";

export interface BookPageData {
  pageNumber: number;
  text: string;
  imageUrl: string;
}

interface BookViewerProps {
  pages: BookPageData[];
  title: string;
  characterName: string;
  onDownload?: () => void;
  onShare?: () => void;
  onRegenerate?: () => void;
}

export default function BookViewer({
  pages,
  title,
  characterName,
  onDownload,
  onShare,
  onRegenerate,
}: BookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalPages = pages.length;

  // 翻页动画
  const handlePageFlip = (direction: "next" | "prev") => {
    if (isFlipping) return;

    setIsFlipping(true);

    if (direction === "next" && currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }

    setTimeout(() => setIsFlipping(false), 600);
  };

  // 键盘控制
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      handlePageFlip("next");
    } else if (e.key === "ArrowLeft") {
      handlePageFlip("prev");
    }
  };

  const currentPageData = pages[currentPage];

  return (
    <div
      className={`bg-gray-100 rounded-2xl overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">
            第 {currentPage + 1} / {totalPages} 页
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="下载PDF (会员)"
            >
              📥
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="分享"
            >
              📤
            </button>
          )}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="重新生成"
            >
              🔄
            </button>
          )}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? "退出全屏" : "全屏"}
          >
            {isFullscreen ? "✖️" : "📺"}
          </button>
        </div>
      </div>

      {/* 绘本内容区 */}
      <div className="relative flex items-center justify-center min-h-[500px] lg:min-h-[600px] bg-gradient-to-b from-amber-50 to-orange-50 p-4 lg:p-8">
        {/* 翻页容器 */}
        <div
          className={`relative w-full max-w-3xl aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden ${
            isFlipping ? "book-page" : ""
          }`}
        >
          {/* 插图区域 */}
          <div className="relative w-full h-[65%] bg-gray-100">
            <img
              src={currentPageData.imageUrl}
              alt={`第${currentPageData.pageNumber}页插图`}
              className="w-full h-full object-cover"
            />
            {/* 页码角标 */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-600 shadow">
              {currentPageData.pageNumber}
            </div>
            {/* AI生成标识 */}
            <div className="absolute top-4 left-4 bg-primary-orange/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white shadow flex items-center gap-1">
              <span>✨</span>
              <span>AI生成</span>
            </div>
          </div>

          {/* 文字区域 */}
          <div className="w-full h-[35%] p-4 lg:p-6 flex items-center justify-center">
            <p className="text-base lg:text-lg text-gray-700 text-center leading-relaxed max-w-lg font-medium">
              {currentPageData.text}
            </p>
          </div>
        </div>

        {/* 左右翻页按钮 */}
        <button
          onClick={() => handlePageFlip("prev")}
          disabled={currentPage === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl transition-all ${
            currentPage === 0
              ? "opacity-30 cursor-not-allowed"
              : "hover:scale-110 hover:shadow-xl"
          }`}
        >
          ←
        </button>
        <button
          onClick={() => handlePageFlip("next")}
          disabled={currentPage === totalPages - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl transition-all ${
            currentPage === totalPages - 1
              ? "opacity-30 cursor-not-allowed"
              : "hover:scale-110 hover:shadow-xl"
          }`}
        >
          →
        </button>
      </div>

      {/* 底部页码导航 */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                currentPage === index
                  ? "bg-primary-orange text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 操作提示 */}
      <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-500">
        使用 ← → 键或点击按钮翻页
      </div>
    </div>
  );
}
