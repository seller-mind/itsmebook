"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SharePage() {
  const router = useRouter();
  const [story, setStory] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storyStr = sessionStorage.getItem("bedtime_story");
    if (storyStr) {
      setStory(JSON.parse(storyStr));
    }
  }, []);

  const getShareText = () => {
    const childNameText = story?.childName || "孩子";
    return `给孩子生成了一本专属绘本，太惊喜了！

故事里叫着${childNameText}的名字，连喜欢的恐龙都变成了好朋友！孩子一听就知道"这是我呀！"

#睡前故事 #AI绘本 #育儿好物 #是我呀`;
  };

  const shareText = getShareText();

  const handleCopy = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 使用Web Share API分享（支持移动端原生分享）
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title || "是我呀-专属绘本",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // 用户取消分享
        if ((err as Error).name !== "AbortError") {
          console.error("分享失败:", err);
        }
      }
    } else {
      // 不支持Web Share API时，复制文案
      handleCopy();
    }
  };

  const handleShare = () => {
    // 使用Web Share API
    handleNativeShare();
  };

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
          <button onClick={() => router.push("/create")} className="btn-primary mt-4 px-6 py-2 text-sm">
            先去创建故事
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* 顶部 */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">返回</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">✨</span>
          <span className="font-bold text-gray-900">魔法时刻</span>
        </div>
        <div className="w-16" />
      </div>

      <div className="max-w-lg mx-auto px-4 pb-12 space-y-6">
        {/* 成功提示 */}
        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center animate-bounce">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">魔法时刻已生成！</h1>
          <p className="text-gray-500 text-sm">
            看看效果，分享给朋友
          </p>
        </div>

        {/* 视频预览 */}
        {story.pages && story.pages[0] && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="aspect-[9/16] bg-gradient-to-br from-indigo-200 to-purple-200 relative">
              <img
                src={story.pages[0].imageUrl}
                alt="封面"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-8">
                <div className="text-center text-white">
                  <p className="font-bold text-lg mb-1">{story.title}</p>
                  <p className="text-sm text-white/80">{story.childName}的睡前故事</p>
                </div>
              </div>
              {/* 播放按钮 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-white transition-colors cursor-pointer">
                  <svg className="w-6 h-6 text-primary-orange ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* 时长 */}
              <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                15秒
              </div>
            </div>
          </div>
        )}

        {/* 分享到 */}
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-4">分享到</h3>
          <div className="flex gap-4">
            <button
              onClick={handleNativeShare}
              className="flex-1 flex flex-col items-center gap-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xl text-white shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">一键分享</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 flex flex-col items-center gap-2 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl shadow-sm">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">复制文案</span>
            </button>
          </div>
        </div>

        {/* 复制文案 */}
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-4">一键复制文案</h3>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {shareText}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={`mt-4 w-full py-3 rounded-xl font-medium text-sm transition-all ${
              copied
                ? "bg-green-500 text-white"
                : "bg-primary-orange text-white hover:bg-primary-dark"
            }`}
          >
            {copied ? "已复制！" : "复制文案"}
          </button>
        </div>

        {/* 分享解锁 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-100 text-center">
          <p className="text-lg mb-1">🎁 分享解锁</p>
          <p className="text-sm text-gray-600">
            分享到朋友圈，可解锁1个免费完整故事
          </p>
        </div>

        {/* 重新体验 */}
        <div className="text-center pt-2">
          <button
            onClick={() => router.push("/create")}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            再创建一个故事
          </button>
        </div>
      </div>
    </div>
  );
}
