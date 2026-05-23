"use client";

import { useState, useRef, useEffect, useCallback } from "react";
// V2: 声音克隆已移除，这些常量不再使用
// import { DEFAULT_PROMPT, RECORDING_CONFIG } from "@/lib/voice";
const DEFAULT_PROMPT = "从前有一只小兔子，它的耳朵长长的，每天晚上都会去森林里找妈妈讲故事……";
const RECORDING_CONFIG = { maxDuration: 20, minDuration: 5, sampleRate: 16000, format: "webm" };

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

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordedSamplesRef = useRef<Float32Array[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 开始录制 - 使用AudioContext直接录制WAV格式
  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          // 采样率由AudioContext决定，通常44100或48000
        },
      });

      streamRef.current = stream;

      // 创建AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // 16kHz符合百炼要求
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // 创建分析器（波形显示）
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // 波形动画
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setWaveformData(Array.from(dataArray).slice(0, 20));
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      // 使用ScriptProcessor录制原始PCM数据
      const bufferSize = 4096;
      const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorRef.current = scriptProcessor;
      recordedSamplesRef.current = [];

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        recordedSamplesRef.current.push(new Float32Array(inputData));
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      setState("recording");
      setRecordingTime(0);
      recordingStartTimeRef.current = Date.now();

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

  // 停止录制 - 将PCM数据转为WAV
  const stopRecording = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }

    // 收集所有录音数据
    const samples = recordedSamplesRef.current;
    if (samples.length === 0) {
      cleanup();
      return;
    }

    // 检查录音时长是否过短（用ref避免闭包旧值问题）
    const actualDuration = recordingStartTimeRef.current > 0
      ? Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
      : 0;
    if (actualDuration < RECORDING_CONFIG.minDuration) {
      setError(`录音时间太短，请至少录制${RECORDING_CONFIG.minDuration}秒`);
      cleanup();
      setState("idle");
      return;
    }

    // 合并所有采样数据
    const totalLength = samples.reduce((acc, buf) => acc + buf.length, 0);
    const mergedBuffer = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of samples) {
      mergedBuffer.set(buf, offset);
      offset += buf.length;
    }

    // 转换为WAV格式
    const sampleRate = audioContextRef.current?.sampleRate || 16000;
    const wavBlob = encodeWAV(mergedBuffer, sampleRate);
    const url = URL.createObjectURL(wavBlob);

    setAudioBlob(wavBlob);
    setAudioUrl(url);
    setState("recorded");

    if (onRecordingComplete) {
      onRecordingComplete(wavBlob, url);
    }

    cleanup();
  };

  // PCM Float32 转 WAV Blob
  const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // WAV文件头
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // PCM
    view.setUint16(20, 1, true); // PCM格式
    view.setUint16(22, 1, true); // 单声道
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // 字节率
    view.setUint16(32, 2, true); // 块对齐
    view.setUint16(34, 16, true); // 16位
    writeString(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);

    // 写入PCM数据（Float32 → Int16）
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
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

    setState("cloning");

    try {
      // 直接调声音克隆API（WAV格式，百炼支持）
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("userId", `u${Date.now().toString(36)}`);

      const cloneRes = await fetch("/api/voice/clone", {
        method: "POST",
        body: formData,
      });

      const cloneData = await cloneRes.json();

      if (!cloneData.success) {
        throw new Error(cloneData.message || "声音克隆失败");
      }

      setState("done");
      onRecordingComplete(audioBlob, audioUrl);
      if (onCloning && cloneData.voiceId) {
        onCloning(cloneData.voiceId);
      }
    } catch (err: any) {
      setError(err.message || "声音克隆失败，请重试");
      setState("recorded");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min(
    (recordingTime / RECORDING_CONFIG.maxDuration) * 100,
    100
  );

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* 提示文案 */}
      <div className="text-center space-y-2 px-4">
        <p className="text-gray-700 font-medium text-base">🎤 {currentPrompt}</p>
        <p className="text-gray-400 text-xs">
          请用正常语速朗读，保持安静环境，录制10-20秒即可
        </p>
      </div>

      {/* 声波可视化 */}
      <div className="flex items-center justify-center gap-0.5 h-16 px-4">
        {waveformData.length > 0 ? (
          waveformData.map((value, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-amber-400 to-orange-500 transition-all duration-75"
              style={{
                height: `${Math.max(4, (value / 255) * 56)}px`,
              }}
            />
          ))
        ) : (
          Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1 rounded-full bg-gray-200"
            />
          ))
        )}
      </div>

      {/* 录音按钮区域 */}
      <div className="flex flex-col items-center gap-4">
        {state === "idle" && (
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        )}

        {state === "recording" && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500 font-mono text-lg font-bold">
                {formatTime(recordingTime)}
              </span>
            </div>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-red-500 shadow-lg hover:bg-red-600 transition-all flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          </>
        )}

        {state === "recorded" && (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-600 text-sm">{formatTime(recordingTime)}</span>
              <button
                onClick={playAudio}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ▶ 试听
              </button>
              <button
                onClick={reRecord}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                重新录制
              </button>
            </div>
            <button
              onClick={uploadAndClone}
              className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              上传声音，继续 →
            </button>
          </div>
        )}

        {(state === "cloning" || state === "uploading") && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">
              {state === "cloning" ? "正在克隆你的声音..." : "正在上传录音..."}
            </p>
          </div>
        )}

        {state === "done" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">声音克隆成功！</p>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 p-3 bg-red-50 rounded-lg border border-red-100">
          <p className="text-red-600 text-sm text-center">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-400 text-xs text-center w-full mt-1"
          >
            关闭
          </button>
        </div>
      )}

      {/* 隐藏的audio元素 */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} className="hidden" />
      )}
    </div>
  );
}
