/**
 * Creem 支付工具库（海外收款）
 * 官方文档: https://docs.creem.io/
 * Next.js SDK: @creem_io/nextjs
 * 
 * 费率: 3.9% + $0.40/笔
 * 功能: MoR代处理全球税务、支持信用卡/SEPA/Apple Pay/Google Pay
 * 
 * 使用前提:
 * 1. 在 Creem Dashboard 创建产品，获取 product_id
 * 2. 在 Creem Developers 获取 API Key
 * 3. 设置环境变量 CREEM_API_KEY 和 CREEM_WEBHOOK_SECRET
 */

import crypto from 'crypto';

// Creem API 基础URL
const CREEM_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.creem.io'
  : 'https://test-api.creem.io';

// 海外套餐配置（美元定价）
export const CREEM_PLANS = {
  'single-en': {
    id: 'single-en',
    name: 'Single Storybook',
    productId: process.env.CREEM_PRODUCT_SINGLE || '',
    price: '$4.99',
    priceCents: 499, // 美分
    credits: 1,
    description: '1 personalized AI storybook',
  },
} as const;

export type CreemPlanId = keyof typeof CREEM_PLANS;

export function getCreemPlan(planId: string) {
  return CREEM_PLANS[planId as CreemPlanId] || null;
}

/**
 * 创建 Creem Checkout Session
 * 文档: https://docs.creem.io/features/checkout/checkout-api
 */
export async function createCreemCheckout(params: {
  productId: string;
  requestId: string;
  successUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    throw new Error('CREEM_API_KEY is not configured');
  }

  const response = await fetch(`${CREEM_BASE_URL}/v1/checkouts`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: params.productId,
      request_id: params.requestId,
      success_url: params.successUrl,
      ...(params.customerEmail && {
        customer: { email: params.customerEmail },
      }),
      ...(params.metadata && { metadata: params.metadata }),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Creem checkout error:', data);
    throw new Error(data.message || 'Failed to create checkout session');
  }

  return {
    checkoutId: data.id,
    checkoutUrl: data.checkout_url,
    productId: data.product_id,
    status: data.status,
  };
}

/**
 * 验证 Creem Webhook 签名
 * 文档: https://docs.creem.io/api-reference/introduction
 */
export function verifyCreemWebhook(
  payload: string,
  signature: string,
): boolean {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CREEM_WEBHOOK_SECRET is not configured');
    return false;
  }

  const computed = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return computed === signature;
}

/**
 * 验证 Creem Success URL 签名
 * 支付成功后用户跳转到 success_url 时，Creem 会附带 signature 参数
 */
export function verifyCreemSuccessSignature(
  params: Record<string, string>,
): boolean {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return false;

  // 按 Creem 文档，signature 是用 API key 对其他参数签名
  const { signature, ...otherParams } = params;
  const sortedKeys = Object.keys(otherParams).sort();
  const signString = sortedKeys
    .map((key) => `${key}=${otherParams[key]}`)
    .join('&');

  const computed = crypto
    .createHmac('sha256', apiKey)
    .update(signString)
    .digest('hex');

  return computed === signature;
}
