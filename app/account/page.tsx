"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HistoryItem {
  id: string;
  title: string;
  childName: string;
  createdAt: string;
  pagesCount: number;
  thumbnail: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showLogin, setShowLogin] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem("itsmebook_token");
    const userStr = localStorage.getItem("itsmebook_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setPhone(user.phone || "");
        setIsLoggedIn(true);
        loadHistory();
      } catch {
        setShowLogin(true);
      }
    } else {
      setShowLogin(true);
    }
  }, []);

  const loadHistory = () => {
    // 演示历史记录
    setHistory([
      {
        id: "1",
        title: "小明的睡前故事",
        childName: "小明",
        createdAt: "2024-01-15",
        pagesCount: 8,
        thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop",
      },
      {
        id: "2",
        title: "星星和月亮",
        childName: "小宝贝",
        createdAt: "2024-01-14",
        pagesCount: 8,
        thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
      },
      {
        id: "3",
        title: "小兔子的冒险",
        childName: "小兔子",
        createdAt: "2024-01-13",
        pagesCount: 8,
        thumbnail: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=400&fit=crop",
      },
    ]);
  };

  const sendCode = async () => {
    if (!phone || phone.length !== 11) {
      alert("请输入正确的手机号");
      return;
    }
    setSendingCode(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setCodeSent(true);
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert(data.message || "发送失败");
      }
    } catch {
      // 演示模式
      setCodeSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setSendingCode(false);
  };

  const handleLogin = async () => {
    if (!code || code.length !== 6) {
      alert("请输入6位验证码");
      return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("itsmebook_token", data.token);
        localStorage.setItem("itsmebook_user", JSON.stringify({ phone }));
        setIsLoggedIn(true);
        setShowLogin(false);
        loadHistory();
      } else {
        alert(data.message || "登录失败");
      }
    } catch {
      // 演示模式：直接登录
      const demoToken = "demo_token_" + Date.now();
      localStorage.setItem("itsmebook_token", demoToken);
      localStorage.setItem("itsmebook_user", JSON.stringify({ phone }));
      setIsLoggedIn(true);
      setShowLogin(false);
      loadHistory();
    }
    setLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("itsmebook_token");
    localStorage.removeItem("itsmebook_user");
    setIsLoggedIn(false);
    setShowLogin(true);
    setHistory([]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto bg-white border-b border-gray-100">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">👤</span>
          <span className="font-bold text-gray-900">我的</span>
        </div>
        <div className="w-8" />
      </div>

      {/* 已登录状态 */}
      {isLoggedIn && (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* 用户信息 */}
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-orange to-primary-dark flex items-center justify-center">
              <span className="text-2xl text-white">👩</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">用户</p>
              <p className="text-sm text-gray-500">{phone}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              退出
            </button>
          </div>

          {/* 会员状态 */}
          <div className="bg-gradient-to-r from-primary-orange to-primary-dark rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-lg">月卡会员</p>
                <p className="text-white/70 text-sm">有效期至 2024.02.15</p>
              </div>
              <span className="text-3xl">👑</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
              <p className="text-sm text-white/80">剩余故事次数：无限制</p>
              <button
                onClick={() => router.push("/pricing")}
                className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
              >
                续费
              </button>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {[
              { emoji: "📚", title: "我的故事", desc: `${history.length}个故事`, action: () => {} },
              { emoji: "🎬", title: "我的视频", desc: "0个视频", action: () => {} },
              { emoji: "💳", title: "订阅管理", desc: "月卡会员", action: () => router.push("/pricing") },
              { emoji: "❤️", title: "收藏夹", desc: "暂无收藏", action: () => {} },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* 历史故事 */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">最近的故事</h3>
                <button className="text-xs text-gray-400 hover:text-gray-600">查看全部</button>
              </div>
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      sessionStorage.setItem("bedtime_story", JSON.stringify({
                        title: item.title,
                        childName: item.childName,
                        pages: Array.from({ length: item.pagesCount }, (_, i) => ({
                          pageNumber: i + 1,
                          text: "故事内容...",
                          imageUrl: item.thumbnail,
                        })),
                        voiceUrl: "",
                        voiceId: "",
                      }));
                      router.push("/story/player");
                    }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.childName} · {item.pagesCount}页
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt)}</p>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 创建新故事 */}
          <button
            onClick={() => router.push("/create")}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建新故事
          </button>
        </div>
      )}

      {/* 登录状态 */}
      {showLogin && !isLoggedIn && (
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-orange to-primary-dark flex items-center justify-center">
              <span className="text-4xl">🌙</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">是我呀</h2>
            <p className="text-sm text-gray-500 mt-1">登录后保存你的故事和声音</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="请输入手机号"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-orange focus:outline-none transition-colors text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入验证码"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-orange focus:outline-none transition-colors text-base"
                />
                <button
                  onClick={sendCode}
                  disabled={countdown > 0 || sendingCode}
                  className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loggingIn || !phone || !code}
              className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingIn ? "登录中..." : "登录"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              登录即表示同意
              <button onClick={() => router.push("/terms")} className="text-primary-orange hover:underline">《使用条款》</button>
              和
              <button onClick={() => router.push("/privacy")} className="text-primary-orange hover:underline">《隐私政策》</button>
            </p>
          </div>

          {/* 跳过登录 */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/create")}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              跳过登录，直接体验
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
