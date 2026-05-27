"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_PLANS, getPlanConfig, AdminGenerateParams, AdminFeatures, addClonedVoice, VoiceOption } from "@/lib/admin";
import { STORY_THEMES } from "@/lib/story";
import { v4 as uuidv4 } from "uuid";
import { convertWebmToMp4 } from "@/lib/video-converter";

// 带重试的fetch（解决网络波动导致的"Failed to fetch"）
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> => {
  let lastError: Error = new Error("Unknown error");
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes("Failed to fetch") && attempt < maxRetries) {
        // 网络错误，等1-3秒后重试
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

// 通过代理加载图片（解决dashscope OSS不支持CORS的问题）
const loadImageViaProxy = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (!url) { reject(new Error("No URL")); return; }
    const needsProxy = url.includes("aliyuncs.com") || url.includes("dashscope");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = needsProxy ? `/api/admin/image-proxy?url=${encodeURIComponent(url)}` : url;
    const timeout = setTimeout(() => reject(new Error("Image load timeout")), 12000);
    img.onload = () => { clearTimeout(timeout); if (img.naturalWidth > 0) resolve(img); else reject(new Error("No dimensions")); };
    img.onerror = () => { clearTimeout(timeout); reject(new Error("Load failed")); };
  });
};

// Canvas中文自动换行
const drawWrappedText = (ctx: CanvasRenderingContext2D, text: string, x: number, startY: number, maxWidth: number, lineHeight: number, maxLines: number = 6): number => {
  const chars = text.split("");
  let lines: string[] = [];
  let currentLine = "";
  for (const char of chars) {
    const testLine = currentLine + char;
    if (ctx.measureText(testLine).width > maxWidth) { lines.push(currentLine); currentLine = char; }
    else { currentLine = testLine; }
  }
  if (currentLine) lines.push(currentLine);
  let y = startY;
  for (const line of lines.slice(0, maxLines)) { ctx.fillText(line, x, y); y += lineHeight; }
  return y;
};

// Admin 密码保护
const ADMIN_PASSWORD = "itsmebook2026";
const AUTH_KEY = "itsmebook_admin_auth";

// 风格选项
const STYLES = [
  { id: "watercolor", name: "水彩风", emoji: "🎨" },
  { id: "oil", name: "油画风", emoji: "🖼️" },
  { id: "anime", name: "动漫风", emoji: "✨" },
  { id: "chinese", name: "中国风", emoji: "🏮" },
  { id: "pastoral", name: "田园风", emoji: "🌾" },
  { id: "fantasy", name: "梦幻风", emoji: "🦋" },
  { id: "minimalist", name: "简约风", emoji: "⬜" },
  { id: "nordic", name: "北欧风", emoji: "❄️" },
];

// 年龄选项
const AGE_OPTIONS = [
  { value: 2, label: "2岁" },
  { value: 3, label: "3岁" },
  { value: 4, label: "4岁" },
  { value: 5, label: "5岁" },
  { value: 6, label: "6岁" },
  { value: 7, label: "7岁" },
  { value: 8, label: "8岁" },
  { value: 9, label: "9岁" },
];

// 性别选项
const GENDER_OPTIONS = [
  { value: "boy", label: "男孩", emoji: "👦" },
  { value: "girl", label: "女孩", emoji: "👧" },
];

// 默认声音
const DEFAULT_VOICES: VoiceOption[] = [
  { id: "longhuhu_v3", name: "龙呼呼", emoji: "🐉", description: "天真女童，最适合故事", isCloned: false },
  { id: "xiaoyi_v3", name: "亲切老师", emoji: "🧑‍🏫", description: "温暖女声，娓娓道来", isCloned: false },
  { id: "zhichu_v3", name: "阳光少年", emoji: "👨‍🎓", description: "活泼男童声线", isCloned: false },
  { id: "zhimiao_v3", name: "睡前低语", emoji: "🎭", description: "轻柔女声，适合睡前", isCloned: false },
  { id: "zhiyan_v3", name: "故事大王", emoji: "🌟", description: "浑厚男声，讲大冒险", isCloned: false },
];

interface OrderForm {
  // 客户信息
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderNote: string;
  
  // 孩子信息
  childName: string;
  childAge: number;
  childGender: "boy" | "girl";
  
  // 绘本配置
  themeId: string;
  styleId: string;
  pageCount: 8 | 12;
  
  // 套餐
  planId: "basic" | "premium" | "audio" | "parent-voice" | "child-hero" | "custom-advanced";
  
  // 声音
  voiceId: string;
  useClonedVoice: boolean;
  parentVoiceFile: File | null;
  
  // 照片
  useChildPhoto: boolean;
  childPhotoFile: File | null;
  
  // 自定义需求（自由高阶版）
  customPrompt: string;
}

type GenerationStep = 
  | "idle"
  | "uploading_voice"
  | "cloning_voice"
  | "uploading_photo"
  | "generating_story"
  | "generating_images"
  | "generating_audio"
  | "generating_video"
  | "completed"
  | "failed";

// 密码保护组件
function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, "true");
      setPasswordError("");
    } else {
      setPasswordError("密码错误");
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full mx-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔒</div>
            <h1 className="text-xl font-bold text-gray-800">管理后台</h1>
            <p className="text-sm text-gray-500 mt-1">请输入管理密码</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="管理密码"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center">{passwordError}</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              进入后台
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function AdminPage() {
  const router = useRouter();
  
  // 当前生成任务ID（用于后台恢复）
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // 表单状态
  const [form, setForm] = useState<OrderForm>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    orderNote: "",
    childName: "",
    childAge: 5,
    childGender: "boy",
    themeId: STORY_THEMES[0].id,
    styleId: "watercolor",
    pageCount: 8,
    planId: "basic",
    voiceId: DEFAULT_VOICES[0].id,
    useClonedVoice: false,
    parentVoiceFile: null,
    useChildPhoto: false,
    childPhotoFile: null,
    customPrompt: "",
  });
  
  // UI状态
  const [voices, setVoices] = useState<VoiceOption[]>(DEFAULT_VOICES);
  const [selectedPlan, setSelectedPlan] = useState(ADMIN_PLANS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>("idle");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [completedBookId, setCompletedBookId] = useState<string | null>(null);
  const [completedStory, setCompletedStory] = useState<{
    title: string; childName: string;
    pages: Array<{ pageNumber: number; text: string; imageUrl: string; audioUrl?: string }>;
  } | null>(null);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement | null>(null);
  const completedSectionRef = useRef<HTMLDivElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null); // 轮询定时器
  
  // 已通过密码验证，不需要再检查 admin 模式

  // ====== Pipeline轮询逻辑 ======
  
  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // 处理轮询到的状态数据
  const handlePollResult = useCallback((data: any, sid: string) => {
    if (data.status === "completed") {
      setGenerationProgress(100);
      setGenerationStep("completed");
      setIsGenerating(false);
      stopPolling();
      localStorage.removeItem("itsmebook_generating_session");
      
      // 加载完成的结果
      if (data.result) {
        const r = data.result;
        const storyData = {
          title: r.title || form.childName + "的绘本",
          childName: form.childName,
          pages: (r.pages || []).map((p: any, i: number) => ({
            pageNumber: p.page_number || i + 1,
            text: p.text,
            imageUrl: p.image_url,
            audioUrl: p.audio_url || undefined,
          })),
        };
        setCompletedStory(storyData);
        if (r.bookId) setCompletedBookId(r.bookId);
        
        // 保存到localStorage
        const playerData = { ...storyData, voiceUrl: "" };
        sessionStorage.setItem("bedtime_story", JSON.stringify(playerData));
        localStorage.setItem("itsmebook_last_story", JSON.stringify(playerData));
        
        try {
          const booksStr = localStorage.getItem("itsmebook_books");
          const books = booksStr ? JSON.parse(booksStr) : [];
          books.unshift({
            id: r.bookId || Date.now().toString(), title: storyData.title,
            childName: storyData.childName, pages: storyData.pages,
            createdAt: new Date().toISOString(), isAdminGenerated: true,
          });
          localStorage.setItem("itsmebook_books", JSON.stringify(books.slice(0, 50)));
        } catch {}
      }
    } else if (data.status === "failed") {
      setGenerationStep("failed");
      setGenerationError(data.step || "生成失败");
      setIsGenerating(false);
      stopPolling();
      localStorage.removeItem("itsmebook_generating_session");
    } else {
      // 还在生成中，更新进度
      setGenerationProgress(data.progress || 0);
      // 根据进度推断步骤
      const p = data.progress || 0;
      if (p < 15) setGenerationStep("generating_story");
      else if (p < 90) setGenerationStep("generating_images");
      else setGenerationStep("completed");
    }
  }, [form.childName, stopPolling]);

  // 开始轮询
  const startPolling = useCallback((sid: string) => {
    stopPolling(); // 先停止旧的
    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/generate-status?sessionId=${sid}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) handlePollResult(data, sid);
      } catch (e) {
        console.error("轮询失败:", e);
      }
    };
    // 立即执行一次，然后每2秒执行
    poll();
    pollingIntervalRef.current = setInterval(poll, 2000);
  }, [stopPolling, handlePollResult]);

  // 页面加载时恢复进行中的生成任务
  useEffect(() => {
    const savedSid = localStorage.getItem("itsmebook_generating_session");
    if (savedSid) {
      setIsGenerating(true);
      setCurrentSessionId(savedSid);
      startPolling(savedSid);
    }
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  // 页面可见性变化时恢复轮询
  useEffect(() => {
    const handleVisibility = () => {
      const savedSid = localStorage.getItem("itsmebook_generating_session");
      if (document.visibilityState === "visible" && savedSid && !pollingIntervalRef.current) {
        // 页面重新可见，恢复轮询
        setIsGenerating(true);
        setCurrentSessionId(savedSid);
        startPolling(savedSid);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [startPolling]);

  // 监听套餐变化 - 自动滚动到上传区域
  useEffect(() => {
    const plan = ADMIN_PLANS.find(p => p.id === form.planId);
    if (plan) {
      setSelectedPlan(plan);
      setForm(prev => ({ ...prev, pageCount: plan.pageCount }));
      // 选了需要上传的套餐时，自动滚动到上传区域
      if (plan.id === "parent-voice" || plan.id === "child-hero") {
        setTimeout(() => {
          uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  }, [form.planId]);
  
  // 清理录音URL
  useEffect(() => {
    return () => {
      if (voicePreviewUrl) {
        URL.revokeObjectURL(voicePreviewUrl);
      }
    };
  }, [voicePreviewUrl]);
  
  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setVoicePreviewUrl(url);
        
        // 转换为 wav 格式（百炼需要）
        convertToWav(audioBlob).then(wavBlob => {
          const wavFile = new File([wavBlob], "recording.wav", { type: "audio/wav" });
          setForm(prev => ({ ...prev, parentVoiceFile: wavFile }));
        });
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("录音失败:", error);
      alert("无法访问麦克风，请检查权限设置");
    }
  };
  
  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };
  
  // 转换 webm 为 wav（简化版，实际需要 ffmpeg）
  const convertToWav = async (blob: Blob): Promise<Blob> => {
    // 由于服务端没有 ffmpeg，这里直接返回原始 blob
    // 百炼API应该支持webm或其他格式
    return blob;
  };
  
  // 清除录音
  const clearRecording = () => {
    if (voicePreviewUrl) {
      URL.revokeObjectURL(voicePreviewUrl);
    }
    setVoicePreviewUrl(null);
    setForm(prev => ({ ...prev, parentVoiceFile: null }));
    setRecordingTime(0);
  };
  
  // 处理照片上传
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("照片大小不能超过5MB");
        return;
      }
      
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrl(url);
      setForm(prev => ({ ...prev, childPhotoFile: file }));
    }
  };
  
  // 清除照片
  const clearPhoto = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setForm(prev => ({ ...prev, childPhotoFile: null }));
  };
  
  // 生成绘本 - 使用后台Pipeline + 轮询（解决切换页面后生成中断的问题）
  const generateBook = async () => {
    if (form.planId === "custom-advanced") {
      if (form.customPrompt.trim().length < 10) {
        alert("自由高阶版请至少输入10个字描述你的需求");
        return;
      }
    } else {
      if (!form.childName.trim()) {
        alert("请输入孩子名字");
        return;
      }
    }
    if (form.useClonedVoice && !form.parentVoiceFile) {
      alert("请先录制家长语音片段");
      return;
    }
    if (form.useChildPhoto && !form.childPhotoFile) {
      alert("请先上传孩子照片");
      return;
    }
    
    setIsGenerating(true);
    setGenerationStep("generating_story");
    setGenerationProgress(0);
    setGenerationError(null);
    setCompletedStory(null);
    setVideoBlobUrl(null);
    
    try {
      const sessionId = uuidv4();
      setCurrentSessionId(sessionId);
      
      // 前置步骤：上传语音/照片（这些需要客户端处理）
      let clonedVoiceId = form.voiceId;
      let photoBase64: string | undefined;
      
      if (form.useClonedVoice && form.parentVoiceFile) {
        setGenerationStep("cloning_voice");
        setGenerationProgress(3);
        const voiceBase64 = await fileToBase64(form.parentVoiceFile);
        const cloneResponse = await fetch("/api/voice/clone", {
          method: "POST", body: voiceBase64, headers: { "Content-Type": "text/plain" },
        });
        if (cloneResponse.ok) {
          const cloneResult = await cloneResponse.json();
          if (cloneResult.success && cloneResult.voice_id) {
            clonedVoiceId = cloneResult.voice_id;
            addClonedVoice(clonedVoiceId, `克隆-${form.customerName || "家长"}`);
            setVoices(prev => [...prev, { id: clonedVoiceId, name: `克隆-${form.customerName || "家长"}`, emoji: "🎙️", description: "家长克隆声音", isCloned: true }]);
          }
        }
        setGenerationProgress(5);
      }
      
      if (form.useChildPhoto && form.childPhotoFile) {
        setGenerationStep("uploading_photo");
        photoBase64 = await fileToBase64(form.childPhotoFile);
        setGenerationProgress(8);
      }
      
      // 保存sessionId到localStorage（页面刷新/切换后可恢复）
      localStorage.setItem("itsmebook_generating_session", sessionId);
      
      // ====== 调用后台Pipeline ======
      setGenerationStep("generating_story");
      setGenerationProgress(10);
      
      // 发起pipeline请求（服务端后台执行，不阻塞前端）
      fetchWithRetry("/api/admin/generate-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          params: {
            childName: form.childName || "自定义",
            childAge: form.childAge,
            childGender: form.childGender,
            themeId: form.themeId,
            styleId: form.styleId,
            planId: form.planId,
            pageCount: form.pageCount,
            customPrompt: form.planId === "custom-advanced" ? form.customPrompt : undefined,
            refImageBase64: photoBase64,
            voiceId: clonedVoiceId,
          },
        }),
      }).catch(err => {
        // pipeline请求失败不影响轮询（服务端可能已在运行）
        console.error("Pipeline请求失败（不影响后台运行）:", err);
      });
      
      // ====== 开始轮询进度 ======
      startPolling(sessionId);
      
    } catch (error: any) {
      console.error("生成启动失败:", error);
      setGenerationStep("failed");
      setGenerationError(error.message || "未知错误");
      setIsGenerating(false);
      localStorage.removeItem("itsmebook_generating_session");
    }
  };
  
  // 生成完成后不再滚动，直接切换到结果视图
  // useEffect for scroll removed

  // 文件转 Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // 保存完成的绘本数据
  const saveCompletedStory = (data: any) => {
    if (!data.pages || data.pages.length === 0) return;
    const storyData = {
      title: data.title || form.childName + "的绘本",
      childName: form.childName,
      pages: data.pages.map((p: any) => ({
        pageNumber: p.page_number,
        text: p.text,
        imageUrl: p.image_url,
        audioUrl: p.audio_url || undefined,
      })),
    };
    setCompletedStory(storyData);
    const playerData = { ...storyData, voiceUrl: "" };
    sessionStorage.setItem("bedtime_story", JSON.stringify(playerData));
    localStorage.setItem("itsmebook_last_story", JSON.stringify(playerData));
    
    // 存入绘本列表（个人中心可见）
    try {
      const booksStr = localStorage.getItem("itsmebook_books");
      const books = booksStr ? JSON.parse(booksStr) : [];
      const bookRecord = {
        id: data.bookId || completedBookId || Date.now().toString(),
        title: storyData.title,
        childName: storyData.childName,
        pages: storyData.pages,
        createdAt: new Date().toISOString(),
        isAdminGenerated: true,
        voiceId: form.voiceId,
        themeId: form.themeId,
        styleId: form.styleId,
        planId: form.planId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
      };
      books.unshift(bookRecord);
      localStorage.setItem("itsmebook_books", JSON.stringify(books.slice(0, 50)));
    } catch (e) {
      console.error("保存绘本列表失败:", e);
    }
  };

  // 下载原图（通过代理，直接下载不渲染）
  const downloadImages = async () => {
    if (!completedStory || downloading.images) return;
    setDownloading(prev => ({ ...prev, images: true }));
    try {
      let downloaded = 0;
      for (let i = 0; i < completedStory.pages.length; i++) {
        const page = completedStory.pages[i];
        if (!page.imageUrl) continue;
        try {
          // 通过代理下载图片blob
          const proxyUrl = `/api/admin/image-proxy?url=${encodeURIComponent(page.imageUrl)}`;
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error(`代理返回${res.status}`);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = `${completedStory.title}_${i + 1}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          // 延迟释放blob URL，确保下载完成
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
          downloaded++;
          if (i < completedStory.pages.length - 1) await new Promise(r => setTimeout(r, 800));
        } catch (err) {
          console.error(`第${i+1}页图片下载失败:`, err);
        }
      }
      if (downloaded === 0) alert("图片下载失败，请检查网络后重试");
    } catch (e) {
      console.error("图片下载失败:", e);
      alert("图片下载失败，请重试");
    } finally {
      setDownloading(prev => ({ ...prev, images: false }));
    }
  };

  // 查看生成的绘本
  const viewBook = () => {
    if (!completedStory) return;
    const playerData = { ...completedStory, voiceUrl: "" };
    sessionStorage.setItem("bedtime_story", JSON.stringify(playerData));
    localStorage.setItem("itsmebook_last_story", JSON.stringify(playerData));
    router.push("/story/player");
  };
  
  // 获取分享链接
  const getShareLink = () => {
    if (completedBookId) {
      return `${window.location.origin}/share/${completedBookId}`;
    }
    return "";
  };
  
  // 复制分享链接
  const copyShareLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    alert("分享链接已复制到剪贴板");
  };

  // 下载状态
  const [downloading, setDownloading] = useState({ images: false, pdf: false, video: false });

  // 客户端Canvas渲染+jsPDF图片方式（不需要中文字体，Canvas原生渲染中文）
  const downloadPDF = async () => {
    if (!completedStory || downloading.pdf) return;
    setDownloading(prev => ({ ...prev, pdf: true }));
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = 297, pageHeight = 210;
      for (let i = 0; i < completedStory.pages.length; i++) {
        if (i > 0) pdf.addPage();
        const page = completedStory.pages[i];
        const isCover = i === 0;
        const isBack = i === completedStory.pages.length - 1;
        // Canvas渲染这一页
        const canvas = document.createElement("canvas");
        canvas.width = 1440; canvas.height = 1018;
        const ctx = canvas.getContext("2d")!;
        // 背景
        ctx.fillStyle = (isCover || isBack) ? "#fff5eb" : "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 图片
        if (page.imageUrl) {
          try {
            const img = await loadImageViaProxy(page.imageUrl);
            const maxW = canvas.width - 80, maxH = canvas.height * 0.6;
            const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
            const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
            const x = (canvas.width - w) / 2, y = 25;
            ctx.save(); ctx.beginPath(); 
            // roundRect兼容处理
            if (ctx.roundRect) { ctx.roundRect(x, y, w, h, 12); } 
            else { ctx.rect(x, y, w, h); }
            ctx.clip(); ctx.drawImage(img, x, y, w, h); ctx.restore();
          } catch (imgErr) { 
            console.error(`PDF第${i+1}页图片加载失败:`, imgErr);
            ctx.fillStyle = "#f3f4f6"; ctx.fillRect(40, 25, canvas.width - 80, canvas.height * 0.6); 
          }
        }
        // 文字
        ctx.fillStyle = "#333333"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        if (isCover) {
          ctx.font = 'bold 52px "PingFang SC", "Microsoft YaHei", sans-serif';
          drawWrappedText(ctx, page.text || "", canvas.width / 2, canvas.height * 0.67, canvas.width - 160, 64, 3);
          if (completedStory.childName) { ctx.font = '36px "PingFang SC", "Microsoft YaHei", sans-serif'; ctx.fillStyle = "#666666"; ctx.fillText(`${completedStory.childName} 的专属绘本`, canvas.width / 2, canvas.height * 0.82); }
        } else {
          ctx.font = '34px "PingFang SC", "Microsoft YaHei", sans-serif';
          drawWrappedText(ctx, page.text || "", canvas.width / 2, canvas.height * 0.67, canvas.width - 160, 46, 5);
        }
        // 页码
        if (!isCover && !isBack) { ctx.fillStyle = "#cccccc"; ctx.font = "20px sans-serif"; ctx.fillText(`${i + 1} / ${completedStory.pages.length}`, canvas.width / 2, canvas.height - 22); }
        // AI标注
        ctx.fillStyle = "#dddddd"; ctx.font = "14px sans-serif"; ctx.fillText("AI Generated Content | AI生成内容  itsmebook.com", canvas.width / 2, canvas.height - 6);
        // Canvas转JPEG加到PDF
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
      }
      pdf.save(`${completedStory.title || "绘本"}.pdf`);
    } catch (e) { 
      console.error("PDF生成失败:", e); 
      alert("PDF生成失败：" + (e instanceof Error ? e.message : "未知错误"));
    }
    finally { setDownloading(prev => ({ ...prev, pdf: false })); }
  };

  // 视频录制：图片代理 + TTS音频代理 + Canvas录制（确保有声音）
  const downloadVideo = async () => {
    if (!completedStory || downloading.video) return;
    setDownloading(prev => ({ ...prev, video: true }));
    try {
      const pages = completedStory.pages;

      // 1. 预渲染所有页面到Canvas
      const pageCanvases: HTMLCanvasElement[] = [];
      for (let i = 0; i < pages.length; i++) {
        const pc = document.createElement("canvas");
        pc.width = 1080; pc.height = 1080;
        const pctx = pc.getContext("2d")!;
        pctx.fillStyle = "#FFF5EB";
        pctx.fillRect(0, 0, 1080, 1080);
        if (pages[i].imageUrl) {
          try {
            const img = await loadImageViaProxy(pages[i].imageUrl);
            const imgMaxH = 1080 * 0.78;
            const scale = Math.min(1080 / img.naturalWidth, imgMaxH / img.naturalHeight);
            const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
            pctx.drawImage(img, (1080 - w) / 2, (imgMaxH - h) / 2, w, h);
          } catch (imgErr) { 
            console.error(`视频第${i+1}页图片加载失败:`, imgErr);
            pctx.fillStyle = "#f3f4f6"; pctx.fillRect(0, 0, 1080, 1080 * 0.78); 
          }
        }
        pctx.fillStyle = "rgba(255,255,255,0.95)";
        pctx.fillRect(0, 1080 * 0.78, 1080, 1080 * 0.22);
        pctx.fillStyle = "#333"; pctx.textAlign = "center"; pctx.textBaseline = "top";
        pctx.font = '30px "PingFang SC", "Microsoft YaHei", sans-serif';
        drawWrappedText(pctx, pages[i].text || "", 540, 1080 * 0.78 + 20, 960, 42, 4);
        pctx.font = "18px sans-serif"; pctx.fillStyle = "#aaa";
        pctx.fillText(`${i + 1} / ${pages.length}`, 540, 1060);
        pageCanvases.push(pc);
      }

      // 2. 预生成TTS音频（使用returnAudioData=true直接返回base64，彻底解决CORS问题）
      const audioBuffers: (AudioBuffer | null)[] = new Array(pages.length).fill(null);
      const tmpAudioCtx = new AudioContext();
      await tmpAudioCtx.resume();
      
      let audioSuccessCount = 0;
      for (let i = 0; i < pages.length; i++) {
        try {
          const ttsRes = await fetchWithRetry("/api/voice/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: pages[i].text, returnAudioData: true }),
          });
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            if (ttsData.success && ttsData.audioDataBase64) {
              // 直接从base64解码音频（不需要走代理，彻底解决CORS）
              try {
                const binaryStr = atob(ttsData.audioDataBase64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let j = 0; j < binaryStr.length; j++) bytes[j] = binaryStr.charCodeAt(j);
                const arrayBuffer = bytes.buffer;
                audioBuffers[i] = await tmpAudioCtx.decodeAudioData(arrayBuffer);
                audioSuccessCount++;
              } catch (decodeErr) {
                console.error(`第${i+1}页音频解码失败:`, decodeErr);
              }
            } else if (ttsData.success && ttsData.audioUrl) {
              // 降级：使用代理方式
              const proxyAudioUrl = `/api/admin/image-proxy?url=${encodeURIComponent(ttsData.audioUrl)}`;
              const audioRes = await fetchWithRetry(proxyAudioUrl, {});
              if (audioRes.ok) {
                const arrayBuffer = await audioRes.arrayBuffer();
                try {
                  audioBuffers[i] = await tmpAudioCtx.decodeAudioData(arrayBuffer);
                  audioSuccessCount++;
                } catch (decodeErr) {
                  console.error(`第${i+1}页音频解码失败:`, decodeErr);
                }
              }
            }
          }
        } catch (ttsErr) {
          console.error(`第${i+1}页TTS失败:`, ttsErr);
        }
      }
      tmpAudioCtx.close();
      
      console.log(`[视频] 音频准备完成: ${audioSuccessCount}/${pages.length}页成功`);

      // 3. 设置录制
      const recordCanvas = document.createElement("canvas");
      recordCanvas.width = 1080; recordCanvas.height = 1080;
      const recordCtx = recordCanvas.getContext("2d")!;

      const audioCtx = new AudioContext();
      await audioCtx.resume();
      const audioDest = audioCtx.createMediaStreamDestination();
      const videoStream = recordCanvas.captureStream(1);
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);

      let mimeType = "video/webm";
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) mimeType = "video/webm;codecs=vp9,opus";
      else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) mimeType = "video/webm;codecs=vp8,opus";
      else if (MediaRecorder.isTypeSupported("video/webm")) mimeType = "video/webm";

      const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 2500000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const recordingDone = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        recorder.onerror = () => reject(new Error("Recording error"));
      });
      recorder.start(1000);

      // 4. 逐页播放（用AudioBufferSourceNode播放音频到录制流）
      // 同时连接audioCtx.destination让用户听到声音（录进视频流+外放）
      for (let i = 0; i < pages.length; i++) {
        recordCtx.drawImage(pageCanvases[i], 0, 0);

        if (audioBuffers[i]) {
          try {
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffers[i];
            // 连接到录制流
            source.connect(audioDest);
            // 同时连接到扬声器（让用户听到）
            source.connect(audioCtx.destination);
            const duration = audioBuffers[i]!.duration;
            await new Promise<void>((resolve) => {
              source.onended = () => resolve();
              source.start(0);
              setTimeout(resolve, (duration + 0.5) * 1000); // 保底超时
            });
          } catch (playErr) {
            console.error(`第${i+1}页音频播放失败:`, playErr);
            await new Promise(r => setTimeout(r, 4000));
          }
        } else {
          // 没有音频的页面，停留4秒
          await new Promise(r => setTimeout(r, 4000));
        }
      }

      recorder.stop();
      const videoBlob = await recordingDone;
      audioCtx.close();

      if (videoBlob.size < 1000) {
        throw new Error("视频文件太小，录制可能失败");
      }

      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url; a.download = `${completedStory.title || "绘本"}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) { 
      console.error("视频生成失败:", e); 
      alert("视频生成失败：" + (e instanceof Error ? e.message : "未知错误"));
    }
    finally { setDownloading(prev => ({ ...prev, video: false })); }
  };

  // 当前套餐是否有视频功能
  const currentPlan = ADMIN_PLANS.find(p => p.id === form.planId);
  const hasVideo = currentPlan?.hasVideoExport ?? false;

  // 视频blob URL状态
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);

  // 服务端PDF下载（最可靠）
  const downloadPDF_Server = async () => {
    if (!completedStory || downloading.pdf) return;
    setDownloading(prev => ({ ...prev, pdf: true }));
    try {
      const res = await fetch("/api/admin/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: completedStory.title,
          childName: completedStory.childName || "",
          childAge: form.childAge || 5,
          pages: completedStory.pages.map(p => ({
            text: p.text,
            imageUrl: p.imageUrl,
          })),
        }),
      });
      if (!res.ok) throw new Error(`PDF生成失败: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${completedStory.title || "绘本"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) {
      console.error("PDF下载失败:", e);
      alert("PDF下载失败：" + (e instanceof Error ? e.message : "未知错误"));
    } finally {
      setDownloading(prev => ({ ...prev, pdf: false }));
    }
  };

  // 生成并下载有声视频（仅有声版/亲子朗读版）
  const generateAndDownloadVideo = async () => {
    if (!completedStory || downloading.video) return;
    setDownloading(prev => ({ ...prev, video: true }));
    try {
      const pages = completedStory.pages;

      // 1. 预渲染Canvas
      const pageCanvases: HTMLCanvasElement[] = [];
      for (let i = 0; i < pages.length; i++) {
        const pc = document.createElement("canvas");
        pc.width = 1080; pc.height = 1080;
        const pctx = pc.getContext("2d")!;
        pctx.fillStyle = "#FFF5EB";
        pctx.fillRect(0, 0, 1080, 1080);
        if (pages[i].imageUrl) {
          try {
            const img = await loadImageViaProxy(pages[i].imageUrl);
            const imgMaxH = 1080 * 0.78;
            const scale = Math.min(1080 / img.naturalWidth, imgMaxH / img.naturalHeight);
            const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
            pctx.drawImage(img, (1080 - w) / 2, (imgMaxH - h) / 2, w, h);
          } catch { pctx.fillStyle = "#f3f4f6"; pctx.fillRect(0, 0, 1080, 1080 * 0.78); }
        }
        pctx.fillStyle = "rgba(255,255,255,0.95)";
        pctx.fillRect(0, 1080 * 0.78, 1080, 1080 * 0.22);
        pctx.fillStyle = "#333"; pctx.textAlign = "center"; pctx.textBaseline = "top";
        pctx.font = '30px "PingFang SC", "Microsoft YaHei", sans-serif';
        drawWrappedText(pctx, pages[i].text || "", 540, 1080 * 0.78 + 20, 960, 42, 4);
        pctx.font = "18px sans-serif"; pctx.fillStyle = "#aaa";
        pctx.fillText(`${i + 1} / ${pages.length}`, 540, 1060);
        pageCanvases.push(pc);
      }

      // 2. TTS音频（使用returnAudioData=true直接返回base64，彻底解决CORS）
      const audioBuffers: (AudioBuffer | null)[] = new Array(pages.length).fill(null);
      const tmpAudioCtx = new AudioContext();
      await tmpAudioCtx.resume();
      let audioSuccessCount = 0;
      for (let i = 0; i < pages.length; i++) {
        try {
          const ttsRes = await fetchWithRetry("/api/voice/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: pages[i].text, voice: form.voiceId, returnAudioData: true }),
          });
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            if (ttsData.success && ttsData.audioDataBase64) {
              // 直接从base64解码音频（彻底解决CORS）
              try {
                const binaryStr = atob(ttsData.audioDataBase64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let j = 0; j < binaryStr.length; j++) bytes[j] = binaryStr.charCodeAt(j);
                audioBuffers[i] = await tmpAudioCtx.decodeAudioData(bytes.buffer);
                audioSuccessCount++;
              } catch (e) { console.error(`第${i+1}页音频解码失败:`, e); }
            } else if (ttsData.success && ttsData.audioUrl) {
              // 降级：代理方式
              const proxyAudioUrl = `/api/admin/image-proxy?url=${encodeURIComponent(ttsData.audioUrl)}`;
              const audioRes = await fetchWithRetry(proxyAudioUrl, {});
              if (audioRes.ok) {
                const arrayBuffer = await audioRes.arrayBuffer();
                try { audioBuffers[i] = await tmpAudioCtx.decodeAudioData(arrayBuffer); audioSuccessCount++; } catch (e) { console.error(`第${i+1}页音频解码失败:`, e); }
              }
            }
          }
        } catch (e) { console.error(`第${i+1}页TTS失败:`, e); }
      }
      tmpAudioCtx.close();
      console.log(`[视频] 音频准备完成: ${audioSuccessCount}/${pages.length}页成功`);

      // 3. 录制
      const recordCanvas = document.createElement("canvas");
      recordCanvas.width = 1080; recordCanvas.height = 1080;
      const recordCtx = recordCanvas.getContext("2d")!;
      const audioCtx = new AudioContext();
      await audioCtx.resume();
      const audioDest = audioCtx.createMediaStreamDestination();
      const videoStream = recordCanvas.captureStream(1);
      const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioDest.stream.getAudioTracks()]);
      let mimeType = "video/webm";
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) mimeType = "video/webm;codecs=vp9,opus";
      else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) mimeType = "video/webm;codecs=vp8,opus";
      const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 2500000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const recordingDone = new Promise<Blob>((resolve) => { recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType })); });
      recorder.start(1000);

      // 4. 逐页播放
      for (let i = 0; i < pages.length; i++) {
        recordCtx.drawImage(pageCanvases[i], 0, 0);
        if (audioBuffers[i]) {
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffers[i];
          source.connect(audioDest);
          source.connect(audioCtx.destination);
          const duration = audioBuffers[i]!.duration;
          await new Promise<void>((resolve) => { source.onended = () => resolve(); source.start(0); setTimeout(resolve, (duration + 0.5) * 1000); });
        } else {
          await new Promise(r => setTimeout(r, 4000));
        }
      }

      recorder.stop();
      const videoBlob = await recordingDone;
      audioCtx.close();

      // 保存视频blob用于播放
      const blobUrl = URL.createObjectURL(videoBlob);
      setVideoBlobUrl(blobUrl);

      // 同时触发下载
      const a = document.createElement("a");
      a.href = blobUrl; a.download = `${completedStory.title || "绘本"}.webm`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) {
      console.error("视频生成失败:", e);
      alert("视频生成失败：" + (e instanceof Error ? e.message : "未知错误"));
    } finally {
      setDownloading(prev => ({ ...prev, video: false }));
    }
  };

  // ====== 结果页视图（生成完成后显示，替代表单） ======
  if (completedStory && !isGenerating) {
    return (
      <AdminAuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-purple-50">
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[60%]">📖 {completedStory.title}</h1>
            <button
              onClick={() => { setCompletedStory(null); setGenerationStep("idle"); setGenerationProgress(0); setCompletedBookId(null); setVideoBlobUrl(null); }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
            >
              ➕ 新建绘本
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 绘本图片网格 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {completedStory.pages.map((page, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border-2 border-gray-100 hover:border-orange-300 transition-colors bg-white shadow-sm">
                {page.imageUrl ? (
                  <img 
                    src={page.imageUrl.startsWith("http") ? `/api/admin/image-proxy?url=${encodeURIComponent(page.imageUrl)}` : page.imageUrl} 
                    alt={`第${idx+1}页`} 
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🖼️</div>
                      <div>第{idx+1}页</div>
                      <div className="text-xs text-red-400">未生成</div>
                    </div>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs text-gray-600 line-clamp-2">{page.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 有声视频播放器（仅有声版/亲子朗读版） */}
          {hasVideo && videoBlobUrl && (
            <div className="mb-6 bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">🎬 有声绘本视频</h3>
              <video src={videoBlobUrl} controls className="w-full rounded-xl" style={{ maxHeight: "400px" }} />
            </div>
          )}

          {/* 下载按钮区域 */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">📦 下载交付物</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={downloadPDF} disabled={downloading.pdf}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium">
                {downloading.pdf ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 生成PDF中...</> : <><span className="text-xl">📄</span> 下载PDF绘本</>}
              </button>
              <button onClick={downloadImages} disabled={downloading.images}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 font-medium">
                {downloading.images ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 下载中...</> : <><span className="text-xl">🖼️</span> 下载全部图片</>}
              </button>
              {hasVideo && (
                <button onClick={generateAndDownloadVideo} disabled={downloading.video}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 font-medium sm:col-span-2">
                  {downloading.video ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 生成有声视频中...</> : <><span className="text-xl">🎬</span> 生成并下载有声视频</>}
                </button>
              )}
            </div>
            {completedBookId && (
              <div className="mt-4 pt-4 border-t flex items-center gap-3">
                <span className="text-sm text-gray-500">🔗</span>
                <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded-lg break-all">{getShareLink()}</code>
                <button onClick={copyShareLink} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">复制</button>
              </div>
            )}
          </div>
        </div>
      </div>
      </AdminAuthGuard>
    );
  }

  // ====== 生成中/表单视图 ======
  return (
    <AdminAuthGuard>
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>📋</span> Admin 接单后台
              </h1>
              <p className="text-sm text-gray-500">快速生成客户专属绘本</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Admin Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 进度显示 */}
        {isGenerating && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="animate-spin">⏳</span> 生成进度
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{generationStep === "completed" ? '✅ 生成完成！' : generationProgress < 10 ? '准备中...' : generationProgress < 30 ? '正在生成故事...' : generationProgress < 60 ? '正在绘制插画...' : generationProgress < 80 ? '正在合成配音...' : generationProgress < 95 ? '正在保存绘本...' : '即将完成！'}</span>
                <span className="text-2xl font-bold text-orange-600">{generationProgress}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 rounded-full"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["idle", "uploading_voice", "cloning_voice", "uploading_photo", "generating_story", "generating_images", "generating_audio", "generating_video"].map((step) => (
                <span 
                  key={step}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    generationStep === step 
                      ? "bg-orange-100 text-orange-700 ring-2 ring-orange-300" 
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {step === "uploading_voice" && "📤 上传语音"}
                  {step === "cloning_voice" && "🎙️ 克隆声音"}
                  {step === "uploading_photo" && "📷 上传照片"}
                  {step === "generating_story" && "✍️ 生成故事"}
                  {step === "generating_images" && "🎨 生成配图"}
                  {step === "generating_audio" && "🔊 生成配音"}
                  {step === "generating_video" && "🎬 生成视频"}
                </span>
              ))}
            </div>
            
            {generationStep === "failed" && generationError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">❌ {generationError}</p>
              </div>
            )}
            
            {generationStep === "completed" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium">✅ 绘本生成完成！绘本预览正在加载...</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：客户信息 */}
          <div className="space-y-6">
            {/* 客户信息 */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>👤</span> 客户信息
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    客户姓名
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="输入客户姓名"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系电话
                  </label>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => setForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="输入联系电话"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    电子邮箱
                  </label>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="输入邮箱地址"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    订单备注
                  </label>
                  <textarea
                    value={form.orderNote}
                    onChange={(e) => setForm(prev => ({ ...prev, orderNote: e.target.value }))}
                    placeholder="输入备注信息"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>
              </div>
            </div>

            {/* 孩子信息（自由高阶版隐藏，全由用户自定义描述） */}
            {form.planId !== "custom-advanced" && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>👶</span> 孩子信息
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      孩子名字
                    </label>
                    <input
                      type="text"
                      value={form.childName}
                      onChange={(e) => setForm(prev => ({ ...prev, childName: e.target.value }))}
                      placeholder="输入孩子名字（绘本主角）"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        年龄
                      </label>
                      <select
                        value={form.childAge}
                        onChange={(e) => setForm(prev => ({ ...prev, childAge: Number(e.target.value) }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      >
                        {AGE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        性别
                      </label>
                      <div className="flex gap-2">
                        {GENDER_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setForm(prev => ({ ...prev, childGender: opt.value as "boy" | "girl" }))}
                            className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                              form.childGender === opt.value
                                ? "border-orange-400 bg-orange-50 text-orange-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {opt.emoji} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 照片上传（孩子主角） */}
            {(form.planId === "child-hero" || form.useChildPhoto) && (
              <div ref={uploadSectionRef} className="bg-white rounded-2xl shadow-md p-6 border-2 border-orange-300">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span>📷</span> 孩子照片（生成主角）
                </h2>
                <p className="text-sm text-orange-600 font-medium mb-4">
                  ⚠️ 请上传孩子正面照片，AI将根据照片生成主角形象
                </p>
                
                {!photoPreviewUrl ? (
                  <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-gray-600">点击上传孩子照片</p>
                    <p className="text-xs text-gray-400 mt-1">支持 JPG/PNG，最大 5MB</p>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={photoPreviewUrl}
                      alt="孩子照片预览"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={clearPhoto}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      ✕
                    </button>
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      ✅ 照片已上传，将用于生成主角形象
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 语音录制（亲子朗读） */}
            {(form.planId === "parent-voice" || form.useClonedVoice) && (
              <div ref={form.planId === "parent-voice" ? uploadSectionRef : undefined} className="bg-white rounded-2xl shadow-md p-6 border-2 border-orange-300">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span>🎙️</span> 家长语音（克隆声音）
                </h2>
                <p className="text-sm text-orange-600 font-medium mb-4">
                  ⚠️ 请录制5-20秒家长语音，AI将克隆家长声音朗读绘本
                </p>
                
                {!voicePreviewUrl ? (
                  <div className="text-center">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all mx-auto ${
                        isRecording
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      }`}
                    >
                      {isRecording ? "⏹️" : "🎤"}
                    </button>
                    <p className="mt-3 text-gray-600">
                      {isRecording ? (
                        <>
                          <span className="text-red-500 font-medium">{recordingTime}s</span> / 录音中...
                        </>
                      ) : (
                        "点击开始录音"
                      )}
                    </p>
                    {isRecording && (
                      <div className="mt-2 flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-red-400 rounded-full animate-pulse"
                            style={{
                              height: `${10 + Math.random() * 20}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <button
                        onClick={() => {
                          const audio = new Audio(voicePreviewUrl);
                          audio.play();
                        }}
                        className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600"
                      >
                        ▶️
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">录音已保存</p>
                        <p className="text-xs text-gray-500">点击播放试听</p>
                      </div>
                      <button
                        onClick={clearRecording}
                        className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        删除
                      </button>
                    </div>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      ✅ 录音已保存，将用于克隆声音
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧：绘本配置 */}
          <div className="space-y-6">
            {/* 套餐选择 */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>💎</span> 选择套餐
              </h2>
              <div className="space-y-3">
                {ADMIN_PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setForm(prev => ({ ...prev, planId: plan.id }))}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      form.planId === plan.id
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{plan.emoji}</span>
                        <div>
                          <p className="font-medium text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">
                          {plan.price === 0 ? "免费" : `¥${plan.price}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {plan.pageCount}页
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {plan.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义需求（自由高阶版） */}
            {form.planId === "custom-advanced" && (
              <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-purple-300">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span>🔮</span> 自定义绘本需求
                </h2>
                <p className="text-sm text-purple-600 font-medium mb-4">
                  描述你想要的绘本，AI将根据你的需求量身打造
                </p>
                <textarea
                  value={form.customPrompt}
                  onChange={(e) => setForm(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder={"描述你想要的绘本，例如：\n- 故事内容：讲一个关于小兔子去月球找妈妈的故事\n- 主角设定：叫豆豆的5岁女孩，喜欢天文\n- 特殊要求：每页要有星星元素，结尾要有惊喜\n- 教育意义：培养孩子的探索精神\n- 风格偏好：温馨治愈，不要太刺激"}
                  className="w-full h-40 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors text-sm resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-400">越详细，生成效果越好</p>
                  <p className="text-xs text-gray-400">{form.customPrompt.length}/1000</p>
                </div>
                {form.customPrompt.trim().length > 0 && form.customPrompt.trim().length < 10 && (
                  <p className="text-xs text-orange-500 mt-1">请至少输入10个字描述你的需求</p>
                )}
              </div>
            )}

            {/* 主题选择（自由高阶版隐藏，由用户自定义描述） */}
            {form.planId !== "custom-advanced" && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🎭</span> 故事主题
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {STORY_THEMES.slice(0, 9).map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setForm(prev => ({ ...prev, themeId: theme.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        form.themeId === theme.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{theme.emoji}</div>
                      <p className="text-xs font-medium text-gray-700">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 画风选择（自由高阶版隐藏，由用户自定义描述） */}
            {form.planId !== "custom-advanced" && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🎨</span> 画风选择
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  {STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setForm(prev => ({ ...prev, styleId: style.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        form.styleId === style.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{style.emoji}</div>
                      <p className="text-xs font-medium text-gray-700">{style.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 声音选择（仅有声版/亲子朗读版需要） */}
            {(form.planId === "audio" || form.planId === "parent-voice") && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🔊</span> 朗读声音
              </h2>
              <div className="space-y-2">
                {voices.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => setForm(prev => ({ ...prev, voiceId: voice.id }))}
                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      form.voiceId === voice.id
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{voice.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{voice.name}</p>
                      <p className="text-xs text-gray-500">{voice.description}</p>
                    </div>
                    {voice.isCloned && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                        克隆
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* 页数选择 */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📄</span> 绘本页数
              </h2>
              <div className="flex gap-3">
                {[8, 12].map(count => (
                  <button
                    key={count}
                    onClick={() => setForm(prev => ({ ...prev, pageCount: count as 8 | 12 }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                      form.pageCount === count
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {count} 页
                  </button>
                ))}
              </div>
            </div>

            {/* 一键生成按钮 */}
            <button
              onClick={generateBook}
              disabled={isGenerating || (form.planId === "custom-advanced" ? form.customPrompt.trim().length < 10 : !form.childName.trim())}
              className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                isGenerating || (form.planId === "custom-advanced" ? form.customPrompt.trim().length < 10 : !form.childName.trim())
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-primary-dark text-white hover:shadow-xl"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  ✨ 一键生成绘本
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    {/* 浮动进度条 - 生成时固定在底部 */}
    {isGenerating && (
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-50 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {generationStep === "completed" ? "✅ 生成完成！" :
             generationStep === "generating_story" ? "✍️ 生成故事中..." :
             generationStep === "generating_images" ? "🎨 绘制插画中..." :
             generationStep === "generating_audio" ? "🔊 合成配音中..." :
             generationStep === "cloning_voice" ? "🎙️ 克隆声音中..." :
             generationStep === "uploading_voice" ? "📤 上传语音中..." :
             generationStep === "uploading_photo" ? "📷 上传照片中..." :
             "⏳ 准备中..."}
          </span>
          <span className="text-xl font-bold text-orange-600">{generationProgress}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 rounded-full"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      </div>
    )}
    
    </AdminAuthGuard>
  );
}
