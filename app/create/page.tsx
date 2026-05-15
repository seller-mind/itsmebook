"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import ChildConsentModal from "@/components/ChildConsentModal";
import { GenerationProgress } from "@/components/AIBadge";
import { STYLE_CONFIGS, THEME_CONFIGS, STORY_PROMPT_TEMPLATE } from "@/lib/ai";

// 故事主题
const THEMES = [
  { id: "adventure", name: "冒险", emoji: "🚀", description: "勇敢探索未知世界" },
  { id: "friendship", name: "友谊", emoji: "🤝", description: "学会和朋友相处" },
  { id: "growth", name: "成长", emoji: "🌱", description: "克服困难长大" },
  { id: "courage", name: "勇气", emoji: "💪", description: "战胜恐惧" },
  { id: "imagination", name: "想象力", emoji: "✨", description: "奇幻冒险之旅" },
  { id: "family", name: "家庭", emoji: "👨‍👩‍👧", description: "温馨亲情故事" },
  { id: "holiday", name: "节日", emoji: "🎉", description: "节日庆祝活动" },
  { id: "nature", name: "自然", emoji: "🌳", description: "探索大自然奥秘" },
];

// 绘本风格
const STYLES = [
  { id: "watercolor", name: "水彩风格", emoji: "🎨", color: "from-pink-200 to-purple-200" },
  { id: "oil", name: "油画风格", emoji: "🖼️", color: "from-amber-200 to-orange-200" },
  { id: "anime", name: "日系动漫", emoji: "✨", color: "from-blue-200 to-cyan-200" },
  { id: "chinese", name: "国风水墨", emoji: "🖌️", color: "from-green-200 to-teal-200" },
  { id: "pastoral", name: "温暖田园", emoji: "🌻", color: "from-yellow-200 to-green-200" },
  { id: "fantasy", name: "梦幻童话", emoji: "🌈", color: "from-purple-200 to-pink-200" },
  { id: "minimalist", name: "简约现代", emoji: "⬜", color: "from-gray-200 to-slate-200" },
  { id: "nordic", name: "北欧极简", emoji: "❄️", color: "from-sky-200 to-indigo-200" },
];



export default function CreatePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  // 步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // 照片状态
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // 选择状态
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [characterName, setCharacterName] = useState("");
  const [characterAge, setCharacterAge] = useState("5");
  const [characterGender, setCharacterGender] = useState<string>("男孩");
  const [characterAppearance, setCharacterAppearance] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // 弹窗状态
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");
  const [generationError, setGenerationError] = useState("");

  // 文件上传处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > 3) {
      alert("最多只能上传3张照片");
      return;
    }

    const newPhotos = [...photos, ...acceptedFiles];
    setPhotos(newPhotos);

    // 生成预览
    const newPreviews = newPhotos.map((file) =>
      URL.createObjectURL(file)
    );
    setPhotoPreviews(newPreviews);
  }, [photos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // 删除照片
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  // 下一步
  const handleNext = () => {
    if (currentStep === 1 && photos.length === 0) {
      alert("请至少上传一张照片");
      return;
    }
    if (currentStep === 2 && !selectedStyle) {
      alert("请选择一种绘本风格");
      return;
    }
    if (currentStep === 3 && !selectedTheme) {
      alert("请选择一个故事主题");
      return;
    }
    if (currentStep === 4 && !characterName.trim()) {
      alert("请输入角色名字");
      return;
    }

    if (currentStep === 4 && !hasConsented) {
      setShowConsent(true);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // 同意并继续
  const handleConsentConfirm = () => {
    setHasConsented(true);
    setShowConsent(false);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // 流式调用Doubao API生成故事
  const streamDoubaoStory = async (
    prompt: string,
    apiKey: string,
    endpointId: string,
    onProgress: (content: string, progress: number) => void
  ): Promise<string> => {
    const controller = new AbortController();
    // 120秒无数据则断开
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: endpointId,
          messages: [
            { role: "system", content: "你是一位获得过凯迪克金奖的国际顶级绘本大师。请直接输出最终结果，不要进行思考推理过程。" },
            { role: "user", content: prompt },
          ],
          temperature: 0.85,
          max_tokens: 8000,
          thinking: { type: "disabled" },
          stream: true, // 关键：开启流式
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`故事生成失败 (${response.status}): ${errorText.slice(0, 100)}`);
    }

    if (!response.body) {
      throw new Error('故事生成失败：响应体为空');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const content = data.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              // 根据已接收内容估算进度（故事一般1500-4000字）
              const receivedLen = fullContent.length;
              const estimatedTotal = 2500;
              const progress = Math.min(15, Math.floor((receivedLen / estimatedTotal) * 15));
              onProgress(fullContent, progress);
            }
          } catch {
            // 忽略解析错误，继续处理下一行
          }
        }
      }
    }

    return fullContent;
  };

  // 并发生成图片（每批5张）
  const generateImagesConcurrent = async (
    pages: Array<{ pageNumber: number; text: string; imagePrompt: string }>,
    onProgress: (completed: number, total: number, status: string) => void
  ): Promise<Array<{ pageNumber: number; text: string; imageUrl: string }>> => {
    const results: Array<{ pageNumber: number; text: string; imageUrl: string }> = new Array(pages.length);
    const total = pages.length;
    const batchSize = 5;
    let completed = 0;

    for (let batchStart = 0; batchStart < total; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, total);
      const batchPages = pages.slice(batchStart, batchEnd);

      onProgress(completed, total, `正在绘制第 ${batchStart + 1}-${batchEnd}/${total} 页插图...`);

      const batchPromises = batchPages.map(async (page, idx) => {
        const globalIndex = batchStart + idx;
        try {
          const imageUrl = await generateSingleImage(page.imagePrompt, globalIndex);
          results[globalIndex] = { pageNumber: page.pageNumber, text: page.text, imageUrl };
        } catch (e: unknown) {
          console.error(`第${globalIndex + 1}页图片生成失败:`, e);
          // 图片失败用占位图，不阻塞流程
          results[globalIndex] = {
            pageNumber: page.pageNumber,
            text: page.text,
            imageUrl: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f3f4f6" width="400" height="400"/><text x="200" y="190" text-anchor="middle" fill="%239ca3af" font-size="16">图片生成失败</text><text x="200" y="220" text-anchor="middle" fill="%239ca3af" font-size="14">${page.text.slice(0, 20)}...</text></svg>`,
          };
        }
        completed++;
        onProgress(completed, total, `正在绘制第 ${batchStart + 1}-${batchEnd}/${total} 页插图...`);
      });

      await Promise.all(batchPromises);
    }

    return results;
  };

  // 带超时的fetch
  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`请求超时（${timeoutMs / 1000}秒）`);
      }
      throw error;
    }
  };

  // 生成单张图片（带重试）
  const generateSingleImage = async (imagePrompt: string, pageIndex: number): Promise<string> => {
    const dashscopeKey = process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY;
    if (!dashscopeKey) {
      throw new Error('未配置图片生成API Key');
    }

    let lastError: Error | null = null;
    // 尝试2次
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const wanRes = await fetchWithTimeout(
          'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${dashscopeKey}`,
            },
            body: JSON.stringify({
              model: "wan2.7-image-pro",
              input: {
                messages: [{ role: "user", content: [{ text: imagePrompt }] }]
              },
              parameters: { size: "1024*1024", n: 1 }
            }),
          },
          45000 // 45秒超时
        );

        if (wanRes.ok) {
          const wanData = await wanRes.json();
          const imageUrl = wanData.output?.choices?.[0]?.message?.content?.[0]?.image;
          if (imageUrl) {
            return imageUrl;
          }
        }
        // 如果响应不ok或者没有图片，尝试解析错误
        const errorText = await wanRes.text().catch(() => '');
        lastError = new Error(`图片生成失败 (${wanRes.status}): ${errorText.slice(0, 100)}`);
      } catch (e: unknown) {
        if (e instanceof Error) {
          lastError = e;
        } else {
          lastError = new Error(String(e));
        }
      }
      
      // 如果不是超时错误，不重试
      if (!lastError || !lastError.message.includes('超时')) {
        break;
      }
    }
    
    throw lastError || new Error(`第${pageIndex + 1}页图片生成失败`);
  };

  // 开始生成 - 流式API + 并发图片
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus("正在构思故事...");
    setGenerationError("");

    try {
      // 第1步：准备参数
      const apiKey = process.env.NEXT_PUBLIC_VOLCENGINE_API_KEY;
      const endpointId = process.env.NEXT_PUBLIC_VOLCENGINE_ENDPOINT_ID || 'ep-20260515174520-v8rzv';

      if (!apiKey) {
        throw new Error('未配置API Key，请联系管理员');
      }

      const styleConfig = STYLE_CONFIGS[selectedStyle] || STYLE_CONFIGS.watercolor;
      const themeConfig = THEME_CONFIGS[selectedTheme] || THEME_CONFIGS.adventure;
      const genderChinese = characterGender === "男孩" ? "男孩" : "女孩";
      const appearanceChinese = `${parseInt(characterAge)}岁的${genderChinese}孩子，${characterAppearance || `${characterGender}，${characterAge}岁`}`;

      const prompt = STORY_PROMPT_TEMPLATE
        .replace("{characterName}", characterName)
        .replace("{age}", characterAge)
        .replace("{gender}", characterGender)
        .replace("{genderChinese}", genderChinese)
        .replace("{appearance}", characterAppearance || `${characterGender}，${characterAge}岁`)
        .replace("{appearanceChinese}", appearanceChinese)
        .replace("{themeAngle}", themeConfig.storyAngle)
        .replace("{styleChinese}", styleConfig.chinese)
        .replace("{wanchineseStyle}", styleConfig.chinesePrompt);

      // 第2步：流式生成故事
      setGenerationStatus("正在构思故事...");
      
      const content = await streamDoubaoStory(
        prompt,
        apiKey,
        endpointId,
        (partialContent, progress) => {
          setGenerationProgress(progress);
          const receivedChars = partialContent.length;
          setGenerationStatus(`正在构思故事... 已收到${receivedChars}字`);
        }
      );

      if (!content) {
        throw new Error('故事生成失败：返回内容为空');
      }

      // 清理markdown代码块
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('故事生成失败：无法解析内容');
      }

      const storyResult = JSON.parse(jsonMatch[0]);
      if (!storyResult.appearanceChinese) storyResult.appearanceChinese = appearanceChinese;
      // 替换pages中的wanchineseStyle占位符
      if (storyResult.pages) {
        storyResult.pages = storyResult.pages.map((page: { pageNumber: number; text: string; imagePrompt?: string }) => ({
          ...page,
          imagePrompt: page.imagePrompt?.replace(/\{wanchineseStyle\}/g, styleConfig.chinesePrompt) || page.imagePrompt
        }));
      }

      const { title, pages } = storyResult;

      setGenerationProgress(20);
      setGenerationStatus("故事创作完成！开始绘制插图...");

      // 第3步：并发生成插图
      const pagesWithImages = await generateImagesConcurrent(
        pages,
        (completed, total, status) => {
          // 图片进度：20-90%
          const imgProgress = 20 + Math.floor((completed / total) * 70);
          setGenerationProgress(Math.min(imgProgress, 89));
          setGenerationStatus(status);
        }
      );

      setGenerationProgress(90);
      setGenerationStatus("正在组装绘本...");

      // 第4步：保存到localStorage
      const bookId = uuidv4();
      const bookData = {
        id: bookId,
        title,
        characterName,
        characterGender,
        characterAge,
        appearanceChinese,
        style: selectedStyle,
        theme: selectedTheme,
        pages: pagesWithImages,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`book_${bookId}`, JSON.stringify(bookData));

      // 组装阶段
      for (let p = 90; p <= 100; p += 5) {
        await new Promise(r => setTimeout(r, 80));
        setGenerationProgress(p);
      }
      setGenerationStatus("绘本制作完成！正在跳转预览...");

      await new Promise(resolve => setTimeout(resolve, 300));
      router.push(`/book/${bookId}`);
    } catch (error: unknown) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : '生成失败，请稍后重试';
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 进度指示器 */}
        {!isGenerating && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep > index + 1
                        ? "bg-green-500 text-white"
                        : currentStep === index + 1
                        ? "bg-primary-orange text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > index + 1 ? "✓" : index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                        currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500">
                第 {currentStep} / {totalSteps} 步
              </span>
            </div>
          </div>
        )}

        {/* 生成进度 */}
        {isGenerating && (
          <GenerationProgress 
            progress={generationProgress} 
            status={generationStatus} 
          />
        )}

        {/* 步骤内容 */}
        {!isGenerating ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {/* Step 1: 上传照片 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">📷</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    上传孩子照片
                  </h2>
                  <p className="text-gray-600">
                    上传1-3张清晰的照片，帮助AI识别孩子特征
                  </p>
                </div>

                {/* 上传区域 */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-primary-orange bg-primary-light"
                      : "border-gray-300 hover:border-primary-orange"
                  }`}
                >
                  <input {...getInputProps()} />
                  <span className="text-5xl mb-4 block">📤</span>
                  <p className="text-gray-600 mb-2">
                    {isDragActive
                      ? "放开以上传照片"
                      : "拖拽照片到这里，或点击选择"}
                  </p>
                  <p className="text-sm text-gray-400">
                    支持 JPG、PNG 格式，单张不超过5MB
                  </p>
                </div>

                {/* 照片预览 */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                        <img
                          src={preview}
                          alt={`上传照片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-500 text-center">
                  💡 建议上传正面、清晰的照片，效果更佳
                </p>
              </div>
            )}

            {/* Step 2: 选择风格 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">🎨</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    选择绘本风格
                  </h2>
                  <p className="text-gray-600">
                    从8种精美风格中选择你喜欢的
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedStyle === style.id
                          ? `bg-gradient-to-br ${style.color} ring-4 ring-primary-orange shadow-lg`
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-4xl mb-2 block">{style.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {style.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: 选择主题 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">📚</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    选择故事主题
                  </h2>
                  <p className="text-gray-600">
                    选一个孩子感兴趣的故事主题
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedTheme === theme.id
                          ? "bg-primary-orange text-white shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-4xl mb-2 block">{theme.emoji}</span>
                      <span className="text-sm font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>

                {selectedTheme && (
                  <div className="bg-primary-light rounded-xl p-4 text-center">
                    <p className="text-primary-dark">
                      {THEMES.find((t) => t.id === selectedTheme)?.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: 角色信息 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">✏️</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    输入角色信息
                  </h2>
                  <p className="text-gray-600">
                    告诉AI，小主人公是谁
                  </p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      角色名字 *
                    </label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      placeholder="例如：小明、小花"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      性别
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCharacterGender("男孩")}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          characterGender === "男孩"
                            ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span>👦</span>
                        <span>男孩</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCharacterGender("女孩")}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          characterGender === "女孩"
                            ? "bg-pink-100 text-pink-700 ring-2 ring-pink-500"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span>👧</span>
                        <span>女孩</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      年龄
                    </label>
                    <select
                      value={characterAge}
                      onChange={(e) => setCharacterAge(e.target.value)}
                      className="input-field"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 3).map((age) => (
                        <option key={age} value={age}>
                          {age}岁
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      外貌简述（可选）
                    </label>
                    <textarea
                      value={characterAppearance}
                      onChange={(e) => setCharacterAppearance(e.target.value)}
                      placeholder="描述一下孩子的外貌，帮助AI画出更像的形象。&#10;例如：圆圆的脸蛋，大眼睛，短发，穿着蓝色外套"
                      rows={3}
                      className="input-field resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      填写越详细，生成的角色越像您的孩子哦～
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      其他信息（可选）
                    </label>
                    <textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="补充一些关于孩子或想要的故事的细节..."
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: 确认并开始生成 */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">✨</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    确认并开始生成
                  </h2>
                  <p className="text-gray-600">
                    检查一下信息是否正确
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📷</span>
                    <div>
                      <p className="text-sm text-gray-500">照片</p>
                      <p className="font-medium">{photos.length} 张照片</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {STYLES.find((s) => s.id === selectedStyle)?.emoji}
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">风格</p>
                      <p className="font-medium">
                        {STYLES.find((s) => s.id === selectedStyle)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {THEMES.find((t) => t.id === selectedTheme)?.emoji}
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">主题</p>
                      <p className="font-medium">
                        {THEMES.find((t) => t.id === selectedTheme)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-sm text-gray-500">主角</p>
                      <p className="font-medium">
                        {characterName}，{characterGender}，{characterAge}岁
                      </p>
                      {characterAppearance && (
                        <p className="text-sm text-gray-500 mt-1">
                          外貌：{characterAppearance}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 未登录提示 */}
                {!isSignedIn && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center max-w-md mx-auto">
                    <p className="text-yellow-800 text-sm">
                      💡 未登录状态下生成的绘本可以预览，但无法保存。登录后可永久保存。
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500 text-center">
                  🎉 确认无误后，点击下方按钮开始生成绘本
                </p>
              </div>
            )}

            {/* 导航按钮 */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                ← 上一步
              </button>

              {currentStep < 5 ? (
                <button onClick={handleNext} className="btn-primary">
                  下一步 →
                </button>
              ) : (
                <button onClick={handleGenerate} className="btn-primary">
                  ✨ 开始生成绘本
                </button>
              )}
            </div>
          </div>
        ) : (
          /* 生成中状态 */
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6 animate-bounce">📖</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AI正在创作专属绘本...
            </h2>
            <p className="text-gray-600 mb-8">
              {generationStatus}
            </p>
            <div className="max-w-md mx-auto">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-orange rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {generationProgress}%
              </p>
            </div>
            {/* 错误提示 */}
            {generationError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{generationError}</p>
                <button
                  onClick={() => {
                    setIsGenerating(false);
                    setGenerationError("");
                    setGenerationProgress(0);
                    setGenerationStatus("");
                  }}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                >
                  关闭并重试
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 儿童信息使用同意弹窗 */}
      <ChildConsentModal
        isOpen={showConsent}
        onCancel={() => setShowConsent(false)}
        onConfirm={handleConsentConfirm}
      />
    </div>
  );
}
