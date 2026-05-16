/**
 * 发送验证码 API
 * POST /api/auth/send-code
 * 
 * 功能：
 * 1. 接收手机号
 * 2. 校验手机号格式
 * 3. 调用阿里云短信认证API发送
 * 4. 记录发送历史到Supabase（用于审计，不校验验证码）
 * 
 * 阿里云短信认证 (dypnsapi) API
 * 签名名称: 速通互联验证码
 * 模板CODE: 100001
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Dypnsapi20170525, * as dypnsapiModels from '@alicloud/dypnsapi20170525';
import * as $OpenApiCore from '@alicloud/openapi-core';

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

// 发送短信验证码（使用阿里云官方SDK - dypnsapi）
async function sendSmsCode(phone: string): Promise<{ success: boolean; message: string }> {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  
  if (!accessKeyId || !accessKeySecret) {
    console.error('阿里云 AccessKey not configured');
    return { success: false, message: '短信服务未配置，请联系管理员' };
  }
  
  try {
    const config = new $OpenApiCore.$OpenApiUtil.Config({
      accessKeyId,
      accessKeySecret,
      endpoint: 'dypnsapi.aliyuncs.com',
    });
    
    const client = new Dypnsapi20170525(config);
    
    const request = new dypnsapiModels.SendSmsVerifyCodeRequest({
      phoneNumber: phone,
      signName: '速通互联验证码',
      templateCode: '100001',
      templateParam: '{"code":"##code##","min":"5"}',
      codeType: 1,       // 1=纯数字
      codeLength: 6,     // 6位验证码
      returnVerifyCode: true,
      validTime: 300,    // 5分钟有效
      interval: 60,      // 60秒发送间隔（阿里云自带频控）
    });
    
    const response = await client.sendSmsVerifyCode(request);
    
    if (response.statusCode === 200 && response.body?.code === 'OK') {
      return { success: true, message: '验证码发送成功' };
    } else {
      console.error('阿里云短信发送失败:', JSON.stringify(response));
      return { success: false, message: '短信服务暂时不可用，请稍后重试' };
    }
  } catch (error: any) {
    console.error('短信发送异常:', error.message, error.code, error.data);
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
