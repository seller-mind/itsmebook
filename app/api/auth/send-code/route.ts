/**
 * 发送验证码 API
 * POST /api/auth/send-code
 * 
 * 功能：
 * 1. 接收手机号
 * 2. 校验手机号格式
 * 3. 调用阿里云短信认证API发送（使用原生HTTP + V1.0签名）
 * 4. 记录发送历史到Supabase（用于审计，不校验验证码）
 * 
 * 阿里云短信认证 (dypnsapi) API
 * 签名名称: 速通互联验证码
 * 模板CODE: 100001
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// 创建Supabase客户端
function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// 手机号格式校验
function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

// 阿里云V1.0签名 - percentEncode（签名专用，比encodeURIComponent多了几个字符）
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

// 生成阿里云V1.0签名
function generateSignature(params: Record<string, string>, accessKeySecret: string): string {
  // 1. 按参数名排序
  const sortedKeys = Object.keys(params).sort();
  
  // 2. 构造规范化请求字符串
  const canonicalizedQueryString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');
  
  // 3. 构造待签名字符串
  const stringToSign = `POST&${percentEncode('/')}&${percentEncode(canonicalizedQueryString)}`;
  
  // 4. 计算签名（HMAC-SHA1）
  const signature = crypto.createHmac('sha1', accessKeySecret + '&')
    .update(stringToSign, 'utf8')
    .digest('base64');
  
  return signature;
}

// 发送短信验证码（使用原生fetch + V1.0签名）
async function sendSmsCode(phone: string): Promise<{ success: boolean; message: string }> {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  
  if (!accessKeyId || !accessKeySecret) {
    console.error('阿里云 AccessKey not configured');
    return { success: false, message: '短信服务未配置，请联系管理员' };
  }
  
  try {
    // 生成UUID作为SignatureNonce
    const signatureNonce = crypto.randomUUID();
    
    // Timestamp - ISO8601格式 UTC时间
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    // 公共参数
    const publicParams: Record<string, string> = {
      AccessKeyId: accessKeyId,
      Action: 'SendSmsVerifyCode',
      Format: 'JSON',
      RegionId: 'cn-hangzhou',
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: signatureNonce,
      SignatureVersion: '1.0',
      Timestamp: timestamp,
      Version: '2017-05-25',
    };
    
    // 业务参数
    const bizParams: Record<string, string> = {
      PhoneNumber: phone,
      SignName: '速通互联验证码',
      TemplateCode: '100001',
      TemplateParam: '{"code":"##code##","min":"5"}',
      CodeType: '1',
      CodeLength: '6',
      ReturnVerifyCode: 'true',
      ValidTime: '300',
      Interval: '60',
    };
    
    // 合并所有参数
    const allParams = { ...publicParams, ...bizParams };
    
    // 计算签名
    const signature = generateSignature(allParams, accessKeySecret);
    
    // 添加签名到参数
    allParams.Signature = signature;
    
    // 构造请求体（标准URL编码）
    const requestBody = Object.entries(allParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    // 发送请求
    const response = await fetch('https://dypnsapi.aliyuncs.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });
    
    const result = await response.text();
    console.log('阿里云SendSmsVerifyCode响应:', result);
    
    // 解析JSON响应
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      console.error('响应解析失败:', result);
      return { success: false, message: '短信服务响应异常' };
    }
    
    if (response.ok && parsedResult.Code === 'OK') {
      return { success: true, message: '验证码发送成功' };
    } else {
      console.error('阿里云短信发送失败:', parsedResult);
      return { success: false, message: parsedResult.Message || parsedResult.Code || '发送失败', _debug: parsedResult };
    }
  } catch (error: any) {
    console.error('短信发送异常:', error.message);
    return { success: false, message: '短信服务暂时不可用，请稍后重试' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;
    
    // 1. 参数校验
    if (!phone) {
      return NextResponse.json(
        { success: false, message: '请输入手机号' },
        { status: 400 }
      );
    }
    
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, message: '手机号格式不正确' },
        { status: 400 }
      );
    }
    
    // 2. 调用阿里云API发送验证码（阿里云自带60秒频控）
    const smsResult = await sendSmsCode(phone);
    
    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, message: smsResult.message },
        { status: 500 }
      );
    }
    
    // 3. 记录发送历史到sms_codes表（不存验证码，仅记录发送时间用于审计）
    const supabase = getSupabaseClient();
    
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    const { error: insertError } = await supabase
      .from('sms_codes')
      .insert({
        phone,
        code: null, // 不存储验证码，由阿里云校验
        expires_at: expiresAt.toISOString(),
        used: false,
      });
    
    if (insertError) {
      console.error('记录发送历史失败:', insertError);
      // 不影响主流程，发送已成功
    }
    
    return NextResponse.json({
      success: true,
      message: '验证码发送成功',
    });
    
  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json(
      { success: false, message: '短信服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
