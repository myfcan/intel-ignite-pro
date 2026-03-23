UPDATE v10_lesson_steps SET description = 'Imagem visual que acompanha o post da segunda-feira.' WHERE id = 'bff2e216-148c-4c91-8c8a-3bae915082fd';
UPDATE v10_lesson_steps SET description = 'Quatro imagens restantes para os posts de terça a sexta.' WHERE id = '9e2b2cd6-d468-4cc4-ae96-ea8124517040';
UPDATE v10_lesson_steps SET description = 'Confirmar que o agendamento está correto no Post Bridge.' WHERE id = '225c119b-90c2-428f-a817-17dcade87f02';
UPDATE v10_lesson_steps SET description = 'Toda a semana está agendada e confirmada para publicação.' WHERE id = 'b2ee7c30-c928-412a-a3d2-807519c7b17c';
UPDATE v10_lesson_steps SET description = 'Expandir a automação para LinkedIn, TikTok e Facebook.' WHERE id = '0c8cd967-2d31-4161-804d-64da6b75aab2';
UPDATE v10_lesson_steps SET description = 'Parabéns! Você completou a automação da semana de posts.' WHERE id = '62d47b2f-3915-4af9-8e12-5b898fe5f7ba';
UPDATE v10_bpa_pipeline SET assembly_passed = true, assembly_checklist = jsonb_set(assembly_checklist::jsonb, '{structure_ok}', 'true') WHERE id = '853e2fda-01ff-462c-b325-e75e0574b337';