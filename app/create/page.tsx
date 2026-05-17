"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  // 3秒后自动跳转到新页面
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/recording");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* 装饰图标 */}
        <div className="text-6xl mb-6 animate-bounce">🌙</div>
        
        {/* 标题 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          页面已更新
        </h1>
        
        {/* 说明 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <p className="text-gray-600 leading-relaxed mb-4">
            绘本制作功能已全新升级！
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            新版本采用<strong className="text-primary-orange">声音克隆</strong>技术，
            录30秒，你的声音就能讲一整本故事。
          </p>
          <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium mb-2">✨ 新功能亮点：</p>
            <ul className="text-left space-y-1">
              <li>• 用你的声音讲故事</li>
              <li>• AI智能生成故事</li>
              <li>• 精美配图</li>
              <li>• 睡前哄睡模式</li>
            </ul>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/recording")}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary-orange to-primary-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            立即体验新功能 →
          </button>
          <p className="text-sm text-gray-400">
            页面将在3秒后自动跳转...
          </p>
        </div>
        
        {/* 装饰 */}
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-orange/30"
              style={{
                animation: `pulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* 装饰背景 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float">✨</div>
        <div className="absolute top-40 right-20 text-3xl opacity-15 animate-float" style={{ animationDelay: "1s" }}>🌟</div>
        <div className="absolute bottom-40 left-20 text-3xl opacity-15 animate-float" style={{ animationDelay: "2s" }}>✨</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: "0.5s" }}>🌙</div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
