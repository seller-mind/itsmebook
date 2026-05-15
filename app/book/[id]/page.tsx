"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import BookViewer, { BookPageData } from "@/components/BookViewer";
import { AIDisclaimer } from "@/components/AIBadge";

// Mock数据
const MOCK_BOOK_DATA = {
  id: "demo-book",
  title: "小明的太空探险",
  characterName: "小明",
  style: "fantasy",
  pages: [
    {
      pageNumber: 1,
      text: "小明住在一个美丽的小村庄里。一天，他在后院发现了一张神秘的地图。",
      imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 2,
      text: "\"这张地图会指引我去哪里呢？\"小明好奇地问。",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 3,
      text: "小明跟着地图，穿过了密密的竹林。",
      imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 4,
      text: "他来到了一座大山前，山脚下有一个闪闪发光的洞口。",
      imageUrl: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 5,
      text: "洞里住着一只可爱的小精灵，小精灵说：\"欢迎来到魔法世界！\"",
      imageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 6,
      text: "小精灵送给小明一颗神奇的星星种子。",
      imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 7,
      text: "小明把种子种在了山顶上，种子马上发芽开花了。",
      imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 8,
      text: "整个村庄都被美丽的星光照亮了，大家都出来庆祝。小明成为了村庄里的小英雄！",
      imageUrl: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&h=800&fit=crop",
    },
  ] as BookPageData[],
};

// 下载提示弹窗（未登录/未付费时）
function DownloadPromptModal({ isOpen, onClose, isSignedIn }: { isOpen: boolean; onClose: () => void; isSignedIn: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center animate-fade-in">
        <span className="text-6xl mb-6 block">📥</span>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {isSignedIn ? "下载功能即将上线" : "登录后即可下载高清PDF"}
        </h3>
        <p className="text-gray-600 mb-8">
          {isSignedIn
            ? "PDF下载功能正在开发中，敬请期待！"
            : "创建账户即可保存和下载您的专属绘本"}
        </p>
        <div className="flex flex-col gap-3">
          {!isSignedIn ? (
            <>
              <SignUpButton mode="modal">
                <button className="w-full btn-primary py-3">免费注册</button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="w-full btn-outline py-3">已有账号？登录</button>
              </SignInButton>
            </>
          ) : (
            <button className="w-full btn-primary py-3" onClick={onClose}>
              我知道了
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [bookData, setBookData] = useState<typeof MOCK_BOOK_DATA | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);

  // 模拟加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setBookData(MOCK_BOOK_DATA);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [params.id]);

  // 下载PDF
  const handleDownload = () => {
    setShowDownloadPrompt(true);
  };

  // 分享（占位函数）
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookData?.title || "是我呀绘本",
          text: "看看我做的专属绘本！",
          url: window.location.href,
        });
      } catch (err) {
        console.log("分享取消");
      }
    } else {
      // 复制链接
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("链接已复制到剪贴板！");
      } catch {
        alert("链接已复制到剪贴板！");
      }
    }
  };

  // 重新生成
  const handleRegenerate = () => {
    if (confirm("确定要重新生成这本绘本吗？")) {
      router.push("/create");
    }
  };

  // 返回首页
  const handleBack = () => {
    router.push("/");
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">📚</div>
          <p className="text-gray-600">正在加载绘本...</p>
        </div>
      </div>
    );
  }

  // 没有数据
  if (!bookData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-6 block">😢</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            绘本不存在
          </h1>
          <p className="text-gray-600 mb-8">
            未找到对应的绘本，请检查链接或重新生成
          </p>
          <button
            onClick={() => router.push("/create")}
            className="btn-primary"
          >
            重新生成
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-orange transition-colors"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">重新生成</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2"
            >
              <span>📥</span>
              <span>下载PDF</span>
            </button>
          </div>
        </div>

        {/* 绘本信息 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {bookData.title}
          </h1>
          <p className="text-gray-500">
            主角：{bookData.characterName} | 风格：{bookData.style} | 共{bookData.pages.length}页
          </p>
          {!isSignedIn && (
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1">
              <span>👀</span>
              <span>预览模式</span>
            </div>
          )}
        </div>

        {/* 绘本预览 */}
        <div className="mb-8">
          <BookViewer
            pages={bookData.pages}
            title={bookData.title}
            characterName={bookData.characterName}
            onDownload={handleDownload}
            onShare={handleShare}
            onRegenerate={handleRegenerate}
          />
        </div>

        {/* AI免责声明 */}
        <AIDisclaimer />

        {/* 底部CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">喜欢这本绘本吗？</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDownload}
              className="btn-primary"
            >
              📥 下载高清PDF
            </button>
            <button
              onClick={handleRegenerate}
              className="btn-outline"
            >
              🔄 再做一本
            </button>
          </div>
          {!isSignedIn && (
            <p className="text-sm text-gray-500 mt-4">
              登录后可永久保存绘本，获得高清PDF下载
            </p>
          )}
        </div>
      </div>

      {/* 下载提示弹窗 */}
      <DownloadPromptModal
        isOpen={showDownloadPrompt}
        onClose={() => setShowDownloadPrompt(false)}
        isSignedIn={isSignedIn}
      />
    </div>
  );
}
