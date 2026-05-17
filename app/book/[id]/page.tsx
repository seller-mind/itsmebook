"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import BookViewer, { BookPageData } from "@/components/BookViewer";
import { AIDisclaimer } from "@/components/AIBadge";

// Mock数据（作为fallback）
const MOCK_BOOK_DATA = {
  id: "demo-book",
  title: "小明的太空探险",
  characterName: "小明",
  characterGender: "男孩",
  characterAge: "5",
  style: "fantasy",
  theme: "adventure",
  pages: [
    {
      pageNumber: 1,
      text: "小明住在一个美丽的小村庄里。一天清晨，他在后院发现了一张泛着微光的旧地图。",
      imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 2,
      text: "\"这张地图会指引我去哪里呢？\"小明好奇地问天上的云朵。云朵摇摇头，不肯告诉他。",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 3,
      text: "地图上画着一座彩虹桥，通向一颗闪烁的星星。小明决定踏上这段奇妙的旅程。",
      imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 4,
      text: "小明跟着地图，穿过了密密的竹林。竹叶沙沙作响，像是在唱一首神秘的歌。",
      imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 5,
      text: "竹林深处有一只会说话的小兔子，它戴着一顶魔法师帽子，正在地上画着什么。",
      imageUrl: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 6,
      text: "\"你要去星星那里吗？\"小兔子问道，\"我可以帮你画一扇传送门。\"",
      imageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 7,
      text: "小兔子挥动魔法棒，地上出现了一个闪闪发光的圆圈。小明深吸一口气，跳了进去。",
      imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 8,
      text: "穿过传送门，小明来到了一片漂浮在天空中的花园。到处都是发光的蝴蝶在翩翩起舞。",
      imageUrl: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 9,
      text: "\"欢迎来到云端花园！\"一只戴着眼镜的猫头鹰从书中抬起头来，\"我是这里的守护者。\"",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 10,
      text: "猫头鹰告诉小明，要到达星星，必须先穿过迷雾森林，那里住着调皮的影子精灵。",
      imageUrl: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 11,
      text: "小明勇敢地走进迷雾森林，四周什么都看不清。\"嘻嘻嘻\"，影子精灵们躲在树后偷笑。",
      imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 12,
      text: "影子精灵们吹灭了小明的灯笼，想让他迷路。但小明想起了妈妈教他的童谣。",
      imageUrl: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 13,
      text: "小明唱起了歌，歌声越来越响亮。影子精灵们捂住耳朵，从树后跑了出来。",
      imageUrl: "https://images.unsplash.com/photo-1474291103669-7fc568846da4?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 14,
      text: "\"你的歌声真好听！\"影子精灵们不再捉弄他，反而想和他交朋友。",
      imageUrl: "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 15,
      text: "影子精灵们送给小明一颗会发光的萤石：\"拿着它，你就能看清前方的路了。\"",
      imageUrl: "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 16,
      text: "有了萤石的指引，小明走出了迷雾森林。眼前出现了一座用彩虹建成的桥。",
      imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 17,
      text: "桥的尽头有一扇巨大的门，门上镶嵌着无数闪闪发光的星星宝石。",
      imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 18,
      text: "小兔子、猫头鹰、还有影子精灵们，都跑来帮助小明。他们的友谊就是打开门的钥匙。",
      imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 19,
      text: "小明把小精灵送的星星种子种在了后院最温暖的角落。种子马上发芽，开出了璀璨的花。",
      imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop",
    },
    {
      pageNumber: 20,
      text: "整个村庄都被美丽的星光照亮了，大家都出来看这片奇迹。小明成为了村庄里的小英雄，也明白了真正的勇气来自友谊和善良。",
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

// 风格名称映射
const STYLE_NAMES: Record<string, string> = {
  watercolor: "水彩风格",
  oil: "油画风格",
  anime: "日系动漫",
  chinese: "国风水墨",
  pastoral: "温暖田园",
  fantasy: "梦幻童话",
  minimalist: "简约现代",
  nordic: "北欧极简",
};

// 主题名称映射
const THEME_NAMES: Record<string, string> = {
  adventure: "冒险",
  friendship: "友谊",
  growth: "成长",
  courage: "勇气",
  imagination: "想象力",
  family: "家庭",
  holiday: "节日",
  nature: "自然",
};

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [bookData, setBookData] = useState<typeof MOCK_BOOK_DATA | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealBook, setIsRealBook] = useState(false);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);

  // 从localStorage读取真实绘本数据或从sample-books.json读取示例绘本
  useEffect(() => {
    const loadBookData = async () => {
      // 先检查localStorage
      const stored = localStorage.getItem(`book_${params.id}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setBookData({
            ...MOCK_BOOK_DATA,
            ...data,
          });
          setIsRealBook(true);
          setIsLoading(false);
          return;
        } catch {
          // continue to check sample books
        }
      }

      // 检查是否是示例绘本
      if (params.id && typeof params.id === "string" && params.id.startsWith("sample-")) {
        try {
          const response = await fetch("/sample-books.json");
          const sampleBooks = await response.json();
          const sampleBook = sampleBooks.find((b: any) => b.id === params.id);
          if (sampleBook) {
            setBookData({
              id: sampleBook.id,
              title: sampleBook.title,
              characterName: sampleBook.characterName,
              characterGender: sampleBook.characterGender,
              characterAge: sampleBook.characterAge,
              style: sampleBook.style,
              theme: sampleBook.theme,
              pages: sampleBook.pages.map((p: any) => ({
                pageNumber: p.pageNumber,
                text: p.text,
                imageUrl: p.imageUrl,
              })),
            });
            setIsRealBook(false);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to load sample book:", err);
        }
      }

      // Fallback to mock data
      setBookData(MOCK_BOOK_DATA);
      setIsRealBook(false);
      setIsLoading(false);
    };

    loadBookData();
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
            主角：{bookData.characterName} 
            {bookData.characterGender && ` | ${bookData.characterGender}`}
            {bookData.characterAge && ` ${bookData.characterAge}岁`}
            {bookData.style && ` | ${STYLE_NAMES[bookData.style] || bookData.style}`}
            {bookData.theme && ` | ${THEME_NAMES[bookData.theme] || bookData.theme}`}
            | 共{bookData.pages.length}页
          </p>
          {!isSignedIn && (
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1">
              <span>👀</span>
              <span>{isRealBook ? "预览模式" : "示例绘本"}</span>
            </div>
          )}
          {isRealBook && isSignedIn && (
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-full px-4 py-1">
              <span>✅</span>
              <span>已保存</span>
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

        {/* 内容举报入口 */}
        <div className="mt-6 text-center">
          <a
            href="mailto:haimozhouqiu@outlook.com?subject=内容举报&body=您好，我举报「是我呀」生成的绘本存在以下问题："
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
          >
            如发现不当内容，请举报
          </a>
        </div>

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
        isSignedIn={isSignedIn ?? false}
      />
    </div>
  );
}
