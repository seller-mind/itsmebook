"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    number: 1,
    title: "上传照片",
    description: "AI识别特征",
    icon: "📷",
    color: "bg-pink-100 text-pink-600",
  },
  {
    number: 2,
    title: "选择风格",
    description: "8种风格挑选",
    icon: "🎨",
    color: "bg-purple-100 text-purple-600",
  },
  {
    number: 3,
    title: "选主题",
    description: "故事主题定制",
    icon: "📚",
    color: "bg-blue-100 text-blue-600",
  },
  {
    number: 4,
    title: "AI生成",
    description: "几分钟出绘本",
    icon: "✨",
    color: "bg-orange-100 text-orange-600",
  },
];

export default function ProcessSteps() {
  return (
    <section id="features" className="py-6 sm:py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区 */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            轻松创作专属绘本
          </h2>
          <p className="text-xs sm:text-base text-gray-500">
            无需设计经验，几步操作即可完成
          </p>
        </div>

        {/* 步骤卡片 - 手机端2列紧凑布局 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-sm">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${step.color} flex items-center justify-center text-xs sm:text-base font-bold flex-shrink-0`}>
                {step.number}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-base font-bold text-gray-900">{step.title}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 特色功能 */}
        <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { icon: "⚡", title: "快速生成", desc: "3分钟" },
            { icon: "🎯", title: "角色一致", desc: "像本人" },
            { icon: "💝", title: "温馨有趣", desc: "正能量" },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm"
            >
              <span className="text-lg sm:text-2xl block">{feature.icon}</span>
              <h4 className="font-semibold text-gray-900 text-[10px] sm:text-xs">{feature.title}</h4>
              <p className="text-[10px] text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
