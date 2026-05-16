"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

interface StyleShowcaseProps {
  lang: string;
}

// 绘本风格数据
const BOOK_STYLES = [
  {
    id: "watercolor",
    emoji: "🎨",
    color: "from-pink-200 to-purple-200",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
  },
  {
    id: "oil",
    emoji: "🖼️",
    color: "from-amber-200 to-orange-200",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
  },
  {
    id: "chinese",
    emoji: "🖌️",
    color: "from-green-200 to-teal-200",
    image: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400&h=300&fit=crop",
  },
  {
    id: "fantasy",
    emoji: "🌈",
    color: "from-purple-200 to-pink-200",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop",
  },
  {
    id: "pastoral",
    emoji: "🌻",
    color: "from-yellow-200 to-green-200",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop",
  },
  {
    id: "anime",
    emoji: "✨",
    color: "from-blue-200 to-cyan-200",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop",
  },
  {
    id: "minimalist",
    emoji: "⬜",
    color: "from-gray-200 to-slate-200",
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop",
  },
  {
    id: "nordic",
    emoji: "❄️",
    color: "from-sky-200 to-indigo-200",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop",
  },
];

export default function StyleShowcase({ lang }: StyleShowcaseProps) {
  const { t } = useLanguage();
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  return (
    <section id="styles" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <span className="text-primary-orange font-medium mb-4 block">
            {t('styles.sectionTag')}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('styles.sectionTitle')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('styles.sectionDesc1')}
            <br />
            {t('styles.sectionDesc2')}
          </p>
        </div>

        {/* 风格网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {BOOK_STYLES.map((style) => (
            <div
              key={style.id}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredStyle(style.id)}
              onMouseLeave={() => setHoveredStyle(null)}
            >
              {/* 卡片容器 */}
              <div
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 transform ${
                  hoveredStyle === style.id
                    ? "scale-105 shadow-2xl z-10"
                    : "shadow-lg"
                }`}
              >
                {/* 背景图片 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${style.color}`}>
                  <img
                    src={style.image}
                    alt={t(`styles.${style.id}`)}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* 内容 */}
                <div className="relative p-4 md:p-6 h-48 md:h-64 flex flex-col justify-end">
                  <span className="text-3xl md:text-4xl mb-2">{style.emoji}</span>
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1">
                    {t(`styles.${style.id}`)}
                  </h3>
                  <p className="text-white/80 text-sm hidden sm:block">
                    {t(`styles.${style.id}Desc`)}
                  </p>
                </div>

                {/* 悬停时的边框效果 */}
                <div
                  className={`absolute inset-0 rounded-2xl border-4 border-white/50 transition-opacity ${
                    hoveredStyle === style.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-8">
          <p className="text-gray-500">
            {t('styles.moreComing')}
            <span className="ml-2">🎉</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// 导出风格列表供其他组件使用
export const BOOK_STYLES_DATA = BOOK_STYLES;
