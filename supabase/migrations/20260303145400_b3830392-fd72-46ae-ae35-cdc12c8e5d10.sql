ALTER TABLE public.user_gamification_events DROP CONSTRAINT user_gamification_events_event_type_check;

ALTER TABLE public.user_gamification_events ADD CONSTRAINT user_gamification_events_event_type_check CHECK (event_type = ANY (ARRAY['lesson_completed'::text, 'journey_completed'::text, 'quiz_answered'::text, 'insight_claimed'::text]));