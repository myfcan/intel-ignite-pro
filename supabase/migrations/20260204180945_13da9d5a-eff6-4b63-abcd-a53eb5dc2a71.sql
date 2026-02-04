-- C05.3: RPC para calcular hash de forma determinística no banco
-- Isso elimina qualquer divergência entre JavaScript e PostgreSQL
CREATE OR REPLACE FUNCTION public.c05_compute_content_hash(p_run_id uuid)
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
  WHERE run_id = p_run_id::text;
  
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
  WHERE run_id = p_run_id::text;
  
  RETURN v_hash;
END;
$$;

COMMENT ON FUNCTION public.c05_compute_content_hash(uuid) IS 'C05.3: Computes SHA-256 hash of output_data.content using canonical_jsonb_string - ensures deterministic parity by calculating in PostgreSQL';