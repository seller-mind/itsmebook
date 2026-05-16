/**
 * 查询支付状态 API
 * GET /api/payment/status?orderId=xxx
 * 
 * 功能：
 * 1. 前端轮询检查订单是否支付成功
 * 2. 返回订单状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    // 1. 获取订单ID
    const orderId = request.nextUrl.searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: '缺少订单号' },
        { status: 400 }
      );
    }
    
    // 2. 查询订单状态
    const supabase = getSupabase();
    
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('trade_order_id', orderId)
      .single();
    
    if (error || !order) {
      return NextResponse.json(
        { success: false, message: '订单不存在' },
        { status: 404 }
      );
    }
    
    // 3. 返回订单状态
    return NextResponse.json({
      success: true,
      data: {
        orderId: order.trade_order_id,
        status: order.status,
        plan: order.plan,
        amount: order.amount,
        paidAt: order.paid_at,
      },
    });
    
  } catch (error) {
    console.error('查询订单状态失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
