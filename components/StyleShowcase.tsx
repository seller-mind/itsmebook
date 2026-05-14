"use client";

import { useState } from "react";

// 绘本风格数据
const BOOK_STYLES = [
  {
    id: "watercolor",
    name: "水彩风格",
    description: "柔和的色彩，轻盈的笔触",
    emoji: "🎨",
    color: "from-pink-200 to-purple-200",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
  },
  {
    id: "oil",
    name: "油画风格",
    description: "浓郁的色彩，厚重的质感",
    emoji: "🖼️",
    color: "from-amber-200 to-orange-200",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
  },
  {
    id: "anime",
    name: "日系动漫",
    description: "明亮的色彩，可爱的角色",
    emoji: "✨",
    color: "from-blue-200 to-cyan-200",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop",
  },
  {
    id: "chinese",
    name: "国风水墨",
    description: "淡雅的色彩，古典的韵味",
    emoji: "🖌️",
    color: "from-green-200 to-teal-200",
    image: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400&h=300&fit=crop",
  },
  {
    id: "pastoral",
    name: "温暖田园",
    description: "柔和的色彩，温馨的氛围",
    emoji: "🌻",
    color: "from-yellow-200 to-green-200",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop",
  },
  {
    id: "fantasy",
    name: "梦幻童话",
    description: "绚丽的色彩，魔法般的场景",
    emoji: "🌈",
    color: "from-purple-200 to-pink-200",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=300&fit=crop",
  },
  {
    id: "minimalist",
    name: "简约现代",
    description: "干净的线条，大胆的配色",
    emoji: "⬜",
    color: "from-gray-200 to-slate-200",
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop",
  },
  {
    id: "nordic",
    name: "北欧极简",
    description: "清新的色彩，简洁的构图",
    emoji: "❄️",
    color: "from-sky-200 to-indigo-200",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop",
  },
];

export default function StyleShowcase() {
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  return (
    <section id="styles" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区 */}
        <div className="text-center mb-16">
          <span className="text-primary-orange font-medium mb-4 block">
            ✨ 多种风格可选
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            找到属于你的绘本风格
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            从水彩到油画，从日系到国风，8种精心设计的绘本风格
            <br />
            让每一本绘本都独一无二
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
                    alt={style.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* 内容 */}
                <div className="relative p-4 md:p-6 h-48 md:h-64 flex flex-col justify-end">
                  <span className="text-3xl md:text-4xl mb-2">{style.emoji}</span>
                  <h3 className="text-white font-bold text-lg md:text-xl mb-1">
                    {style.name}
                  </h3>
                  <p className="text-white/80 text-sm hidden sm:block">
                    {style.description}
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
        <div className="text-center mt-12">
          <p className="text-gray-500">
            更多风格持续更新中...
            <span className="ml-2">🎉</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// 导出风格列表供其他组件使用
export const BOOK_STYLES_DATA = BOOK_STYLES;
