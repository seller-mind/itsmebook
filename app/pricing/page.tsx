"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

const PLANS = [
  {
    id: "single",
    name: "单本绘本",
    price: "¥29.9",
    description: "1本专属绘本，全风格+外观",
    color: "from-gray-50 to-gray-100",
    ringColor: "",
    features: [
      "全风格5种",
      "角色外观定制",
      "AI朗读",
      "PDF下载+分享图",
    ],
    included: [true, true, true, true],
    buttonText: "立即购买",
    buttonStyle: "outline" as const,
    badge: null,
  },
  {
    id: "monthly",
    name: "月度会员",
    price: "¥49/月",
    description: "4本/月，比单本省59%",
    color: "from-primary-orange to-primary-dark",
    ringColor: "ring-primary-orange",
    features: [
      "4本/月",
      "全风格+外观定制",
      "睡前模式+优先生成",
      "PDF下载+分享图",
    ],
    included: [true, true, true, true],
    buttonText: "立即购买",
    buttonStyle: "primary" as const,
    badge: "推荐",
  },
  {
    id: "yearly",
    name: "年度会员",
    price: "¥299/年",
    description: "4本/月+生日绘本，相当于¥24.9/月",
    color: "from-green-50 to-green-100",
    ringColor: "",
    features: [
      "4本/月+生日绘本",
      "全风格+外观定制",
      "睡前模式+优先生成",
      "PDF下载+分享图",
    ],
    included: [true, true, true, true],
    buttonText: "立即购买",
    buttonStyle: "outline" as const,
    badge: "省69%",
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
          <span className="font-bold text-gray-900">解锁更多绘本</span>
        </div>
        <div className="w-16" />
      </div>

      {/* 标题 */}
      <div className="px-4 pt-6 pb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          解锁更多专属绘本
        </h1>
        <p className="text-gray-500">
          每个孩子都值得一本自己的绘本
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
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.buttonStyle === "primary"
                    ? "bg-primary-orange text-white hover:bg-primary-dark shadow-md hover:shadow-lg"
                    : "border-2 border-gray-300 text-gray-700 hover:border-primary-orange hover:text-primary-orange"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* 常见问题 */}
        <div className="mt-12 max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-gray-900 text-center mb-6">常见问题</h3>
          <div className="space-y-4">
            <details className="bg-white rounded-xl p-4 shadow-sm">
              <summary className="font-medium text-gray-800 cursor-pointer">绘本可以下载吗？</summary>
              <p className="text-sm text-gray-500 mt-2">可以，所有套餐都支持PDF下载，方便打印或分享。</p>
            </details>
            <details className="bg-white rounded-xl p-4 shadow-sm">
              <summary className="font-medium text-gray-800 cursor-pointer">月度会员绘本可以累计吗？</summary>
              <p className="text-sm text-gray-500 mt-2">月度会员每月3本额度，当月未使用完不可累计到下月。</p>
            </details>
            <details className="bg-white rounded-xl p-4 shadow-sm">
              <summary className="font-medium text-gray-800 cursor-pointer">生日绘本是什么？</summary>
              <p className="text-sm text-gray-500 mt-2">年度会员可获得一本特别版生日绘本，专为庆祝孩子生日设计。</p>
            </details>
            <details className="bg-white rounded-xl p-4 shadow-sm">
              <summary className="font-medium text-gray-800 cursor-pointer">如何联系客服？</summary>
              <p className="text-sm text-gray-500 mt-2">如有问题，欢迎通过公众号或应用内反馈联系我们。</p>
            </details>
          </div>
        </div>
      </div>

      {/* 支付方式弹窗 */}
      {showPaySheet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                选择支付方式
              </h3>
              <button
                onClick={() => setShowPaySheet(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 选中套餐信息 */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{getPlanName(selectedPlan || "")}</span>
                <span className="font-bold text-primary-orange">{getPlanPrice(selectedPlan || "")}</span>
              </div>
            </div>

            {/* 支付方式 */}
            <div className="space-y-3">
              <button
                onClick={() => handlePayTypeSelect("wechat")}
                disabled={!!loading}
                className="w-full p-4 rounded-xl border-2 border-gray-200 flex items-center justify-between hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 17.006 24 15.189c0-3.21-2.931-5.837-6.062-6.33zM13.349 10.36c-.621 0-1.123.509-1.123 1.134 0 .624.502 1.133 1.123 1.133.62 0 1.122-.509 1.122-1.133 0-.625-.502-1.134-1.122-1.134zm-5.813 0c-.621 0-1.123.509-1.123 1.134 0 .624.502 1.133 1.123 1.133.62 0 1.122-.509 1.122-1.133 0-.625-.502-1.134-1.122-1.134z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">微信支付</span>
                </div>
                {loading === "wechat" ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => handlePayTypeSelect("alipay")}
                disabled={!!loading}
                className="w-full p-4 rounded-xl border-2 border-gray-200 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.89 13.02c1.155 0 1.564-.806 1.564-2.073 0-1.267-.395-2.073-1.564-2.073-.932 0-1.564.567-1.564 1.564 0 .998.632 1.684 1.564 2.073-.024.41-.048.998-.024 1.499 0 1.753 1.447 2.882 3.404 2.882.316 0 .63-.024.947-.072-1.564-2.073.411-4.8 1.736-6.48-1.317 1.736-2.658 3.8-3.155 5.76-.024.146-.05.316-.05.46 0 .365.17.68.433.878a.83.83 0 00.47.14c.41 0 .682-.34.682-.75v-3.168c0-.41.267-.75.682-.75.41 0 .682.34.682.75v1.612c0 1.564.926 2.61 2.61 2.61.926 0 1.736-.51 2.268-1.34-.34 0-.657.048-.997.048-1.736 0-2.853-.926-2.853-2.364 0-1.34.997-2.268 2.364-2.364 1.196 0 1.999.656 1.999 1.78 0 1.124-.803 1.78-1.78 1.78-.779 0-1.412-.436-1.412-1.124 0-.41.17-.753.43-.997a1.54 1.54 0 01.242-.166c.12-.06.24-.12.41-.12.316 0 .51.194.51.51 0 .17-.073.365-.169.51-.024.05-.024.096-.072.146-.267.365-.558.754-.875 1.136-.12.145-.218.315-.218.51 0 .435.364.801.802.801.17 0 .34-.072.51-.194-.17.364-.267.778-.267 1.243 0 2.17 1.736 3.66 3.9 3.66.534 0 1.02-.073 1.46-.218-.534.34-1.22.534-1.908.534-3.08 0-5.172-1.853-5.172-4.39 0-1.267.486-2.315 1.34-3.11-.51.022-1.047.07-1.63.169-.025-.024-.048-.05-.072-.05-.656 0-1.047.51-1.047 1.124 0 .632.391 1.149 1.047 1.149.168 0 .364-.05.532-.097l.876 1.998c-.364.17-.778.268-1.243.268-1.708 0-2.95-1.244-2.95-2.95 0-1.708 1.242-2.95 2.95-2.95 1.172 0 2.17.655 2.633 1.564.19-.388.412-.754.655-1.12-.876.17-1.756.534-2.486 1.047.17-.05.34-.097.534-.097zm-8.983-6.26c-.17-.51-.706-.753-1.267-.534-.51.17-.778.68-.607 1.22.194.51.73.753 1.267.534.559-.193.778-.704.607-1.22z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">支付宝</span>
                </div>
                {loading === "alipay" ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>

            {/* 错误提示 */}
            {payError && (
              <div className="mt-4 p-3 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600">{payError}</p>
              </div>
            )}

            {/* 底部说明 */}
            <p className="text-xs text-gray-400 text-center mt-6">
              支付即表示同意《用户协议》和《隐私政策》
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
