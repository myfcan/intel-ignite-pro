
-- Create lesson_ratings table
CREATE TABLE public.lesson_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_ratings ENABLE ROW LEVEL SECURITY;

-- Validation trigger instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_lesson_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_lesson_rating
  BEFORE INSERT OR UPDATE ON public.lesson_ratings
  FOR EACH ROW EXECUTE FUNCTION public.validate_lesson_rating();

-- RLS: Users can insert own ratings
CREATE POLICY "users_insert_own_ratings"
  ON public.lesson_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can view own ratings
CREATE POLICY "users_view_own_ratings"
  ON public.lesson_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS: Users can update own ratings
CREATE POLICY "users_update_own_ratings"
  ON public.lesson_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS: Admins manage all
CREATE POLICY "admins_manage_all_ratings"
  ON public.lesson_ratings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: Public SELECT for conversion funnels (anon can read aggregated ratings)
CREATE POLICY "public_read_ratings"
  ON public.lesson_ratings FOR SELECT
  TO anon
  USING (true);
