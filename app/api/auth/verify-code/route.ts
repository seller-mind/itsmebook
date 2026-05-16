/**
 * 验证码校验登录 API
 * POST /api/auth/verify-code
 * 
 * 功能：
 * 1. 接收手机号+验证码
 * 2. 调用阿里云CheckSmsVerifyCode校验
 * 3. 校验通过后：标记sms_codes为已使用、查找或创建用户、签发JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { signToken } from '@/lib/auth';
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

// 调用阿里云CheckSmsVerifyCode校验验证码（使用原生fetch + V1.0签名）
async function checkSmsVerifyCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
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
      Action: 'CheckSmsVerifyCode',
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
      VerifyCode: code,
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
    console.log('阿里云CheckSmsVerifyCode响应:', result);
    
    // 解析JSON响应
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      console.error('响应解析失败:', result);
      return { success: false, message: '验证码校验响应异常' };
    }
    
    if (response.ok && parsedResult.Code === 'OK') {
      return { success: true, message: '验证码校验成功' };
    } else {
      console.error('阿里云验证码校验失败:', parsedResult);
      return { success: false, message: '验证码无效或已过期' };
    }
  } catch (error: any) {
    console.error('验证码校验异常:', error.message);
    return { success: false, message: '验证码无效或已过期' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;
    
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
    
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: '验证码必须是6位数字' },
        { status: 400 }
      );
    }
    
    // 2. 调用阿里云API校验验证码
    const checkResult = await checkSmsVerifyCode(phone, code);
    
    if (!checkResult.success) {
      return NextResponse.json(
        { success: false, message: checkResult.message },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseClient();
    
    // 3. 标记该手机号最近的sms_codes为已使用
    await supabase
      .from('sms_codes')
      .update({ used: true })
      .eq('phone', phone)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);
    
    // 4. 查找或创建用户
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('查询用户失败:', userError);
      return NextResponse.json(
        { success: false, message: '系统错误，请稍后重试' },
        { status: 500 }
      );
    }
    
    // 如果用户不存在，创建新用户
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          phone,
          nickname: `用户${phone.slice(-4)}`,
          free_count: 1, // 新用户赠送1次免费
        })
        .select()
        .single();
      
      if (createError) {
        console.error('创建用户失败:', createError);
        return NextResponse.json(
          { success: false, message: '系统错误，请稍后重试' },
          { status: 500 }
        );
      }
      
      user = newUser;
    }
    
    // 5. 签发JWT Token
    const token = await signToken({
      sub: user.id,
      phone: user.phone,
      nickname: user.nickname,
      freeCount: user.free_count,
    });
    
    // 6. 返回用户信息和Token
    return NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          freeCount: user.free_count,
        },
      },
    });
    
  } catch (error) {
    console.error('验证码校验失败:', error);
    return NextResponse.json(
      { success: false, message: '系统错误，请稍后重试' },
      { status: 500 }
    );
  }
}
