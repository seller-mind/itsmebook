/**
 * 推荐统计 API
 * GET /api/referral/stats
 * 
 * 功能：获取推荐人列表和状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

// 创建Supabase客户端
function getSupabaseClient(): ReturnType<typeof createClient> {
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

export async function GET(request: NextRequest) {
  try {
    // 从Header获取Token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }
    
    // 验证Token
    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token无效或已过期' },
        { status: 401 }
      );
    }
    
    const userId = payload.sub;
    const supabase = getSupabaseClient();
    
    // 获取URL参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // 查询推荐记录（我推荐的人）
    const { data: referrals, count, error } = await supabase
      .from('referrals')
      .select(`
        id,
        referee_id,
        reward_claimed,
        created_at,
        users:referee_id (
          nickname,
          phone
        )
      `, { count: 'exact' })
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('查询推荐记录失败:', error);
      return NextResponse.json(
        { success: false, message: '查询失败' },
        { status: 500 }
      );
    }
    
    // 格式化数据
    const referralList = (referrals || []).map((ref: any) => ({
      id: ref.id,
      refereeNickname: ref.users?.nickname || '神秘用户',
      refereePhone: ref.users?.phone 
        ? `${ref.users.phone.substring(0, 3)}****${ref.users.phone.substring(7)}`
        : '未知',
      rewardClaimed: ref.reward_claimed,
      invitedAt: ref.created_at,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        list: referralList,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
    
  } catch (error: any) {
    console.error('获取推荐统计失败:', error);
    return NextResponse.json(
      { success: false, message: '系统错误，请稍后重试' },
      { status: 500 }
    );
  }
}
