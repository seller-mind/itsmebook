-- 是我呀 AI绘本 - 数据库初始化 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行
-- Dashboard地址: https://supabase.com/dashboard/project/sdeduzqplvsyttvnolxm/sql

-- 1. 创建books表（绘本存储）
CREATE TABLE IF NOT EXISTS public.books (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  character_name TEXT DEFAULT '',
  character_age INTEGER DEFAULT 5,
  theme TEXT DEFAULT '',
  style TEXT DEFAULT '',
  pages JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 3. Service role完全访问权限
DROP POLICY IF EXISTS "Service role full access" ON public.books;
CREATE POLICY "Service role full access" ON public.books
  FOR ALL USING (auth.role() = 'service_role');

-- 4. 公开读取权限（分享链接需要）
DROP POLICY IF EXISTS "Public read" ON public.books;
CREATE POLICY "Public read" ON public.books
  FOR SELECT USING (true);
