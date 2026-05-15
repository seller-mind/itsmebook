"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import ChildConsentModal from "@/components/ChildConsentModal";
import { GenerationProgress } from "@/components/AIBadge";

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

  // 开始生成 - 对接真实API
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus("正在构思故事...");

    try {
      // 第1步：生成故事
      const storyRes = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName,
          age: parseInt(characterAge),
          gender: characterGender,
          appearance: characterAppearance || `${characterGender}，${characterAge}岁`,
          theme: selectedTheme,
          style: selectedStyle,
        }),
      });

      if (!storyRes.ok) {
        const err = await storyRes.json();
        throw new Error(err.error || '故事生成失败');
      }
      
      const storyResult = await storyRes.json();
      const { title, pages, appearanceChinese } = storyResult.data;

      setGenerationProgress(15);
      setGenerationStatus("故事创作完成！开始绘制插图...");

      // 第2步：逐页生成插图
      const pagesWithImages = [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const progressPercent = 15 + Math.floor(((i + 1) / pages.length) * 75);
        setGenerationProgress(progressPercent);
        setGenerationStatus(`正在绘制第 ${i + 1}/${pages.length} 页插图...`);

        try {
          const imgRes = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imagePrompt: page.imagePrompt,
              style: selectedStyle,
              pageNumber: i + 1,
              totalPages: pages.length,
            }),
          });

          if (imgRes.ok) {
            const imgData = await imgRes.json();
            pagesWithImages.push({
              pageNumber: page.pageNumber,
              text: page.text,
              imageUrl: imgData.data.imageUrl,
            });
          } else {
            // 图片生成失败时使用空字符串
            pagesWithImages.push({
              pageNumber: page.pageNumber,
              text: page.text,
              imageUrl: '',
            });
          }
        } catch {
          // 单页生成失败，继续处理其他页
          pagesWithImages.push({
            pageNumber: page.pageNumber,
            text: page.text,
            imageUrl: '',
          });
        }
      }

      setGenerationProgress(92);
      setGenerationStatus("正在组装绘本...");

      // 第3步：保存到localStorage
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

      setGenerationProgress(100);
      setGenerationStatus("绘本制作完成！正在跳转预览...");

      await new Promise(resolve => setTimeout(resolve, 800));
      router.push(`/book/${bookId}`);
    } catch (error: any) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
      alert(`绘本生成失败：${error.message || '请稍后重试'}`);
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
          </div>
        )}
      </div>

      {/* 儿童信息使用同意弹窗 */}
      <ChildConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onConfirm={handleConsentConfirm}
      />
    </div>
  );
}
