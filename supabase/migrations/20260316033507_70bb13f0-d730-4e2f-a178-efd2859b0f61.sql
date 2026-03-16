ALTER TABLE v10_lesson_intro_slides
  ADD CONSTRAINT v10_lesson_intro_slides_lesson_id_slide_order_key
  UNIQUE (lesson_id, slide_order);