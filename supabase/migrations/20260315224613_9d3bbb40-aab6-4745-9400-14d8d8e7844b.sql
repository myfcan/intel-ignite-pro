
-- v10_user_daily_usage table (referenced in Dashboard.tsx)
CREATE TABLE public.v10_user_daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  interactions_used INTEGER NOT NULL DEFAULT 0,
  interactions_limit INTEGER NOT NULL DEFAULT 5,
  UNIQUE(user_id, usage_date)
);

ALTER TABLE public.v10_user_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_v10_daily_usage" ON public.v10_user_daily_usage FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_all_v10_daily_usage" ON public.v10_user_daily_usage FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_v10_daily_usage_user_date ON public.v10_user_daily_usage(user_id, usage_date);
