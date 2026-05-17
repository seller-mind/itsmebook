"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "itsmebook_cookie_consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 检查是否已经做出过选择
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // 延迟显示，等页面加载完成
      setTimeout(() => setShow(true), 500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ 
      accepted: true, 
      timestamp: new Date().toISOString() 
    }));
    setShow(false);
    // 触发同意事件，可以让百度统计等脚本重新加载
    window.dispatchEvent(new Event("cookieConsentAccepted"));
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ 
      accepted: false, 
      timestamp: new Date().toISOString() 
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-gray-700 text-sm sm:text-base">
              我们使用Cookie和类似技术来提升您的使用体验。继续使用即表示您同意我们的Cookie政策。
            </p>
            <Link 
              href="/cookie" 
              className="text-primary-orange hover:underline text-sm mt-1 inline-block"
            >
              了解更多
            </Link>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              拒绝
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm bg-primary-orange text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              同意
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
