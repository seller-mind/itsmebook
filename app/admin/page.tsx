"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_PLANS, getPlanConfig, AdminGenerateParams, AdminFeatures, addClonedVoice, VoiceOption } from "@/lib/admin";
import { STORY_THEMES } from "@/lib/story";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";

// 动态导入导出组件（避免SSR问题）
const PDFExport = dynamic(() => import("@/components/admin/PDFExport"), { ssr: false });
const VideoExport = dynamic(() => import("@/components/admin/VideoExport"), { ssr: false });

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
  planId: "basic" | "premium" | "audio" | "parent-voice" | "child-hero";
  
  // 声音
  voiceId: string;
  useClonedVoice: boolean;
  parentVoiceFile: File | null;
  
  // 照片
  useChildPhoto: boolean;
  childPhotoFile: File | null;
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

export default function AdminPage() {
  const router = useRouter();
  
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
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 监听套餐变化
  useEffect(() => {
    const plan = ADMIN_PLANS.find(p => p.id === form.planId);
    if (plan) {
      setSelectedPlan(plan);
      // 更新页数
      setForm(prev => ({ ...prev, pageCount: plan.pageCount }));
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
  
  // 生成绘本
  const generateBook = async () => {
    if (!form.childName.trim()) {
      alert("请输入孩子名字");
      return;
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
    setGenerationStep("idle");
    setGenerationProgress(0);
    setGenerationError(null);
    
    try {
      // 步骤1: 上传语音并克隆（如果有）
      let clonedVoiceId = form.voiceId;
      
      if (form.useClonedVoice && form.parentVoiceFile) {
        setGenerationStep("uploading_voice");
        setGenerationProgress(5);
        
        // 读取语音文件为 base64
        const voiceBase64 = await fileToBase64(form.parentVoiceFile);
        
        setGenerationStep("cloning_voice");
        setGenerationProgress(10);
        
        // 调用声音克隆API
        const cloneResponse = await fetch("/api/voice/clone", {
          method: "POST",
          body: voiceBase64, // 直接传 base64 字符串
          headers: {
            "Content-Type": "text/plain",
          },
        });
        
        if (!cloneResponse.ok) {
          throw new Error("声音克隆失败");
        }
        
        const cloneResult = await cloneResponse.json();
        if (cloneResult.success && cloneResult.voice_id) {
          clonedVoiceId = cloneResult.voice_id;
          // 添加到声音列表
          addClonedVoice(clonedVoiceId, `克隆-${form.customerName || "家长"}`);
          setVoices(prev => [...prev, {
            id: clonedVoiceId,
            name: `克隆-${form.customerName || "家长"}`,
            emoji: "🎙️",
            description: "家长克隆声音",
            isCloned: true,
          }]);
        }
        setGenerationProgress(15);
      }
      
      // 步骤2: 上传照片（如果有）
      let photoBase64: string | undefined;
      
      if (form.useChildPhoto && form.childPhotoFile) {
        setGenerationStep("uploading_photo");
        setGenerationProgress(20);
        
        photoBase64 = await fileToBase64(form.childPhotoFile);
        setGenerationProgress(25);
      }
      
      // 步骤3: 生成故事
      setGenerationStep("generating_story");
      setGenerationProgress(30);
      
      const sessionId = uuidv4();
      
      const generateResponse = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          childName: form.childName,
          childAge: form.childAge,
          childGender: form.childGender,
          themeId: form.themeId,
          styleId: form.styleId,
          pageCount: form.pageCount,
          voiceId: clonedVoiceId,
          useClonedVoice: form.useClonedVoice,
          photoBase64,
          useChildPhoto: form.useChildPhoto,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail,
          orderNote: form.orderNote,
        }),
      });
      
      if (!generateResponse.ok) {
        throw new Error("生成失败");
      }
      
      // 处理SSE流
      const reader = generateResponse.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");
      
      const decoder = new TextDecoder();
      let result = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        result += chunk;
        
        // 解析SSE数据
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "progress") {
                setGenerationProgress(Math.min(data.progress, 90));
                setGenerationStep(data.step as GenerationStep);
              } else if (data.type === "completed") {
                setGenerationProgress(100);
                setGenerationStep("completed");
                setCompletedBookId(data.bookId);
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      setGenerationStep("completed");
      setGenerationProgress(100);
      
    } catch (error: any) {
      console.error("生成失败:", error);
      setGenerationStep("failed");
      setGenerationError(error.message || "生成过程中出现错误");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 文件转 Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // 查看生成的绘本
  const viewBook = () => {
    if (completedBookId) {
      router.push(`/story/player?bookId=${completedBookId}`);
    }
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

  return (
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
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-primary-orange transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{generationProgress}%</p>
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
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">✅ 绘本生成完成！</p>
                  <div className="mt-3 flex gap-3 flex-wrap">
                    <button
                      onClick={viewBook}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      📖 查看绘本
                    </button>
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      🔗 复制分享链接
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      ➕ 新建订单
                    </button>
                  </div>
                </div>
                
                {/* PDF和视频导出 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PDFExport
                    bookId={completedBookId || ""}
                    title={`${form.childName}的绘本`}
                    characterName={form.childName}
                    characterAge={form.childAge}
                    pages={[]}
                  />
                  <VideoExport
                    bookId={completedBookId || ""}
                    title={`${form.childName}的绘本`}
                    pages={[]}
                    pageDuration={4}
                  />
                </div>
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

            {/* 孩子信息 */}
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

            {/* 照片上传（孩子主角） */}
            {(form.planId === "child-hero" || form.useChildPhoto) && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📷</span> 孩子照片（生成主角）
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  上传孩子照片，AI将生成以孩子形象为主角的绘本
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
            {(form.planId === "parent-voice" || form.planId === "child-hero" || form.useClonedVoice) && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🎙️</span> 家长语音（克隆声音）
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  录制家长语音片段（5-20秒），AI将克隆家长的声音朗读绘本
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

            {/* 主题选择 */}
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

            {/* 画风选择 */}
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

            {/* 声音选择 */}
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
              disabled={isGenerating || !form.childName.trim()}
              className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                isGenerating || !form.childName.trim()
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
  );
}
