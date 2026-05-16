"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";

interface ChildConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  lang: string;
}

export default function ChildConsentModal({
  isOpen,
  onConfirm,
  onCancel,
  lang,
}: ChildConsentModalProps) {
  const { t } = useLanguage();
  const [isChecked, setIsChecked] = useState(false);
  const isZh = lang === 'zh';

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

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-primary-orange to-secondary-blue p-4 sm:p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl">👶</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">{t('consent.title')}</h2>
              <p className="text-white/80 text-xs sm:text-sm">{t('consent.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
            <p className="text-yellow-800 text-xs sm:text-sm leading-relaxed">
              <strong>{t('consent.warning')}</strong>
              <br />
              {t('consent.warningText')}
            </p>
          </div>

          <div className="space-y-4 text-gray-600 text-xs sm:text-sm leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>🔒</span> {t('consent.photoSafety')}
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('consent.photoSafety1')}</li>
                <li>{t('consent.photoSafety2')}</li>
                <li>{t('consent.photoSafety3')}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>👨‍👩‍👧</span> {t('consent.parentalGuidance')}
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('consent.parentalGuidance1')}</li>
                <li>{t('consent.parentalGuidance2')}</li>
                <li>{t('consent.parentalGuidance3')}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>📝</span> {t('consent.contentRules')}
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('consent.contentRules1')}</li>
                <li>{t('consent.contentRules2')}</li>
                <li>{t('consent.contentRules3')}</li>
              </ul>
            </div>

            {/* 英文版额外显示COPPA条款 */}
            {!isZh && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mt-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>🛡️</span> Parental Consent Required (COPPA)
                </h3>
                <p className="text-blue-800 text-xs leading-relaxed">
                  By proceeding, you confirm that you are the parent or legal guardian of the child whose information is being provided. You consent to the collection and processing of your child's personal information (name, age, gender, photograph) solely for generating personalized picture book content. This data is not used to train AI models.
                </p>
              </div>
            )}
          </div>

          {/* 复选框 */}
          <label className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary-orange focus:ring-primary-orange flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-700 leading-snug">
              {t('consent.checkbox')}
            </span>
          </label>
        </div>

        {/* 按钮 */}
        <div className="p-4 sm:p-6 bg-gray-50 rounded-b-2xl flex gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border-2 border-gray-300 text-gray-600 font-medium sm:font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            {t('consent.cancel')}
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
            {t('consent.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
