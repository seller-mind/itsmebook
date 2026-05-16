"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

interface HeroSectionProps {
  lang: string;
}

export default function HeroSection({ lang }: HeroSectionProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClick = () => {
    router.push(`/${lang}/create`);
  };

  return (
    <section className="relative flex items-center justify-center overflow-hidden gradient-hero pt-16 pb-12">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        {/* 主标题 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-gradient">{t('hero.title1')}</span>
          <br />
          <span className="text-gray-900">{t('hero.title2')}</span>
        </h1>

        {/* 副标题 */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle1')}
          <br className="hidden sm:block" />
          {t('hero.subtitle2')}
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
                {t('common.loading')}
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>{t('common.startCreating')}</span>
              </>
            )}
          </button>
          <a
            href={`/${lang}/#features`}
            className="btn-outline text-lg px-8 py-4 flex items-center gap-2"
          >
            <span>{t('common.learnMore')}</span>
            <span>↓</span>
          </a>
        </div>

        {/* 统计数据 */}
        <div className="mt-10 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { number: t('hero.stat1Number'), label: t('hero.stat1Label') },
            { number: t('hero.stat2Number'), label: t('hero.stat2Label') },
            { number: t('hero.stat3Number'), label: t('hero.stat3Label') },
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

    </section>
  );
}
