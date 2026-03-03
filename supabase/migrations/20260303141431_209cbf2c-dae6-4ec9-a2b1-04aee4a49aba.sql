
-- 1. Add 'insight_claimed' event type to register_gamification_event
CREATE OR REPLACE FUNCTION public.register_gamification_event(p_event_type text, p_event_reference_id uuid DEFAULT NULL::uuid, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS gamification_result
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_xp_delta INTEGER := 0;
  v_coins_delta INTEGER := 0;
  v_power_score INTEGER;
  v_coins INTEGER;
  v_old_patent INTEGER;
  v_new_patent INTEGER;
  v_patent_name TEXT;
  v_is_new_patent BOOLEAN := false;
  v_correct INTEGER;
  v_total INTEGER;
  v_result public.gamification_result;
  v_event_exists BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  IF p_event_reference_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_gamification_events
      WHERE user_id = v_user_id
        AND event_type = p_event_type
        AND event_reference_id = p_event_reference_id
    ) INTO v_event_exists;

    IF v_event_exists THEN
      SELECT power_score, coins, patent_level
      INTO v_power_score, v_coins, v_old_patent
      FROM public.users
      WHERE id = v_user_id;

      v_result.xp_delta := 0;
      v_result.coins_delta := 0;
      v_result.new_power_score := v_power_score;
      v_result.new_coins := v_coins;
      v_result.new_patent_level := v_old_patent;
      v_result.patent_name := CASE v_old_patent
        WHEN 0 THEN 'Sem patente'
        WHEN 1 THEN 'Operador Básico de I.A.'
        WHEN 2 THEN 'Executor de Sistemas'
        WHEN 3 THEN 'Estrategista em I.A.'
        ELSE 'Sem patente'
      END;
      v_result.is_new_patent := false;
      RETURN v_result;
    END IF;
  END IF;

  IF p_event_type = 'lesson_completed' THEN
    v_xp_delta := 40;
    v_coins_delta := 10;

  ELSIF p_event_type = 'journey_completed' THEN
    v_xp_delta := 120;
    v_coins_delta := 25;

  ELSIF p_event_type = 'quiz_answered' THEN
    v_correct := COALESCE((p_payload->>'correctAnswers')::INTEGER, 0);
    v_total := COALESCE((p_payload->>'totalQuestions')::INTEGER, 0);

    IF v_total > 0 AND v_correct::NUMERIC >= v_total::NUMERIC * 0.8 THEN
      v_xp_delta := 50;
      v_coins_delta := 5;
    ELSE
      v_xp_delta := 20;
      v_coins_delta := 0;
    END IF;

  ELSIF p_event_type = 'insight_claimed' THEN
    v_xp_delta := 10;
    v_coins_delta := COALESCE((p_payload->>'credits')::INTEGER, 10);

  ELSE
    RAISE EXCEPTION 'Unknown event_type: %', p_event_type;
  END IF;

  SELECT patent_level INTO v_old_patent
  FROM public.users
  WHERE id = v_user_id;

  UPDATE public.users
  SET
    power_score = power_score + v_xp_delta,
    coins = coins + v_coins_delta,
    total_points = total_points + v_xp_delta,
    gamification_updated_at = NOW()
  WHERE id = v_user_id
  RETURNING power_score, coins, patent_level
  INTO v_power_score, v_coins, v_new_patent;

  IF v_power_score < 200 THEN
    v_new_patent := 0;
  ELSIF v_power_score < 600 THEN
    v_new_patent := 1;
  ELSIF v_power_score < 1200 THEN
    v_new_patent := 2;
  ELSE
    v_new_patent := 3;
  END IF;

  IF v_new_patent != v_old_patent THEN
    UPDATE public.users SET patent_level = v_new_patent WHERE id = v_user_id;
    v_is_new_patent := true;
  END IF;

  v_patent_name := CASE v_new_patent
    WHEN 0 THEN 'Sem patente'
    WHEN 1 THEN 'Operador Básico de I.A.'
    WHEN 2 THEN 'Executor de Sistemas'
    WHEN 3 THEN 'Estrategista em I.A.'
    ELSE 'Sem patente'
  END;

  INSERT INTO public.user_gamification_events (
    user_id, event_type, event_reference_id, payload, xp_delta, coins_delta
  ) VALUES (
    v_user_id, p_event_type, p_event_reference_id, p_payload, v_xp_delta, v_coins_delta
  );

  v_result.xp_delta := v_xp_delta;
  v_result.coins_delta := v_coins_delta;
  v_result.new_power_score := v_power_score;
  v_result.new_coins := v_coins;
  v_result.new_patent_level := v_new_patent;
  v_result.patent_name := v_patent_name;
  v_result.is_new_patent := v_is_new_patent;

  RETURN v_result;
END;
$function$;

-- 2. Add UNIQUE partial index for idempotency protection
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamification_user_event_ref 
ON public.user_gamification_events (user_id, event_type, event_reference_id) 
WHERE event_reference_id IS NOT NULL;
