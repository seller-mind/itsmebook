/**
 * 推荐信息 API
 * GET /api/referral/info
 * 
 * 功能：获取当前用户的推荐码、推荐链接、推荐统计
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

// 获取推荐码（用户ID前8位）
function getReferralCode(userId: string): string {
  return userId.replace(/-/g, '').substring(0, 8).toUpperCase();
}

// 生成推荐链接
function getReferralLink(referralCode: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itsmebook.com';
  return `${appUrl}/?ref=${referralCode}`;
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
    
    // 查询用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, nickname, phone, free_count')
      .eq('id', userId)
      .single() as { data: { id: string; nickname: string; phone: string; free_count: number } | null; error: any };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 生成推荐码和链接
    const referralCode = getReferralCode(user.id);
    const referralLink = getReferralLink(referralCode);
    
    // 查询推荐统计
    // 1. 作为推荐人：我推荐了多少人
    const { count: invitedCount } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', user.id);
    
    // 2. 作为推荐人：我成功奖励了多少人
    const { count: claimedCount } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', user.id)
      .eq('reward_claimed', true);
    
    // 3. 我作为被推荐人：是否有人推荐了我（不显示具体是谁）
    const { data: myReferral } = await supabase
      .from('referrals')
      .select('id, created_at')
      .eq('referee_id', user.id)
      .single() as { data: { id: string; created_at: string } | null };
    
    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        referralLink,
        nickname: user.nickname,
        freeCount: user.free_count,
        stats: {
          invitedCount: invitedCount || 0,
          claimedCount: claimedCount || 0,
          pendingCount: (invitedCount || 0) - (claimedCount || 0),
          wasInvited: !!myReferral,
          invitedAt: myReferral?.created_at || null,
        },
      },
    });
    
  } catch (error: any) {
    console.error('获取推荐信息失败:', error);
    return NextResponse.json(
      { success: false, message: '系统错误，请稍后重试' },
      { status: 500 }
    );
  }
}
