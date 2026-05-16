/**
 * 虎皮椒异步通知 API
 * POST /api/payment/notify
 * 
 * 功能：
 * 1. 接收虎皮椒POST回调
 * 2. 验证签名
 * 3. 更新orders表状态为已支付
 * 4. 增加用户free_count
 * 5. 返回 "success" 字符串
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyNotify } from '@/lib/xunhupay';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. 获取回调参数
    const formData = await request.formData();
    const params: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });
    
    console.log('虎皮椒支付回调:', params);
    
    // 2. 验证签名
    const appSecret = process.env.XUNHUPAY_APP_SECRET;
    if (!appSecret) {
      console.error('虎皮椒未配置密钥');
      return new NextResponse('fail', { status: 500 });
    }
    
    if (!verifyNotify(params, appSecret)) {
      console.error('签名验证失败');
      return new NextResponse('fail', { status: 400 });
    }
    
    // 3. 验证支付状态
    if (params.status !== 'OD') {
      console.log('支付未完成，状态:', params.status);
      return new NextResponse('success', { status: 200 });
    }
    
    const tradeOrderId = params.trade_order_id;
    const transactionId = params.transaction_id || '';
    
    if (!tradeOrderId) {
      console.error('缺少订单号');
      return new NextResponse('fail', { status: 400 });
    }
    
    // 4. 更新订单状态
    const supabase = getServiceSupabase();
    
    // 检查订单是否已处理（幂等性）
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status, user_id')
      .eq('trade_order_id', tradeOrderId)
      .single();
    
    if (fetchError || !existingOrder) {
      console.error('订单不存在:', tradeOrderId);
      return new NextResponse('fail', { status: 404 });
    }
    
    // 如果已经是paid状态，直接返回success
    if (existingOrder.status === 'paid') {
      console.log('订单已处理:', tradeOrderId);
      return new NextResponse('success', { status: 200 });
    }
    
    // 更新订单状态
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        transaction_id: transactionId,
        paid_at: new Date().toISOString(),
      })
      .eq('trade_order_id', tradeOrderId);
    
    if (updateError) {
      console.error('更新订单状态失败:', updateError);
      return new NextResponse('fail', { status: 500 });
    }
    
    // 5. 增加用户免费次数
    const { error: userError } = await supabase
      .rpc('increment_free_count', {
        user_id: existingOrder.user_id,
        increment: 1,
      });
    
    // 如果rpc失败，尝试直接更新
    if (userError) {
      console.warn('RPC调用失败，尝试直接更新:', userError);
      
      const { data: user } = await supabase
        .from('users')
        .select('free_count')
        .eq('id', existingOrder.user_id)
        .single();
      
      if (user) {
        await supabase
          .from('users')
          .update({ free_count: (user.free_count || 0) + 1 })
          .eq('id', existingOrder.user_id);
      }
    }
    
    console.log('支付回调处理成功:', tradeOrderId);
    
    // 6. 返回纯文本 "success"
    return new NextResponse('success', { status: 200 });
    
  } catch (error) {
    console.error('处理支付回调失败:', error);
    return new NextResponse('fail', { status: 500 });
  }
}

// 禁用不必要的HTTP方法
export async function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
