/**
 * 绘本生成服务 - 独立于React组件，页面切换不中断
 * 
 * 原理：生成逻辑在模块作用域运行，不依赖组件state
 * 进度通过 localStorage 传递，任何页面都能读取
 * 完成后派发自定义事件，当前页面组件可监听
 */

export interface GenerateParams {
  childName: string;
  themeId: string;
  customPrompt: string;
  styleId: string;
  ageGroup: string;
  favoriteAnimal: string;
  favoriteColor: string;
  personality: string;
  location: string;
  lifeEvent: string;
  voiceId: string;
  isFreeUser: boolean;
  isClassic: boolean;
  classicPages?: any[];
  classicTitle?: string;
}

interface GenerateState {
  status: 'generating' | 'completed' | 'failed';
  step: string;
  progress: number;
  params: GenerateParams;
  story?: any;
  error?: string;
  startedAt: number;
}

const STORAGE_KEY = 'itsmebook_generating';

// 保存状态到 localStorage
function saveState(state: GenerateState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// 读取当前状态
export function getGeneratingState(): GenerateState | null {
  try {
    const str = localStorage.getItem(STORAGE_KEY);
    return str ? JSON.parse(str) : null;
  } catch { return null; }
}

// 清除状态
export function clearGeneratingState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// 保存完成的绘本到列表
export function saveCompletedBook(storyData: any) {
  try {
    // 保存到最近故事
    sessionStorage.setItem('bedtime_story', JSON.stringify(storyData));
    localStorage.setItem('itsmebook_last_story', JSON.stringify(storyData));
    
    // 追加到绘本列表
    const booksStr = localStorage.getItem('itsmebook_books');
    const books = booksStr ? JSON.parse(booksStr) : [];
    books.unshift({ ...storyData, id: Date.now().toString() });
    localStorage.setItem('itsmebook_books', JSON.stringify(books.slice(0, 50)));
  } catch {}
}

// 生成占位图
function getPlaceholderImage(index: number): string {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F'];
  const bg = colors[index % colors.length];
  return `https://placehold.co/800x800/${bg}/ffffff?text=Page+${index + 1}`;
}

/**
 * 启动绘本生成 - 在模块作用域运行，不依赖React组件
 * 返回后用户可以随意切换页面，生成继续在后台跑
 */
export function startGeneration(params: GenerateParams): void {
  const state: GenerateState = {
    status: 'generating',
    step: '正在生成故事文本...',
    progress: 5,
    params,
    startedAt: Date.now(),
  };
  saveState(state);

  // 在后台运行生成流程
  runGeneration(params);
}

async function runGeneration(params: GenerateParams): Promise<void> {
  let state: GenerateState | null = getGeneratingState();
  if (!state) return;

  try {
    // ============ 步骤1: 生成故事文本 ============
    if (!state.story || !state.story.pages) {
      state.step = '正在生成故事文本...';
      state.progress = 10;
      saveState(state);

      let story: any;

      if (params.isClassic && params.classicPages) {
        // 经典故事 - 直接使用预置内容
        story = {
          title: params.classicTitle || '经典故事',
          pages: params.classicPages.map((p: any, i: number) => ({
            pageNumber: i + 1,
            text: p.text,
            imagePrompt: p.imagePrompt || p.text,
            imageUrl: p.imageUrl || '',
          })),
        };
      } else {
        // AI生成故事
        const response = await fetch('/api/story/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childName: params.childName,
            themeId: params.themeId,
            styleId: params.styleId,
            customPrompt: params.customPrompt,
            ageGroup: params.ageGroup,
            favoriteAnimal: params.favoriteAnimal,
            favoriteColor: params.favoriteColor,
            personality: params.personality,
            location: params.location,
            lifeEvent: params.lifeEvent,
          }),
        });

        if (!response.ok) {
          throw new Error(`故事生成失败(${response.status})`);
        }

        // 检查是否流式响应
        const contentType = response.headers.get('content-type') || '';
        const isStreaming = contentType.includes('text/event-stream');

        if (isStreaming) {
          // 流式读取
          const reader = response.body?.getReader();
          if (!reader) throw new Error('无法读取响应流');
          const decoder = new TextDecoder();
          let fullData = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            state = getGeneratingState();
            if (!state || state.status === 'failed') {
              reader.releaseLock();
              return; // 被外部取消了
            }
            state.progress = Math.min(state.progress + 1, 25);
            saveState(state);

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const lineData = line.slice(6).trim();
                if (lineData && lineData !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(lineData);
                    if (parsed.success === false) {
                      throw new Error(parsed.message || '故事生成失败');
                    }
                    if (parsed.story) {
                      fullData = JSON.stringify(parsed);
                    }
                  } catch (e: any) {
                    if (e.message && !e.message.includes('JSON')) throw e;
                  }
                }
              }
            }
          }

          if (!fullData) throw new Error('AI未返回故事内容');
          const data = JSON.parse(fullData);
          story = data.story;
        } else {
          // 非流式（demo模式）
          const data = await response.json();
          if (!data.success) throw new Error(data.message || '故事生成失败');
          story = data.story;
        }
      }

      // 保存故事文本
      state = getGeneratingState();
      if (!state || state.status === 'failed') return;
      state.story = story;
      state.step = '故事文本生成完成';
      state.progress = 30;
      saveState(state);
    }

    // ============ 步骤2: 批量生成TTS（先并发生成所有页的TTS，比图片快） ============
    state = getGeneratingState();
    if (!state || state.status === 'failed') return;

    state.step = '正在生成语音...';
    state.progress = 30;
    saveState(state);

    const pages = state.story.pages;
    const BATCH_SIZE = 3;

    // 先批量生成所有页的TTS
    for (let batchStart = 0; batchStart < pages.length; batchStart += BATCH_SIZE) {
      state = getGeneratingState();
      if (!state || state.status === 'failed') return;

      const batchEnd = Math.min(batchStart + BATCH_SIZE, pages.length);

      await Promise.all(pages.slice(batchStart, batchEnd).map(async (page: any, i: number) => {
        const index = batchStart + i;
        // TTS生成
        if (!page.audioUrl) {
          try {
            const ttsRes = await fetch('/api/voice/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: page.text, voice: params.voiceId }),
            });
            const ttsData = await ttsRes.json();
            if (ttsData.success && ttsData.audioUrl) {
              page.audioUrl = ttsData.audioUrl;
            }
          } catch { /* TTS失败，播放器会fallback到WebSpeech */ }
        }
      }));

      // 更新进度：30-55%
      state.step = `正在生成语音 (${batchEnd}/${pages.length})...`;
      state.progress = 30 + Math.round((batchEnd / pages.length) * 25);
      saveState(state);
    }

    // ============ 步骤3: 批量生成配图 ============
    state = getGeneratingState();
    if (!state || state.status === 'failed') return;

    const maxImages = params.isFreeUser ? 2 : pages.length;

    for (let batchStart = 0; batchStart < pages.length; batchStart += BATCH_SIZE) {
      state = getGeneratingState();
      if (!state || state.status === 'failed') return;

      const batchEnd = Math.min(batchStart + BATCH_SIZE, pages.length);
      const batchPages = pages.slice(batchStart, batchEnd);

      // 批量生成图片
      await Promise.all(batchPages.map(async (page: any, i: number) => {
        const index = batchStart + i;

        // 免费用户只生成前2张图
        if (params.isFreeUser && index >= maxImages) {
          page.imageUrl = getPlaceholderImage(index);
          return;
        }

        // 图片生成（带重试）
        if (!page.imageUrl || page.imageUrl.includes('placehold.co')) {
          let imageUrl = getPlaceholderImage(index);
          for (let retry = 0; retry < 2; retry++) {
            try {
              const imageRes = await fetch('/api/image/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imagePrompt: page.imagePrompt,
                  style: params.styleId || 'watercolor',
                  index,
                }),
              });
              const imageData = await imageRes.json();
              if (imageData.success && imageData.imageUrl) {
                imageUrl = imageData.imageUrl;
                break;
              }
            } catch { /* 重试 */ }
          }
          page.imageUrl = imageUrl;
        }
      }));

      // 更新进度：55-95%
      state.step = `正在生成配图 (${batchEnd}/${pages.length})...`;
      state.progress = 55 + Math.round((batchEnd / pages.length) * 40);
      saveState(state);
    }

    // ============ 步骤4: 完成 ============
    state = getGeneratingState();
    if (!state || state.status === 'failed') return;

    const storyData = {
      title: state.story.title,
      childName: params.childName,
      pages,
      voiceUrl: '',
      voiceId: params.voiceId,
      createdAt: new Date().toISOString(),
      isClassic: params.isClassic,
      isFreeUser: params.isFreeUser,
    };

    saveCompletedBook(storyData);

    state.status = 'completed';
    state.step = '完成！';
    state.progress = 100;
    saveState(state);

    // 派发自定义事件，让当前页面的组件知道完成了
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storyGenerationComplete', { detail: storyData }));
    }
  } catch (error: any) {
    const currentState = getGeneratingState();
    if (currentState) {
      currentState.status = 'failed';
      currentState.error = error.message || '生成失败';
      saveState(currentState);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('storyGenerationFailed', { detail: currentState.error }));
      }
    }
  }
}

/**
 * 轮询生成状态 - 供React组件调用
 * 返回当前进度、步骤、是否完成
 */
export function pollGeneratingStatus(): {
  isGenerating: boolean;
  progress: number;
  step: string;
  isCompleted: boolean;
  isFailed: boolean;
  error?: string;
  storyData?: any;
} {
  const state = getGeneratingState();
  
  if (!state) {
    return { isGenerating: false, progress: 0, step: '', isCompleted: false, isFailed: false };
  }

  if (state.status === 'completed') {
    // 读取完成的数据
    const storyStr = localStorage.getItem('itsmebook_last_story');
    const storyData = storyStr ? JSON.parse(storyStr) : null;
    clearGeneratingState();
    return { isGenerating: false, progress: 100, step: '完成！', isCompleted: true, isFailed: false, storyData };
  }

  if (state.status === 'failed') {
    const error = state.error || '生成失败';
    clearGeneratingState();
    return { isGenerating: false, progress: 0, step: '', isCompleted: false, isFailed: true, error };
  }

  return {
    isGenerating: true,
    progress: state.progress,
    step: state.step,
    isCompleted: false,
    isFailed: false,
  };
}
