/**
 * 获取当前用户信息 API
 * GET /api/auth/me
 * 
 * 功能：
 * 1. 从请求头提取JWT Token
 * 2. 验证Token并返回用户信息
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证Token
    const payload = await getCurrentUser(request);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '未登录或登录已过期' },
        { status: 401 }
      );
    }
    
    // 2. 从数据库获取最新用户信息（同步free_count等）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 3. 返回用户信息
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        freeCount: user.free_count,
      },
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
