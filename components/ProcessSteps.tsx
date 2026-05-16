"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface ProcessStepsProps {
  lang: string;
}

export default function ProcessSteps({ lang }: ProcessStepsProps) {
  const { t } = useLanguage();
  
  return (
    <section id="features" className="py-4 sm:py-8 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        {/* 标题 */}
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
          {t('process.title')}
        </h2>

        {/* 步骤流程 - 横向一行 */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
          <span className="bg-pink-100 text-pink-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
          <span className="text-xs sm:text-sm text-gray-700">{t('process.step1')}</span>
          <span className="text-gray-300">→</span>
          <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">2</span>
          <span className="text-xs sm:text-sm text-gray-700">{t('process.step2')}</span>
          <span className="text-gray-300">→</span>
          <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">3</span>
          <span className="text-xs sm:text-sm text-gray-700">{t('process.step3')}</span>
          <span className="text-gray-300">→</span>
          <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">4</span>
          <span className="text-xs sm:text-sm text-gray-700">{t('process.step4')}</span>
        </div>

        {/* 三个卖点 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow">
            <span className="text-lg sm:text-2xl block">⚡</span>
            <h4 className="font-semibold text-gray-900 text-[10px] sm:text-sm">{t('process.feature1Title')}</h4>
            <p className="text-[10px] sm:text-xs text-gray-400">{t('process.feature1Desc')}</p>
          </div>
          <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow">
            <span className="text-lg sm:text-2xl block">🎯</span>
            <h4 className="font-semibold text-gray-900 text-[10px] sm:text-sm">{t('process.feature2Title')}</h4>
            <p className="text-[10px] sm:text-xs text-gray-400">{t('process.feature2Desc')}</p>
          </div>
          <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow">
            <span className="text-lg sm:text-2xl block">💝</span>
            <h4 className="font-semibold text-gray-900 text-[10px] sm:text-sm">{t('process.feature3Title')}</h4>
            <p className="text-[10px] sm:text-xs text-gray-400">{t('process.feature3Desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
