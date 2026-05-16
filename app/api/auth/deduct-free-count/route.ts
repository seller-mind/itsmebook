/**
 * 扣减免费次数 API
 * POST /api/auth/deduct-free-count
 * 
 * 功能：
 * 1. 验证用户身份
 * 2. 检查免费次数
 * 3. 扣减免费次数
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabaseAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证Token
    const payload = await getCurrentUser(request);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '未登录或登录已过期' },
        { status: 401 }
      );
    }
    
    const supabase = getSupabaseAdminClient();
    
    // 2. 获取用户当前免费次数
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('free_count')
      .eq('id', payload.sub)
      .single();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 3. 检查免费次数
    if (user.free_count <= 0) {
      return NextResponse.json(
        { success: false, message: '免费次数已用完，请先充值' },
        { status: 403 }
      );
    }
    
    // 4. 扣减免费次数
    const { error: updateError } = await supabase
      .from('users')
      .update({
        free_count: user.free_count - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.sub);
    
    if (updateError) {
      console.error('扣减免费次数失败:', updateError);
      return NextResponse.json(
        { success: false, message: '扣减失败，请重试' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '扣减成功',
      data: {
        remainingCount: user.free_count - 1,
      },
    });
    
  } catch (error) {
    console.error('扣减免费次数失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
