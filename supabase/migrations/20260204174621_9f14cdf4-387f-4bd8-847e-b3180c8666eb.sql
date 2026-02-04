-- C05.3 FIX: Atualizar canonical_jsonb_string para normalizar números como JavaScript
-- JavaScript JSON.stringify(1.0) = '1', mas PostgreSQL jsonb mantém 1.0
-- Precisamos normalizar para garantir paridade de hash

CREATE OR REPLACE FUNCTION public.canonical_jsonb_string(input_jsonb jsonb)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result text;
  key text;
  val jsonb;
  arr_elem jsonb;
  pairs text[];
  arr_parts text[];
  json_type text;
  num_val numeric;
  num_text text;
BEGIN
  json_type := jsonb_typeof(input_jsonb);
  
  IF input_jsonb IS NULL THEN
    RETURN 'null';
  ELSIF json_type = 'null' THEN
    RETURN 'null';
  ELSIF json_type = 'boolean' THEN
    RETURN input_jsonb::text;
  ELSIF json_type = 'number' THEN
    -- C05.3 FIX: Normalizar números para corresponder a JavaScript JSON.stringify
    -- JavaScript: 1.0 → '1', 1.5 → '1.5', 0.05 → '0.05'
    -- PostgreSQL jsonb::text mantém 1.0, precisamos normalizar
    num_val := input_jsonb::numeric;
    
    -- Se o número é inteiro (sem parte decimal), remover .0
    IF num_val = trunc(num_val) THEN
      RETURN trunc(num_val)::text;
    ELSE
      -- Manter decimais, mas remover trailing zeros desnecessários
      -- rtrim não funciona bem aqui, usar cast para double precision
      RETURN rtrim(rtrim(num_val::text, '0'), '.');
    END IF;
  ELSIF json_type = 'string' THEN
    RETURN input_jsonb::text;
  ELSIF json_type = 'array' THEN
    arr_parts := ARRAY[]::text[];
    FOR arr_elem IN SELECT jsonb_array_elements(input_jsonb)
    LOOP
      arr_parts := array_append(arr_parts, canonical_jsonb_string(arr_elem));
    END LOOP;
    RETURN '[' || array_to_string(arr_parts, ',') || ']';
  ELSIF json_type = 'object' THEN
    pairs := ARRAY[]::text[];
    FOR key, val IN SELECT * FROM jsonb_each(input_jsonb) ORDER BY key
    LOOP
      pairs := array_append(pairs, '"' || key || '":' || canonical_jsonb_string(val));
    END LOOP;
    RETURN '{' || array_to_string(pairs, ',') || '}';
  ELSE
    RETURN 'null';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.canonical_jsonb_string(jsonb) IS 'C05.3: Creates canonical JSON string with keys sorted alphabetically and numbers normalized to match JavaScript JSON.stringify for deterministic SHA-256 hashing';