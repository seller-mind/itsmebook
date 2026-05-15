"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <SignedIn>
              <Link
                href="/create"
                className="hidden sm:inline-flex btn-primary text-sm"
              >
                开始制作
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-primary-orange transition-colors font-medium">
                  登录
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary text-sm">注册</button>
              </SignUpButton>
            </SignedOut>

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
            <SignedIn>
              <Link
                href="/create"
                className="block btn-primary text-center mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                开始制作
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
