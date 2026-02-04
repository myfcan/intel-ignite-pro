-- C05.2: Function to create canonical JSON string for hash verification
-- Matches the JavaScript canonicalStringify function (keys sorted alphabetically)
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
BEGIN
  json_type := jsonb_typeof(input_jsonb);
  
  IF input_jsonb IS NULL THEN
    RETURN 'null';
  ELSIF json_type = 'null' THEN
    RETURN 'null';
  ELSIF json_type = 'boolean' THEN
    RETURN input_jsonb::text;
  ELSIF json_type = 'number' THEN
    RETURN input_jsonb::text;
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

COMMENT ON FUNCTION public.canonical_jsonb_string(jsonb) IS 'C05.2: Creates canonical JSON string with keys sorted alphabetically, matching JavaScript canonicalStringify for deterministic SHA-256 hashing';