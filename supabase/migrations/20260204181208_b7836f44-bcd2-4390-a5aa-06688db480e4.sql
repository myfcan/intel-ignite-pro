-- C05.3 FIX: Corrigir tipo de run_id na função
-- O campo run_id em pipeline_executions é TEXT, não UUID
DROP FUNCTION IF EXISTS public.c05_compute_content_hash(uuid);

CREATE OR REPLACE FUNCTION public.c05_compute_content_hash(p_run_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_content jsonb;
  v_hash text;
BEGIN
  -- Buscar content do output_data
  SELECT output_data->'content' INTO v_content
  FROM pipeline_executions
  WHERE run_id = p_run_id;
  
  IF v_content IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calcular hash usando a mesma função canônica usada na verificação
  v_hash := encode(extensions.digest(
    convert_to(public.canonical_jsonb_string(v_content), 'utf8'),
    'sha256'
  ), 'hex');
  
  -- Atualizar o hash na tabela
  UPDATE pipeline_executions
  SET output_content_hash = v_hash
  WHERE run_id = p_run_id;
  
  RETURN v_hash;
END;
$$;

COMMENT ON FUNCTION public.c05_compute_content_hash(text) IS 'C05.3: Computes SHA-256 hash of output_data.content using canonical_jsonb_string - ensures deterministic parity by calculating in PostgreSQL';