"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoiceRecorder from "@/components/voice/VoiceRecorder";

export default function RecordingPage() {
  const router = useRouter();
  const [voiceId, setVoiceId] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [cloned, setCloned] = useState(false);

  const handleRecordingComplete = (audioBlob: Blob, audioUrlValue: string) => {
    setAudioUrl(audioUrlValue);
    // 存储到sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bedtime_voice_url", audioUrlValue);
    }
  };

  const handleCloning = (newVoiceId: string) => {
    setVoiceId(newVoiceId);
    setCloned(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bedtime_voice_id", newVoiceId);
    }
  };

  const handleContinue = () => {
    router.push("/story/select");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
      {/* 顶部导航 */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">返回</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🎤</span>
          <span className="font-bold text-gray-900">录制声音</span>
        </div>
        <div className="w-16" />
      </div>

      {/* 进度指示 */}
      <div className="max-w-lg mx-auto px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            <div className="w-6 h-6 rounded-full bg-primary-orange text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div className="flex-1 h-1 bg-primary-orange rounded-full" />
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
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

      {/* 主内容区 */}
      <div className="max-w-lg mx-auto px-4 pb-12">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            用你的声音，给孩子讲今晚的故事
          </h1>
          <p className="text-sm text-gray-500">
            录10-20秒，我们就能克隆你的声音
          </p>
        </div>

        {/* 跳过录音，直接体验 */}
        {!cloned && (
          <div className="mb-4 text-center">
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition-all border border-amber-200"
            >
              <span>📖</span>
              <span>先听故事，稍后再录声音</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* 录音组件 */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onCloning={handleCloning}
          />
        </div>

        {/* 其他妈妈示例 */}
        <div className="bg-white rounded-3xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">👂</span>
            <h3 className="font-medium text-gray-900 text-sm">听听其他妈妈的声音</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: "妈妈A", desc: "温柔型" },
              { name: "妈妈B", desc: "活泼型" },
              { name: "爸爸A", desc: "磁性型" },
              { name: "爸爸B", desc: "沉稳型" },
            ].map((person, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  // 播放示例音频（这里只是UI示意）
                }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-200 flex items-center justify-center text-lg">
                  {i < 2 ? "👩" : "👨"}
                </div>
                <p className="text-xs font-medium text-gray-700">{person.name}</p>
                <p className="text-xs text-gray-400">{person.desc}</p>
                <div className="w-5 h-5 rounded-full bg-primary-orange/10 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-primary-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 继续按钮（克隆完成后显示） */}
        {cloned && (
          <div className="mt-6 text-center">
            <button
              onClick={handleContinue}
              className="btn-primary px-10 py-4 text-base inline-flex items-center gap-2"
            >
              选择故事，继续
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}


      </div>
    </div>
  );
}
