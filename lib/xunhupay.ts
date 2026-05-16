/**
 * 虎皮椒支付工具库
 * 官方文档: https://www.xunhupay.com/
 * 
 * 签名算法:
 * 1. 将所有非sign、非空参数按key升序排列
 * 2. 拼接为 key1=value1&key2=value2...
 * 3. 末尾追加 &key=AppSecret
 * 4. 对整个字符串做MD5，转大写
 */

import crypto from 'crypto';

// 虎皮椒配置
interface XunhuPayConfig {
  appId: string;
  appSecret: string;
  gateway: string;
  notifyUrl: string;
}

// 获取虎皮椒配置
export function getXunhuPayConfig(): XunhuPayConfig {
  return {
    appId: process.env.XUNHUPAY_APP_ID || '',
    appSecret: process.env.XUNHUPAY_APP_SECRET || '',
    gateway: process.env.XUNHUPAY_GATEWAY || 'https://api.xunhupay.com/payment/do.html',
    notifyUrl: process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/notify`
      : 'https://www.itsmebook.com/api/payment/notify',
  };
}

/**
 * 生成MD5签名
 * @param params 参数对象
 * @param appSecret 密钥
 * @returns 大写MD5签名
 */
export function generateSign(params: Record<string, string>, appSecret: string): string {
  // 1. 过滤掉sign参数和空值
  const filteredParams: Record<string, string> = {};
  for (const key of Object.keys(params)) {
    if (key !== 'sign' && params[key] !== '' && params[key] !== undefined && params[key] !== null) {
      filteredParams[key] = params[key];
    }
  }
  
  // 2. 按key升序排列
  const sortedKeys = Object.keys(filteredParams).sort();
  
  // 3. 拼接为 key1=value1&key2=value2...
  const paramString = sortedKeys
    .map(key => `${key}=${filteredParams[key]}`)
    .join('&');
  
  // 4. 末尾追加 &key=AppSecret
  const signString = `${paramString}&key=${appSecret}`;
  
  // 5. MD5后转大写
  return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
}

/**
 * 生成随机字符串
 */
export function generateNonceStr(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

/**
 * 创建支付订单
 * @param params 支付参数
 * @returns 支付链接或二维码URL
 */
export async function createPayment(params: {
  tradeOrderId: string;
  totalFee: string;
  title: string;
  type: 'wechat' | 'alipay';
  openid?: string;
}): Promise<{
  success: boolean;
  urlQrcode?: string;
  url?: string;
  errcode?: number;
  errmsg?: string;
}> {
  const config = getXunhuPayConfig();
  const { appId, appSecret, gateway } = config;
  
  // 如果没有配置AppID，返回错误
  if (!appId || !appSecret) {
    return {
      success: false,
      errcode: -1,
      errmsg: '虎皮椒支付未配置，请联系管理员',
    };
  }
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = generateNonceStr();
  
  // 构建请求参数
  const requestParams: Record<string, string> = {
    version: '1.1',
    appid: appId,
    trade_order_id: params.tradeOrderId,
    total_fee: params.totalFee,
    title: params.title,
    time: timestamp,
    nonce_str: nonceStr,
    type: params.type,
    notify_url: config.notifyUrl,
  };
  
  // 如果是微信H5支付，可以添加openid
  if (params.type === 'wechat' && params.openid) {
    requestParams.openid = params.openid;
  }
  
  // 生成签名
  const sign = generateSign(requestParams, appSecret);
  requestParams.sign = sign;
  
  try {
    const response = await fetch(gateway, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestParams).toString(),
    });
    
    const data = await response.json();
    
    if (data.errcode === 0) {
      return {
        success: true,
        urlQrcode: data.url_qrcode,
        url: data.url,
      };
    } else {
      return {
        success: false,
        errcode: data.errcode,
        errmsg: data.errmsg || '支付创建失败',
      };
    }
  } catch (error) {
    console.error('虎皮椒支付请求失败:', error);
    return {
      success: false,
      errcode: -2,
      errmsg: '支付请求失败，请稍后重试',
    };
  }
}

/**
 * 验证回调签名
 * @param params 回调参数
 * @param appSecret 密钥
 * @returns 是否验证通过
 */
export function verifyNotify(params: Record<string, string>, appSecret: string): boolean {
  const receivedSign = params.sign;
  
  if (!receivedSign) {
    return false;
  }
  
  const calculatedSign = generateSign(params, appSecret);
  
  // 比较签名（不区分大小写）
  return calculatedSign.toLowerCase() === receivedSign.toLowerCase();
}

// 套餐配置从共享文件导入（避免客户端导入 crypto）
export { PLAN_CONFIGS, getPlanConfig } from './plan-config';
export type { PlanId, PlanConfig } from './plan-config';
