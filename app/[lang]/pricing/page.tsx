"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { PLAN_CONFIGS } from "@/lib/plan-config";

export default function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t } = useLanguage();
  const router = useRouter();

  const handlePlanClick = (planId: string) => {
    // 跳转到创建页面
    router.push(`/${lang}/create`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-orange font-medium mb-4 block">
            💎 {t('pricing.simplePricing')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
            <br />
            {t('pricing.subtitle2')}
            <br />
            {t('pricing.subtitle3')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Trial */}
            <div
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
            >
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {t('payment.trial')}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('pricing.experienceFirst')}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ¥9.9
                  </span>
                  <span className="text-gray-500">/{t('payment.creditsUnit')}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature4')}</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handlePlanClick('trial')}
                  className="w-full py-3 rounded-xl font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {t('pricing.trialBtn')}
                </button>
              </div>
            </div>

            {/* Standard */}
            <div
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col ${
                true ? "ring-4 ring-primary-orange" : ""
              }`}
            >
              <div className="bg-primary-orange text-white text-center py-2 font-medium">
                ⭐ {t('pricing.mostPopular')}
              </div>

              <div className="p-6 flex-1 pt-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {t('payment.standard')}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('pricing.mostPopular').replace('⭐ ', '')}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ¥19.9
                  </span>
                  <span className="text-gray-500">/{t('payment.creditsUnit')}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature5')}</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handlePlanClick('standard')}
                  className="w-full py-3 rounded-xl font-semibold transition-all bg-primary-orange text-white hover:bg-primary-dark shadow-lg"
                >
                  {t('pricing.standardBtn')}
                </button>
              </div>
            </div>

            {/* Pro */}
            <div
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
            >
              <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                {t('payment.proQuality')}
              </div>

              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {t('payment.pro')}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('pricing.bestQuality')}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ¥29.9
                  </span>
                  <span className="text-gray-500">/{t('payment.creditsUnit')}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature6')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature5')}</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handlePlanClick('pro')}
                  className="w-full py-3 rounded-xl font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {t('pricing.premiumBtn')}
                </button>
              </div>
            </div>

            {/* Monthly */}
            <div
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col"
            >
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                {t('payment.save45')}
              </div>

              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {t('payment.monthly')}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('pricing.frequentUser')}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ¥99
                  </span>
                  <span className="text-gray-500">/30{t('payment.days') || '天'}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature7')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature8')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 text-sm">{t('pricing.feature5')}</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handlePlanClick('monthly')}
                  className="w-full py-3 rounded-xl font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {t('pricing.monthlyBtn')}
                </button>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-gray-400 text-sm mt-12">
            {t('pricing.aiDisclaimer')}
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">🔒</span>
              <span className="text-gray-600 text-sm">{t('pricing.security')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">💳</span>
              <span className="text-gray-600 text-sm">{t('pricing.alipay')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">📱</span>
              <span className="text-gray-600 text-sm">{t('pricing.mobileSupport')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-2">💬</span>
              <span className="text-gray-600 text-sm">{t('pricing.customerService')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-orange to-secondary-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('pricing.ctaTitle')}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('pricing.ctaDesc')}
          </p>
          <button
            onClick={() => router.push(`/${lang}/create`)}
            className="bg-white text-primary-orange font-bold text-lg px-12 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            {t('pricing.ctaBtn')}
          </button>
        </div>
      </section>
    </div>
  );
}
