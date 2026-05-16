/**
 * 验证码校验登录 API
 * POST /api/auth/verify-code
 * 
 * 功能：
 * 1. 接收手机号+验证码
 * 2. 从Supabase查sms_codes表校验
 * 3. 校验通过后：查找或创建用户
 * 4. 签发JWT token返回
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { signToken } from '@/lib/auth';

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
    
    const supabase = getSupabaseClient();
    
    // 2. 查找有效验证码
    const { data: validCode, error: queryError } = await supabase
      .from('sms_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (queryError || !validCode) {
      return NextResponse.json(
        { success: false, message: '验证码无效或已过期' },
        { status: 400 }
      );
    }
    
    // 3. 标记验证码为已使用
    await supabase
      .from('sms_codes')
      .update({ used: true })
      .eq('id', validCode.id);
    
    // 4. 查找或创建用户
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 是"未找到结果"的错误，可以忽略
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
          nickname: `用户${phone.slice(-4)}`, // 默认昵称
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
