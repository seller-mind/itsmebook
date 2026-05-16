"use client";

import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  // 手机号登录即注册，重定向到登录页
  router.replace("/sign-in");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="text-center">
        <span className="text-5xl">📚</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">正在跳转...</h1>
        <p className="text-gray-600 mt-2">手机号登录即自动注册</p>
      </div>
    </div>
  );
}
