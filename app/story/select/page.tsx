"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { STORY_THEMES } from "@/lib/story";
import { CLASSIC_STORIES, STORY_CATEGORIES, ClassicStory } from "@/lib/classic-stories";
import { startGeneration, pollGeneratingStatus, getGeneratingState, clearGeneratingState, saveCompletedBook } from "@/lib/story-generator";

// 孩子档案类型
interface ChildProfile {
  name?: string;
  ageGroup?: string;
  favoriteAnimal?: string;
  favoriteColor?: string;
  personality?: string;
  theme?: string;
  location?: string;
  lifeEvent?: string;
}

// 声音选项
interface VoiceOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: "longhuhu_v3", name: "龙呼呼", emoji: "🐉", description: "天真女童，最适合故事" },
  { id: "xiaoyi_v3", name: "亲切老师", emoji: "🧑‍🏫", description: "温暖女声，娓娓道来" },
  { id: "zhichu_v3", name: "阳光少年", emoji: "👨‍🎓", description: "活泼男童声线" },
  { id: "zhimiao_v3", name: "睡前低语", emoji: "🎭", description: "轻柔女声，适合睡前" },
  { id: "zhiyan_v3", name: "故事大王", emoji: "🌟", description: "浑厚男声，讲大冒险" },
];

// localStorage 操作辅助函数
const storage = {
  getGenerating: (): any | null => {
    try {
      const str = localStorage.getItem("itsmebook_generating");
      return str ? JSON.parse(str) : null;
    } catch { return null; }
  },
  setGenerating: (data: any) => {
    try {
      localStorage.setItem("itsmebook_generating", JSON.stringify(data));
    } catch { /* 存储失败，忽略 */ }
  },
  clearGenerating: () => {
    try {
      localStorage.removeItem("itsmebook_generating");
    } catch { /* 忽略 */ }
  },
  getBooks: (): any[] => {
    try {
      const str = localStorage.getItem("itsmebook_books");
      return str ? JSON.parse(str) : [];
    } catch { return []; }
  },
  addBook: (book: any) => {
    try {
      const books = storage.getBooks();
      books.unshift({ ...book, id: Date.now().toString() });
      localStorage.setItem("itsmebook_books", JSON.stringify(books.slice(0, 50))); // 最多保留50个
    } catch { /* 忽略 */ }
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

export default function StorySelectPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [childName, setChildName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  
  // 经典故事库 Tab状态
  const [activeTab, setActiveTab] = useState<"classic" | "custom">("custom");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(STORY_CATEGORIES.map(cat => [cat.name, true]))
  );
  const [selectedClassicStory, setSelectedClassicStory] = useState<ClassicStory | null>(null);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [hasLastStory, setHasLastStory] = useState(false);
  
  // 声音选择
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);

  // 读取孩子档案 + 判断免费用户 + 检查上次绘本
  useEffect(() => {
    const profileStr = sessionStorage.getItem("itsmebook_child_profile");
    if (profileStr) {
      try {
        const profile: ChildProfile = JSON.parse(profileStr);
        if (profile.name) {
          setChildName(profile.name);
        }
        if (profile.theme) {
          const matchedTheme = STORY_THEMES.find(t => t.id === profile.theme);
          if (matchedTheme) {
            setSelectedTheme(matchedTheme.id);
          }
        }
      } catch (e) {
        console.error("解析孩子档案失败:", e);
      }
    }

    // 判断是否免费用户
    const userStr = localStorage.getItem("itsmebook_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsFreeUser((user.freeCount || 0) <= 0);
      } catch {
        setIsFreeUser(true);
      }
    } else {
      setIsFreeUser(true);
    }

    // 检查是否有上次未看完的绘本
    const lastStory = sessionStorage.getItem("bedtime_story") || localStorage.getItem("itsmebook_last_story");
    if (lastStory) {
      try {
        const parsed = JSON.parse(lastStory);
        if (parsed.pages && parsed.pages.length > 0) {
          setHasLastStory(true);
        }
      } catch {}
    }
  }, []);

  // 轮询生成进度 - 独立于组件生命周期
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 检查是否有正在进行的生成任务
    const genState = getGeneratingState();
    if (genState && genState.status === 'generating') {
      setIsGenerating(true);
      setProgress(genState.progress);
      setStatus(genState.step);
    }

    // 启动轮询
    pollTimerRef.current = setInterval(() => {
      const result = pollGeneratingStatus();
      
      if (result.isGenerating) {
        setIsGenerating(true);
        setProgress(result.progress);
        setStatus(result.step);
      } else if (result.isCompleted && result.storyData) {
        setIsGenerating(false);
        setProgress(100);
        clearInterval(pollTimerRef.current!);
        // 跳转到播放器
        setTimeout(() => router.push("/story/player"), 500);
      } else if (result.isFailed) {
        setIsGenerating(false);
        setError(result.error || "生成失败，请重试");
        clearInterval(pollTimerRef.current!);
      } else {
        setIsGenerating(false);
      }
    }, 1000);

    // 监听自定义完成事件（用户停留在当前页时直接响应）
    const handleComplete = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsGenerating(false);
      setProgress(100);
      clearInterval(pollTimerRef.current!);
      setTimeout(() => router.push("/story/player"), 500);
    };
    const handleFailed = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsGenerating(false);
      setError(customEvent.detail || "生成失败，请重试");
      clearInterval(pollTimerRef.current!);
    };

    window.addEventListener("storyGenerationComplete", handleComplete);
    window.addEventListener("storyGenerationFailed", handleFailed);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      window.removeEventListener("storyGenerationComplete", handleComplete);
      window.removeEventListener("storyGenerationFailed", handleFailed);
    };
  }, [router]);

  // 继续上次未读完的绘本
  const resumeLastStory = () => {
    const storyStr = sessionStorage.getItem("bedtime_story") || localStorage.getItem("itsmebook_last_story");
    if (storyStr) {
      // 确保sessionStorage也有（防页面刷新后丢失）
      sessionStorage.setItem("bedtime_story", storyStr);
      router.push("/story/player");
    }
  };

  // 切换分类展开/收起
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // 选择经典故事并开始生成 - 委托给后台生成服务
  const handleSelectClassicStory = async (story: ClassicStory) => {
    const name = childName.trim() || "小宝贝";
    setSelectedClassicStory(story);
    setIsGenerating(true);
    setProgress(0);
    setError("");

    // 保存选中的声音ID到sessionStorage，播放器需要用到
    sessionStorage.setItem("bedtime_voice_id", selectedVoice.id);

    startGeneration({
      childName: name,
      themeId: "classic",
      customPrompt: "",
      styleId: "watercolor",
      ageGroup: "",
      favoriteAnimal: "",
      favoriteColor: "",
      personality: "",
      location: "",
      lifeEvent: "",
      voiceId: selectedVoice.id,
      isFreeUser,
      isClassic: true,
      classicPages: story.pages,
      classicTitle: story.title,
    });
  };

  // 自定义故事生成 - 委托给后台生成服务
  const handleGenerate = async () => {
    if (!selectedTheme && !customPrompt.trim()) {
      setError("请选择一个故事主题或输入自定义故事");
      return;
    }

    const name = childName.trim() || "小宝贝";
    setIsGenerating(true);
    setProgress(0);
    setError("");

    // 读取孩子档案参数
    const profileStr = sessionStorage.getItem("itsmebook_child_profile");
    let profile: ChildProfile = {};
    if (profileStr) {
      try {
        profile = JSON.parse(profileStr);
      } catch (e) {
        console.error("解析孩子档案失败:", e);
      }
    }

    // 保存选中的声音ID到sessionStorage，播放器需要用到
    sessionStorage.setItem("bedtime_voice_id", selectedVoice.id);

    startGeneration({
      childName: name,
      themeId: selectedTheme || "custom",
      customPrompt: customPrompt.trim(),
      styleId: "watercolor",
      ageGroup: profile.ageGroup || "",
      favoriteAnimal: profile.favoriteAnimal || "",
      favoriteColor: profile.favoriteColor || "",
      personality: profile.personality || "",
      location: profile.location || "",
      lifeEvent: profile.lifeEvent || "",
      voiceId: selectedVoice.id,
      isFreeUser,
      isClassic: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      {/* 顶部导航 */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={() => router.push("/create")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">填写信息</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">📖</span>
          <span className="font-bold text-gray-900">选择故事</span>
        </div>
        <div className="w-16" />
      </div>

      {/* 进度指示 */}
      <div className="max-w-lg mx-auto px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
              ✓
            </div>
            <div className="flex-1 h-1 bg-green-500 rounded-full" />
            <div className="w-6 h-6 rounded-full bg-primary-orange text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
              3
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>填信息</span>
          <span>选故事</span>
          <span>看绘本</span>
        </div>
      </div>

      {/* 生成中状态 */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#grad2)"
                  strokeWidth="6"
                  strokeDasharray={`${progress * 2.83} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF8C42" />
                    <stop offset="100%" stopColor="#FFD93D" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-700">{progress}%</span>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {selectedClassicStory ? "正在准备经典故事" : "正在生成你的专属故事"}
            </h3>
            <p className="text-sm text-gray-500 mb-2">{status}</p>
            <p className="text-xs text-gray-400">
              {selectedClassicStory 
                ? "经典故事即选即读，马上就好" 
                : "这可能需要1-2分钟，请耐心等待"
              }
            </p>
          </div>
        </div>
      )}

      {/* 主内容 */}
      <div className="max-w-lg mx-auto px-4 pb-12">
        {/* 继续上次绘本 */}
        {hasLastStory && !isGenerating && (
          <div
            onClick={resumeLastStory}
            className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-md p-5 mb-4 cursor-pointer hover:shadow-lg transition-shadow border border-orange-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                📖
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">继续上次的绘本</p>
                <p className="text-sm text-gray-500">点击继续阅读未看完的故事</p>
              </div>
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">选择今晚的故事</h1>
          <p className="text-sm text-gray-500">
            经典故事即选即读，也可让AI创作专属故事
          </p>
        </div>

        {/* Tab切换 */}
        <div className="bg-white rounded-2xl shadow-md p-1.5 mb-4 flex">
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "custom"
                  ? "bg-gradient-to-r from-primary-orange to-amber-400 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>✨</span>
            <span>自定义故事</span>
          </button>
          <button
            onClick={() => setActiveTab("classic")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "classic"
                  ? "bg-gradient-to-r from-primary-orange to-amber-400 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>📚</span>
            <span>经典故事库</span>
          </button>
        </div>

        {/* 自定义故事 */}
        {activeTab === "custom" && (
          <>
            {/* 孩子名字输入 - 已从上一步带入 */}
            {childName && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-md p-5 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                    👧
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">孩子的名字</p>
                    <p className="font-bold text-gray-900 text-lg">{childName}的专属故事</p>
                  </div>
                </div>
              </div>
            )}

            {/* 故事主题选择 */}
            <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
              <h3 className="font-medium text-gray-900 text-sm mb-3">故事模板</h3>
              <div className="grid grid-cols-3 gap-3">
                {STORY_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedTheme === theme.id
                        ? "bg-gradient-to-br " + theme.color + " ring-2 ring-primary-orange shadow-md"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{theme.emoji}</span>
                    <p className="font-medium text-gray-900 text-xs">{theme.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义故事输入 */}
            <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
              <h3 className="font-medium text-gray-900 text-sm mb-3">自定义故事</h3>
              <p className="text-xs text-gray-500 mb-3">
                说一句话或关键词，我会帮你生成故事
              </p>
              {/* 示例标签 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  "小兔子今天去旅行了",
                  "星星和月亮是好朋友",
                  "讲一个关于勇敢的冒险故事",
                  "小熊想吃天上的云朵",
                  "彩虹桥的另一边有什么",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setCustomPrompt(example);
                      setSelectedTheme("");
                    }}
                    className="px-3 py-1.5 rounded-full text-xs bg-gray-50 border border-gray-200 text-gray-600 hover:bg-primary-orange/10 hover:border-primary-orange/50 hover:text-primary-orange transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  if (e.target.value.trim()) setSelectedTheme("");
                }}
                placeholder="写下你想要的故事情节..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-orange focus:outline-none transition-colors text-base resize-none"
              />
            </div>

            {/* 声音选择 */}
            <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
              <h3 className="font-medium text-gray-900 text-sm mb-3">选择朗读声音</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`flex-shrink-0 p-3 rounded-xl text-center transition-all min-w-[90px] ${
                      selectedVoice.id === voice.id
                        ? "bg-gradient-to-br from-primary-orange/10 to-amber-50 ring-2 ring-primary-orange shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{voice.emoji}</span>
                    <p className={`font-medium text-xs ${selectedVoice.id === voice.id ? "text-primary-orange" : "text-gray-700"}`}>
                      {voice.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight line-clamp-2">{voice.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 开始生成 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  开始生成故事
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* 提示 */}
            <p className="text-xs text-gray-400 text-center mt-4">
              生成大约需要1-2分钟，配图会自动生成
            </p>
          </>
        )}

        {/* 经典故事库 */}
        {activeTab === "classic" && (
          <div className="space-y-3">
            {/* 声音选择（经典故事也支持选择声音） */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
              <h3 className="font-medium text-gray-900 text-sm mb-3">选择朗读声音</h3>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`flex-shrink-0 p-2.5 rounded-xl text-center transition-all min-w-[80px] ${
                      selectedVoice.id === voice.id
                        ? "bg-gradient-to-br from-primary-orange/10 to-amber-50 ring-2 ring-primary-orange"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl block mb-0.5">{voice.emoji}</span>
                    <p className={`font-medium text-xs ${selectedVoice.id === voice.id ? "text-primary-orange" : "text-gray-700"}`}>
                      {voice.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 故事数量提示 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <span className="text-lg">📚</span>
                <span>精选 {CLASSIC_STORIES.length} 个公版经典故事，免去等待，即选即读</span>
              </p>

            </div>

            {/* 分类展示 */}
            {STORY_CATEGORIES.map((category) => {
              const categoryStories = CLASSIC_STORIES.filter(s => s.category === category.name);
              const isExpanded = expandedCategories[category.name];
              
              return (
                <div key={category.name} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  {/* 分类标题 */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.emoji}</span>
                      <span className="font-medium text-gray-800">{category.name}</span>
                      <span className="text-xs text-gray-500">({category.count})</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 分类内容 */}
                  {isExpanded && (
                    <div className="p-3 space-y-2">
                      {categoryStories.map((story) => (
                        <button
                          key={story.id}
                          onClick={() => handleSelectClassicStory(story)}
                          disabled={isGenerating}
                          className="w-full p-3 rounded-xl border border-gray-100 hover:border-primary-orange/50 hover:bg-primary-orange/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg flex-shrink-0">
                              {story.categoryEmoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-medium text-gray-900 truncate">{story.title}</h4>
                                <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full flex-shrink-0">
                                  {story.ageRange}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">{story.description}</p>
                              <p className="text-xs text-primary-orange mt-1 flex items-center gap-1">
                                <span>点击立即播放</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 占位图 - 生成与故事主题相关的渐变SVG
function getPlaceholderImage(index: number): string {
  // 主题色渐变配置，每页不同
  const gradients = [
    { colors: ["#FFB6C1", "#FFC0CB", "#FF69B4"], emoji: "🌙" },
    { colors: ["#87CEEB", "#ADD8E6", "#B0E0E6"], emoji: "⭐" },
    { colors: ["#DDA0DD", "#EE82EE", "#DA70D6"], emoji: "🌸" },
    { colors: ["#98FB98", "#90EE90", "#7CFC00"], emoji: "🌿" },
    { colors: ["#FFD700", "#FFA500", "#FF8C00"], emoji: "🌻" },
    { colors: ["#87CEFA", "#4682B4", "#5F9EA0"], emoji: "🐱" },
    { colors: ["#F5DEB3", "#DEB887", "#D2B48C"], emoji: "🐶" },
    { colors: ["#FFA07A", "#FA8072", "#E9967A"], emoji: "🦊" },
  ];

  const config = gradients[index % gradients.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${config.colors[0]}"/>
          <stop offset="50%" style="stop-color:${config.colors[1]}"/>
          <stop offset="100%" style="stop-color:${config.colors[2]}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#grad${index})"/>
      <text x="400" y="400" font-size="200" text-anchor="middle" dominant-baseline="middle">${config.emoji}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
