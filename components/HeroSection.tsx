"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

export default function HeroSection() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { isLoaded } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClick = () => {
    if (isSignedIn) {
      router.push("/create");
    } else {
      router.push("/#start-creating");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 漂浮的星星 */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              fontSize: `${12 + Math.random() * 16}px`,
            }}
          >
            ⭐
          </div>
        ))}
        
        {/* 云朵装饰 */}
        <div className="absolute top-20 left-10 text-6xl opacity-30 cloud-float">
          ☁️
        </div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 cloud-float" style={{ animationDelay: '2s' }}>
          ☁️
        </div>
        <div className="absolute bottom-40 left-1/4 text-4xl opacity-25 cloud-float" style={{ animationDelay: '4s' }}>
          ☁️
        </div>
      </div>

      {/* 主内容 */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        {/* 主标题 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-gradient">你的孩子</span>
          <br />
          <span className="text-gray-900">就是绘本的主角</span>
        </h1>

        {/* 副标题 */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          用AI为您的孩子创作独一无二的专属绘本
          <br className="hidden sm:block" />
          上传照片，选择风格，几分钟就能拥有一本专属故事书
        </p>

        {/* CTA按钮 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleStartClick}
            disabled={isLoading}
            className="btn-primary text-lg px-10 py-4 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                加载中...
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>开始制作</span>
              </>
            )}
          </button>
          <a
            href="#features"
            className="btn-outline text-lg px-8 py-4 flex items-center gap-2"
          >
            <span>了解更多</span>
            <span>↓</span>
          </a>
        </div>

        {/* 统计数据 */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { number: "10,000+", label: "家庭选择" },
            { number: "8-12页", label: "精美绘本" },
            { number: "3分钟", label: "快速生成" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-orange">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base text-gray-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 向下滚动提示 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a href="#features" className="text-gray-400 hover:text-primary-orange transition-colors">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
