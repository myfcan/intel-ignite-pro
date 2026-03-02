UPDATE lessons
SET content = jsonb_set(
  content,
  '{sections,0,imageUrl}',
  to_jsonb('https://pspvppymcdjbwsudxzdx.supabase.co/storage/v1/object/public/lesson-audios/v8-images/92da570a-32c0-4df0-ac24-be6de43e3e0f/section-0.png?t=' || extract(epoch from now())::bigint::text)
)
WHERE id = '92da570a-32c0-4df0-ac24-be6de43e3e0f';