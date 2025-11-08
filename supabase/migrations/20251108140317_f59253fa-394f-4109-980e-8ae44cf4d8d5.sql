-- Insert lesson 3: As 3 Ferramentas de IA que Você Precisa Conhecer
INSERT INTO lessons (
  id,
  title,
  description,
  lesson_type,
  trail_id,
  order_index,
  content,
  is_active,
  difficulty_level,
  estimated_time,
  passing_score
) VALUES (
  '33333333-3333-3333-3333-333333333303',
  'As 3 Ferramentas de IA que Você Precisa Conhecer',
  'Descubra as 3 principais ferramentas de IA (ChatGPT, Midjourney e Claude) e aprenda quando usar cada uma delas',
  'guided',
  'efa0c22c-26fb-44d2-b1dc-721724ca5c5b',
  3,
  '{"duration": 0, "contentVersion": 1}'::jsonb,
  true,
  'beginner',
  20,
  70
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;