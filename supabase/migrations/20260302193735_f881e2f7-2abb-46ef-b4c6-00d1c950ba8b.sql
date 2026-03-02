CREATE TABLE public.lesson_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id text NOT NULL,
  category text NOT NULL,
  details text,
  page_context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lesson_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own_reports" ON public.lesson_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_view_own_reports" ON public.lesson_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins_manage_all_reports" ON public.lesson_reports
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));