"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/HeroSection";
import StyleShowcase from "@/components/StyleShowcase";
import ProcessSteps from "@/components/ProcessSteps";
import ChildConsentModal from "@/components/ChildConsentModal";

export default function HomePage() {
  const router = useRouter();
  const [showConsent, setShowConsent] = useState(false);

  // Plan B: 所有用户都可以直接进入创建流程
  const handleStartCreating = () => {
    setShowConsent(true);
  };

  const handleConsentConfirm = () => {
    setShowConsent(false);
    router.push("/create");
  };

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Features / Process */}
      <ProcessSteps />

      {/* Style Showcase */}
      <StyleShowcase />

      {/* Sample Books Section */}
      <section id="start-creating" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-orange font-medium mb-4 block">
              📚 作品展示
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              看看其他小朋友的绘本
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              每一个故事都是独一无二的
              <br />
              也许下一个就是您孩子的故事
            </p>
          </div>

          {/* Sample Book Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "小明的太空探险",
                style: "水彩风格",
                author: "小明妈妈",
                cover: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=500&fit=crop",
              },
              {
                title: "莉莉的魔法花园",
                style: "梦幻童话",
                author: "莉莉爸爸",
                cover: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=500&fit=crop",
              },
              {
                title: "天天交朋友",
                style: "日系动漫",
                author: "天天爷爷",
                cover: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&h=500&fit=crop",
              },
            ].map((book, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-600 mb-2">
                      {book.style}
                    </span>
                    <h3 className="text-white font-bold text-lg">
                      {book.title}
                    </h3>
                    <p className="text-white/80 text-sm">by {book.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-orange to-secondary-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            给孩子做一本专属绘本吧 📚
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            用AI技术，把孩子的照片变成一个温馨有趣的故事
            <br />
            留下最珍贵的童年回忆
          </p>
          <button
            onClick={handleStartCreating}
            className="bg-white text-primary-orange font-bold text-lg px-12 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            🚀 立即开始制作
          </button>
          <p className="text-white/70 text-sm mt-6">
            限时免费体验2次，满意再购买
          </p>
        </div>
      </section>

      {/* 儿童信息保护弹窗 */}
      <ChildConsentModal
        isOpen={showConsent}
        onConfirm={handleConsentConfirm}
        onCancel={() => setShowConsent(false)}
      />
    </>
  );
}
