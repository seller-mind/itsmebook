"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 首页组件 - 严格按照蓝图v2.1文案
export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    router.push("/recording");
  };

  const handleListenDemo = () => {
    setShowDemo(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* Hero区域 - pt-16为全局fixed导航栏留出空间 */}
      <section className="relative px-4 pt-8 pb-16 text-center max-w-5xl mx-auto overflow-hidden">
        {/* 装饰背景 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute twinkle"
              style={{
                left: `${8 + (i * 9) % 84}%`,
                top: `${5 + (i * 17) % 75}%`,
                animationDelay: `${i * 0.4}s`,
                fontSize: `${10 + (i % 4) * 6}px`,
              }}
            >
              ✨
            </div>
          ))}
          <div className="absolute top-10 left-8 text-5xl opacity-20 cloud-float">☁️</div>
          <div className="absolute top-20 right-12 text-4xl opacity-15 cloud-float" style={{ animationDelay: "2s" }}>
            ☁️
          </div>
          <div className="absolute bottom-20 left-1/4 text-3xl opacity-10 cloud-float" style={{ animationDelay: "4s" }}>
            🌙
          </div>
        </div>

        {/* 主标题 */}
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            <span className="text-gradient">你的声音</span>
            <br />
            <span className="text-xl sm:text-3xl md:text-5xl">是孩子最好的睡前魔法</span>
          </h1>

          {/* 副标题 */}
          <p className="text-xs sm:text-base md:text-lg text-gray-600 mb-8 max-w-xs sm:max-w-md mx-auto leading-relaxed">
            经典童话+AI专属故事，用你的声音讲给孩子听
            <br />
            录10秒，你的声音就能讲一整本
          </p>

          {/* CTA按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={handleListenDemo}
              className="px-8 py-3.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:border-primary-orange hover:text-primary-orange transition-all flex items-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              听听这个魔法
            </button>
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="px-10 py-3.5 rounded-full bg-gradient-to-r from-primary-orange to-primary-dark text-white font-semibold shadow-xl hover:shadow-2xl transition-all text-base flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  跳转中...
                </>
              ) : (
                <>
                  立即体验
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* 社会证明 */}
          <p className="text-sm text-gray-500">
            已有 <span className="text-primary-orange font-medium">10,000+</span> 个家庭在用
          </p>
        </div>
      </section>

      {/* 魔法时刻示例区 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-6 sm:p-8 text-center">
          {/* 视频封面 */}
          <div className="max-w-sm mx-auto mb-6">
            <div
              className="aspect-video rounded-2xl bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden relative"
              onClick={handleListenDemo}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <svg className="w-7 h-7 text-primary-orange ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                0:15
              </div>
            </div>
          </div>

          {/* 用户反馈 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 max-w-sm mx-auto">
            <p className="text-gray-700 text-sm leading-relaxed italic">
              "今晚太累了不想读，但女儿说：
              <span className="text-primary-orange font-medium">妈妈我想听你讲故事</span>"
            </p>
            <p className="text-xs text-gray-400 mt-2">—— 北京 · 职场妈妈小雨</p>
          </div>
        </div>
      </section>

      {/* 3步魔法区 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-8">
          3步，你的声音替孩子讲故事
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* 步骤1 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
              <span className="text-3xl">🎤</span>
            </div>
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="font-bold text-gray-900 mb-1">录声音</h3>
            <p className="text-sm text-gray-500 mb-3">30秒，录下你的声音</p>
            <div className="text-xs text-gray-400">约30秒</div>
          </div>

          {/* 连接线 */}
          <div className="hidden sm:flex items-center justify-center absolute left-1/3">
            <div className="w-full h-0.5 bg-gradient-to-r from-pink-300 to-purple-300" />
          </div>

          {/* 步骤2 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
              <span className="text-3xl">📖</span>
            </div>
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="font-bold text-gray-900 mb-1">选故事</h3>
            <p className="text-sm text-gray-500 mb-3">经典童话或AI专属</p>
            <div className="text-xs text-gray-400">20+经典 · 无限AI</div>
          </div>

          {/* 步骤3 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center">
              <span className="text-3xl">🌙</span>
            </div>
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h3 className="font-bold text-gray-900 mb-1">听故事</h3>
            <p className="text-sm text-gray-500 mb-3">翻页浏览，睡前模式</p>
            <div className="text-xs text-gray-400">即刻享用</div>
          </div>
        </div>
      </section>

      {/* 故事库预览区 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
          从经典到专属，总有孩子爱的故事
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">你的声音读经典，还是讲一个独一无二的故事？都行</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 经典故事 */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStart}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">经典故事库</h3>
                <p className="text-xs text-primary-orange">故事库持续更新中</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { emoji: "🇩🇰", name: "安徒生童话", examples: "丑小鸭、拇指姑娘、夜莺" },
                { emoji: "🇨🇳", name: "中国经典", examples: "嫦娥奔月、神笔马良、九色鹿" },
                { emoji: "🇩🇪", name: "格林童话", examples: "睡美人、青蛙王子" },
              ].map((cat, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span>{cat.emoji}</span>
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  <span className="text-gray-400 text-xs">{cat.examples}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI专属故事 */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStart}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">AI专属故事</h3>
                <p className="text-xs text-purple-500">无限生成，独一无二</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { emoji: "🌙", desc: "输入孩子名字，主角就是TA" },
                { emoji: "🎨", desc: "选风格主题，每次都不一样" },
                { emoji: "💡", desc: "融入你想教的道理和习惯" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span>{item.emoji}</span>
                  <span className="text-gray-600">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 场景区 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
          每晚这一刻，你最需要魔法
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">这些时刻，让你的声音陪孩子入睡</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { emoji: "😫", title: "太累了", desc: "不想开口" },
            { emoji: "📚", title: "嫌读绘本", desc: "太麻烦" },
            { emoji: "🤦", title: "觉得自己", desc: "读得不好" },
            { emoji: "🔁", title: "读了三遍", desc: "孩子还要听" },
            { emoji: "🗣️", title: "嗓子哑了", desc: "实在读不动" },
            { emoji: "✈️", title: "出差在外", desc: "语音陪娃" },
          ].map((scene, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={handleStart}
            >
              <span className="text-2xl block mb-2">{scene.emoji}</span>
              <p className="font-medium text-gray-900 text-sm">{scene.title}</p>
              <p className="text-xs text-gray-500">{scene.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 定价预览区 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">解锁更多睡前魔法</h2>
              <p className="text-sm text-gray-500 mt-1">每天一个故事，每晚一份陪伴</p>
            </div>
            <button
              onClick={() => router.push("/pricing")}
              className="text-sm text-primary-orange hover:text-primary-dark transition-colors flex items-center gap-1"
            >
              查看全部
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "免费体验", price: "¥0", desc: "1个故事·6页预览", color: "from-gray-100 to-gray-200" },
              { name: "月卡", price: "¥99", desc: "每天1个·无限生成", color: "from-primary-orange to-primary-dark", highlight: true },
              { name: "年卡", price: "¥699", desc: "每天¥1.9·省¥489", color: "from-green-100 to-green-200" },
            ].map((plan, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${plan.color} rounded-xl p-4 text-center relative ${plan.highlight ? "ring-2 ring-primary-orange" : ""}`}
              >
                {plan.highlight && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-primary-orange text-white px-2 py-0.5 rounded-full">
                    推荐
                  </span>
                )}
                <p className="font-bold text-gray-900 text-sm">{plan.name}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{plan.price}</p>
                <p className="text-xs text-gray-600 mt-1">{plan.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部CTA */}
      <section className="px-4 pb-20 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-primary-orange to-primary-dark rounded-3xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">今晚，让故事替你说晚安</h2>
          <p className="text-white/80 text-sm mb-6">经典童话+AI专属，录10秒就能讲一整本</p>
          <button
            onClick={handleStart}
            className="px-10 py-3.5 rounded-full bg-white text-primary-orange font-semibold hover:bg-gray-100 transition-colors text-base"
          >
            立即体验
          </button>
        </div>
      </section>

      {/* 底部提示 */}
      <div className="text-center text-xs text-gray-400 pb-8 px-4">
        <p>你的声音，是孩子最好的睡前魔法</p>
        <p className="mt-1">
          <button onClick={() => router.push("/privacy")} className="hover:text-gray-600">隐私政策</button>
          {" · "}
          <button onClick={() => router.push("/terms")} className="hover:text-gray-600">使用条款</button>
        </p>
      </div>

      {/* 演示弹窗 */}
      {showDemo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center">
              <span className="text-3xl">🎧</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">听听这个魔法</h3>
            <p className="text-sm text-gray-500 mb-6">
              这是一位妈妈用30秒录音生成的睡前故事，听听效果
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <button className="w-12 h-12 rounded-full bg-primary-orange flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-primary-orange"
                        style={{
                          height: `${8 + Math.random() * 20}px`,
                          opacity: 0.3 + Math.random() * 0.7,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-left">0:15 / 0:15</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="w-full py-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
