"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StoryPlayer, { StoryPage } from "@/components/story/StoryPlayer";
import MagicVideoGenerator from "@/components/story/MagicVideoGenerator";

export default function StoryPlayerPage() {
  const router = useRouter();
  const [story, setStory] = useState<{
    title: string;
    childName: string;
    pages: StoryPage[];
    voiceUrl: string;
    isFreeUser?: boolean;
  } | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);

  // 加载故事数据
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 优先从sessionStorage读取，fallback到localStorage（防返回丢失）
    let storyStr = sessionStorage.getItem("bedtime_story");
    if (!storyStr) {
      storyStr = localStorage.getItem("itsmebook_last_story");
      if (storyStr) {
        // 从localStorage恢复到sessionStorage
        sessionStorage.setItem("bedtime_story", storyStr);
      }
    }
    if (storyStr) {
      try {
        const storyData = JSON.parse(storyStr);
        setStory(storyData);
        setIsFreeUser(storyData.isFreeUser || false);
      } catch {
        loadDemoStory();
      }
    } else {
      loadDemoStory();
    }
  }, []);

  const loadDemoStory = () => {
    // 演示故事数据
    const demoStory = {
      title: "小宝贝的睡前故事",
      childName: "小宝贝",
      voiceUrl: "",
      pages: [
        {
          pageNumber: 1,
          text: "夜幕降临，月亮慢慢爬上了天空。小宝贝躺在床上，闭上眼睛，听妈妈讲今晚的故事。",
          imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 2,
          text: "从前，在一片美丽的大森林里，住着一只小白兔。它的毛色雪白雪白的，眼睛亮晶晶的，最喜欢在月亮升起的时候去森林里玩。",
          imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 3,
          text: "小兔子最喜欢的事情，就是在月亮升起的时候，去森林里找星星玩。星星们住在很高很高的天上，眨着眼睛，就像一盏盏小灯笼。",
          imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 4,
          text: "\"星星星星，你们今晚要去哪里玩呀？\"小兔子轻轻地问。星星们眨眨眼睛说：\"今晚我们一起去小宝贝的梦里玩！\"",
          imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 5,
          text: "小兔子听了，好羡慕呀。它也想和小宝贝一起玩。就在这时，一阵温柔的风吹过，轻轻地对小兔子说：\"快去吧，小宝贝已经做好梦的准备了。\"",
          imageUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 6,
          text: "小兔子轻轻地走进了小宝贝的梦里。它们一起在云朵上跳舞，在星星间捉迷藏，开心极了。",
          imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 7,
          text: "小宝贝睡得好香好香，嘴角露出了甜甜的笑容。小兔子轻轻地趴在小宝贝的枕头边，也闭上了眼睛。",
          imageUrl: "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800&h=800&fit=crop",
        },
        {
          pageNumber: 8,
          text: "月亮轻轻地说：\"晚安小宝贝，晚安小兔子。做个好梦，明天见。\"星星们眨眨眼睛，也在旁边安静地睡着了。",
          imageUrl: "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&h=800&fit=crop",
        },
      ] as StoryPage[],
    };
    setStory(demoStory as any);
  };

  const handleShare = () => {
    setShowShare(true);
  };

  const handleGenerateVideo = () => {
    setShowVideo(true);
  };

  // 下载绘本（付费用户）
  const handleDownload = async () => {
    if (!story) return;
    try {
      const res = await fetch("/api/story/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: story.title,
          childName: story.childName,
          pages: story.pages,
        }),
      });
      if (!res.ok) throw new Error("下载失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${story.title}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("下载失败，请重试");
    }
  };

  // 分享文案
  const getShareText = () => {
    const childNameText = story?.childName || "孩子";
    return `给孩子生成了一本专属绘本，太惊喜了！

故事里叫着${childNameText}的名字，连喜欢的恐龙都变成了好朋友！孩子一听就知道"这是我呀！"

#睡前故事 #AI绘本 #育儿好物 #是我呀`;
  };

  const shareText = getShareText();

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert("已复制到剪贴板！");
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
      copyToClipboard();
    }
  };

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 播放器 */}
      <StoryPlayer
        pages={story.pages}
        title={story.title}
        childName={story.childName}
        voiceAudioUrl={story.voiceUrl || undefined}
        onShare={handleShare}
        onGenerateVideo={handleGenerateVideo}
        isFreeUser={isFreeUser}
        onDownload={handleDownload}
      />

      {/* 分享弹窗 */}
      {showShare && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowShare(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full sm:max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">分享故事</h3>
              <button
                onClick={() => setShowShare(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 一键分享 */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-2">一键分享</p>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {shareText}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleNativeShare}
                  className="flex-1 py-2.5 rounded-xl bg-primary-orange text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制文案
                </button>
              </div>
            </div>

            {/* 分享解锁提示 */}
            <p className="text-xs text-gray-400 text-center mt-4">
              分享到朋友圈，可解锁1个免费完整故事
            </p>
          </div>
        </div>
      )}

      {/* 魔法视频弹窗 */}
      {showVideo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">保存故事卡片</h3>
              <button
                onClick={() => setShowVideo(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MagicVideoGenerator
              pages={story.pages}
              title={story.title}
              childName={story.childName}
              voiceAudioUrl={story.voiceUrl || undefined}
            />
          </div>
        </div>
      )}
    </>
  );
}
