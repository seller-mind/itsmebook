"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STORY_THEMES } from "@/lib/story";

export default function StorySelectPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [childName, setChildName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!selectedTheme && !customPrompt.trim()) {
      setError("请选择一个故事主题或输入自定义故事");
      return;
    }

    const name = childName.trim() || "小宝贝";
    setIsGenerating(true);
    setProgress(0);
    setError("");

    try {
      setStatus("正在生成故事文本...");
      setProgress(5);

      // 启动模拟进度：从5%缓慢爬到25%，每2秒+1%
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 25) {
            clearInterval(progressTimer);
            return 25;
          }
          return prev + 1;
        });
      }, 2000);

      // 调用故事生成API
      const response = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: name,
          themeId: selectedTheme || "custom",
          styleId: "watercolor",
          customPrompt: customPrompt.trim(),
        }),
      });

      // 检查是否是流式响应
      const contentType = response.headers.get("content-type") || "";
      const isStreaming = contentType.includes("text/event-stream");

      let data;

      if (!isStreaming) {
        // 非流式响应（demo模式），直接解析JSON
        clearInterval(progressTimer);
        setProgress(30);
        data = await response.json();
      } else {
        // 流式响应
        clearInterval(progressTimer);
        setProgress(30);

        // 处理流式响应
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullData = "";

        if (!reader) {
          throw new Error("无法读取响应流");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 流式读取时渐进进度：30→55%
          setProgress(prev => Math.min(prev + 1, 55));

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const lineData = line.slice(6).trim();
              if (lineData && lineData !== "[DONE]") {
                try {
                  const parsed = JSON.parse(lineData);
                  if (parsed.success === false) {
                    throw new Error(parsed.message || "故事生成失败");
                  }
                  if (parsed.story) {
                    fullData = JSON.stringify(parsed);
                  }
                } catch {
                  // 忽略解析错误，继续接收
                }
              }
            }
          }
        }

        data = JSON.parse(fullData);
      }

      if (!data.success) {
        throw new Error(data.message || "故事生成失败");
      }

      const story = data.story;

      // 生成配图
      setStatus("正在生成配图...");
      const pagesWithImages = await Promise.all(
        story.pages.map(async (page: any, index: number) => {
          // 配图生成进度：55%→85%
          setProgress(55 + Math.round((index / story.pages.length) * 30));

          try {
            const imageRes = await fetch("/api/image/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imagePrompt: page.imagePrompt,
                style: "watercolor",
                index,
              }),
            });

            const imageData = await imageRes.json();
            return {
              ...page,
              imageUrl: imageData.success ? imageData.imageUrl : imageData.imageUrl || getPlaceholderImage(index),
            };
          } catch {
            return {
              ...page,
              imageUrl: getPlaceholderImage(index),
            };
          }
        })
      );

      setProgress(85);
      setStatus("正在完成...");

      // 保存故事数据到sessionStorage
      const storyData = {
        title: story.title,
        childName: name,
        pages: pagesWithImages,
        voiceUrl: sessionStorage.getItem("bedtime_voice_url") || "",
        voiceId: sessionStorage.getItem("bedtime_voice_id") || "",
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem("bedtime_story", JSON.stringify(storyData));

      setProgress(100);
      setStatus("完成！");

      // 跳转到播放器
      setTimeout(() => {
        router.push("/story/player");
      }, 500);
    } catch (err: any) {
      setError(err.message || "生成失败，请重试");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      {/* 顶部导航 */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={() => router.push("/recording")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">声音录制</span>
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
          <span>录声音</span>
          <span>选故事</span>
          <span>听故事</span>
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
              正在生成你的专属故事
            </h3>
            <p className="text-sm text-gray-500 mb-2">{status}</p>
            <p className="text-xs text-gray-400">
              这可能需要1-2分钟，请耐心等待
            </p>
          </div>
        </div>
      )}

      {/* 主内容 */}
      <div className="max-w-lg mx-auto px-4 pb-12">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">选择今晚的故事类型</h1>
          <p className="text-sm text-gray-500">
            选一个孩子喜欢的，或者告诉我你想要的故事
          </p>
        </div>

        {/* 孩子名字输入 */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            孩子名字（可选）
          </label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="输入名字，故事里会提到"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-orange focus:outline-none transition-colors text-base"
          />
        </div>

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

        {/* 自定义故事 */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
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
    { colors: ["#F0E68C", "#EEE8AA", "#BDB76B"], emoji: "🌻" },
    { colors: ["#FFA07A", "#FA8072", "#FF7F50"], emoji: "🔥" },
    { colors: ["#87CEFA", "#4169E1", "#6495ED"], emoji: "🌊" },
    { colors: ["#D8BFD8", "#DDA0DD", "#EE82EE"], emoji: "🌺" },
    { colors: ["#AFEEEE", "#40E0D0", "#48D1CC"], emoji: "🦋" },
    { colors: ["#FFDAB9", "#FFE4B5", "#FFA500"], emoji: "🐻" },
  ];
  
  const gradient = gradients[index % gradients.length];
  const [color1, color2, color3] = gradient.colors;
  const emoji = gradient.emoji;
  
  // 生成 SVG 占位图
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${color2};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color3};stop-opacity:1" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="800" height="800" fill="url(#grad)" rx="40"/>
      <circle cx="400" cy="400" r="300" fill="url(#glow)"/>
      <text x="400" y="420" font-size="180" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      <text x="400" y="650" font-size="32" text-anchor="middle" fill="white" opacity="0.8" font-family="sans-serif">第${index + 1}页</text>
    </svg>
  `.trim();
  
  // 将 SVG 转为 data URL
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}
