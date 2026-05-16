/**
 * 故事生成代理 API
 * POST /api/generate/story
 * 
 * 校验JWT token后，代理转发火山引擎流式请求
 * 防止未登录用户直接调用
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // 1. 校验登录状态
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: '登录已过期，请重新登录' },
        { status: 401 }
      );
    }

    // 2. 校验免费次数
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: userData } = await supabase
      .from('users')
      .select('free_count')
      .eq('id', payload.sub)
      .single();
    
    if (!userData || userData.free_count <= 0) {
      return NextResponse.json(
        { success: false, message: '免费次数已用完' },
        { status: 403 }
      );
    }
    
    // 3. 转发到火山引擎（流式）
    const body = await request.json();
    const apiKey = process.env.VOLCENGINE_API_KEY || process.env.NEXT_PUBLIC_VOLCENGINE_API_KEY;
    const endpointId = process.env.VOLCENGINE_ENDPOINT_ID || process.env.NEXT_PUBLIC_VOLCENGINE_ENDPOINT_ID || 'ep-20260515144642-96m6k';
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '服务未配置' },
        { status: 500 }
      );
    }

    const volcResponse = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: endpointId,
        messages: body.messages,
        stream: true,
      }),
    });

    if (!volcResponse.ok) {
      const errText = await volcResponse.text();
      console.error('火山引擎错误:', volcResponse.status, errText);
      return NextResponse.json(
        { success: false, message: '故事生成服务异常' },
        { status: 502 }
      );
    }

    // 流式转发
    return new NextResponse(volcResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('故事代理异常:', error.message);
    return NextResponse.json(
      { success: false, message: '服务异常' },
      { status: 500 }
    );
  }
}
