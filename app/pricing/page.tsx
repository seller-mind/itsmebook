"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

const PLANS = [
  {
    id: "single",
    name: "单次故事",
    price: "¥9.9",
    description: "1个完整故事",
    color: "from-gray-50 to-gray-100",
    ringColor: "",
    features: [
      "12页完整故事",
      "AI生成配图",
      "一键生成视频",
      "微信分享",
    ],
    included: [true, true, true, true],
    buttonText: "立即购买",
    buttonStyle: "outline" as const,
    badge: null,
  },
  {
    id: "monthly",
    name: "月卡",
    price: "¥99",
    period: "",
    description: "每天1个故事，30天无限陪伴",
    color: "from-primary-orange to-primary-dark",
    ringColor: "ring-primary-orange",
    features: [
      "30个故事/月",
      "AI生成配图",
      "一键生成视频",
      "睡前模式",
    ],
    included: [true, true, true, true],
    buttonText: "立即购买",
    buttonStyle: "primary" as const,
    badge: "推荐",
  },
  {
    id: "yearly",
    name: "年卡",
    price: "¥699",
    period: "",
    description: "每天¥1.9，全年无限故事",
    color: "from-green-50 to-green-100",
    ringColor: "",
    features: [
      "365个故事/年",
      "AI生成配图",
      "一键生成视频",
      "睡前模式+声音克隆",
    ],
    included: [true, true, true, true],
    buttonText: "立即购买",
    buttonStyle: "outline" as const,
    badge: "省40%",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [showPaySheet, setShowPaySheet] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    // 未登录则跳转到登录页
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    setSelectedPlan(planId);
    setShowPaySheet(true);
    setPayError(null);
  };

  const handlePayTypeSelect = async (payType: "wechat" | "alipay") => {
    if (!selectedPlan) return;

    setLoading(payType);
    setPayError(null);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, payType }),
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        // 跳转到虎皮椒支付页面
        window.location.href = data.data.url;
      } else {
        setPayError(data.message || "创建支付订单失败");
      }
    } catch {
      setPayError("网络错误，请稍后重试");
    }

    setLoading(null);
  };

  const getPlanName = (planId: string) => {
    return PLANS.find((p) => p.id === planId)?.name || planId;
  };

  const getPlanPrice = (planId: string) => {
    return PLANS.find((p) => p.id === planId)?.price || "";
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
          选择适合你的套餐，开始创作更多故事
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
                </div>
                <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
              </div>

              {/* 特性列表 */}
              <div className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
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
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* 按钮 */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.buttonStyle === "primary"
                    ? "bg-primary-orange text-white hover:bg-primary-dark active:scale-95"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 active:scale-95"
                } disabled:opacity-50`}
              >
                {loading ? "处理中..." : plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-gray-400 text-sm mt-8">
          支付安全由虎皮椒提供支持 · 遇到问题？联系客服
        </p>
      </div>

      {/* 支付方式选择 Sheet */}
      {showPaySheet && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setShowPaySheet(false);
              setPayError(null);
            }}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 animate-slide-up">
            {/* 标题 */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                选择支付方式
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {getPlanName(selectedPlan!)} · {getPlanPrice(selectedPlan!)}
              </p>
            </div>

            {/* 错误提示 */}
            {payError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                {payError}
              </div>
            )}

            {/* 支付方式 */}
            <div className="space-y-3">
              {/* 微信支付 */}
              <button
                onClick={() => handlePayTypeSelect("wechat")}
                disabled={loading !== null}
                className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-2xl transition-colors disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.87c-.135-.004-.272-.012-.407-.012zm-1.834 2.994c.536 0 .969.44.969.983a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.433-.983.97-.983zm4.857 0c.536 0 .969.44.969.983a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.433-.983.969-.983z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">微信支付</div>
                  <div className="text-xs text-gray-500">推荐</div>
                </div>
                {loading === "wechat" && (
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                )}
              </button>

              {/* 支付宝 */}
              <button
                onClick={() => handlePayTypeSelect("alipay")}
                disabled={loading !== null}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.489 10.127c-.276-1.804-1.108-3.205-2.484-4.165-1.373-.957-3.128-1.44-5.245-1.44-.958 0-1.903.107-2.814.316-.914.21-1.762.523-2.531.934-.37.197-.723.42-1.053.667-.333-.248-.683-.47-1.054-.667-2.16-1.15-4.77-.985-6.648.44C-1.48 7.9-1.944 9.84-1.59 11.66c.35 1.805 1.47 3.38 3.31 4.5 1.16.71 2.51 1.1 4 1.16l.04.01.04-.01c.35-.02.7-.06 1.04-.12.35-.06.69-.14 1.02-.24.33-.1.65-.22.96-.35l.47-.22c.15-.07.3-.14.44-.22.28-.15.55-.32.81-.5.52-.36 1-.79 1.42-1.28.08-.09.16-.18.23-.27.21-.26.39-.53.56-.81.16-.28.3-.57.41-.87.11-.3.19-.6.25-.91.06-.31.09-.62.09-.93 0-.34-.04-.67-.1-.99l.02-.01-.03-.01.01.02-.02-.01.01.01-.02-.01.01.01c-.13-.54-.36-1.05-.67-1.51l.02-.02zm-2.72 1.19c.19.25.35.52.49.8.14.28.25.58.33.88.08.3.12.62.12.94 0 .34-.04.67-.12.99-.08.32-.2.62-.35.9-.15.28-.34.54-.56.77-.22.23-.48.43-.77.59-.29.16-.61.28-.95.35-.34.07-.7.1-1.07.09h-.25c-.26.01-.52-.01-.77-.05-.26-.04-.51-.1-.76-.18a4.6 4.6 0 01-1.4-.72c-.21-.16-.4-.33-.57-.52a4.34 4.34 0 01-.45-.61c-.12-.21-.22-.43-.3-.66-.08-.23-.13-.47-.16-.72-.03-.25-.03-.5-.01-.75l.02-.01-.02-.01.01.02-.01-.01.01.01-.01-.01.01.01c.07-.94.35-1.85.81-2.66.46-.81 1.08-1.51 1.82-2.05.74-.54 1.59-.92 2.5-1.1.91-.18 1.85-.17 2.76.03.91.2 1.75.6 2.47 1.16.72.56 1.29 1.3 1.67 2.16.38.86.56 1.8.52 2.75l-.01-.01zM9.5 13.5c.34 0 .67.04.99.11.32.07.62.18.9.33.28.15.54.33.77.55.23.22.42.47.57.75.15.28.26.58.32.9.06.32.08.65.06.98-.02.33-.08.65-.18.96-.1.31-.24.6-.42.87-.18.27-.4.52-.64.74a4.6 4.6 0 01-.82.56c-.3.16-.62.28-.95.36-.33.08-.68.11-1.03.1-.35-.01-.69-.07-1.01-.16-.32-.09-.63-.22-.91-.38-.28-.16-.54-.36-.77-.58a3.5 3.5 0 01-.59-.74 3.87 3.87 0 01-.38-.87 3.87 3.87 0 01-.14-.96c.01-.35.07-.69.18-1.01.11-.32.26-.62.45-.89.19-.27.41-.51.66-.72.25-.21.53-.38.82-.51.29-.13.6-.22.92-.27.32-.05.65-.06.97-.03l.03-.01-.01-.01h.01zm-1.1 2.1c-.15.26-.26.55-.32.85-.06.3-.07.61-.03.92.04.31.13.61.27.88.14.27.33.52.56.73.23.21.5.38.79.5.29.12.6.18.92.18.32 0 .63-.04.93-.13.3-.09.57-.22.82-.39.25-.17.47-.38.65-.62.18-.24.32-.51.42-.8.1-.29.14-.6.12-.91-.02-.31-.1-.61-.24-.89-.14-.28-.33-.53-.56-.74-.23-.21-.5-.38-.79-.5-.29-.12-.6-.18-.92-.18-.32 0-.63.04-.93.13-.3.09-.57.22-.82.39a3.5 3.5 0 00-.65.62c-.18.24-.32.51-.42.8-.1.29-.14.6-.12.91.02.31.1.61.24.89l.01.01-.01-.01h.01zm6.89-.4l-1.45.68c-.19.09-.39.15-.59.2-.2.05-.41.08-.61.08h-.21c-.18 0-.36-.02-.54-.06a3.3 3.3 0 01-.52-.18c-.17-.07-.33-.16-.48-.26-.15-.1-.29-.22-.42-.35-.13-.13-.24-.28-.34-.43-.1-.15-.18-.32-.24-.5-.06-.18-.1-.36-.12-.55-.02-.19-.02-.38 0-.57.02-.19.06-.38.12-.56.06-.18.14-.35.24-.51.1-.16.22-.31.36-.44.14-.13.29-.25.45-.34.16-.09.33-.17.51-.22.18-.05.37-.09.56-.1.19-.01.38 0 .57.02.19.02.38.06.56.12.18.06.35.14.51.24.16.1.31.22.44.36.13.14.24.29.33.45.09.16.16.33.21.51l1.45-.68c.19-.09.39-.15.59-.2.2-.05.41-.08.61-.08h.21c.18 0 .36.02.54.06.18.04.35.1.52.18.17.08.33.17.48.27.15.1.29.22.42.35.13.13.24.28.34.44.1.16.18.33.24.51.06.18.1.36.12.55.02.19.02.38 0 .57-.02.19-.06.38-.12.56-.06.18-.14.35-.24.51-.1.16-.22.31-.36.44-.14.13-.29.25-.45.34-.16.09-.33.17-.51.22-.18.05-.37.09-.56.1-.19.01-.38 0-.57-.02-.19-.02-.38-.06-.56-.12-.18-.06-.35-.14-.51-.24-.16-.1-.31-.22-.44-.36a2.5 2.5 0 01-.33-.45c-.09-.16-.16-.33-.21-.51l-.01.01zm-3.39-1.7l-.01-.01.01.01z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">支付宝</div>
                  <div className="text-xs text-gray-500">安全快捷</div>
                </div>
                {loading === "alipay" && (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </div>

            {/* 取消按钮 */}
            <button
              onClick={() => {
                setShowPaySheet(false);
                setPayError(null);
              }}
              className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              取消
            </button>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
