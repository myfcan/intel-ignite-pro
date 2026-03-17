
ALTER TABLE public.v10_lessons
ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
