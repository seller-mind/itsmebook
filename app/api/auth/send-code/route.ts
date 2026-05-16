/**
 * 发送验证码 API
 * POST /api/auth/send-code
 * 
 * 功能：
 * 1. 接收手机号
 * 2. 频率限制（60秒内只能发一次）
 * 3. 生成6位随机验证码
 * 4. 调用阿里云短信认证API发送
 * 5. 存储验证码到Supabase（5分钟过期）
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

// 生成6位随机验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 阿里云 V3 签名算法
async function signRequest(
  accessKeySecret: string,
  method: string,
  url: string,
  queryParams: Record<string, string>
): Promise<string> {
  // 1. 对查询参数进行排序和编码
  const sortedKeys = Object.keys(queryParams).sort();
  const canonicalizedQueryString = sortedKeys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');
  
  // 2. 构造待签名字符串
  const stringToSign = [
    method.toUpperCase(),
    url.split('?')[0], // path
    canonicalizedQueryString,
  ].join('\n');
  
  // 3. 使用 HMAC-SHA256 签名
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(accessKeySecret + '&'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(stringToSign)
  );
  
  // 4. Base64 编码
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// 发送短信验证码（使用阿里云短信认证API - dypnsapi）
async function sendSmsCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  
  if (!accessKeyId || !accessKeySecret) {
    console.error('阿里云 AccessKey not configured');
    return { success: false, message: '短信服务未配置，请联系管理员' };
  }
  
  try {
    // 阿里云短信认证API配置
    const regionId = 'cn-hangzhou';
    const signName = '速通互联验证码'; // 短信签名
    const templateCode = '100001'; // 短信模板CODE
    const gatewayUrl = 'https://dypnsapi.aliyuncs.com';
    
    // 构造请求参数
    const params: Record<string, string> = {
      PhoneNumbers: phone,
      SignName: signName,
      TemplateCode: templateCode,
      Code: code,
      CodeType: '0', // 数字验证码
      RegionId: regionId,
      AccessKeyId: accessKeyId,
      Format: 'JSON',
      SignatureMethod: 'HMAC-SHA256',
      SignatureVersion: '1.0',
      SignatureNonce: crypto.randomUUID(),
      Timestamp: new Date().toISOString(),
      Action: 'SendSmsVerifyCode',
      Version: '2017-05-25',
    };
    
    // 添加签名
    const signature = await signRequest(accessKeySecret, 'POST', gatewayUrl, params);
    params.Signature = signature;
    
    // 发送请求
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString(),
    });
    
    const result = await response.json();
    
    if (result.Code === 'OK' || result.Code === ' dysnsapi_common_response_success') {
      return { success: true, message: '验证码发送成功' };
    } else {
      console.error('阿里云短信认证失败:', result);
      return { success: false, message: result.Message || result.Code || '发送失败' };
    }
  } catch (error: any) {
    console.error('短信发送失败:', error);
    return { success: false, message: '短信服务暂时不可用' };
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
    
    // 2. 频率限制 - 检查60秒内是否已发送
    const supabase = getSupabaseClient();
    
    const { data: recentCode } = await supabase
      .from('sms_codes')
      .select('*')
      .eq('phone', phone)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (recentCode) {
      const createdAt = new Date(recentCode.created_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;
      
      if (diffSeconds < 60) {
        const remainingSeconds = Math.ceil(60 - diffSeconds);
        return NextResponse.json(
          { 
            success: false, 
            message: `请 ${remainingSeconds} 秒后再试`,
            retryAfter: remainingSeconds,
          },
          { status: 429 }
        );
      }
    }
    
    // 3. 生成验证码
    const code = generateCode();
    
    // 4. 保存验证码到数据库（5分钟过期）
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期
    
    const { error: insertError } = await supabase
      .from('sms_codes')
      .insert({
        phone,
        code,
        expires_at: expiresAt.toISOString(),
        used: false,
      });
    
    if (insertError) {
      console.error('保存验证码失败:', insertError);
      return NextResponse.json(
        { success: false, message: '系统错误，请稍后重试' },
        { status: 500 }
      );
    }
    
    // 5. 发送短信
    const smsResult = await sendSmsCode(phone, code);
    
    if (!smsResult.success) {
      // 发送失败，回滚验证码记录
      await supabase
        .from('sms_codes')
        .delete()
        .eq('phone', phone)
        .eq('code', code);
      
      return NextResponse.json(
        { success: false, message: smsResult.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '验证码发送成功',
    });
    
  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
