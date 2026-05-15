"use client";

import { useState, useEffect } from "react";

interface ChildConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ChildConsentModal({
  isOpen,
  onConfirm,
  onCancel,
}: ChildConsentModalProps) {
  const [isChecked, setIsChecked] = useState(false);

  // 打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* 弹窗内容 - 移动端全面适配 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-primary-orange to-secondary-blue p-4 sm:p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl">👶</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">儿童信息保护声明</h2>
              <p className="text-white/80 text-xs sm:text-sm">Children's Privacy Notice</p>
            </div>
          </div>
        </div>

        {/* 内容区域 - 可滚动 */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
            <p className="text-yellow-800 text-xs sm:text-sm leading-relaxed">
              <strong>⚠️ 重要提示：</strong>
              <br />
              感谢您信任"是我呀"！在使用我们的服务前，请务必阅读以下重要信息。
            </p>
          </div>

          <div className="space-y-4 text-gray-600 text-xs sm:text-sm leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🔒</span> 照片安全
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>您上传的照片仅用于生成绘本插图</li>
                <li>照片将安全存储，不会被公开或分享</li>
                <li>您可以随时登录账户删除照片</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>👨‍👩‍👧</span> 家长监护
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>本服务面向3-12岁儿童</li>
                <li>建议在家长陪同下使用</li>
                <li>AI生成内容仅供参考，需家长审核</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>📝</span> 内容规范
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>故事内容积极正面，适合儿童</li>
                <li>不得生成任何不当内容</li>
                <li>发现违规请立即联系我们</li>
              </ul>
            </div>
          </div>

          {/* 复选框 - 移动端优化 */}
          <label className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary-orange focus:ring-primary-orange flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-700 leading-snug">
              我已阅读并理解上述声明，作为监护人，我同意我的孩子使用此服务，并确认上传的照片仅用于生成个人绘本。
            </span>
          </label>
        </div>

        {/* 按钮 - 移动端优化 */}
        <div className="p-4 sm:p-6 bg-gray-50 rounded-b-2xl flex gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border-2 border-gray-300 text-gray-600 font-medium sm:font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            稍后再说
          </button>
          <button
            onClick={onConfirm}
            disabled={!isChecked}
            className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-medium sm:font-semibold text-sm transition-all ${
              isChecked
                ? "bg-primary-orange text-white hover:bg-primary-dark shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            确认并开始
          </button>
        </div>
      </div>
    </div>
  );
}
