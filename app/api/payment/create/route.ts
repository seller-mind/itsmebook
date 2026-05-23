/**
 * 创建支付订单 API
 * POST /api/payment/create
 * 
 * 功能：
 * 1. 校验用户登录状态
 * 2. 接收并验证支付参数
 * 3. 根据套餐计算金额
 * 4. 生成唯一订单号
 * 5. 存入Supabase orders表
 * 6. 调用虎皮椒下单接口
 * 7. 返回支付链接/二维码URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { createPayment, getPlanConfig, PLAN_CONFIGS } from '@/lib/xunhupay';
import { v4 as uuidv4 } from 'uuid';

// 管理员密钥（用于某些需要高权限的操作）
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const payload = await getCurrentUser(request);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }
    
    const userId = payload.sub;
    
    // 2. 解析请求参数
    const body = await request.json();
    const { plan: planId, payType } = body;
    
    // 3. 验证套餐ID
    const planConfig = getPlanConfig(planId);
    if (!planConfig) {
      return NextResponse.json(
        { success: false, message: '无效的套餐' },
        { status: 400 }
      );
    }
    
    // 4. 验证支付类型
    if (!['wechat', 'alipay'].includes(payType)) {
      return NextResponse.json(
        { success: false, message: '无效的支付方式' },
        { status: 400 }
      );
    }
    
    // 5. 生成唯一订单号
    const timestamp = Date.now();
    const tradeOrderId = `ITSME${timestamp}${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
    
    // 6. 存储订单到数据库
    const supabase = getServiceSupabase();
    
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        trade_order_id: tradeOrderId,
        plan: planId,
        amount: parseFloat(planConfig.price),
        pay_type: payType,
        status: 'pending',
      });
    
    if (insertError) {
      console.error('创建订单失败:', insertError);
      return NextResponse.json(
        { success: false, message: '创建订单失败' },
        { status: 500 }
      );
    }
    
    // 7. 调用虎皮椒创建支付
    const paymentResult = await createPayment({
      tradeOrderId,
      totalFee: planConfig.price,
      title: `是我呀-${planConfig.name}`,
      type: payType as 'wechat' | 'alipay',
    });
    
    if (!paymentResult.success) {
      // 支付创建失败，更新订单状态
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('trade_order_id', tradeOrderId);
      
      return NextResponse.json(
        { success: false, message: paymentResult.errmsg || '支付创建失败' },
        { status: 500 }
      );
    }
    
    // 8. 返回支付信息
    return NextResponse.json({
      success: true,
      data: {
        orderId: tradeOrderId,
        urlQrcode: paymentResult.urlQrcode,
        url: paymentResult.url,
        payType,
        amount: planConfig.priceDisplay,
        planName: planConfig.name,
      },
    });
    
  } catch (error) {
    console.error('创建支付订单失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
