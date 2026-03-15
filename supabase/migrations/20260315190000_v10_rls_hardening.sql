-- ============================================================
-- V10 RLS Hardening + Missing Index
-- Fixes from Phase III audit:
-- 1. User tables: split FOR ALL into SELECT/INSERT/UPDATE (block user DELETE)
-- 2. Add missing index on v10_bpa_pipeline.lesson_id
-- ============================================================

-- ============================================================
-- 1. v10_user_lesson_progress: replace FOR ALL with granular policies
-- ============================================================
DROP POLICY IF EXISTS "v10_user_progress_own" ON v10_user_lesson_progress;

CREATE POLICY "v10_user_progress_select" ON v10_user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "v10_user_progress_insert" ON v10_user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "v10_user_progress_update" ON v10_user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 2. v10_user_achievements: replace FOR ALL with granular policies
-- ============================================================
DROP POLICY IF EXISTS "v10_user_achievements_own" ON v10_user_achievements;

CREATE POLICY "v10_user_achievements_select" ON v10_user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "v10_user_achievements_insert" ON v10_user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE for achievements (immutable once earned)

-- ============================================================
-- 3. v10_user_streaks: replace FOR ALL with granular policies
-- ============================================================
DROP POLICY IF EXISTS "v10_user_streaks_own" ON v10_user_streaks;

CREATE POLICY "v10_user_streaks_select" ON v10_user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "v10_user_streaks_insert" ON v10_user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "v10_user_streaks_update" ON v10_user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- No DELETE for streaks

-- ============================================================
-- 4. v10_user_plans: replace FOR ALL with SELECT-only for users
--    (plans should only be managed by admin/server)
-- ============================================================
DROP POLICY IF EXISTS "v10_user_plans_own" ON v10_user_plans;

CREATE POLICY "v10_user_plans_select" ON v10_user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE only via service_role (edge functions)

-- ============================================================
-- 5. v10_user_daily_usage: replace FOR ALL with SELECT + INSERT + UPDATE
-- ============================================================
DROP POLICY IF EXISTS "v10_user_daily_usage_own" ON v10_user_daily_usage;

CREATE POLICY "v10_user_daily_usage_select" ON v10_user_daily_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "v10_user_daily_usage_insert" ON v10_user_daily_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "v10_user_daily_usage_update" ON v10_user_daily_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- No DELETE for usage tracking

-- ============================================================
-- 6. Missing index: v10_bpa_pipeline.lesson_id (FK join column)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_v10_bpa_pipeline_lesson_id
  ON v10_bpa_pipeline (lesson_id);
