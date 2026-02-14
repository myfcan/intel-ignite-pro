
-- 1. Create courses table
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trail_id uuid NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  title varchar NOT NULL,
  description text,
  icon varchar,
  order_index integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 3. RLS: public read for active courses
CREATE POLICY "Anyone can view active courses"
ON public.courses
FOR SELECT
USING (is_active = true);

-- 4. RLS: admins manage all
CREATE POLICY "admins_manage_all_courses"
ON public.courses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Add course_id to lessons (nullable, FK)
ALTER TABLE public.lessons
ADD COLUMN course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL;

-- 6. Create initial courses (1 per trail) and assign lessons
-- Fundamentos IA
INSERT INTO public.courses (id, trail_id, title, description, icon, order_index)
VALUES ('a1b2c3d4-0001-4000-8000-000000000001', 'efa0c22c-26fb-44d2-b1dc-721724ca5c5b', 'Fundamentos da IA', 'O ponto de partida para dominar a IA do zero.', 'Brain', 1);

UPDATE public.lessons SET course_id = 'a1b2c3d4-0001-4000-8000-000000000001' WHERE trail_id = 'efa0c22c-26fb-44d2-b1dc-721724ca5c5b';

-- Domando as IAs nos Negócios
INSERT INTO public.courses (id, trail_id, title, description, icon, order_index)
VALUES ('a1b2c3d4-0002-4000-8000-000000000002', '2d63e929-1485-438e-8c71-5c44a793dc63', 'Domando as IAs nos Negócios', 'Transforme qualquer negócio em uma máquina de resultados.', 'Zap', 1);

UPDATE public.lessons SET course_id = 'a1b2c3d4-0002-4000-8000-000000000002' WHERE trail_id = '2d63e929-1485-438e-8c71-5c44a793dc63';

-- Dominando Copyright Com IA
INSERT INTO public.courses (id, trail_id, title, description, icon, order_index)
VALUES ('a1b2c3d4-0003-4000-8000-000000000003', '98b15941-0cb9-43b4-b76f-ee9bae6319dc', 'Dominando Copyright Com IA', 'Crie conteúdos que vendem usando IA como arma secreta.', 'Target', 1);

UPDATE public.lessons SET course_id = 'a1b2c3d4-0003-4000-8000-000000000003' WHERE trail_id = '98b15941-0cb9-43b4-b76f-ee9bae6319dc';

-- Renda Extra com IA
INSERT INTO public.courses (id, trail_id, title, description, icon, order_index)
VALUES ('a1b2c3d4-0004-4000-8000-000000000004', '439b0b03-108f-4fa9-9745-a0f7c9874166', 'Renda Extra com IA', 'Fature com o poder da IA.', 'Rocket', 1);

UPDATE public.lessons SET course_id = 'a1b2c3d4-0004-4000-8000-000000000004' WHERE trail_id = '439b0b03-108f-4fa9-9745-a0f7c9874166';

-- IA para Profissionais
INSERT INTO public.courses (id, trail_id, title, description, icon, order_index)
VALUES ('a1b2c3d4-0005-4000-8000-000000000005', '3977a279-a916-47e4-8ce5-e4474cfbd021', 'IA para Profissionais', 'Escale seus serviços e conquiste mais clientes.', 'TrendingUp', 1);

UPDATE public.lessons SET course_id = 'a1b2c3d4-0005-4000-8000-000000000005' WHERE trail_id = '3977a279-a916-47e4-8ce5-e4474cfbd021';

-- 7. Index for performance
CREATE INDEX idx_courses_trail_id ON public.courses(trail_id);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
