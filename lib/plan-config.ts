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
    price: '29.90',
    priceDisplay: '¥29.9',
    pages: 8,
    credits: 1,
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '1本专属绘本，全风格+外观',
    tag: null,
  },
  monthly: {
    id: 'monthly',
    name: '月度会员',
    price: '49.00',
    priceDisplay: '¥49/月',
    pages: 8,
    credits: 4, // 4本/月
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '4本/月，比单本省59%',
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
    description: '4本/月+生日绘本，相当于¥24.9/月',
    tag: '省69%',
  },
};

export type PlanId = keyof typeof PLAN_CONFIGS;

export function getPlanConfig(planId: string): PlanConfig | null {
  return PLAN_CONFIGS[planId] || null;
}
