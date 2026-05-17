-- ============================================
-- 「是我呀」推荐裂变系统数据库脚本
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 1. 推荐记录表
-- ============================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- 同一用户只能被推荐一次
    UNIQUE(referrer_id, referee_id)
);

-- 索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON public.referrals(referee_id);

-- ============================================
-- 2. 领取推荐奖励的函数
-- ============================================
-- 给推荐人和被推荐人各加1次免费次数
CREATE OR REPLACE FUNCTION public.claim_referral_reward(
    p_referrer_id UUID,
    p_referee_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    ref_record RECORD;
BEGIN
    -- 检查推荐记录是否存在
    SELECT * INTO ref_record FROM public.referrals
    WHERE referrer_id = p_referrer_id 
    AND referee_id = p_referee_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- 检查是否已领取
    IF ref_record.reward_claimed THEN
        RETURN FALSE;
    END IF;
    
    -- 不能自己推荐自己
    IF p_referrer_id = p_referee_id THEN
        RETURN FALSE;
    END IF;
    
    -- 标记为已领取
    UPDATE public.referrals SET reward_claimed = TRUE
    WHERE referrer_id = p_referrer_id 
    AND referee_id = p_referee_id;
    
    -- 推荐人+1次免费次数
    UPDATE public.users SET free_count = COALESCE(free_count, 0) + 1
    WHERE id = p_referrer_id;
    
    -- 被推荐人+1次免费次数（额外赠送的）
    UPDATE public.users SET free_count = COALESCE(free_count, 0) + 1
    WHERE id = p_referee_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. RLS 策略（行级安全策略）
-- ============================================

-- 允许用户查看自己的推荐记录
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals as referrer"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their own referrals as referee"
ON public.referrals
FOR SELECT
USING (auth.uid() = referee_id);

-- ============================================
-- 4. 查看推荐统计的视图（可选）
-- ============================================
CREATE OR REPLACE VIEW public.referral_stats AS
SELECT 
    u.id as user_id,
    u.nickname,
    u.phone,
    COUNT(r.id) FILTER (WHERE r.referrer_id = u.id) as total_invited,
    COUNT(r.id) FILTER (WHERE r.referrer_id = u.id AND r.reward_claimed) as total_rewards_claimed,
    COUNT(r.id) FILTER (WHERE r.referrer_id = u.id AND NOT r.reward_claimed) as pending_rewards
FROM public.users u
LEFT JOIN public.referrals r ON u.id = r.referrer_id
GROUP BY u.id, u.nickname, u.phone;

-- ============================================
-- 执行完成后确认
-- ============================================
-- SELECT '推荐系统初始化完成！' as status;
-- SELECT * FROM public.referrals LIMIT 0;
