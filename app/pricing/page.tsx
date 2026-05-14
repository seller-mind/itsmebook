"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/clerk";

const PLANS = [
  {
    id: "free",
    name: "免费体验",
    price: "¥0",
    period: "限时免费",
    description: "先体验再决定",
    features: [
      "2次绘本生成（限时）",
      "8页基础绘本",
      "4种绘本风格可选",
      "在线预览",
      "有效期7天",
    ],
    notIncluded: [
      "高清PDF下载",
      "全部8种风格",
      "自定义故事长度",
      "优先生成通道",
    ],
    buttonText: "免费开始",
    popular: false,
  },
  {
    id: "single",
    name: "单本购买",
    price: "¥19.9",
    period: "/本",
    description: "做一本就值回票价",
    features: [
      "1本精美绘本",
      "8-12页精致绘本",
      "全部8种风格",
      "在线预览",
      "高清PDF下载",
      "无限期保存",
    ],
    notIncluded: [
      "优先生成通道",
    ],
    buttonText: "购买单本",
    popular: false,
  },
  {
    id: "monthly",
    name: "月度会员",
    price: "¥49",
    period: "/月",
    description: "适合经常使用",
    features: [
      "每月3本绘本",
      "8-12页精致绘本",
      "全部8种风格",
      "在线预览",
      "高清PDF下载",
      "专属角色模板",
      "无限期保存",
      "优先生成通道",
    ],
    notIncluded: [],
    buttonText: "开通月度会员",
    popular: true,
  },
  {
    id: "yearly",
    name: "年度会员",
    price: "¥349",
    period: "/年",
    description: "最划算的选择",
    originalPrice: "¥588",
    features: [
      "每月4本绘本",
      "8-12页精致绘本",
      "全部8种风格",
      "在线预览",
      "高清PDF下载",
      "专属角色模板",
      "无限期保存",
      "优先生成通道",
      "生日特别绘本",
      "专属客服支持",
    ],
    notIncluded: [],
    buttonText: "开通年度会员",
    popular: false,
    badge: "省41%",
  },
];

const FAQS = [
  {
    question: "免费体验可以用几次？",
    answer: "限时免费体验2次绘本生成，让您充分感受不同风格和主题。体验结束后可选择单本购买或会员。",
  },
  {
    question: "单本购买和会员有什么区别？",
    answer: "单本购买¥19.9做一本，包含PDF下载。月度会员¥49/月可做3本，年度会员¥349/月可做4本/月，性价比更高。",
  },
  {
    question: "生成的绘本有版权吗？",
    answer: "您使用AI生成的绘本版权归您个人所有，可以自由使用、分享和打印。",
  },
  {
    question: "可以退款吗？",
    answer: "付费用户在开通后7天内，如对服务不满意，可以申请全额退款。",
  },
  {
    question: "照片安全吗？",
    answer: "您上传的照片仅用于生成绘本，我们采用加密存储，不会被公开或分享，您可随时删除。",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handlePlanClick = (planId: string) => {
    if (planId === "free") {
      if (isSignedIn) {
        router.push("/create");
      } else {
        router.push("/sign-up");
      }
    } else {
      // 付费功能暂未开放
      alert("支付功能即将上线，敬请期待！");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-orange font-medium mb-4 block">
            💎 简单定价
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            选择适合您的方案
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            免费开始使用，升级获得更多权益
            <br />
            无隐藏费用，随时取消
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? "ring-4 ring-primary-orange scale-105" : ""
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary-orange text-white text-center py-2 font-medium">
                    ⭐ 最受欢迎
                  </div>
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                {/* Content */}
                <div className={`p-8 ${plan.popular ? "pt-12" : ""}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
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
                    {plan.originalPrice && (
                      <span className="ml-2 text-gray-400 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 opacity-50"
                      >
                        <span className="text-gray-400 mt-0.5">×</span>
                        <span className="text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
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

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            常见问题
          </h2>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <span
                    className={`text-gray-400 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-orange to-secondary-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            还在犹豫？
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            先试试免费版，体验AI绘本的魔力
            <br />
            满意后再升级，绝无强迫
          </p>
          <button
            onClick={() => router.push(isSignedIn ? "/create" : "/sign-up")}
            className="bg-white text-primary-orange font-bold text-lg px-12 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            🚀 立即免费开始
          </button>
        </div>
      </section>
    </div>
  );
}
