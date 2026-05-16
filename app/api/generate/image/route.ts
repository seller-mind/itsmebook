/**
 * 图片生成代理 API
 * POST /api/generate/image
 * 
 * 校验JWT token后，代理转发阿里云万相图片生成请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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

    // 2. 转发到阿里云万相API
    const body = await request.json();
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '服务未配置' },
        { status: 500 }
      );
    }

    const dashResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const result = await dashResponse.json();
    
    if (!dashResponse.ok) {
      console.error('万相API错误:', dashResponse.status, JSON.stringify(result));
      return NextResponse.json(
        { success: false, message: '图片生成失败' },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('图片代理异常:', error.message);
    return NextResponse.json(
      { success: false, message: '服务异常' },
      { status: 500 }
    );
  }
}
