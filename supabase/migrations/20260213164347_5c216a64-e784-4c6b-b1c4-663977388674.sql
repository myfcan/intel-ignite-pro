
-- =============================================
-- AI Image Lab v0 — Fase 0 + Fase 1
-- 4 tabelas + 1 bucket + 1 view + seed + RLS
-- =============================================

-- 1.1 image_presets
CREATE TABLE public.image_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  version text NOT NULL,
  title text NOT NULL,
  prompt_template text NOT NULL,
  default_size text NOT NULL DEFAULT '1024x1024',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT image_presets_key_version_unique UNIQUE (key, version)
);

ALTER TABLE public.image_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_image_presets" ON public.image_presets
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "supervisors_select_image_presets" ON public.image_presets
  FOR SELECT USING (public.has_role(auth.uid(), 'supervisor'));

-- 1.2 image_jobs
CREATE TABLE public.image_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  status text NOT NULL DEFAULT 'queued',
  preset_id uuid NOT NULL REFERENCES public.image_presets(id),
  preset_key text,
  preset_version text,
  provider text NOT NULL DEFAULT 'openai',
  model text NOT NULL DEFAULT 'gpt-image-1',
  size text NOT NULL DEFAULT '1024x1024',
  n integer NOT NULL DEFAULT 1,
  prompt_base text,
  prompt_scene text NOT NULL,
  prompt_final text,
  hash text,
  cache_hit boolean NOT NULL DEFAULT false,
  approved_asset_id uuid,
  latency_ms integer,
  error_code text,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_image_jobs_status_created ON public.image_jobs (status, created_at DESC);

ALTER TABLE public.image_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_image_jobs" ON public.image_jobs
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "supervisors_select_image_jobs" ON public.image_jobs
  FOR SELECT USING (public.has_role(auth.uid(), 'supervisor'));

CREATE POLICY "supervisors_insert_image_jobs" ON public.image_jobs
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'supervisor'));

-- 1.3 image_attempts
CREATE TABLE public.image_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.image_jobs(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  prompt_final text NOT NULL,
  latency_ms integer,
  cost_estimate numeric,
  error_code text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_image_attempts_job ON public.image_attempts (job_id, created_at DESC);

ALTER TABLE public.image_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_image_attempts" ON public.image_attempts
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "supervisors_select_image_attempts" ON public.image_attempts
  FOR SELECT USING (public.has_role(auth.uid(), 'supervisor'));

CREATE POLICY "supervisors_insert_image_attempts" ON public.image_attempts
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'supervisor'));

-- 1.4 image_assets
CREATE TABLE public.image_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.image_jobs(id) ON DELETE CASCADE,
  attempt_id uuid NOT NULL REFERENCES public.image_attempts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'completed',
  variation_index integer NOT NULL DEFAULT 0,
  storage_bucket text NOT NULL DEFAULT 'image-lab',
  storage_path text NOT NULL,
  public_url text,
  mime_type text NOT NULL DEFAULT 'image/png',
  width integer NOT NULL,
  height integer NOT NULL,
  sha256_bytes text,
  hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_image_assets_hash ON public.image_assets (hash);
CREATE INDEX idx_image_assets_status_created ON public.image_assets (status, created_at DESC);

ALTER TABLE public.image_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_image_assets" ON public.image_assets
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "supervisors_select_image_assets" ON public.image_assets
  FOR SELECT USING (public.has_role(auth.uid(), 'supervisor'));

-- FK from image_jobs.approved_asset_id -> image_assets.id (deferred because of circular dependency)
ALTER TABLE public.image_jobs
  ADD CONSTRAINT fk_image_jobs_approved_asset
  FOREIGN KEY (approved_asset_id) REFERENCES public.image_assets(id);

-- 1.5 Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('image-lab', 'image-lab', true);

-- Storage RLS: admin upload, public read
CREATE POLICY "admin_upload_image_lab" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'image-lab' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_image_lab" ON storage.objects
  FOR UPDATE USING (bucket_id = 'image-lab' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_image_lab" ON storage.objects
  FOR DELETE USING (bucket_id = 'image-lab' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public_read_image_lab" ON storage.objects
  FOR SELECT USING (bucket_id = 'image-lab');

-- Supervisor can also upload (they can generate)
CREATE POLICY "supervisor_upload_image_lab" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'image-lab' AND public.has_role(auth.uid(), 'supervisor'));

-- 1.6 KPI View
CREATE OR REPLACE VIEW public.image_lab_kpis_last_7d AS
WITH recent_jobs AS (
  SELECT * FROM public.image_jobs WHERE created_at >= now() - interval '7 days'
),
recent_attempts AS (
  SELECT a.* FROM public.image_attempts a
  JOIN recent_jobs j ON a.job_id = j.id
),
approved_jobs AS (
  SELECT j.id, COUNT(a.id) as attempt_count
  FROM recent_jobs j
  JOIN public.image_attempts a ON a.job_id = j.id
  WHERE j.status = 'approved'
  GROUP BY j.id
),
first_pass AS (
  SELECT j.id FROM recent_jobs j
  WHERE j.status = 'approved'
  AND (SELECT COUNT(*) FROM public.image_attempts a WHERE a.job_id = j.id) = 1
)
SELECT
  (SELECT COUNT(*) FROM recent_jobs)::bigint AS total_jobs,
  (SELECT COUNT(*) FROM recent_attempts)::bigint AS total_attempts,
  CASE WHEN (SELECT COUNT(*) FROM approved_jobs) > 0
    THEN ROUND((SELECT COUNT(*) FROM first_pass)::numeric / (SELECT COUNT(*) FROM approved_jobs)::numeric * 100, 1)
    ELSE 0 END AS first_pass_accept_rate,
  CASE WHEN (SELECT COUNT(*) FROM approved_jobs) > 0
    THEN ROUND((SELECT AVG(attempt_count) FROM approved_jobs), 1)
    ELSE 0 END AS avg_attempts_per_approved,
  CASE WHEN (SELECT COUNT(*) FROM recent_attempts WHERE provider = 'openai') > 0
    THEN ROUND((SELECT COUNT(*) FROM recent_attempts WHERE provider = 'openai' AND status = 'failed')::numeric / NULLIF((SELECT COUNT(*) FROM recent_attempts WHERE provider = 'openai'), 0)::numeric * 100, 1)
    ELSE 0 END AS fail_rate_openai,
  CASE WHEN (SELECT COUNT(*) FROM recent_attempts WHERE provider = 'gemini') > 0
    THEN ROUND((SELECT COUNT(*) FROM recent_attempts WHERE provider = 'gemini' AND status = 'failed')::numeric / NULLIF((SELECT COUNT(*) FROM recent_attempts WHERE provider = 'gemini'), 0)::numeric * 100, 1)
    ELSE 0 END AS fail_rate_gemini,
  COALESCE((SELECT ROUND(AVG(latency_ms)) FROM recent_attempts WHERE provider = 'openai' AND status = 'completed'), 0)::bigint AS avg_latency_openai,
  COALESCE((SELECT ROUND(AVG(latency_ms)) FROM recent_attempts WHERE provider = 'gemini' AND status = 'completed'), 0)::bigint AS avg_latency_gemini;

-- 1.7 Seed preset
INSERT INTO public.image_presets (key, version, title, prompt_template, default_size)
VALUES (
  'cinematic-01',
  '1.0',
  'Cinematic Still Frame',
  'Cinematic still frame, high realism, natural lighting, shallow depth of field, 35mm lens look, clean composition, no text, no watermarks. Scene: {{SCENE}}. {{STYLE_HINTS}}',
  '1536x1024'
);

-- updated_at trigger for image_jobs
CREATE TRIGGER update_image_jobs_updated_at
  BEFORE UPDATE ON public.image_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
