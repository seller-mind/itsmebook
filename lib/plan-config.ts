/**
 * 套餐配置（客户端和服务端共用）
 * 注意：此文件不能导入任何 Node.js 专属模块（如 crypto）
 */

export interface PlanConfig {
  id: string;
  name: string;
  price: string;
  priceDisplay: string;
  pages: number;
  credits: number; // 购买后增加的生成次数
  imageModel: string;
  imageSize: string;
  description: string;
  tag: string | null;
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  single: {
    id: 'single',
    name: '单本绘本',
    price: '19.90',
    priceDisplay: '¥19.9',
    pages: 8,
    credits: 1,
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '1本专属绘本',
    tag: null,
  },
  monthly: {
    id: 'monthly',
    name: '月度会员',
    price: '39.00',
    priceDisplay: '¥39/月',
    pages: 8,
    credits: 3, // 3本/月
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '3本/月，比单本省35%',
    tag: '推荐',
  },
  yearly: {
    id: 'yearly',
    name: '年度会员',
    price: '299.00',
    priceDisplay: '¥299/年',
    pages: 8,
    credits: 48, // 4本/月 * 12月
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '4本/月，比单本省69%',
    tag: '省69%',
  },
};

export type PlanId = keyof typeof PLAN_CONFIGS;

export function getPlanConfig(planId: string): PlanConfig | null {
  return PLAN_CONFIGS[planId] || null;
}
