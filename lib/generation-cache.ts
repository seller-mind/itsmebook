/**
 * 内存中的生成状态缓存（同进程内可靠）
 * 独立模块，避免Next.js路由类型检查报错
 */

export const generationCache = new Map<string, {
  status: string;
  progress: number;
  step: string;
  result?: any;
  updatedAt: number;
}>();
