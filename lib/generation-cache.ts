/**
 * 生成状态缓存 - 是我呀
 * 
 * 内存中的生成状态缓存（同进程内可靠）
 * 独立模块，避免Next.js路由类型检查报错
 * 
 * 注意：Vercel Serverless中内存不持久化，
 * 主要依赖Supabase的story_generations表存储状态
 */

export interface GenerationCacheEntry {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  step: string;
  result?: any;
  updatedAt: number;
  createdAt: number;
}

// 内存缓存（Vercel Serverless中每个请求可能不同进程，仅作辅助）
export const generationCache = new Map<string, GenerationCacheEntry>();

// 清理过期缓存（1小时前的记录）
export function cleanupExpiredCache(maxAgeMs: number = 3600000) {
  const now = Date.now();
  const keysToDelete: string[] = [];
  generationCache.forEach((entry, key) => {
    if (now - entry.updatedAt > maxAgeMs) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => generationCache.delete(key));
}

// 设置缓存项
export function setCacheEntry(sessionId: string, entry: Partial<GenerationCacheEntry>) {
  const existing = generationCache.get(sessionId);
  generationCache.set(sessionId, {
    status: entry.status || existing?.status || 'pending',
    progress: entry.progress ?? existing?.progress ?? 0,
    step: entry.step || existing?.step || '',
    result: entry.result !== undefined ? entry.result : existing?.result,
    updatedAt: Date.now(),
    createdAt: existing?.createdAt || Date.now(),
  });
}

// 获取缓存项
export function getCacheEntry(sessionId: string): GenerationCacheEntry | undefined {
  return generationCache.get(sessionId);
}

// 删除缓存项
export function deleteCacheEntry(sessionId: string) {
  generationCache.delete(sessionId);
}
