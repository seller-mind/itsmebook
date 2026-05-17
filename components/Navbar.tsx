"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  phone: string;
  nickname: string;
  freeCount: number;
}

// 脱敏手机号显示
function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("itsmebook_token");
      const userStr = localStorage.getItem("itsmebook_user");
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (e) {
          // 解析失败，清除无效数据
          localStorage.removeItem("itsmebook_token");
          localStorage.removeItem("itsmebook_user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // 初始检查
    checkAuth();

    // 监听登录状态变化
    window.addEventListener("loginStateChange", checkAuth);
    return () => window.removeEventListener("loginStateChange", checkAuth);
  }, []);

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("itsmebook_token");
    localStorage.removeItem("itsmebook_user");
    document.cookie = "itsmebook_token=; path=/; max-age=0";
    setUser(null);
    setIsDropdownOpen(false);
    router.push("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl md:text-3xl transition-transform group-hover:scale-110">
              📚
            </span>
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              是我呀
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-gray-600 hover:text-primary-orange transition-colors font-medium"
            >
              功能特点
            </Link>
            <Link
              href="/#styles"
              className="text-gray-600 hover:text-primary-orange transition-colors font-medium"
            >
              绘本风格
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-primary-orange transition-colors font-medium"
            >
              定价
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {/* 免费次数提示 */}
            {user && (
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600">
                <span className="text-orange-500 font-medium">剩余 {user.freeCount} 次</span>
              </div>
            )}

            {/* 开始制作 */}
            <Link
              href="/recording"
              className="hidden sm:inline-flex btn-primary text-sm"
            >
              开始制作
            </Link>

            {user ? (
              /* 已登录 - 显示用户下拉菜单 */
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-orange-100 hover:bg-orange-200 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                    {user.nickname?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block text-gray-700 text-sm">
                    {maskPhone(user.phone)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 下拉菜单 */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600">手机号</p>
                      <p className="font-medium text-gray-900">{maskPhone(user.phone)}</p>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600">免费次数</p>
                      <p className="font-medium text-orange-500">{user.freeCount} 次</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 未登录 - 显示登录按钮 */
              <>
                <Link
                  href="/sign-in"
                  className="text-gray-600 hover:text-primary-orange transition-colors font-medium"
                >
                  登录
                </Link>
                <Link
                  href="/sign-in"
                  className="btn-primary text-sm"
                >
                  注册
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/#features"
              className="block text-gray-600 hover:text-primary-orange transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              功能特点
            </Link>
            <Link
              href="/#styles"
              className="block text-gray-600 hover:text-primary-orange transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              绘本风格
            </Link>
            <Link
              href="/pricing"
              className="block text-gray-600 hover:text-primary-orange transition-colors font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              定价
            </Link>
            
            {/* 移动端用户信息 */}
            {user ? (
              <>
                <div className="py-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500">登录账号</p>
                  <p className="font-medium text-gray-900">{maskPhone(user.phone)}</p>
                  <p className="text-sm text-orange-500 mt-1">剩余 {user.freeCount} 次免费</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-red-500 hover:bg-red-50 rounded-lg px-4 transition"
                >
                  退出登录
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="block btn-primary text-center mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                登录 / 注册
              </Link>
            )}

            {/* 开始制作 */}
            <Link
              href="/create"
              className="block btn-primary text-center mt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              开始制作
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
