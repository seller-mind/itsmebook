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

// 调用阿里云CheckSmsVerifyCode校验验证码
async function checkSmsVerifyCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
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
    
    const request = new dypnsapiModels.CheckSmsVerifyCodeRequest({
      phoneNumber: phone,
      verifyCode: code,
    });
    
    const response = await client.checkSmsVerifyCode(request);
    
    if (response.statusCode === 200 && response.body?.code === 'OK') {
      return { success: true, message: '验证码校验成功' };
    } else {
      console.error('阿里云验证码校验失败:', JSON.stringify(response));
      return { success: false, message: '验证码无效或已过期' };
    }
  } catch (error: any) {
    console.error('验证码校验异常:', error.message, error.code, error.data);
    // 阿里云返回错误时也可能是验证码错误，给出通用提示
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
    
    if (!code) {
      return NextResponse.json(
        { success: false, message: '请输入验证码' },
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
      .eq('phone', phone)
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
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
