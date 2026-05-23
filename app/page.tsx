"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 首页组件 - 是我呀 V2
export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    router.push("/create");
  };

  const handleViewDemo = () => {
    setShowDemo(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-purple-50">
      {/* Hero区域 - pt-16为全局fixed导航栏留出空间 */}
      <section className="relative px-4 pt-8 pb-16 text-center max-w-5xl mx-auto overflow-hidden">
        {/* 装饰背景 - 更温暖的绘本风格装饰 */}
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
            📖
          </div>
          {/* 额外的绘本风格装饰 */}
          <div className="absolute top-1/4 right-6 text-2xl opacity-15" style={{ animation: "twinkle 3s infinite" }}>
            🌟
          </div>
          <div className="absolute bottom-1/3 right-1/4 text-2xl opacity-10" style={{ animation: "twinkle 2.5s infinite 1s" }}>
            💫
          </div>
        </div>

        {/* 主标题 */}
        <div className="relative z-10">
          {/* Logo图标 */}
          <div className="inline-block mb-4">
            <span className="text-5xl">📖</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            <span className="text-gradient">每个孩子</span>
            <br />
            <span className="text-xl sm:text-3xl md:text-5xl">都是自己故事的主角</span>
          </h1>

          {/* 副标题 */}
          <p className="text-xs sm:text-base md:text-lg text-gray-600 mb-8 max-w-xs sm:max-w-md mx-auto leading-relaxed">
            输入名字、选兴趣，60秒生成专属绘本
            <br />
            名字、性格、外观，全都是TA的
          </p>

          {/* CTA按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={handleViewDemo}
              className="px-8 py-3.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:border-primary-orange hover:text-primary-orange transition-all flex items-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              看看这个魔法
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

      {/* 绘本示例区 - 3本示例绘本展示 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
          看看其他孩子的专属绘本
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">每本都是独一无二的故事</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 示例1：小宇的小灯 */}
          <div
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
            onClick={handleStart}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img
                src="/sample-images/sample-1-cover.png"
                alt="小宇的小灯"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="font-bold text-base">《小宇的小灯》</p>
                <p className="text-xs text-white/80">主角：小宇 · 5岁 · 勇敢</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">💙蓝色</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs">🌳森林</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs">💪勇气</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                怕黑的小宇去林子里采山枣，用手电筒照亮了每一步，发现自己比想象中勇敢得多。
              </p>
            </div>
          </div>

          {/* 示例2：朵朵的超能力 */}
          <div
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
            onClick={handleStart}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img
                src="/sample-images/sample-2-cover.png"
                alt="朵朵的超能力"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="font-bold text-base">《朵朵的超能力》</p>
                <p className="text-xs text-white/80">主角：朵朵 · 6岁 · 好奇</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-xs">🩷粉色</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-xs">🏰糖果王国</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 text-xs">🔍好奇</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                朵朵掉进糖果王国，用想象力修好了断掉的彩虹桥，拯救了所有小动物。
              </p>
            </div>
          </div>

          {/* 示例3：阿宝的秋约 */}
          <div
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
            onClick={handleStart}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img
                src="/sample-images/sample-3-cover.png"
                alt="阿宝的秋约"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="font-bold text-base">《阿宝的秋约》</p>
                <p className="text-xs text-white/80">主角：阿宝 · 7岁 · 温柔</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs">🍂秋色</span>
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs">🌲后山</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs">🤗温柔</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                阿宝在秋天的后山迷了路，发现落叶下面藏着春天的约定——每片叶子都是新芽的被子。
              </p>
            </div>
          </div>
        </div>

        {/* 用户反馈 */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-5 max-w-md mx-auto text-center">
          <p className="text-gray-700 text-sm leading-relaxed italic">
            "女儿听到故事里叫她的名字，兴奋地喊了三遍
            <span className="text-primary-orange font-medium">是我呀！是我呀！是我呀！</span>"
          </p>
          <p className="text-xs text-gray-400 mt-2">—— 北京 · 职场妈妈小雨</p>
        </div>
      </section>

      {/* 3步魔法区 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-8">
          3步，给孩子一本专属绘本
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* 步骤1 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-200 flex items-center justify-center">
              <span className="text-3xl">✏️</span>
            </div>
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="font-bold text-gray-900 mb-1">填信息</h3>
            <p className="text-sm text-gray-500 mb-3">输入名字和兴趣</p>
            <div className="text-xs text-gray-400">30秒完成</div>
          </div>

          {/* 步骤2 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-purple-200 flex items-center justify-center">
              <span className="text-3xl">📖</span>
            </div>
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="font-bold text-gray-900 mb-1">选主题</h3>
            <p className="text-sm text-gray-500 mb-3">冒险/友谊/勇气等</p>
            <div className="text-xs text-gray-400">10+主题可选</div>
          </div>

          {/* 步骤3 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center">
              <span className="text-3xl">🌙</span>
            </div>
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h3 className="font-bold text-gray-900 mb-1">听故事</h3>
            <p className="text-sm text-gray-500 mb-3">AI朗读，翻页阅读</p>
            <div className="text-xs text-gray-400">即刻享用</div>
          </div>
        </div>
      </section>

      {/* 故事库预览区 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
          从经典到专属，总有孩子爱的故事
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">经典故事精选，还是独一无二的主角故事？都行</p>

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
                <h3 className="font-bold text-gray-900">AI专属绘本</h3>
                <p className="text-xs text-purple-500">名字+兴趣+性格·完全定制</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { emoji: "👤", desc: "名字成为故事主角，代入感满满" },
                { emoji: "🎨", desc: "外观、性格、喜好全都融入故事" },
                { emoji: "💡", desc: "你想教的道理，悄悄讲给孩子听" },
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

      {/* 场景区 - 更新为V2适用场景 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
          这些时刻，给孩子一本专属绘本
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">每个孩子都值得拥有自己的故事</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: "📖", title: "孩子不喜欢", desc: "读绘本" },
            { emoji: "🎁", title: "想要", desc: "个性化礼物" },
            { emoji: "⭐", title: "想让孩子", desc: "成为主角" },
            { emoji: "🔄", title: "经典故事", desc: "都听腻了" },
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

      {/* 定价预览区 - V2定价 */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">解锁更多专属绘本</h2>
              <p className="text-sm text-gray-500 mt-1">每本都是独一无二的故事</p>
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
              { name: "免费体验", price: "¥0", desc: "1本/月·2种风格", color: "from-gray-100 to-gray-200" },
              { name: "单本", price: "¥19.9", desc: "1本·全风格+外观", color: "from-primary-orange to-primary-dark", highlight: true },
              { name: "月度", price: "¥39/月", desc: "3本/月·+睡前模式", color: "from-purple-100 to-indigo-200" },
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
        <div className="bg-gradient-to-r from-primary-orange to-purple-500 rounded-3xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">给孩子一本专属绘本</h2>
          <p className="text-white/80 text-sm mb-6">故事里叫着TA的名字，每页都是TA的样子</p>
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
        <p className="text-gradient font-medium">是我呀——每个孩子都是自己故事的主角</p>
        <p className="mt-1">
          <button onClick={() => router.push("/privacy")} className="hover:text-gray-600">隐私政策</button>
          {" · "}
          <button onClick={() => router.push("/terms")} className="hover:text-gray-600">使用条款</button>
        </p>
      </div>

      {/* 演示弹窗 - 示例绘本预览 */}
      {showDemo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-purple-200 flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">看看这个魔法</h3>
            <p className="text-sm text-gray-500 mb-5">
              输入孩子名字和兴趣，60秒生成专属绘本
            </p>
            
            {/* 示例绘本封面 */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3 text-left cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => { setShowDemo(false); handleStart(); }}>
                <img src="/sample-images/sample-1-cover.png" alt="小宇的小灯" className="w-12 h-16 rounded-lg object-cover shadow" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">《小宇的小灯》</p>
                  <p className="text-xs text-gray-500">小宇 · 5岁 · 勇敢 · 森林探险</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-3 text-left cursor-pointer hover:bg-pink-100 transition-colors" onClick={() => { setShowDemo(false); handleStart(); }}>
                <img src="/sample-images/sample-2-cover.png" alt="朵朵的超能力" className="w-12 h-16 rounded-lg object-cover shadow" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">《朵朵的超能力》</p>
                  <p className="text-xs text-gray-500">朵朵 · 6岁 · 好奇 · 糖果王国</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 text-left cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => { setShowDemo(false); handleStart(); }}>
                <img src="/sample-images/sample-3-cover.png" alt="阿宝的秋约" className="w-12 h-16 rounded-lg object-cover shadow" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">《阿宝的秋约》</p>
                  <p className="text-xs text-gray-500">阿宝 · 7岁 · 温柔 · 秋天后山</p>
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
