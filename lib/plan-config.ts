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
  trial: {
    id: 'trial',
    name: '体验版',
    price: '9.90',
    priceDisplay: '¥9.9',
    pages: 20,
    credits: 1,
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '基础绘本生成体验',
    tag: null,
  },
  standard: {
    id: 'standard',
    name: '标准版',
    price: '19.90',
    priceDisplay: '¥19.9',
    pages: 20,
    credits: 3,
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '高清绘本，优质画质',
    tag: '最受欢迎',
  },
  pro: {
    id: 'pro',
    name: '精制版',
    price: '29.90',
    priceDisplay: '¥29.9',
    pages: 20,
    credits: 5,
    imageModel: 'wan2.7-image-pro',
    imageSize: '1024*1024',
    description: 'Pro画质，极致体验',
    tag: 'Pro画质',
  },
  monthly: {
    id: 'monthly',
    name: '月卡',
    price: '59.90',
    priceDisplay: '¥59.9',
    pages: 20,
    credits: 30,
    imageModel: 'wan2.7-image',
    imageSize: '1024*1024',
    description: '30天内无限使用',
    tag: '省40%',
  },
};

export type PlanId = keyof typeof PLAN_CONFIGS;

export function getPlanConfig(planId: string): PlanConfig | null {
  return PLAN_CONFIGS[planId] || null;
}
