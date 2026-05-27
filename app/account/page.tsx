"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// 预设头像列表
const AVATAR_EMOJIS = ["🌟", "🌙", "🦄", "🐰", "🐻", "🦁", "🦊", "🐼"];

// 默认昵称池
const DEFAULT_NICKNAMES = ["小星星", "小太阳", "小月亮", "小云朵", "小彩虹", "小露珠", "小雪花", "小露珠", "小海浪", "小风车"];

// localStorage 操作辅助函数
const storage = {
  getGenerating: (): any | null => {
    try {
      const str = localStorage.getItem("itsmebook_generating");
      return str ? JSON.parse(str) : null;
    } catch { return null; }
  },
  getBooks: (): any[] => {
    try {
      const str = localStorage.getItem("itsmebook_books");
      return str ? JSON.parse(str) : [];
    } catch { return []; }
  },
  getUserProfile: (): any => {
    try {
      const str = localStorage.getItem("itsmebook_user_profile");
      return str ? JSON.parse(str) : null;
    } catch { return null; }
  },
  setUserProfile: (profile: any) => {
    try {
      localStorage.setItem("itsmebook_user_profile", JSON.stringify(profile));
    } catch { /* 忽略 */ }
  },
};

export default function AccountPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  // 删除账户相关状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // 个人资料相关
  const [userProfile, setUserProfile] = useState({
    nickname: "",
    avatar: "🌟",
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  
  // 绘本列表相关
  const [books, setBooks] = useState<any[]>([]);
  const [generatingBook, setGeneratingBook] = useState<any | null>(null);
  
  // 权益相关
  const [userRights, setUserRights] = useState({
    isVip: false,
    freeCount: 3,
    expireDate: "",
  });

  // 检查登录状态和加载数据
  useEffect(() => {
    // 加载用户资料
    let profile = storage.getUserProfile();
    if (!profile) {
      // 首次使用，自动生成默认昵称
      const randomNickname = DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)];
      const randomAvatar = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
      profile = {
        nickname: randomNickname,
        avatar: randomAvatar,
        createdAt: new Date().toISOString(),
      };
      storage.setUserProfile(profile);
    }
    setUserProfile(profile);
    setTempNickname(profile.nickname);

    // 加载权益信息
    const userStr = localStorage.getItem("itsmebook_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(!!user.phone);
        setPhone(user.phone || "");
        setUserRights({
          isVip: user.isVip || false,
          freeCount: user.freeCount ?? 3,
          expireDate: user.expireDate || "",
        });
      } catch {
        // 未登录状态
        setShowLogin(true);
      }
    } else {
      // 未登录状态
      setShowLogin(true);
    }
    
    // 加载绘本列表
    loadBooks();
  }, []);

  // 加载绘本列表
  const loadBooks = () => {
    const bookList = storage.getBooks();
    setBooks(bookList);
    
    // 检查正在生成的绘本
    const generating = storage.getGenerating();
    if (generating && generating.story) {
      setGeneratingBook({
        ...generating.story,
        isGenerating: true,
        progress: generating.progress || 0,
      });
    }
  };

  // 定期检查生成状态
  useEffect(() => {
    const interval = setInterval(() => {
      loadBooks();
    }, 5000); // 每5秒检查一次
    return () => clearInterval(interval);
  }, []);

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
        localStorage.setItem("itsmebook_user", JSON.stringify({ 
          phone, 
          isVip: userRights.isVip,
          freeCount: userRights.freeCount,
          expireDate: userRights.expireDate,
        }));
        setIsLoggedIn(true);
        setShowLogin(false);
      } else {
        alert(data.message || "登录失败");
      }
    } catch {
      // 演示模式：直接登录
      const demoToken = "demo_token_" + Date.now();
      localStorage.setItem("itsmebook_token", demoToken);
      localStorage.setItem("itsmebook_user", JSON.stringify({ 
        phone, 
        isVip: userRights.isVip,
        freeCount: userRights.freeCount,
        expireDate: userRights.expireDate,
      }));
      setIsLoggedIn(true);
      setShowLogin(false);
    }
    setLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("itsmebook_token");
    localStorage.removeItem("itsmebook_user");
    setIsLoggedIn(false);
    setShowLogin(true);
    setPhone("");
    setCode("");
  };

  // 修改昵称
  const handleSaveNickname = () => {
    const newNickname = tempNickname.trim() || userProfile.nickname;
    const newProfile = { ...userProfile, nickname: newNickname };
    storage.setUserProfile(newProfile);
    setUserProfile(newProfile);
    setIsEditingNickname(false);
  };

  // 选择头像
  const handleSelectAvatar = (avatar: string) => {
    const newProfile = { ...userProfile, avatar };
    storage.setUserProfile(newProfile);
    setUserProfile(newProfile);
  };

  // 点击阅读绘本 - 统一通过sessionStorage传递数据
  const handleReadBook = (book: any) => {
    // 保存完整绘本数据到sessionStorage，确保阅读器能直接读取
    const storyData = {
      ...book,
      voiceUrl: "",
    };
    sessionStorage.setItem("bedtime_story", JSON.stringify(storyData));
    localStorage.setItem("itsmebook_last_story", JSON.stringify(storyData));
    
    // 有音频的绘本用全屏播放器
    const hasAudio = book.pages?.some((p: any) => !!p.audioUrl);
    if (hasAudio) {
      router.push("/story/player");
    } else if (book.id) {
      // 尝试通过share页面查看（会先查sessionStorage再查Supabase）
      router.push(`/share/${book.id}`);
    } else {
      router.push("/story/player");
    }
  };

  // 删除账户 - GDPR被遗忘权
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("itsmebook_token");
      const userStr = localStorage.getItem("itsmebook_user");
      let userId = "";
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id || user.userId || "";
        } catch {
          // 解析失败
        }
      }

      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      
      if (data.success) {
        // 清除所有localStorage
        localStorage.removeItem("itsmebook_token");
        localStorage.removeItem("itsmebook_user");
        localStorage.removeItem("itsmebook_user_profile");
        localStorage.removeItem("itsmebook_child_profile");
        localStorage.removeItem("bedtime_story");
        localStorage.removeItem("bedtime_voice_id");
        localStorage.removeItem("itsmebook_books");
        localStorage.removeItem("itsmebook_generating");
        
        setIsLoggedIn(false);
        setShowLogin(true);
        setBooks([]);
        setGeneratingBook(null);
        setShowDeleteConfirm(false);
        
        // 跳转到首页
        router.push("/");
      } else {
        alert(data.message || "删除失败，请稍后重试");
      }
    } catch {
      alert("删除失败，请稍后重试");
    }
    setDeleting(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // 生成中状态的进度百分比文字
  const getGeneratingProgress = () => {
    if (!generatingBook) return "";
    if (generatingBook.progress < 50) return "正在生成故事...";
    if (generatingBook.progress < 80) return "正在生成配图...";
    if (generatingBook.progress < 95) return "正在生成语音...";
    return "即将完成...";
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

      {/* 主内容 */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-orange to-amber-400 flex items-center justify-center text-3xl cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {/* 点击可选择头像 */}}
              title="点击更换头像"
            >
              {userProfile.avatar}
            </div>
            <div className="flex-1">
              {/* 昵称 */}
              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={nicknameInputRef}
                    type="text"
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    onBlur={handleSaveNickname}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
                    className="flex-1 px-3 py-1.5 rounded-lg border-2 border-primary-orange focus:outline-none text-lg font-bold"
                    maxLength={12}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="px-3 py-1.5 rounded-lg bg-primary-orange text-white text-sm font-medium"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setIsEditingNickname(true)}
                >
                  <p className="font-bold text-xl text-gray-900">{userProfile.nickname}</p>
                  <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-0.5">
                {isLoggedIn ? phone : "点击头像选择，昵称可编辑"}
              </p>
            </div>
          </div>
          
          {/* 头像选择器 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">选择头像</p>
            <div className="flex gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectAvatar(emoji)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                    userProfile.avatar === emoji
                      ? "bg-primary-orange/10 ring-2 ring-primary-orange scale-110"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 会员状态 */}
        <div className={`rounded-2xl p-5 ${userRights.isVip ? "bg-gradient-to-r from-primary-orange to-primary-dark" : "bg-gradient-to-r from-gray-100 to-gray-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className={`font-bold text-lg ${userRights.isVip ? "text-white" : "text-gray-700"}`}>
                {userRights.isVip ? "✨ 会员用户" : "🌱 免费用户"}
              </p>
              {userRights.isVip && userRights.expireDate ? (
                <p className="text-white/70 text-sm">有效期至 {userRights.expireDate}</p>
              ) : (
                <p className="text-gray-500 text-sm">剩余免费次数：{userRights.freeCount} 次</p>
              )}
            </div>
            <span className={`text-3xl ${userRights.isVip ? "" : "grayscale opacity-50"}`}>
              {userRights.isVip ? "👑" : "🌱"}
            </span>
          </div>
          {!userRights.isVip && (
            <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between">
              <p className="text-sm text-gray-500">解锁更多精彩故事</p>
              <button
                onClick={() => router.push("/pricing")}
                className="text-sm bg-primary-orange/20 text-primary-orange px-3 py-1 rounded-full hover:bg-primary-orange/30 transition-colors font-medium"
              >
                开通会员
              </button>
            </div>
          )}
        </div>

        {/* 正在生成的绘本 */}
        {generatingBook && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-orange rounded-full animate-pulse"></span>
              正在生成
            </h3>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-orange/20 to-amber-200/30 flex items-center justify-center text-2xl relative overflow-hidden">
                  📖
                  {/* 进度遮罩 */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary-orange/30 transition-all duration-500"
                    style={{ height: `${generatingBook.progress || 0}%` }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{generatingBook.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{getGeneratingProgress()}</p>
                  {/* 进度条 */}
                  <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-orange rounded-full transition-all duration-500"
                      style={{ width: `${generatingBook.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 绘本列表 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              📚 我的绘本
              {books.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{books.length}</span>
              )}
            </h3>
          </div>
          
          {books.length === 0 && !generatingBook ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="text-5xl mb-4">📖</div>
              <p className="text-gray-500 mb-4">还没有绘本哦</p>
              <button
                onClick={() => router.push("/create")}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                开始创作
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {books.slice(0, 10).map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleReadBook(book)}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {book.pages && book.pages[0]?.imageUrl ? (
                      <img
                        src={book.pages[0].imageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-100 to-pink-100">
                        📖
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{book.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {book.childName || "小宝贝"} · {book.pages?.length || 0}页
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {book.createdAt ? formatDate(book.createdAt) : "刚刚"}
                    </p>
                    {book.isClassic && (
                      <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                        经典故事
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
              
              {books.length > 10 && (
                <button className="w-full py-3 text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  查看全部 {books.length} 个绘本
                </button>
              )}
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { emoji: "💳", title: "订阅管理", desc: userRights.isVip ? "月卡会员" : "免费用户", action: () => router.push("/pricing") },
            { emoji: "📝", title: "使用条款", desc: "", action: () => router.push("/terms") },
            { emoji: "🔒", title: "隐私政策", desc: "", action: () => router.push("/privacy") },
            // GDPR被遗忘权 - 删除账户
            { emoji: "⚠️", title: "删除账户", desc: "永久删除所有数据", action: () => setShowDeleteConfirm(true), isDanger: true },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${(item as { isDanger?: boolean }).isDanger ? 'text-red-600' : ''}`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 text-left">
                <p className={`font-medium text-sm ${(item as { isDanger?: boolean }).isDanger ? 'text-red-600' : 'text-gray-900'}`}>{item.title}</p>
                {item.desc && <p className="text-xs text-gray-400">{item.desc}</p>}
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* 删除账户确认弹窗 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">确认删除账户？</h3>
              <p className="text-sm text-gray-600 mb-6">
                此操作不可撤销！删除后您的所有数据将被永久清除，包括：账户信息、所有故事、角色数据、订单记录。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      删除中...
                    </>
                  ) : (
                    "确认删除"
                  )}
                </button>
              </div>
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
    </div>
  );
}
