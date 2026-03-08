
-- 1. Add columns to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS last_login_counted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS dashboard_tour_seen_at timestamptz NULL;

-- 2. Atomic login registration function
CREATE OR REPLACE FUNCTION public.register_dashboard_login(p_last_sign_in_at timestamptz)
RETURNS TABLE(access_count integer, is_first_access boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_current_count integer;
  v_last_counted timestamptz;
  v_tour_seen timestamptz;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT dashboard_access_count, last_login_counted_at, dashboard_tour_seen_at
  INTO v_current_count, v_last_counted, v_tour_seen
  FROM public.users
  WHERE id = v_user_id;

  -- Only increment if this is a genuinely new sign-in event
  IF v_current_count < 5 AND (v_last_counted IS NULL OR p_last_sign_in_at > v_last_counted) THEN
    UPDATE public.users
    SET 
      dashboard_access_count = LEAST(v_current_count + 1, 5),
      last_login_counted_at = p_last_sign_in_at
    WHERE id = v_user_id;

    access_count := LEAST(v_current_count + 1, 5);
  ELSE
    access_count := v_current_count;
  END IF;

  -- First access = count was 0 before this call AND tour never seen
  is_first_access := (v_current_count = 0 AND v_tour_seen IS NULL);

  RETURN NEXT;
END;
$$;

-- 3. Mark tour as seen (idempotent)
CREATE OR REPLACE FUNCTION public.mark_dashboard_tour_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  UPDATE public.users
  SET dashboard_tour_seen_at = NOW()
  WHERE id = v_user_id AND dashboard_tour_seen_at IS NULL;
END;
$$;
