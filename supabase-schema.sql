-- ============================================
-- 「是我呀」AI儿童绘本 - Supabase 数据表
-- ============================================
-- 执行方式：在 Supabase Dashboard -> SQL Editor 中执行

-- ============================================
-- 1. 创建 users 表（用户表）
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    nickname TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    free_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建手机号索引（用于快速查找）
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- ============================================
-- 2. 创建 sms_codes 表（短信验证码表）
-- ============================================
CREATE TABLE IF NOT EXISTS public.sms_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建复合索引（手机号+未使用+未过期）
CREATE INDEX IF NOT EXISTS idx_sms_codes_lookup 
ON public.sms_codes(phone, used, expires_at DESC);

-- ============================================
-- 3. 创建 books 表（绘本表）
-- ============================================
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    character_name TEXT DEFAULT '',
    character_age INTEGER DEFAULT 5,
    theme TEXT DEFAULT '',
    style TEXT DEFAULT '',
    pages JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建用户ID索引
CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);

-- ============================================
-- 4. 启用 Row Level Security (RLS)
-- ============================================

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. 创建 RLS 策略
-- ============================================

-- users 表：用户只能查看和修改自己的数据
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (true);

-- sms_codes 表：只允许服务端操作（使用 service_role key）
CREATE POLICY "Service role full access to sms_codes" ON public.sms_codes
    FOR ALL USING (auth.role() = 'service_role');

-- books 表：用户只能查看和管理自己的绘本
CREATE POLICY "Users can view own books" ON public.books
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own books" ON public.books
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own books" ON public.books
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own books" ON public.books
    FOR DELETE USING (true);

-- ============================================
-- 6. 创建更新时间戳触发器函数
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. 清理过期验证码的定时任务（可选）
-- ============================================
-- 删除 24 小时前已使用或过期的验证码
CREATE OR REPLACE FUNCTION cleanup_expired_sms_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.sms_codes 
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 注释：如果需要可以创建一个 cron job 来执行清理
-- SELECT cron.schedule('cleanup-sms-codes', '0 3 * * *', 'SELECT cleanup_expired_sms_codes()');

-- ============================================
-- 验证表创建成功
-- ============================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'sms_codes', 'books')
ORDER BY table_name;
