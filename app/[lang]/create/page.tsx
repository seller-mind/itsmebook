"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/components/LanguageProvider";
import ChildConsentModal from "@/components/ChildConsentModal";
import PaymentDialog from "@/components/PaymentDialog";
import { GenerationProgress } from "@/components/AIBadge";
import { STYLE_CONFIGS, THEME_CONFIGS, STORY_PROMPT_TEMPLATE } from "@/lib/ai";

interface User {
  id: string;
  phone: string;
  nickname: string;
  freeCount: number;
}

export default function CreatePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t } = useLanguage();
  const router = useRouter();

  // JWT用户状态
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem("itsmebook_token");
    const userStr = localStorage.getItem("itsmebook_user");
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem("itsmebook_token");
        localStorage.removeItem("itsmebook_user");
        setUser(null);
      }
    }
  }, []);

  // 触发登录状态变化事件
  useEffect(() => {
    const handleLoginStateChange = () => {
      const token = localStorage.getItem("itsmebook_token");
      const userStr = localStorage.getItem("itsmebook_user");
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("loginStateChange", handleLoginStateChange);
    return () => window.removeEventListener("loginStateChange", handleLoginStateChange);
  }, []);

  // 步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // 照片状态
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // 选择状态
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");
  const [characterName, setCharacterName] = useState("");
  const [characterAge, setCharacterAge] = useState("5");
  const [characterGender, setCharacterGender] = useState<string>("男孩");
  const [characterAppearance, setCharacterAppearance] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // 弹窗状态
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");
  const [generationError, setGenerationError] = useState("");

  // 文件上传处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > 3) {
      alert(t('create.photoLimit') || "最多只能上传3张照片");
      return;
    }

    const newPhotos = [...photos, ...acceptedFiles];
    setPhotos(newPhotos);

    const newPreviews = newPhotos.map((file) =>
      URL.createObjectURL(file)
    );
    setPhotoPreviews(newPreviews);
  }, [photos, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024,
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
      alert(t('create.uploadHint') || "请至少上传一张照片");
      return;
    }
    if (currentStep === 2 && !selectedStyle) {
      alert(t('create.selectStyle') || "请选择一种绘本风格");
      return;
    }
    if (currentStep === 3 && !selectedTheme) {
      alert(t('create.selectTheme') || "请选择一个故事主题");
      return;
    }
    if (currentStep === 4 && !characterName.trim()) {
      alert(t('create.enterName') || "请输入角色名字");
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
    onProgress: (content: string, progress: number) => void
  ): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const token = localStorage.getItem("itsmebook_token");

    const response = await fetch(
      '/api/generate/story',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are an award-winning children's picture book author. Please output only the final JSON result without any reasoning or thinking process." },
            { role: "user", content: prompt },
          ],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(t('create.loginRequired') || '请先登录后再生成绘本');
      } else if (response.status === 403) {
        throw new Error(t('create.noCredits') || '免费次数已用完，请选择套餐或联系客服');
      }
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
              const receivedLen = fullContent.length;
              const estimatedTotal = 2500;
              const progress = Math.min(15, Math.floor((receivedLen / estimatedTotal) * 15));
              onProgress(fullContent, progress);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent;
  };

  // 并发生成图片
  const generateImagesConcurrent = async (
    pages: Array<{ pageNumber: number; text: string; imagePrompt: string }>,
    onProgress: (completed: number, total: number, status: string) => void,
    photoBase64?: string,
    planConfig?: { model: string; size: string }
  ): Promise<Array<{ pageNumber: number; text: string; imageUrl: string }>> => {
    const results: Array<{ pageNumber: number; text: string; imageUrl: string }> = new Array(pages.length);
    const total = pages.length;
    const batchSize = 3;
    let completed = 0;

    for (let batchStart = 0; batchStart < total; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, total);
      const batchPages = pages.slice(batchStart, batchEnd);

      onProgress(completed, total, t('create.progress.pageProgress', { 
        current: batchStart + 1, 
        end: batchEnd, 
        total: total 
      }));

      const batchPromises = batchPages.map(async (page, idx) => {
        const globalIndex = batchStart + idx;
        try {
          const imageUrl = await generateSingleImage(page.imagePrompt, globalIndex, photoBase64, planConfig);
          results[globalIndex] = { pageNumber: page.pageNumber, text: page.text, imageUrl };
        } catch (e: unknown) {
          console.error(`第${globalIndex + 1}页图片生成失败:`, e);
          results[globalIndex] = {
            pageNumber: page.pageNumber,
            text: page.text,
            imageUrl: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23f3f4f6" width="400" height="400"/><text x="200" y="190" text-anchor="middle" fill="%239ca3af" font-size="16">Image generation failed</text><text x="200" y="220" text-anchor="middle" fill="%239ca3af" font-size="14">${page.text.slice(0, 20)}...</text></svg>`,
          };
        }
        completed++;
        onProgress(completed, total, t('create.progress.pageProgress', { 
          current: batchStart + 1, 
          end: batchEnd, 
          total: total 
        }));
      });

      await Promise.all(batchPromises);
    }

    return results;
  };

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateSingleImage = async (
    imagePrompt: string, 
    pageIndex: number, 
    photoBase64?: string,
    planConfig?: { model: string; size: string }
  ): Promise<string> => {
    const token = localStorage.getItem("itsmebook_token");
    const model = planConfig?.model || 'wan2.7-image';
    const size = planConfig?.size || '1024*1024';

    const response = await fetchWithTimeout(
      '/api/generate/image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          model,
          size,
          ...(photoBase64 && pageIndex === 0 ? { refImage: photoBase64 } : {}),
        }),
      },
      60000
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`图片生成失败: ${errorText.slice(0, 100)}`);
    }

    const data = await response.json();
    if (!data.success || !data.data?.imageUrl) {
      throw new Error('图片生成失败：未返回有效数据');
    }

    return data.data.imageUrl;
  };

  // 开始生成
  const handleGenerate = async () => {
    if (!user) {
      router.push(`/${lang}/sign-in?redirect_url=/${lang}/create`);
      return;
    }

    if (user.freeCount <= 0) {
      setShowPayment(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus(t('create.progress.uploading'));
    setGenerationError("");

    try {
      // 1. 上传照片获取base64（用于参考图）
      let photoBase64: string | undefined;
      if (photos.length > 0) {
        photoBase64 = await fileToBase64(photos[0]);
      }

      // 2. 构建故事生成提示词
      const styleConfig = STYLE_CONFIGS[selectedStyle] || STYLE_CONFIGS.watercolor;
      const themeConfig = THEME_CONFIGS[selectedTheme] || THEME_CONFIGS.adventure;
      
      const planMap: Record<string, { model: string; size: string }> = {
        trial: { model: 'wan2.7-image', size: '1024*1024' },
        standard: { model: 'wan2.7-image', size: '1024*1024' },
        pro: { model: 'wan2.7-image-pro', size: '1024*1024' },
        monthly: { model: 'wan2.7-image', size: '1024*1024' },
      };
      const planConfig = planMap[selectedPlan] || planMap.standard;

      const genderChinese = characterGender === "男孩" ? "男孩" : "女孩";
      
      const prompt = STORY_PROMPT_TEMPLATE
        .replace('{themeAngle}', themeConfig.storyAngle)
        .replace('{characterName}', characterName)
        .replace('{age}', characterAge)
        .replace('{gender}', genderChinese)
        .replace('{appearance}', characterAppearance || '普通亚洲孩子')
        .replace('{styleChinese}', styleConfig.chinese);

      // 3. 生成故事
      setGenerationStatus(t('create.progress.generatingStory'));
      let storyContent = '';
      await streamDoubaoStory(prompt, (content, progress) => {
        storyContent = content;
        setGenerationProgress(progress);
      });

      // 解析故事JSON
      let storyData;
      try {
        const jsonMatch = storyContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          storyData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('无法解析故事内容');
        }
      } catch (e) {
        throw new Error('故事内容格式错误');
      }

      // 4. 生成插图
      setGenerationStatus(t('create.progress.generatingImages'));
      const pages = storyData.pages || [];
      
      const pageResults = await generateImagesConcurrent(
        pages,
        (completed, total, status) => {
          setGenerationProgress(15 + Math.floor((completed / total) * 80));
          setGenerationStatus(status);
        },
        photoBase64,
        planConfig
      );

      // 5. 保存绘本数据
      const bookData = {
        id: uuidv4(),
        title: storyData.title || `${characterName}的故事`,
        characterName,
        characterGender,
        characterAge,
        style: selectedStyle,
        theme: selectedTheme,
        appearance: storyData.appearanceChinese || characterAppearance,
        pages: pageResults,
        createdAt: new Date().toISOString(),
      };

      // 保存到localStorage
      const existingBooks = JSON.parse(localStorage.getItem('itsmebook_books') || '[]');
      existingBooks.push(bookData);
      localStorage.setItem('itsmebook_books', JSON.stringify(existingBooks));
      localStorage.setItem('itsmebook_current_book', JSON.stringify(bookData));

      // 扣减免费次数
      if (user.freeCount > 0) {
        const updatedUser = { ...user, freeCount: user.freeCount - 1 };
        localStorage.setItem('itsmebook_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // 同步到服务器
        await fetch('/api/auth/deduct-free-count', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('itsmebook_token')}` },
        });
      }

      setGenerationProgress(100);
      setGenerationStatus(t('create.progress.complete'));

      // 跳转到绘本页面
      setTimeout(() => {
        router.push(`/${lang}/book/${bookData.id}`);
      }, 1000);

    } catch (error) {
      console.error('生成失败:', error);
      setGenerationError(error instanceof Error ? error.message : '生成失败');
      setIsGenerating(false);
    }
  };

  // 处理支付成功
  const handlePaymentSuccess = () => {
    // 刷新用户状态
    const userStr = localStorage.getItem("itsmebook_user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  };

  const stepLabels = [
    t('create.step1'),
    t('create.step2'),
    t('create.step3'),
    t('create.step4'),
    t('create.step5'),
    t('create.step6'),
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepLabels.map((label, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index + 1 <= currentStep 
                    ? 'bg-primary-orange text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className={`hidden sm:block ml-2 text-sm ${
                  index + 1 <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'
                }`}>
                  {label}
                </span>
                {index < stepLabels.length - 1 && (
                  <div className={`hidden sm:block w-8 sm:w-16 h-0.5 mx-2 ${
                    index + 1 < currentStep ? 'bg-primary-orange' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 步骤1: 上传照片 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('create.uploadPhotos')}</h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-orange bg-orange-50' : 'border-gray-300 hover:border-primary-orange'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-5xl mb-4">📷</div>
              <p className="text-gray-600 mb-2">{t('create.dragOrClick')}</p>
              <p className="text-sm text-gray-400">{t('create.photoLimit')}</p>
            </div>

            {/* 照片预览 */}
            {photoPreviews.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button onClick={handleNext} className="btn-primary">
                {t('create.next')}
              </button>
            </div>
          </div>
        )}

        {/* 步骤2: 选择风格 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('create.style')}</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(STYLE_CONFIGS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStyle(key)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedStyle === key
                      ? 'border-primary-orange bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {key === 'watercolor' && '🎨'}
                    {key === 'oil' && '🖼️'}
                    {key === 'chinese' && '🖌️'}
                    {key === 'fantasy' && '🌈'}
                    {key === 'pastoral' && '🌻'}
                    {key === 'anime' && '✨'}
                    {key === 'minimalist' && '⬜'}
                    {key === 'nordic' && '❄️'}
                  </div>
                  <p className="font-medium text-gray-900">{t(`create.styles.${key}`)}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={handlePrev} className="btn-outline">
                {t('create.prev')}
              </button>
              <button onClick={handleNext} className="btn-primary">
                {t('create.next')}
              </button>
            </div>
          </div>
        )}

        {/* 步骤3: 选择主题 */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('create.theme')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(THEME_CONFIGS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTheme(key)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTheme === key
                      ? 'border-primary-orange bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {key === 'adventure' && '🚀'}
                      {key === 'friendship' && '🤝'}
                      {key === 'growth' && '🌱'}
                      {key === 'courage' && '💪'}
                      {key === 'imagination' && '✨'}
                      {key === 'family' && '👨‍👩‍👧'}
                      {key === 'holiday' && '🎉'}
                      {key === 'nature' && '🌳'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{t(`create.themes.${key}`)}</p>
                      <p className="text-sm text-gray-500">{t(`create.themes.${key}Desc`)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={handlePrev} className="btn-outline">
                {t('create.prev')}
              </button>
              <button onClick={handleNext} className="btn-primary">
                {t('create.next')}
              </button>
            </div>
          </div>
        )}

        {/* 步骤4: 角色信息 */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('create.characterName')}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('create.characterName')}
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder={t('create.characterNamePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('create.age')}
                  </label>
                  <select
                    value={characterAge}
                    onChange={(e) => setCharacterAge(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 3).map((age) => (
                      <option key={age} value={age}>{age} {t('create.age').replace('年龄', '岁')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('create.gender')}
                  </label>
                  <select
                    value={characterGender}
                    onChange={(e) => setCharacterGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    <option value="男孩">{t('create.boy')}</option>
                    <option value="女孩">{t('create.girl')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('create.appearance')}
                </label>
                <textarea
                  value={characterAppearance}
                  onChange={(e) => setCharacterAppearance(e.target.value)}
                  placeholder={t('create.appearancePlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={handlePrev} className="btn-outline">
                {t('create.prev')}
              </button>
              <button onClick={handleNext} className="btn-primary">
                {t('create.next')}
              </button>
            </div>
          </div>
        )}

        {/* 步骤5: 确认生成 */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('create.planSelect')}</h2>
            
            {/* 摘要 */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">📋 故事概要</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{t('create.characterName')}:</span>
                  <span className="ml-2 font-medium">{characterName}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('create.age')}:</span>
                  <span className="ml-2 font-medium">{characterAge}岁</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('create.theme')}:</span>
                  <span className="ml-2 font-medium">{t(`create.themes.${selectedTheme}`)}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('create.style')}:</span>
                  <span className="ml-2 font-medium">{t(`create.styles.${selectedStyle}`)}</span>
                </div>
              </div>
              {photoPreviews.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-500">{t('create.uploadPhotos')}:</span>
                  <div className="flex gap-2 mt-2">
                    {photoPreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 免费次数提示 */}
            {user && user.freeCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-700">
                  🎉 您有 <strong>{user.freeCount}</strong> {t('payment.creditsUnit')}免费次数
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button onClick={handlePrev} className="btn-outline">
                {t('create.prev')}
              </button>
              <button 
                onClick={() => {
                  if (!user) {
                    router.push(`/${lang}/sign-in?redirect_url=/${lang}/create`);
                  } else if (user.freeCount <= 0) {
                    setShowPayment(true);
                  } else {
                    setCurrentStep(6);
                    handleGenerate();
                  }
                }} 
                className="btn-primary"
              >
                {user && user.freeCount > 0 ? t('create.generate') : t('payment.title')}
              </button>
            </div>
          </div>
        )}

        {/* 步骤6: 正在生成 */}
        {currentStep === 6 && isGenerating && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('create.generatingTitle')}</h2>
            <p className="text-gray-600 mb-8">{t('create.generatingSubtitle')}</p>
            
            <div className="max-w-md mx-auto">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-primary-orange to-secondary-blue transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{generationProgress}%</p>
              <p className="text-sm text-gray-600 mt-2">{generationStatus}</p>
            </div>

            {generationError && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl text-red-600">
                <p>{generationError}</p>
                <button 
                  onClick={() => setIsGenerating(false)}
                  className="mt-4 btn-outline"
                >
                  {t('common.back')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 儿童信息保护弹窗 */}
      <ChildConsentModal
        isOpen={showConsent}
        onConfirm={handleConsentConfirm}
        onCancel={() => setShowConsent(false)}
        lang={lang}
      />

      {/* 支付弹窗 */}
      <PaymentDialog
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        initialPlan={selectedPlan}
        lang={lang}
      />
    </div>
  );
}
