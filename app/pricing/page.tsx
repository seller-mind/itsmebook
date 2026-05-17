"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "免费体验",
    price: "¥0",
    period: "",
    description: "试试看，觉得好再买",
    color: "from-gray-100 to-gray-200",
    ringColor: "",
    features: [
      "1个故事",
      "6页预览",
      "1次视频",
      "无睡前模式",
      "无声音克隆",
    ],
    included: [false, false, false, false, false],
    buttonText: "免费体验",
    buttonStyle: "outline" as const,
    badge: null,
  },
  {
    id: "monthly",
    name: "月卡",
    price: "¥99",
    period: "/月",
    description: "每天一个故事，每晚一份陪伴",
    color: "from-primary-orange to-primary-dark",
    ringColor: "ring-primary-orange",
    features: [
      "无限故事",
      "12页完整",
      "无限视频",
      "睡前模式",
      "声音克隆",
    ],
    included: [true, true, true, true, true],
    buttonText: "立即订阅",
    buttonStyle: "primary" as const,
    badge: "推荐",
  },
  {
    id: "yearly",
    name: "年卡",
    price: "¥699",
    period: "/年",
    description: "每天仅¥1.9，省¥489",
    color: "from-green-100 to-green-200",
    ringColor: "",
    features: [
      "无限故事",
      "12页完整",
      "无限视频",
      "睡前模式",
      "声音克隆",
    ],
    included: [true, true, true, true, true],
    buttonText: "省40%",
    buttonStyle: "outline" as const,
    badge: "划算",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") {
      router.push("/recording");
      return;
    }

    setLoading(planId);

    // 调用支付API
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        // 演示模式
        alert(`${planId === "monthly" ? "月卡" : "年卡"}支付功能正在配置中，敬请期待！`);
      }
    } catch {
      alert("支付功能正在配置中，敬请期待！");
    }

    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* 导航栏 */}
      <div className="px-4 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">返回</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">💫</span>
          <span className="font-bold text-gray-900">解锁更多魔法</span>
        </div>
        <div className="w-16" />
      </div>

      {/* 标题 */}
      <div className="px-4 pt-6 pb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          解锁更多睡前魔法
        </h1>
        <p className="text-gray-500">
          每天一个故事，每晚一份陪伴
        </p>
      </div>

      {/* 定价卡片 */}
      <div className="px-4 pb-16 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-br ${plan.color} rounded-3xl p-6 flex flex-col ${
                plan.ringColor ? `ring-2 ${plan.ringColor}` : ""
              }`}
            >
              {/* 徽章 */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs bg-primary-orange text-white px-3 py-1 rounded-full font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* 标题 */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
              </div>

              {/* 特性列表 */}
              <div className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {plan.included[i] ? (
                      <svg
                        className="w-4 h-4 text-green-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span
                      className={`text-sm ${
                        plan.included[i] ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* 按钮 */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.buttonStyle === "primary"
                    ? "bg-white text-primary-orange hover:bg-gray-100 shadow-lg"
                    : "border-2 border-gray-300 text-gray-700 hover:border-gray-400"
                } disabled:opacity-50`}
              >
                {loading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    处理中...
                  </span>
                ) : (
                  plan.buttonText
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 节日限定 */}
        <div className="mt-8 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl p-6 border border-rose-100">
          <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
            <span>🎂</span> 节日限定
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>生日特惠：购买月卡送1本定制生日故事书</p>
            <p>圣诞特惠：年卡8折 + 专属圣诞故事</p>
          </div>
        </div>

        {/* 支付方式 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-2">支付方式</p>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <span className="text-lg">💳</span>
            <span className="text-sm">微信支付</span>
            <span>·</span>
            <span className="text-lg">💰</span>
            <span className="text-sm">支付宝</span>
            <span>·</span>
            <span className="text-lg">🍎</span>
            <span className="text-sm">Apple Pay</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10 space-y-4">
          <h3 className="font-bold text-gray-900 text-center">常见问题</h3>
          {[
            {
              q: "订阅可以取消吗？",
              a: "可以随时取消，取消后当前周期内仍可使用，到期后不再续费。",
            },
            {
              q: "声音克隆安全吗？",
              a: "你的声音数据仅用于生成你的故事，不会用于任何其他用途，也不会分享给第三方。",
            },
            {
              q: "生成的绘本可以下载吗？",
              a: "付费用户可以下载完整绘本和分享视频，免费用户可以预览前6页。",
            },
          ].map((item, i) => (
            <details key={i} className="bg-white rounded-2xl p-4 shadow-sm group">
              <summary className="font-medium text-gray-900 text-sm cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <svg
                  className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
