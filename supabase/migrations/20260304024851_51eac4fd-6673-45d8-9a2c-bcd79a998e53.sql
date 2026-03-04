-- Phase 4: Update register_gamification_event to validate playground score before crediting insight XP
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
  v_pg_score INTEGER;
  v_pg_is_copy BOOLEAN;
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
    -- Phase 4: Validate playground score before awarding XP
    -- Check if playground_id is provided in payload
    IF p_payload->>'playground_id' IS NOT NULL AND (p_payload->>'playground_id') != '' THEN
      SELECT score, is_copy
      INTO v_pg_score, v_pg_is_copy
      FROM public.user_playground_sessions
      WHERE user_id = v_user_id
        AND playground_id = (p_payload->>'playground_id')
      ORDER BY created_at DESC
      LIMIT 1;

      -- If we found a session: validate score >= 81 and not a copy
      IF v_pg_score IS NOT NULL THEN
        IF v_pg_score < 81 OR v_pg_is_copy = true THEN
          -- Block XP: score too low or copy detected
          v_xp_delta := 0;
          v_coins_delta := 0;
          
          -- Still record the event (idempotency) but with 0 deltas
          SELECT patent_level INTO v_old_patent FROM public.users WHERE id = v_user_id;
          SELECT power_score, coins, patent_level INTO v_power_score, v_coins, v_new_patent
          FROM public.users WHERE id = v_user_id;

          INSERT INTO public.user_gamification_events (
            user_id, event_type, event_reference_id, payload, xp_delta, coins_delta
          ) VALUES (
            v_user_id, p_event_type, p_event_reference_id, p_payload, 0, 0
          );

          v_result.xp_delta := 0;
          v_result.coins_delta := 0;
          v_result.new_power_score := v_power_score;
          v_result.new_coins := v_coins;
          v_result.new_patent_level := v_new_patent;
          v_result.patent_name := CASE v_new_patent
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
      -- If no session found, allow claim (backward compat with old lessons)
    END IF;

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
