-- Fix security issue: Remove public access to claude_cache table
-- Only edge functions with service_role_key should access this table

-- Drop the permissive policy that allows public access
DROP POLICY IF EXISTS "System can manage cache" ON public.claude_cache;

-- No new policies needed - only service_role_key (used by edge functions) can access
-- This prevents users from reading other users' AI conversation history