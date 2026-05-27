/**
 * Supabase Storage 初始化脚本
 * 创建 book-images bucket 并设置权限
 * 
 * 执行方式：
 * 1. 在 Supabase Dashboard -> SQL Editor 中执行
 * 2. 或通过 Supabase CLI: supabase db query -f setup-storage.sql
 */

// 创建 book-images bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('book-images', 'book-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

// 允许公开读取
DROP POLICY IF EXISTS "Public read books" ON storage.objects;
CREATE POLICY "Public read books" ON storage.objects 
FOR SELECT USING (bucket_id = 'book-images');

-- 允许认证用户上传
DROP POLICY IF EXISTS "Authenticated upload books" ON storage.objects;
CREATE POLICY "Authenticated upload books" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'book-images' AND auth.role() = 'authenticated');

-- 允许认证用户更新自己的文件
DROP POLICY IF EXISTS "Authenticated update books" ON storage.objects;
CREATE POLICY "Authenticated update books" ON storage.objects 
FOR UPDATE USING (bucket_id = 'book-images' AND auth.role() = 'authenticated');

-- service_role 可以做任何操作
DROP POLICY IF EXISTS "Service role all books" ON storage.objects;
CREATE POLICY "Service role all books" ON storage.objects 
FOR ALL USING (bucket_id = 'book-images' AND auth.role() = 'service_role');

-- 允许 anon 读取（用于分享页面）
DROP POLICY IF EXISTS "Anon read books" ON storage.objects;
CREATE POLICY "Anon read books" ON storage.objects 
FOR SELECT USING (bucket_id = 'book-images');
