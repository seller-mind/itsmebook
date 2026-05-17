"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DEFAULT_PROMPT, RECORDING_CONFIG } from "@/lib/voice";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void;
  onCloning?: (voiceId: string) => void;
}

type RecordingState = "idle" | "recording" | "recorded" | "uploading" | "cloning" | "done";

export default function VoiceRecorder({ onRecordingComplete, onCloning }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState(DEFAULT_PROMPT);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 清理函数
  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 开始录制
  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      // 设置音频分析（用于波形显示）
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // 开始波形动画
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setWaveformData(Array.from(dataArray).slice(0, 20));
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setState("recorded");
        stream.getTracks().forEach((track) => track.stop());
        cleanup();
      };

      recorder.start();
      setState("recording");
      setRecordingTime(0);

      // 定时器
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= RECORDING_CONFIG.maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError("无法访问麦克风，请检查权限设置");
      console.error("录音失败:", err);
    }
  };

  // 停止录制
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    cleanup();
  };

  // 重新录制
  const reRecord = () => {
    setAudioUrl("");
    setAudioBlob(null);
    setRecordingTime(0);
    setWaveformData([]);
    setState("idle");
  };

  // 试听
  const playAudio = () => {
    if (!audioUrl) return;
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  // 上传并克隆
  const uploadAndClone = async () => {
    if (!audioBlob) return;

    setState("uploading");

    try {
      // 上传音频文件
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("userId", `user_${Date.now()}`);

      const uploadRes = await fetch("/api/upload/voice", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.message || "上传失败");
      }

      // 克隆声音
      setState("cloning");

      const cloneFormData = new FormData();
      cloneFormData.append("audio", audioBlob, "recording.webm");
      cloneFormData.append("userId", `user_${Date.now()}`);

      const cloneRes = await fetch("/api/voice/clone", {
        method: "POST",
        body: cloneFormData,
      });

      const cloneData = await cloneRes.json();

      if (!cloneData.success) {
        throw new Error(cloneData.message || "声音克隆失败");
      }

      setState("done");
      onRecordingComplete(audioBlob, uploadData.audioUrl);
      if (onCloning && cloneData.voiceId) {
        onCloning(cloneData.voiceId);
      }
    } catch (err: any) {
      setError(err.message || "上传失败，请重试");
      setState("recorded");
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 进度百分比
  const progressPercent = Math.min(
    (recordingTime / RECORDING_CONFIG.maxDuration) * 100,
    100
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* 音频ref */}
      <audio ref={audioRef} src={audioUrl} />

      {/* 状态1: 空闲 */}
      {state === "idle" && (
        <>
          {/* 提示文字 */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-gray-700">
              轻轻一点，开始录制
            </h3>
            <p className="text-sm text-gray-500">读出下面的文字，我们就能克隆你的声音</p>
          </div>

          {/* 录制按钮 */}
          <div className="relative">
            <button
              onClick={startRecording}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-orange to-primary-dark shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
              点击开始录制
            </div>
          </div>

          {/* 朗读文本 */}
          <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center border border-amber-100">
            <p className="text-gray-700 leading-relaxed text-base italic">
              "{currentPrompt}"
            </p>
            <p className="text-xs text-amber-600 mt-3">
              提示：读慢一点，感情丰富一点，效果更好哦
            </p>
          </div>
        </>
      )}

      {/* 状态2: 录制中 */}
      {state === "recording" && (
        <>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-lg font-medium text-gray-700">正在录制...</h3>
            </div>
            <p className="text-sm text-gray-500">轻轻说话，像给孩子讲故事一样</p>
          </div>

          {/* 波形动画 */}
          <div className="w-full flex items-center justify-center gap-1 h-20 px-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-2 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(8, waveformData[i] || 0) * 0.8}px`,
                  background:
                    i < (recordingTime / RECORDING_CONFIG.maxDuration) * 20
                      ? "linear-gradient(to top, #FF8C42, #FFD93D)"
                      : "#E5E7EB",
                }}
              />
            ))}
          </div>

          {/* 进度条 */}
          <div className="w-full px-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatTime(recordingTime)}</span>
              <span>{formatTime(RECORDING_CONFIG.maxDuration)}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-orange to-primary-yellow transition-all duration-1000 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex gap-4">
            <button
              onClick={stopRecording}
              className="px-8 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <span className="w-3 h-3 bg-white rounded-sm" />
              停止录制
            </button>
            <button
              onClick={cleanup}
              className="px-6 py-3 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </>
      )}

      {/* 状态3: 已录制 */}
      {(state === "recorded" || state === "uploading" || state === "cloning") && (
        <>
          {/* 成功提示 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">录制完成！</h3>
            <p className="text-sm text-gray-500 mt-1">
              时长 {formatTime(recordingTime)}
            </p>
          </div>

          {/* 波形显示 */}
          <div className="w-full bg-gray-50 rounded-2xl p-4 flex items-center justify-center">
            <div className="w-full h-16 flex items-center justify-center gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-primary-orange to-primary-yellow"
                  style={{
                    height: `${Math.random() * 48 + 8}px`,
                    opacity: 0.7 + Math.random() * 0.3,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 试听和重录 */}
          <div className="flex gap-4">
            <button
              onClick={playAudio}
              className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              试听
            </button>
            <button
              onClick={reRecord}
              className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              重新录制
            </button>
          </div>

          {/* 上传/克隆状态 */}
          {state === "uploading" && (
            <div className="text-center space-y-3 w-full">
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">正在上传声音...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-primary-orange h-1.5 rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {state === "cloning" && (
            <div className="text-center space-y-3 w-full">
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">正在克隆你的声音...</span>
              </div>
              <p className="text-xs text-gray-400">这可能需要几秒钟</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-primary-orange h-1.5 rounded-full transition-all duration-500" style={{ width: "80%" }} />
              </div>
            </div>
          )}

          {/* 继续按钮 */}
          {state === "recorded" && (
            <button
              onClick={uploadAndClone}
              className="btn-primary px-10 py-4 text-base flex items-center gap-2"
            >
              上传声音，继续
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* 状态4: 完成 */}
      {state === "done" && (
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700">声音克隆成功！</h3>
          <p className="text-sm text-gray-500">你的声音已经准备好了，可以选择故事了</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => setError("")}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
