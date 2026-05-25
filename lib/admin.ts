/**
 * Admin 模式工具 - 是我呀
 * 根据访问域名自动判断模式：
 *   admin.itsmebook.com → admin 模式（全功能，仅自用）
 *   itsmebook.com / 其他 → public 模式（对外版，零敏感数据）
 * 也可通过 NEXT_PUBLIC_APP_MODE 环境变量覆盖（本地开发用）
 */

/**
 * 获取当前应用模式
 * @returns 'admin' | 'public'
 */
export function getAppMode(): 'admin' | 'public' {
  if (typeof window === 'undefined') {
    // 服务端：优先用环境变量，否则根据请求头判断（middleware中设置）
    return (process.env.NEXT_PUBLIC_APP_MODE as 'admin' | 'public') || 'public';
  }
  // 客户端：优先根据域名判断，环境变量作后备
  const hostname = window.location.hostname;
  if (hostname === 'admin.itsmebook.com' || hostname.startsWith('admin.')) {
    return 'admin';
  }
  // 本地开发时可通过环境变量切换
  if (process.env.NEXT_PUBLIC_APP_MODE === 'admin') {
    return 'admin';
  }
  return 'public';
}

/**
 * 判断是否为 Admin 模式
 */
export function isAdminMode(): boolean {
  return getAppMode() === 'admin';
}

/**
 * 判断是否为 Public 模式
 */
export function isPublicMode(): boolean {
  return getAppMode() === 'public';
}

// ==================== Admin 模式功能开关 ====================

/**
 * Admin 模式可用套餐
 */
export type AdminPlanType = 'basic' | 'premium' | 'audio' | 'parent-voice' | 'child-hero';

export interface PlanConfig {
  id: AdminPlanType;
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

export const ADMIN_PLANS: PlanConfig[] = [
  {
    id: 'basic',
    name: '基础版',
    emoji: '📖',
    description: '8页AI绘本+基础声音',
    price: 0,
    features: ['8页AI绘本', '5种标准声音', 'PDF下载'],
    pageCount: 8,
    hasVoiceover: false,
    hasParentVoice: false,
    hasChildHero: false,
    hasVideoExport: false,
  },
  {
    id: 'premium',
    name: '精品版',
    emoji: '✨',
    description: '12页绘本+高品质声音+高清PDF',
    price: 29,
    features: ['12页AI绘本', '5种标准声音', '高清PDF', '视频导出'],
    pageCount: 12,
    hasVoiceover: true,
    hasParentVoice: false,
    hasChildHero: false,
    hasVideoExport: true,
  },
  {
    id: 'audio',
    name: '有声版',
    emoji: '🎧',
    description: '精品版+AI配音+字幕视频',
    price: 49,
    features: ['12页AI绘本', 'AI配音朗读', '字幕视频', '高清PDF'],
    pageCount: 12,
    hasVoiceover: true,
    hasParentVoice: false,
    hasChildHero: false,
    hasVideoExport: true,
  },
  {
    id: 'parent-voice',
    name: '亲子朗读版',
    emoji: '👨‍👧',
    description: '精品版+家长声音克隆',
    price: 99,
    features: ['12页AI绘本', '家长声音克隆', '配音朗读', '字幕视频', '高清PDF'],
    pageCount: 12,
    hasVoiceover: true,
    hasParentVoice: true,
    hasChildHero: false,
    hasVideoExport: true,
  },
  {
    id: 'child-hero',
    name: '孩子主角专属版',
    emoji: '👶',
    description: '精品版+孩子照片生成主角',
    price: 129,
    features: ['12页AI绘本', '孩子照片生成主角', '家长声音克隆', '配音朗读', '字幕视频', '高清PDF'],
    pageCount: 12,
    hasVoiceover: true,
    hasParentVoice: true,
    hasChildHero: true,
    hasVideoExport: true,
  },
];

/**
 * 获取套餐配置
 */
export function getPlanConfig(planId: AdminPlanType): PlanConfig | undefined {
  return ADMIN_PLANS.find(p => p.id === planId);
}

/**
 * Admin 模式可用的声音列表（包含克隆声音）
 */
export interface VoiceOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isCloned: boolean;
}

export const ADMIN_VOICES: VoiceOption[] = [
  { id: 'longhuhu_v3', name: '龙呼呼', emoji: '🐉', description: '天真女童，最适合故事', isCloned: false },
  { id: 'xiaoyi_v3', name: '亲切老师', emoji: '🧑‍🏫', description: '温暖女声，娓娓道来', isCloned: false },
  { id: 'zhichu_v3', name: '阳光少年', emoji: '👨‍🎓', description: '活泼男童声线', isCloned: false },
  { id: 'zhimiao_v3', name: '睡前低语', emoji: '🎭', description: '轻柔女声，适合睡前', isCloned: false },
  { id: 'zhiyan_v3', name: '故事大王', emoji: '🌟', description: '浑厚男声，讲大冒险', isCloned: false },
];

/**
 * 添加克隆声音到列表
 */
export function addClonedVoice(voiceId: string, voiceName: string): VoiceOption {
  const clonedVoice: VoiceOption = {
    id: voiceId,
    name: voiceName,
    emoji: '🎙️',
    description: '家长克隆声音',
    isCloned: true,
  };
  
  if (!ADMIN_VOICES.find(v => v.id === voiceId)) {
    ADMIN_VOICES.push(clonedVoice);
  }
  
  return clonedVoice;
}

/**
 * 获取所有可用声音
 */
export function getAllVoices(): VoiceOption[] {
  return ADMIN_VOICES;
}

/**
 * Admin 模式功能检查
 */
export const AdminFeatures = {
  // 12页绘本支持
  has12Pages: () => isAdminMode(),
  
  // 声音克隆功能
  hasVoiceClone: () => isAdminMode(),
  
  // 照片生成主角
  hasChildHeroPhoto: () => isAdminMode(),
  
  // 视频导出
  hasVideoExport: () => isAdminMode(),
  
  // 高清PDF导出
  hasHDExport: () => isAdminMode(),
  
  // 分享链接
  hasShareLink: () => isAdminMode(),
  
  // 快速接单模式
  hasQuickOrder: () => isAdminMode(),
  
  // 批量生成
  hasBatchGenerate: () => isAdminMode(),
};

/**
 * 生成模式参数（用于API调用）
 */
export interface AdminGenerateParams {
  // 基础信息
  childName: string;
  childAge: number;
  childGender: 'boy' | 'girl';
  
  // 内容配置
  themeId: string;
  styleId: string;
  pageCount: 8 | 12;
  
  // 套餐
  planId: AdminPlanType;
  
  // 声音配置
  voiceId: string;
  useClonedVoice: boolean;
  parentVoiceBase64?: string; // base64直传，不落盘
  
  // 照片配置（孩子主角）
  useChildPhoto: boolean;
  childPhotoBase64?: string; // base64直传，不落盘
  
  // 视频配置
  generateVideo: boolean;
  videoDuration: number; // 每页停留秒数
  
  // 客户信息（用于记录）
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderNote?: string;
}

/**
 * 默认生成参数
 */
export const DEFAULT_ADMIN_PARAMS: Partial<AdminGenerateParams> = {
  pageCount: 8,
  useClonedVoice: false,
  useChildPhoto: false,
  generateVideo: false,
  videoDuration: 4,
};
