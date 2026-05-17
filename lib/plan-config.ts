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
  monthly: {
    id: 'monthly',
    name: '月卡',
    price: '99.00',
    priceDisplay: '¥99',
    pages: 12,
    credits: 30, // 30个故事/月，约每天1个
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '每天1个故事，30天无限陪伴',
    tag: '推荐',
  },
  yearly: {
    id: 'yearly',
    name: '年卡',
    price: '699.00',
    priceDisplay: '¥699',
    pages: 12,
    credits: 365, // 365个故事/年
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '每天¥1.9，全年无限故事',
    tag: '省40%',
  },
  single: {
    id: 'single',
    name: '单次故事',
    price: '9.90',
    priceDisplay: '¥9.9',
    pages: 12,
    credits: 1,
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '1个完整故事',
    tag: null,
  },
};

export type PlanId = keyof typeof PLAN_CONFIGS;

export function getPlanConfig(planId: string): PlanConfig | null {
  return PLAN_CONFIGS[planId] || null;
}
