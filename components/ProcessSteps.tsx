"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    number: 1,
    title: "上传照片",
    description: "上传孩子的照片，AI会识别特征",
    icon: "📷",
    color: "bg-pink-100 text-pink-600",
  },
  {
    number: 2,
    title: "选择风格",
    description: "从8种精美风格中挑选",
    icon: "🎨",
    color: "bg-purple-100 text-purple-600",
  },
  {
    number: 3,
    title: "选择主题",
    description: "选择故事主题或自由发挥",
    icon: "📚",
    color: "bg-blue-100 text-blue-600",
  },
  {
    number: 4,
    title: "AI生成",
    description: "几分钟内获得专属绘本",
    icon: "✨",
    color: "bg-orange-100 text-orange-600",
  },
];

export default function ProcessSteps() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 滚动动画效果
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const section = document.getElementById("process");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  // 步骤切换动画
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区 */}
        <div className="text-center mb-16">
          <span className="text-secondary-blue font-medium mb-4 block">
            🚀 简单4步
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            轻松创作专属绘本
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            无需任何设计经验，只需几步操作
            <br />
            就能为孩子创作一本独一无二的故事书
          </p>
        </div>

        {/* 步骤展示 */}
        <div className="relative">
          {/* 连接线 */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-purple-200 via-blue-200 to-orange-200" />

          {/* 步骤卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className={`relative transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* 步骤编号 */}
                <div
                  className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-xl font-bold mx-auto mb-6 relative z-10 shadow-lg`}
                >
                  {step.number}
                </div>

                {/* 卡片内容 */}
                <div
                  className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 ${
                    activeStep === index
                      ? "ring-4 ring-primary-orange/30 scale-105"
                      : "hover:shadow-xl"
                  }`}
                >
                  <span className="text-5xl mb-4 block text-center">
                    {step.icon}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 特色功能 */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: "⚡", title: "快速生成", desc: "3分钟完成" },
            { icon: "🎯", title: "角色一致", desc: "保持孩子特征" },
            { icon: "💝", title: "温馨有趣", desc: "正能量故事" },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="text-3xl mb-2 block">{feature.icon}</span>
              <h4 className="font-semibold text-gray-900">{feature.title}</h4>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
