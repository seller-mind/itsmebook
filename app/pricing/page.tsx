"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "trial",
    name: "体验版",
    price: "¥9.9",
    period: "/本",
    description: "首次体验优选",
    features: [
      "1本绘本",
      "20页内容",
      "标准图片质量",
      "在线预览",
    ],
    buttonText: "立即体验",
    popular: false,
    badge: null,
  },
  {
    id: "standard",
    name: "标准版",
    price: "¥19.9",
    period: "/本",
    description: "最受欢迎",
    features: [
      "1本绘本",
      "20页内容",
      "标准图片质量",
      "在线预览",
      "下载保存",
    ],
    buttonText: "立即购买",
    popular: true,
    badge: null,
  },
  {
    id: "premium",
    name: "精制版",
    price: "¥29.9",
    period: "/本",
    description: "追求最佳画质",
    features: [
      "1本绘本",
      "20页内容",
      "高清Pro图片质量",
      "在线预览",
      "下载保存",
    ],
    buttonText: "立即购买",
    popular: false,
    badge: "Pro画质",
  },
  {
    id: "monthly",
    name: "月卡",
    price: "¥59.9",
    period: "/月",
    description: "高频用户首选",
    features: [
      "每月4本绘本",
      "20页/本",
      "标准图片质量",
      "在线预览",
      "下载保存",
    ],
    buttonText: "开通月卡",
    popular: false,
    badge: "省40%",
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handlePlanClick = (planId: string) => {
    // 付费功能暂未开放
    alert("支付功能即将上线，敬请期待！");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-orange font-medium mb-4 block">
            💎 简单透明定价
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            选择适合您的方案
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            按需选择，无隐藏费用
            <br />
            随时购买，随时使用
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col ${
                  plan.popular ? "ring-4 ring-primary-orange" : ""
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="bg-primary-orange text-white text-center py-2 font-medium">
                    ⭐ 最受欢迎
                  </div>
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}

                {/* Content */}
                <div className={`p-6 flex-1 ${plan.popular ? "pt-4" : ""}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handlePlanClick(plan.id)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? "bg-primary-orange text-white hover:bg-primary-dark shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-center text-gray-400 text-sm mt-12">
            所有绘本均为AI生成，仅供参考娱乐
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: "🔒", text: "安全加密" },
              { icon: "💳", text: "支付宝支付" },
              { icon: "📱", text: "移动端可用" },
              { icon: "💬", text: "在线客服" },
            ].map((badge, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-3xl mb-2">{badge.icon}</span>
                <span className="text-gray-600 text-sm">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-orange to-secondary-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            让孩子爱上阅读
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            AI打造专属绘本，开启奇妙故事之旅
          </p>
          <button
            onClick={() => router.push("/create")}
            className="bg-white text-primary-orange font-bold text-lg px-12 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            🚀 立即免费开始
          </button>
        </div>
      </section>
    </div>
  );
}
