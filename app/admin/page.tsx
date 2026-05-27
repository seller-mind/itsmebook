"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// 套餐配置（与lib/admin.ts保持一致）
interface PlanConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  features: string[];
  pageCount: 8 | 12;
  hasVoiceover: boolean;
  hasParentVoice: boolean;
  hasChildHero: boolean;
  hasVideoExport: boolean;
}

const ADMIN_PLANS: PlanConfig[] = [
  { id: "basic", name: "基础版", emoji: "📖", description: "8页AI绘本+PDF", price: 0, features: ["8页AI绘本", "高清PDF下载"], pageCount: 8, hasVoiceover: false, hasParentVoice: false, hasChildHero: false, hasVideoExport: false },
  { id: "premium", name: "精品版", emoji: "✨", description: "12页精品绘本+PDF", price: 29, features: ["12页AI绘本", "高清PDF下载"], pageCount: 12, hasVoiceover: false, hasParentVoice: false, hasChildHero: false, hasVideoExport: false },
  { id: "audio", name: "有声版", emoji: "🎧", description: "有声绘本视频+PDF", price: 49, features: ["12页AI绘本", "AI配音朗读视频", "高清PDF下载"], pageCount: 12, hasVoiceover: true, hasParentVoice: false, hasChildHero: false, hasVideoExport: true },
  { id: "parent-voice", name: "亲子朗读版", emoji: "👨‍👧", description: "家长声音朗读视频+PDF", price: 99, features: ["12页AI绘本", "家长声音克隆朗读", "配音视频", "高清PDF下载"], pageCount: 12, hasVoiceover: true, hasParentVoice: true, hasChildHero: false, hasVideoExport: true },
  { id: "child-hero", name: "孩子主角专属版", emoji: "👶", description: "孩子照片生成主角+PDF", price: 129, features: ["12页AI绘本", "孩子照片生成主角", "高清PDF下载"], pageCount: 12, hasVoiceover: false, hasParentVoice: false, hasChildHero: true, hasVideoExport: false },
  { id: "custom-advanced", name: "自由高阶版", emoji: "🔮", description: "自定义需求，AI为你量身打造", price: 169, features: ["12页AI绘本", "自定义故事需求", "高清PDF下载"], pageCount: 12, hasVoiceover: false, hasParentVoice: false, hasChildHero: false, hasVideoExport: false },
];

// 主题配置
const STORY_THEMES = [
  { id: "animal", name: "小动物", emoji: "🐰", description: "小动物们的温馨故事" },
  { id: "family", name: "温馨家庭", emoji: "🏠", description: "家人之间的爱与陪伴" },
  { id: "fantasy", name: "奇幻冒险", emoji: "🦋", description: "充满想象的奇妙旅程" },
  { id: "princess", name: "公主王子", emoji: "👸", description: "优雅温馨的宫廷故事" },
  { id: "bedtime", name: "睡前催眠", emoji: "🌙", description: "帮助入睡的温柔故事" },
  { id: "space", name: "太空探险", emoji: "⭐", description: "探索宇宙的奇妙冒险" },
  { id: "ocean", name: "海洋世界", emoji: "🐬", description: "海底小动物们的有趣故事" },
  { id: "dinosaur", name: "恐龙时代", emoji: "🦕", description: "和恐龙做朋友的奇妙旅程" },
  { id: "friendship", name: "友谊故事", emoji: "🤝", description: "小伙伴之间的温暖故事" },
  { id: "bravery", name: "勇敢成长", emoji: "💪", description: "鼓励孩子勇敢的小故事" },
  { id: "seasons", name: "四季变化", emoji: "🍂", description: "感受春夏秋冬的美丽" },
  { id: "fairytale", name: "梦幻童话", emoji: "🏰", description: "充满想象力的睡前故事" },
];

// 画风选项
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

// 声音选项
const VOICES = [
  { id: "longhuhu_v3", name: "龙呼呼", emoji: "🐉", description: "天真女童，最适合故事" },
  { id: "xiaoyi_v3", name: "亲切老师", emoji: "🧑‍🏫", description: "温暖女声，娓娓道来" },
  { id: "zhichu_v3", name: "阳光少年", emoji: "👨‍🎓", description: "活泼男童声线" },
  { id: "zhimiao_v3", name: "睡前低语", emoji: "🎭", description: "轻柔女声，适合睡前" },
  { id: "zhiyan_v3", name: "故事大王", emoji: "🌟", description: "浑厚男声，讲大冒险" },
];

// Admin 密码
const ADMIN_PASSWORD = "itsmebook2026";
const AUTH_KEY = "itsmebook_admin_auth";

// 带重试的fetch（解决网络波动）
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries: number = 2): Promise<Response> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      if (err.name === 'AbortError') throw new Error('请求超时，请重试');
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1000 * attempt));
      else throw err;
    }
  }
  throw new Error("请求失败");
};

// 获取图片URL（Supabase Storage无需代理）
const getImageSrc = (url: string | null | undefined): string => {
  if (!url) return "";
  // Supabase Storage图片直接使用
  if (url.includes("sdeduzqplvsyttvnolxm.supabase.co")) return url;
  // 其他来源可能需要代理（如dashscope旧数据）
  if (url.includes("aliyuncs.com") || url.includes("dashscope")) {
    try {
      const b64 = btoa(url);
      return `/api/admin/image-proxy?b64=${encodeURIComponent(b64)}`;
    } catch {
      return url;
    }
  }
  return url;
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

// =============== 密码保护组件 ===============
function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved === "true") setIsAuthenticated(true);
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
            {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
            <button onClick={handleLogin} className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
              进入后台
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// =============== 主要页面组件 ===============
export default function AdminPage() {
  const router = useRouter();

  // ====== 状态定义 ======
  const [currentView, setCurrentView] = useState<"create" | "reader">("create");

  // 表单状态
  const [form, setForm] = useState({
    customerName: "",
    childName: "",
    childAge: 5,
    childGender: "boy" as "boy" | "girl",
    themeId: "animal",
    styleId: "watercolor",
    planId: "basic",
    voiceId: "longhuhu_v3",
    customPrompt: "",
  });

  // 上传状态
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 完成的绘本
  const [completedBook, setCompletedBook] = useState<{
    title: string;
    childName: string;
    pages: Array<{ pageNumber: number; text: string; imageUrl: string }>;
    bookId: string;
  } | null>(null);

  // 阅读器状态
  const [currentPage, setCurrentPage] = useState(0);
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);

  // 下载状态
  const [downloading, setDownloading] = useState({ pdf: false, images: false });

  // Refs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cancelRef = useRef(false);
  const stallCountRef = useRef(0);
  const lastProgressRef = useRef(-1);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  // ====== 辅助函数 ======

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    stallCountRef.current = 0;
    lastProgressRef.current = -1;
  }, []);

  // 清除卡死状态
  const clearStuckState = useCallback(() => {
    stopPolling();
    setIsGenerating(false);
    setGenerationProgress(0);
    setGenerationError(null);
    localStorage.removeItem("itsmebook_generating_session");
  }, [stopPolling]);

  // 处理轮询结果
  const handlePollResult = useCallback((data: any, sid: string) => {
    if (data.status === "completed") {
      setGenerationProgress(100);
      setGenerationStep("完成！");
      setIsGenerating(false);
      stopPolling();

      if (data.result) {
        const r = data.result;
        const storyData = {
          title: r.title || "我的绘本",
          childName: form.childName || "小朋友",
          pages: (r.pages || []).map((p: any, i: number) => ({
            pageNumber: p.page_number || p.pageNumber || i + 1,
            text: p.text,
            imageUrl: p.image_url || p.imageUrl || "",
          })),
          bookId: r.bookId || "",
        };
        setCompletedBook(storyData);
        setCurrentView("reader");

        // 保存到sessionStorage（分享页会用到）
        const playerData = { ...storyData };
        sessionStorage.setItem("bedtime_story", JSON.stringify(playerData));
      }
      localStorage.removeItem("itsmebook_generating_session");
    } else if (data.status === "failed") {
      setGenerationStep("生成失败");
      setGenerationError(data.step || "生成失败");
      setIsGenerating(false);
      stopPolling();
      localStorage.removeItem("itsmebook_generating_session");
    } else {
      // 还在生成中
      const p = data.progress || 0;
      setGenerationProgress(p);
      setGenerationStep(data.step || "生成中...");

      // 停滞检测
      if (p === lastProgressRef.current) {
        stallCountRef.current++;
        if (stallCountRef.current >= 30) { // 约60秒无变化
          console.warn("进度停滞超时，自动取消");
          clearStuckState();
          setGenerationError("生成超时，请重新生成");
          return;
        }
      } else {
        stallCountRef.current = 0;
        lastProgressRef.current = p;
      }
    }
  }, [form.childName, stopPolling, clearStuckState]);

  // 开始轮询
  const startPolling = useCallback((sid: string) => {
    stopPolling();
    stallCountRef.current = 0;
    lastProgressRef.current = -1;

    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/generate-status?sessionId=${sid}`);
        if (!res.ok) {
          if (res.status === 404) {
            clearStuckState();
            setGenerationError("生成记录不存在");
            return;
          }
          return;
        }
        const data = await res.json();
        if (data.success) handlePollResult(data, sid);
      } catch (e) {
        console.error("轮询失败:", e);
      }
    };

    poll();
    pollingIntervalRef.current = setInterval(poll, 2000);
  }, [stopPolling, handlePollResult, clearStuckState]);

  // 页面加载时检查残留session
  useEffect(() => {
    const savedSid = localStorage.getItem("itsmebook_generating_session");
    if (savedSid) {
      fetch(`/api/admin/generate-status?sessionId=${savedSid}`)
        .then(res => {
          if (!res.ok) { clearStuckState(); return res.json().catch(() => ({})); }
          return res.json();
        })
        .then(data => {
          if (!data.success) { clearStuckState(); return; }
          if (data.status === "completed") {
            handlePollResult(data, savedSid);
          } else if (data.status === "failed") {
            clearStuckState();
            setGenerationError("上次生成已失败");
          } else {
            // 恢复生成
            setIsGenerating(true);
            const p = data.progress || 0;
            setGenerationProgress(p);
            startPolling(savedSid);
          }
        })
        .catch(() => { clearStuckState(); });
    }
    return () => stopPolling();
  }, [startPolling, stopPolling, clearStuckState, handlePollResult]);

  // 取消生成
  const cancelGeneration = () => {
    cancelRef.current = true;
    clearStuckState();
    setGenerationStep("");
  };

  // 照片上传处理
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("照片大小不能超过5MB"); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // ====== 生成绘本 ======
  const generateBook = async () => {
    // 验证
    if (form.planId === "custom-advanced") {
      if (form.customPrompt.trim().length < 10) { alert("自由高阶版请至少输入10个字描述需求"); return; }
    } else {
      if (!form.childName.trim()) { alert("请输入孩子名字"); return; }
    }

    const plan = ADMIN_PLANS.find(p => p.id === form.planId);
    if (plan?.hasChildHero && !photoFile) { alert("请先上传孩子照片"); return; }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep("准备生成...");
    setGenerationError(null);
    cancelRef.current = false;

    try {
      const sessionId = uuidv4();
      localStorage.setItem("itsmebook_generating_session", sessionId);

      // 照片转base64
      let photoBase64: string | undefined;
      if (photoFile) {
        photoBase64 = await fileToBase64(photoFile);
      }

      // ====== 步骤1: Init ======
      setGenerationStep("初始化...");
      setGenerationProgress(2);
      await fetchWithRetry("/api/admin/generate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "init",
          sessionId,
          params: { childName: form.childName, childAge: form.childAge, themeId: form.themeId, styleId: form.styleId, planId: form.planId }
        })
      });
      if (cancelRef.current) return;

      // ====== 步骤2: 生成故事 ======
      setGenerationStep("生成故事中...");
      setGenerationProgress(5);
      const planConfig = ADMIN_PLANS.find(p => p.id === form.planId)!;

      const storyRes = await fetchWithRetry("/api/admin/generate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "story",
          sessionId,
          childName: form.childName || "自定义",
          childAge: form.childAge,
          childGender: form.childGender,
          themeId: form.themeId,
          pageCount: planConfig.pageCount,
          styleId: form.styleId,
          customPrompt: form.planId === "custom-advanced" ? form.customPrompt : undefined,
        })
      });
      if (cancelRef.current) return;

      const storyData = await storyRes.json();
      if (!storyData.success) throw new Error(storyData.message || "故事生成失败");

      const pages = storyData.story.pages;
      setGenerationProgress(20);

      // 开始后台轮询
      startPolling(sessionId);

      // ====== 步骤3: 生成图片（逐页） ======
      for (let i = 0; i < pages.length; i++) {
        if (cancelRef.current) return;

        const imgRes = await fetchWithRetry("/api/admin/generate-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: "image",
            sessionId,
            index: i,
            pages,
            styleId: form.styleId,
            refImageBase64: photoBase64,
          })
        });

        const imgData = await imgRes.json();
        
        // 更新pages中的image_url
        if (imgData.page) {
          pages[i] = imgData.page;
        }

        // 如果这张图失败了（imageUrl为null），最多重试2次
        if (!imgData.imageUrl) {
          for (let retry = 0; retry < 2; retry++) {
            if (cancelRef.current) break;
            const retryRes = await fetchWithRetry("/api/admin/generate-step", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ step: "image", sessionId, index: i, pages, styleId: form.styleId, refImageBase64: photoBase64 })
            });
            const retryData = await retryRes.json();
            if (retryData.imageUrl) {
              pages[i] = retryData.page;
              break;
            }
          }
        }

        const progress = 20 + Math.floor(((i + 1) / pages.length) * 70);
        setGenerationProgress(progress);
      }
      if (cancelRef.current) return;

      // ====== 步骤4: 完成 ======
      setGenerationStep("保存绘本...");
      setGenerationProgress(92);

      const completeRes = await fetchWithRetry("/api/admin/generate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "complete",
          sessionId,
          title: storyData.story.title,
          pages,
          params: { childName: form.childName, childAge: form.childAge, themeId: form.themeId, styleId: form.styleId, planId: form.planId }
        })
      });
      if (cancelRef.current) return;

      const completeData = await completeRes.json();
      if (!completeData.success) throw new Error(completeData.message || "保存失败");

      setGenerationProgress(100);
      setGenerationStep("完成！");

      const bookData = {
        title: completeData.title,
        childName: form.childName || "小朋友",
        pages: pages.map((p: any, i: number) => ({
          pageNumber: p.page_number || i + 1,
          text: p.text,
          imageUrl: p.image_url || "",
        })),
        bookId: completeData.bookId,
      };
      setCompletedBook(bookData);
      setCurrentView("reader");
      sessionStorage.setItem("bedtime_story", JSON.stringify(bookData));
      localStorage.removeItem("itsmebook_generating_session");
      stopPolling();

    } catch (err: any) {
      console.error("生成失败:", err);
      setGenerationError(err.message || "生成失败");
      setIsGenerating(false);
      stopPolling();
      localStorage.removeItem("itsmebook_generating_session");
    }
  };

  // ====== 下载功能 ======
  const downloadPDF = async () => {
    if (!completedBook) return;
    setDownloading(d => ({ ...d, pdf: true }));

    try {
      const pages = completedBook.pages;
      const pageW = 595; // A4 width in points
      const pageH = 842; // A4 height
      const imgY = 80;
      const imgH = pageW - 80; // 正方形图片
      const textY = imgY + imgH + 40;

      // 动态创建canvas
      const canvas = document.createElement("canvas");
      canvas.width = pageW;
      canvas.height = pageH;
      const ctx = canvas.getContext("2d")!;

      // 创建PDF（一次实例，逐页添加）
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];

        // 第一页之后的页面需要addPage
        if (i > 0) pdf.addPage();

        // 白色背景
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageW, pageH);

        // 加载图片
        const imgUrl = getImageSrc(p.imageUrl);
        if (imgUrl && !imgUrl.includes("placehold.co")) {
          try {
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.src = imgUrl;
              img.onload = () => {
                ctx.drawImage(img, 40, imgY, pageW - 80, imgH);
                resolve();
              };
              img.onerror = () => resolve();
              setTimeout(() => resolve(), 5000); // 5秒超时
            });
          } catch {}
        }

        // 文字
        ctx.fillStyle = "#333333";
        ctx.font = i === 0 ? "bold 24px 'PingFang SC', 'Microsoft YaHei', sans-serif" : "18px 'PingFang SC', 'Microsoft YaHei', sans-serif";
        ctx.textAlign = "center";
        const text = p.text || "";

        // 使用drawWrappedText
        drawWrappedText(ctx, text, pageW / 2, textY, pageW - 100, 28, 6);

        // 将canvas添加到PDF
        const imgData = canvas.toDataURL("image/jpeg", 0.9);
        pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
      }

      // 触发下载
      pdf.save(`${completedBook.title || "我的绘本"}.pdf`);
    } catch (err) {
      console.error("PDF生成失败:", err);
      alert("PDF生成失败，请重试");
    } finally {
      setDownloading(d => ({ ...d, pdf: false }));
    }
  };

  const downloadImages = async () => {
    if (!completedBook) return;
    setDownloading(d => ({ ...d, images: true }));

    try {
      for (let i = 0; i < completedBook.pages.length; i++) {
        const p = completedBook.pages[i];
        const imgUrl = getImageSrc(p.imageUrl);

        if (!imgUrl || imgUrl.includes("placehold.co")) continue;

        try {
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `page_${i + 1}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          await new Promise(r => setTimeout(r, 500));
        } catch {
          // 移动端兼容：尝试新标签页打开
          window.open(imgUrl, "_blank");
        }
      }
    } catch (err) {
      console.error("图片下载失败:", err);
    } finally {
      setDownloading(d => ({ ...d, images: false }));
    }
  };

  // ====== 新建绘本 ======
  const handleNewBook = () => {
    setCompletedBook(null);
    setCurrentView("create");
    setCurrentPage(0);
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  // ====== 渲染 ======
  const plan = ADMIN_PLANS.find(p => p.id === form.planId);

  // 阅读器视图
  if (currentView === "reader" && completedBook) {
    const pages = completedBook.pages;
    const totalPages = pages.length;
    const currentPageData = pages[currentPage];
    const isCover = currentPage === 0;
    const isEnd = currentPage === totalPages - 1;

    return (
      <AdminAuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-purple-50">
          {/* 顶部栏 */}
          <div className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <h1 className="font-bold text-gray-900 truncate">📖 {completedBook.title}</h1>
                <p className="text-xs text-gray-500">{completedBook.childName} · 第{currentPage + 1}/{totalPages}页</p>
              </div>
              <button onClick={handleNewBook} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors whitespace-nowrap">
                ➕ 新建
              </button>
            </div>
          </div>

          {/* 主阅读区 */}
          <div className="max-w-2xl mx-auto px-4 py-4">
            {/* 大图展示 */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-4">
              <div className="relative aspect-square bg-gray-100" onClick={() => currentPageData.imageUrl && setFullscreenIdx(currentPage)}>
                {currentPageData.imageUrl ? (
                  <img
                    src={getImageSrc(currentPageData.imageUrl)}
                    alt={`第${currentPage + 1}页`}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.dataset.fallbackUsed) {
                        img.dataset.fallbackUsed = "true";
                        img.src = `https://placehold.co/768x768/FFB6C1/ffffff?text=Page+${currentPage + 1}`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🖼️</div>
                      <p className="text-gray-400">第{currentPage + 1}页未生成</p>
                    </div>
                  </div>
                )}
                {currentPageData.imageUrl && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/40 text-white text-xs rounded-full">🔍 点击放大</div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 text-white text-xs rounded-full">
                  {isCover ? "封面" : isEnd ? "封底" : `${currentPage + 1}/${totalPages}`}
                </div>
              </div>
              <div className="p-5">
                <p className={`text-gray-800 leading-relaxed ${isCover ? 'text-center text-lg font-medium' : ''}`}>{currentPageData.text}</p>
              </div>
            </div>

            {/* 翻页控制 */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${currentPage === 0 ? "bg-gray-200 text-gray-400" : "bg-white shadow-md text-gray-700 hover:bg-orange-50"}`}>‹</button>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px]">
                {pages.map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${i === currentPage ? "bg-orange-500 w-5" : "bg-gray-300"}`} />
                ))}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={isEnd}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isEnd ? "bg-gray-200 text-gray-400" : "bg-white shadow-md text-gray-700 hover:bg-orange-50"}`}>›</button>
            </div>

            {/* 缩略图条 */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {pages.map((p, i) => (
                <button key={i} onClick={() => setCurrentPage(i)} onDoubleClick={() => p.imageUrl && setFullscreenIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === currentPage ? "border-orange-400 shadow-md scale-105" : "border-gray-200 opacity-70"}`}>
                  {p.imageUrl ? (
                    <img src={getImageSrc(p.imageUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">{i + 1}</div>
                  )}
                </button>
              ))}
            </div>

            {/* 下载栏 */}
            <div className="flex gap-3 mb-4">
              <button onClick={downloadPDF} disabled={downloading.pdf}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium">
                {downloading.pdf ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 生成中...</> : "📄 下载PDF"}
              </button>
              <button onClick={downloadImages} disabled={downloading.images}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 font-medium">
                {downloading.images ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 下载中...</> : "🖼️ 下载图片"}
              </button>
            </div>

            {/* 分享链接 */}
            {completedBook.bookId && (
              <div className="flex items-center gap-2 bg-white rounded-xl p-3">
                <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded-lg break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/share/{completedBook.bookId}
                </code>
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${completedBook.bookId}`)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 whitespace-nowrap">复制链接</button>
              </div>
            )}
          </div>
        </div>

        {/* 全屏大图 */}
        {fullscreenIdx !== null && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setFullscreenIdx(null)}>
            <button onClick={() => setFullscreenIdx(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">✕</button>
            <img src={getImageSrc(pages[fullscreenIdx].imageUrl)} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
            <button onClick={(e) => { e.stopPropagation(); setFullscreenIdx(Math.max(0, fullscreenIdx - 1)); }} disabled={fullscreenIdx === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">‹</button>
            <button onClick={(e) => { e.stopPropagation(); setFullscreenIdx(Math.min(totalPages - 1, fullscreenIdx + 1)); }} disabled={fullscreenIdx === totalPages - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">›</button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white text-sm rounded-full">{fullscreenIdx + 1} / {totalPages}</div>
          </div>
        )}
      </AdminAuthGuard>
    );
  }

  // 创建视图
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">✨ 是我呀 AI绘本管理后台</h1>
            <div className="text-sm text-gray-500">重建设计 · 永久URL · 前端重试</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：孩子信息 */}
            <div className="space-y-6">
              {/* 孩子信息 */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span>👶</span> 孩子信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">孩子名字</label>
                    <input type="text" value={form.childName} onChange={e => setForm(f => ({ ...f, childName: e.target.value }))}
                      placeholder="输入名字" className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">年龄</label>
                    <select value={form.childAge} onChange={e => setForm(f => ({ ...f, childAge: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none">
                      {[2,3,4,5,6,7,8,9].map(a => <option key={a} value={a}>{a}岁</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">性别</label>
                    <div className="flex gap-2">
                      <button onClick={() => setForm(f => ({ ...f, childGender: "boy" }))}
                        className={`flex-1 py-2 rounded-xl border-2 transition-all ${form.childGender === "boy" ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200"}`}>👦 男孩</button>
                      <button onClick={() => setForm(f => ({ ...f, childGender: "girl" }))}
                        className={`flex-1 py-2 rounded-xl border-2 transition-all ${form.childGender === "girl" ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200"}`}>👧 女孩</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 照片上传（孩子主角版） */}
              {plan?.hasChildHero && (
                <div ref={uploadSectionRef} className="bg-white rounded-2xl shadow-md p-6 border-2 border-pink-200">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span>📷</span> 孩子照片（生成主角）</h2>
                  <p className="text-sm text-pink-600 mb-3">上传清晰正脸照片，效果更好</p>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                  <label htmlFor="photo-upload" className="block w-full py-8 border-2 border-dashed border-pink-300 rounded-xl text-center cursor-pointer hover:bg-pink-50 transition-colors">
                    {photoPreview ? (
                      <img src={photoPreview} alt="预览" className="w-24 h-24 object-cover rounded-lg mx-auto" />
                    ) : (
                      <><div className="text-3xl mb-2">📸</div><p className="text-sm text-gray-500">点击上传照片</p></>
                    )}
                  </label>
                  {photoFile && <button onClick={clearPhoto} className="mt-2 w-full py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">删除照片</button>}
                </div>
              )}
            </div>

            {/* 中间：主题+画风 */}
            <div className="space-y-6">
              {/* 主题选择 */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span>🎭</span> 故事主题</h2>
                <div className="grid grid-cols-3 gap-2">
                  {STORY_THEMES.map(t => (
                    <button key={t.id} onClick={() => setForm(f => ({ ...f, themeId: t.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.themeId === t.id ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <p className="text-xs font-medium text-gray-700">{t.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 画风选择 */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span>🎨</span> 画风选择</h2>
                <div className="grid grid-cols-4 gap-2">
                  {STYLES.map(s => (
                    <button key={s.id} onClick={() => setForm(f => ({ ...f, styleId: s.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.styleId === s.id ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="text-2xl mb-1">{s.emoji}</div>
                      <p className="text-xs font-medium text-gray-700">{s.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 自定义需求（自由高阶版） */}
              {form.planId === "custom-advanced" && (
                <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-purple-300">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><span>🔮</span> 自定义绘本需求</h2>
                  <p className="text-sm text-purple-600 mb-3">描述你想要的绘本，AI量身打造</p>
                  <textarea value={form.customPrompt} onChange={e => setForm(f => ({ ...f, customPrompt: e.target.value }))}
                    placeholder="描述你想要的绘本，例如：小兔子去月球找妈妈的故事..."
                    className="w-full h-32 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm resize-none" maxLength={1000} />
                  <p className="text-xs text-gray-400 mt-1">{form.customPrompt.length}/1000 {form.customPrompt.length < 10 && "（至少10字）"}</p>
                </div>
              )}
            </div>

            {/* 右侧：套餐+生成 */}
            <div className="space-y-6">
              {/* 套餐选择 */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span>💎</span> 选择套餐</h2>
                <div className="space-y-3">
                  {ADMIN_PLANS.map(p => (
                    <button key={p.id} onClick={() => {
                      setForm(f => ({ ...f, planId: p.id, pageCount: p.pageCount }));
                      if (p.hasChildHero) setTimeout(() => uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
                    }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${form.planId === p.id ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.emoji}</span>
                          <div>
                            <p className="font-medium text-gray-900">{p.name}</p>
                            <p className="text-sm text-gray-500">{p.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{p.price === 0 ? "免费" : `¥${p.price}`}</p>
                          <p className="text-xs text-gray-400">{p.pageCount}页</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 声音选择（有声版） */}
              {(form.planId === "audio" || form.planId === "parent-voice") && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span>🔊</span> 朗读声音</h2>
                  <div className="space-y-2">
                    {VOICES.map(v => (
                      <button key={v.id} onClick={() => setForm(f => ({ ...f, voiceId: v.id }))}
                        className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${form.voiceId === v.id ? "border-orange-400 bg-orange-50" : "border-gray-200"}`}>
                        <span className="text-2xl">{v.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 生成按钮 */}
              <button onClick={isGenerating ? cancelGeneration : generateBook}
                disabled={!isGenerating && (
                  (form.planId === "custom-advanced" ? form.customPrompt.trim().length < 10 : !form.childName.trim()) ||
                  (plan?.hasChildHero && !photoFile)
                )}
                className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isGenerating ? "bg-red-500 text-white hover:bg-red-600" :
                  ((form.planId === "custom-advanced" ? form.customPrompt.trim().length < 10 : !form.childName.trim()) || (plan?.hasChildHero && !photoFile)) ?
                    "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-primary-dark text-white hover:shadow-xl"
                }`}>
                {isGenerating ? "取消生成" : "✨ 一键生成绘本"}
              </button>
            </div>
          </div>
        </div>

        {/* 浮动进度条 */}
        {(isGenerating || generationError) && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-50 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {generationError ? `❌ ${generationError}` : `⏳ ${generationStep}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-orange-600">{generationProgress}%</span>
                {isGenerating ? (
                  <button onClick={cancelGeneration} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 shadow-md">取消</button>
                ) : (
                  <button onClick={() => setGenerationError(null)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 shadow-md">重新开始</button>
                )}
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 rounded-full" style={{ width: `${generationProgress}%` }} />
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}

// 文件转Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
