// Supabase 客户端配置
// 用于存储用户数据、绘本数据和照片信息

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase客户端类型
export interface Book {
  id: string;
  user_id: string;
  title: string;
  character_name: string;
  character_age: number;
  theme: string;
  style: string;
  pages: BookPage[];
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface BookPage {
  page_number: number;
  text: string;
  image_prompt: string;
  image_url: string;
}

export interface UserPhoto {
  id: string;
  user_id: string;
  file_path: string;
  created_at: string;
}

// 创建Supabase客户端实例
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error('Supabase credentials are not configured');
    }

    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

// 保存绘本数据
export async function saveBook(bookData: {
  userId: string;
  title: string;
  characterName: string;
  characterAge: number;
  theme: string;
  style: string;
  pages: BookPage[];
}): Promise<Book | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: bookData.userId,
      title: bookData.title,
      character_name: bookData.characterName,
      character_age: bookData.characterAge,
      theme: bookData.theme,
      style: bookData.style,
      pages: bookData.pages,
      status: 'completed',
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving book:', error);
    return null;
  }

  return data;
}

// 获取用户的绘本列表
export async function getUserBooks(userId: string): Promise<Book[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return data || [];
}

// 获取单个绘本详情
export async function getBookById(bookId: string): Promise<Book | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single();

  if (error) {
    console.error('Error fetching book:', error);
    return null;
  }

  return data;
}

// 删除绘本
export async function deleteBook(bookId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId);

  if (error) {
    console.error('Error deleting book:', error);
    return false;
  }

  return true;
}

// 保存照片
export async function savePhoto(
  userId: string,
  filePath: string
): Promise<UserPhoto | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_photos')
    .insert({
      user_id: userId,
      file_path: filePath,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving photo:', error);
    return null;
  }

  return data;
}

// 获取用户照片列表
export async function getUserPhotos(userId: string): Promise<UserPhoto[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }

  return data || [];
}

// 删除用户照片
export async function deletePhoto(photoId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('user_photos')
    .delete()
    .eq('id', photoId);

  if (error) {
    console.error('Error deleting photo:', error);
    return false;
  }

  return true;
}

// ============================================
// 故事生成状态相关操作
// ============================================

export interface StoryGeneration {
  id: string;
  session_id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  step: string;
  params: any;
  result: any;
  created_at: string;
  updated_at: string;
}

// 创建生成记录
export async function createGenerationRecord(params: any): Promise<{ sessionId: string } | null> {
  try {
    const response = await fetch('/api/story/create-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params }),
    });
    const data = await response.json();
    if (data.success && data.sessionId) {
      return { sessionId: data.sessionId };
    }
    return null;
  } catch (err) {
    console.error('Error creating generation record:', err);
    return null;
  }
}

// 获取生成状态
export async function getGenerationStatus(sessionId: string): Promise<StoryGeneration | null> {
  try {
    const response = await fetch(`/api/story/generation-status?sessionId=${encodeURIComponent(sessionId)}`);
    const data = await response.json();
    if (data.success && data.exists) {
      return {
        id: '',
        session_id: sessionId,
        status: data.status,
        progress: data.progress,
        step: data.step,
        params: data.params,
        result: data.result,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching generation status:', err);
    return null;
  }
}
