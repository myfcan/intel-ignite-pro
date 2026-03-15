-- ============================================================
-- Atomic daily usage increment + RLS hardening for v10_user_daily_usage
-- Fixes:
--   C1: Race condition TOCTOU on daily limit check
--   C3: User can reset own counter via client upsert
-- ============================================================

-- 1. Atomic increment function (returns new count, or -1 if limit reached)
CREATE OR REPLACE FUNCTION increment_daily_usage(
  p_user_id uuid,
  p_usage_date date
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_used int;
  v_limit int;
BEGIN
  -- Lock the row to prevent concurrent updates
  SELECT interactions_used, interactions_limit
    INTO v_used, v_limit
    FROM v10_user_daily_usage
   WHERE user_id = p_user_id AND usage_date = p_usage_date
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  IF v_used >= v_limit THEN
    RETURN -1;
  END IF;

  UPDATE v10_user_daily_usage
     SET interactions_used = v_used + 1
   WHERE user_id = p_user_id AND usage_date = p_usage_date;

  RETURN v_used + 1;
END;
$$;

-- 2. Remove client UPDATE/INSERT policies on v10_user_daily_usage
--    Only service_role (edge functions) should write to this table
DROP POLICY IF EXISTS "v10_user_daily_usage_update" ON v10_user_daily_usage;
DROP POLICY IF EXISTS "v10_user_daily_usage_insert" ON v10_user_daily_usage;

-- Keep SELECT so Dashboard can read today's usage
-- (v10_user_daily_usage_select already exists from hardening migration)
