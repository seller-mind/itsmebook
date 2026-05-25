/**
 * 绘本生成服务 - 调用服务端API
 * 
 * 核心变更：将生成逻辑从客户端移到服务端
 * 服务端API不受浏览器生命周期影响，用户切走也能继续生成
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
  sessionId: string;
  status: 'generating' | 'completed' | 'failed';
  step: string;
  progress: number;
  params: GenerateParams;
  story?: any;
  error?: string;
  startedAt: number;
}

const STORAGE_KEY = 'itsmebook_generating';

// 生成占位图
function getPlaceholderImage(index: number): string {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F'];
  const bg = colors[index % colors.length];
  return `https://placehold.co/800x800/${bg}/ffffff?text=Page+${index + 1}`;
}

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

// 派发完成事件
function dispatchComplete(storyData: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('storyGenerationComplete', { detail: storyData }));
  }
}

// 派发失败事件
function dispatchFailed(error: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('storyGenerationFailed', { detail: error }));
  }
}

/**
 * 启动绘本生成 - 调用服务端API
 * 通过SSE接收服务端推送的进度
 */
export function startGeneration(params: GenerateParams): void {
  // 保存 voiceId 到 localStorage 和 sessionStorage，供播放器使用
  try {
    localStorage.setItem('itsmebook_last_voice_id', params.voiceId);
    sessionStorage.setItem('bedtime_voice_id', params.voiceId);
  } catch {}

  const sessionId = crypto.randomUUID();

  const state: GenerateState = {
    sessionId,
    status: 'generating',
    step: '正在连接服务端...',
    progress: 0,
    params,
    startedAt: Date.now(),
  };
  saveState(state);

  // 调用服务端生成API
  fetch('/api/story/server-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, sessionId }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`服务端响应错误(${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    const decoder = new TextDecoder();

    const readStream = () => {
      reader.read().then(({ done, value }) => {
        if (done) return;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                // 更新进度
                const currentState = getGeneratingState();
                if (currentState && currentState.sessionId === sessionId) {
                  currentState.step = data.step;
                  currentState.progress = data.progress;
                  saveState(currentState);
                }
              } else if (data.type === 'complete') {
                // 生成完成
                const storyData = data.storyData;
                const finalState: GenerateState = {
                  ...getGeneratingState()!,
                  status: 'completed',
                  progress: 100,
                  step: '生成完成',
                  story: storyData,
                };
                saveState(finalState);
                
                // 保存到 storage
                saveCompletedBook(storyData);
                
                // 派发完成事件
                dispatchComplete(storyData);
              } else if (data.type === 'error') {
                // 生成失败
                const finalState: GenerateState = {
                  ...getGeneratingState()!,
                  status: 'failed',
                  step: '生成失败',
                  error: data.message,
                };
                saveState(finalState);
                
                // 派发失败事件
                dispatchFailed(data.message);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }

        if (!done) {
          readStream();
        }
      });
    };

    readStream();
  })
  .catch(error => {
    console.error('[StoryGenerator] Server generation error:', error);
    const finalState: GenerateState = {
      ...getGeneratingState()!,
      status: 'failed',
      step: '生成失败',
      error: error.message,
    };
    saveState(finalState);
    dispatchFailed(error.message);
  });
}

/**
 * 轮询生成状态 - 用于select页面
 * 优先从localStorage读取，如果SSE断开则调用服务端API查询
 */
export function pollGeneratingStatus(): {
  isGenerating: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  progress: number;
  step: string;
  storyData: any;
  error: string;
} {
  const state = getGeneratingState();
  
  if (!state) {
    return {
      isGenerating: false,
      isCompleted: false,
      isFailed: false,
      progress: 0,
      step: '',
      storyData: null,
      error: '',
    };
  }

  return {
    isGenerating: state.status === 'generating',
    isCompleted: state.status === 'completed',
    isFailed: state.status === 'failed',
    progress: state.progress,
    step: state.step,
    storyData: state.story,
    error: state.error || '',
  };
}

/**
 * 恢复被中断的生成 - 当用户返回页面时调用
 * 先检查本地状态，再尝试从服务端获取最新状态
 */
export async function resumeGeneration(): Promise<void> {
  const state = getGeneratingState();
  if (!state) return;

  // 如果状态是已完成或失败，不需要恢复
  if (state.status === 'completed' || state.status === 'failed') return;

  // 尝试从服务端获取最新状态
  try {
    const response = await fetch(`/api/story/generation-status?sessionId=${encodeURIComponent(state.sessionId)}`);
    const data = await response.json();

    if (data.success && data.exists) {
      if (data.status === 'completed' && data.result) {
        // 服务端已完成，直接使用结果
        const updatedState: GenerateState = {
          ...state,
          status: 'completed',
          progress: 100,
          step: '生成完成',
          story: data.result,
        };
        saveState(updatedState);
        saveCompletedBook(data.result);
        dispatchComplete(data.result);
      } else if (data.status === 'failed') {
        // 服务端失败
        const updatedState: GenerateState = {
          ...state,
          status: 'failed',
          step: data.step || '生成失败',
          error: '服务端生成失败',
        };
        saveState(updatedState);
        dispatchFailed('服务端生成失败');
      } else {
        // 仍在生成中，更新进度
        const updatedState: GenerateState = {
          ...state,
          progress: data.progress || state.progress,
          step: data.step || state.step,
        };
        saveState(updatedState);
        
        // 如果SSE断开了，重新发起请求
        // 注意：这里不重新发起，因为SSE连接是独立的
        // 用户通过轮询本地的localStorage来获取进度
      }
    }
  } catch (err) {
    console.error('[StoryGenerator] Failed to resume from server:', err);
    // 如果服务端查询失败，继续使用本地状态
  }
}

/**
 * 重新连接生成流程 - 用于页面重新加载后
 * 尝试重新连接到现有的生成任务
 */
export async function reconnectGeneration(): Promise<boolean> {
  const state = getGeneratingState();
  if (!state || state.status !== 'generating') return false;

  // 先查询服务端状态
  try {
    const response = await fetch(`/api/story/generation-status?sessionId=${encodeURIComponent(state.sessionId)}`);
    const data = await response.json();

    if (data.success && data.exists) {
      if (data.status === 'completed' && data.result) {
        // 已完成
        const updatedState: GenerateState = {
          ...state,
          status: 'completed',
          progress: 100,
          step: '生成完成',
          story: data.result,
        };
        saveState(updatedState);
        saveCompletedBook(data.result);
        dispatchComplete(data.result);
        return true;
      } else if (data.status === 'failed') {
        // 失败
        const updatedState: GenerateState = {
          ...state,
          status: 'failed',
          step: data.step || '生成失败',
          error: data.step || '服务端生成失败',
        };
        saveState(updatedState);
        dispatchFailed(data.step || '服务端生成失败');
        return true;
      } else {
        // 仍在生成，更新本地状态
        const updatedState: GenerateState = {
          ...state,
          progress: data.progress || state.progress,
          step: data.step || state.step,
        };
        saveState(updatedState);
        return true;
      }
    }
  } catch (err) {
    console.error('[StoryGenerator] Reconnect error:', err);
  }

  return false;
}
