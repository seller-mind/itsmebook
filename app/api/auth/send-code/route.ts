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
import Dypnsapi20170525, * as dypnsapiModels from '@alicloud/dypnsapi20170525';
import OpenApi from '@alicloud/openapi-client';
import * as TeaUtil from '@alicloud/tea-util';

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

// 发送短信验证码（使用阿里云官方SDK - dypnsapi）
// 返回API生成的验证码，用于存入数据库校验
async function sendSmsCode(phone: string): Promise<{ success: boolean; message: string; verifyCode?: string }> {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  
  if (!accessKeyId || !accessKeySecret) {
    console.error('阿里云 AccessKey not configured');
    return { success: false, message: '短信服务未配置，请联系管理员' };
  }
  
  try {
    const config = new OpenApi.Config({
      accessKeyId,
      accessKeySecret,
      endpoint: 'dypnsapi.aliyuncs.com',
    });
    
    const client = new Dypnsapi20170525(config);
    
    const request = new dypnsapiModels.SendSmsVerifyCodeRequest({
      phoneNumber: phone,
      signName: '速通互联验证码',
      templateCode: '100001',
      // 使用 ##code## 占位符，让阿里云API生成验证码
      templateParam: '{"code":"##code##"}',
      codeType: 1,       // 1=纯数字
      codeLength: 6,     // 6位验证码
      returnVerifyCode: true, // 返回生成的验证码，用于存入数据库校验
      validTime: 300,    // 5分钟有效
      interval: 60,      // 60秒发送间隔
    });
    
    const runtime = new TeaUtil.RuntimeOptions({});
    
    const response = await client.sendSmsVerifyCode(request, runtime);
    
    if (response.body?.code === 'OK') {
      const verifyCode = response.body?.model?.verifyCode;
      return { success: true, message: '验证码发送成功', verifyCode };
    } else {
      console.error('阿里云短信发送失败:', response.body);
      return { success: false, message: response.body?.message || '发送失败' };
    }
  } catch (error: any) {
    console.error('短信发送异常:', error.message);
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
    
    // 3. 调用阿里云API发送验证码（API自动生成验证码）
    const smsResult = await sendSmsCode(phone);
    
    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, message: smsResult.message },
        { status: 500 }
      );
    }
    
    // 4. 将API返回的验证码存入数据库（5分钟过期）
    const code = smsResult.verifyCode;
    if (!code) {
      console.error('阿里云未返回验证码');
      return NextResponse.json(
        { success: false, message: '验证码获取失败，请重试' },
        { status: 500 }
      );
    }
    
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
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
