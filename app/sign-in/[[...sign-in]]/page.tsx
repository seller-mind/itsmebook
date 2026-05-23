"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
    referral?: {
      code: string;
      message: string;
    };
  };
}

interface SendCodeResponse {
  success: boolean;
  message: string;
  retryAfter?: number;
}

export default function SignInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [showReferralToast, setShowReferralToast] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 已登录用户自动跳转
  useEffect(() => {
    const token = localStorage.getItem("itsmebook_token");
    const userStr = localStorage.getItem("itsmebook_user");
    if (token && userStr) {
      router.replace("/create");
    }
  }, [router]);

  // 获取URL中的ref参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('itsmebook_ref', ref);
      console.log('存储推荐码:', ref);
    }
  }, []);

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
    // 手机号格式校验
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError("请输入正确的手机号");
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

      // 开始倒计时
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
      setError("发送失败，请稍后重试");
    } finally {
      setSending(false);
    }
  };

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 验证码格式校验
    if (!/^\d{6}$/.test(code)) {
      setError("请输入6位验证码");
      return;
    }

    setLoading(true);

    try {
      // 获取存储的推荐码
      const ref = localStorage.getItem('itsmebook_ref');
      
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, ref }),
      });

      const data: LoginResponse = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      // 保存Token到localStorage和cookie
      localStorage.setItem("itsmebook_token", data.data!.token);
      localStorage.setItem("itsmebook_user", JSON.stringify(data.data!.user));
      // 写入cookie供Next.js中间件读取（7天过期，与JWT同步）
      document.cookie = `itsmebook_token=${data.data!.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      // 清除推荐码（已处理）
      localStorage.removeItem('itsmebook_ref');

      // 检查是否有推荐奖励
      if (data.data?.referral) {
        setShowReferralToast(true);
        // 3秒后自动关闭
        setTimeout(() => setShowReferralToast(false), 3000);
      }

      // 通知其他组件登录状态变化
      window.dispatchEvent(new Event("loginStateChange"));

      // 跳转到创建页面（用location确保cookie生效，避免中间件拦截）
      window.location.href = "/create";
    } catch (err) {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理手机号输入
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(value);
  };

  // 处理验证码输入
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4">欢迎来到"是我呀"</h1>
          <p className="text-gray-600 mt-2">登录后开始创作专属绘本</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 手机号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="请输入手机号"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sending}
                  className="px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition whitespace-nowrap"
                >
                  {sending ? "发送中..." : countdown > 0 ? `${countdown}s` : "获取验证码"}
                </button>
              </div>
            </div>

            {/* 验证码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="请输入6位验证码"
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
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </button>
          </form>

          {/* 提示 */}
          <p className="text-center text-gray-500 text-sm mt-6">
            登录即表示同意{" "}
            <a href="/terms" className="text-orange-500 hover:underline">
              用户协议
            </a>{" "}
            和{" "}
            <a href="/privacy" className="text-orange-500 hover:underline">
              隐私政策
            </a>
          </p>
        </div>

        {/* 底部 */}
        <p className="text-center text-gray-500 text-sm mt-6">
          还没有账号？手机号登录即自动注册
        </p>
      </div>

      {/* 推荐奖励提示 */}
      {showReferralToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-bold">推荐奖励已到账！</p>
              <p className="text-sm opacity-90">您和好友各获得1次免费体验</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
