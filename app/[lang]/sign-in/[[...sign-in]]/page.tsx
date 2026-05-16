"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      phone: string;
      nickname: string;
      freeCount: number;
    };
  };
}

interface SendCodeResponse {
  success: boolean;
  message: string;
  retryAfter?: number;
}

export default function SignInPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 清理倒计时
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // 发送验证码
  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError(t('signin.phoneError') || "请输入正确的手机号");
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data: SendCodeResponse = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setCountdown(60);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setError("");
    } catch (err) {
      setError(t('signin.sendFail') || "发送失败，请稍后重试");
    } finally {
      setSending(false);
    }
  };

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code)) {
      setError(t('signin.codeError') || "请输入6位验证码");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const data: LoginResponse = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      localStorage.setItem("itsmebook_token", data.data!.token);
      localStorage.setItem("itsmebook_user", JSON.stringify(data.data!.user));
      document.cookie = `itsmebook_token=${data.data!.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      window.dispatchEvent(new Event("loginStateChange"));

      // 跳转到之前的页面或创建页面
      const redirectUrl = searchParams.get('redirect_url') || `/${lang}/create`;
      router.push(redirectUrl);
    } catch (err) {
      setError(t('signin.loginFail') || "登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(value);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">📚</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{t('signin.welcome')}</h1>
          <p className="text-gray-600 mt-2">{t('signin.subtitle')}</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 手机号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('signin.phone')}
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder={t('signin.phonePlaceholder')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sending}
                  className="px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition whitespace-nowrap"
                >
                  {sending ? t('signin.sending') : countdown > 0 ? `${countdown}s` : t('signin.getCode')}
                </button>
              </div>
            </div>

            {/* 验证码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('signin.code')}
              </label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder={t('signin.codePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                disabled={loading}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading || !phone || !code}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('signin.logging')}
                </span>
              ) : (
                t('signin.loginButton')
              )}
            </button>
          </form>

          {/* 提示 */}
          <p className="text-center text-gray-500 text-sm mt-6">
            {t('signin.agreeTerms')}{" "}
            <Link href={`/${lang}/terms`} className="text-orange-500 hover:underline">
              {t('signin.termsLink')}
            </Link>{" "}
            {t('signin.and')}{" "}
            <Link href={`/${lang}/privacy`} className="text-orange-500 hover:underline">
              {t('signin.privacyLink')}
            </Link>
          </p>
        </div>

        {/* 底部 */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {t('signin.noAccount')}
        </p>
      </div>
    </div>
  );
}
