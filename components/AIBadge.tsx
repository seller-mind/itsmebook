"use client";

interface AIBadgeProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function AIBadge({ size = "md", showText = true }: AIBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-primary-orange to-yellow-500 text-white font-medium rounded-full shadow-sm ${sizeClasses[size]}`}
    >
      <svg
        className={size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      {showText && <span>AI生成</span>}
    </span>
  );
}

// AI内容免责声明
export function AIDisclaimer() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">ℹ️</span>
      <div className="text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-1">内容声明</p>
        <p>
          本故事及插图由人工智能技术自动生成，仅供参考。内容可能不完全准确或符合个人期望，
          建议家长在使用前进行适当审核。所有生成内容版权归用户个人所有。
        </p>
      </div>
    </div>
  );
}

// 生成进度条组件
interface ProgressBarProps {
  progress: number;
  status: string;
}

export function GenerationProgress({ progress, status }: ProgressBarProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary-orange/10 flex items-center justify-center">
          <span className="text-2xl animate-bounce">✨</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">正在创作中...</h3>
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="absolute left-0 top-0 h-full progress-bar rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>开始创作</span>
        <span className="font-medium text-primary-orange">{progress}%</span>
        <span>完成</span>
      </div>

      {/* 生成步骤提示 */}
      <div className="mt-6 space-y-3">
        {[
          { step: "生成故事文本", done: progress > 10 },
          { step: "创作绘本插图", done: progress > 50 },
          { step: "组装完整绘本", done: progress > 90 },
        ].map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className={item.done ? "text-green-500" : "text-gray-300"}>
              {item.done ? "✓" : "○"}
            </span>
            <span className={item.done ? "text-gray-700" : "text-gray-400"}>
              {item.step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
