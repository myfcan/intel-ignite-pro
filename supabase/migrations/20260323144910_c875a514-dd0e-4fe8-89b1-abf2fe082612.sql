
-- Step 4: Inject tooltip_term "Conta Profissional" into frame 0
UPDATE v10_lesson_steps
SET frames = jsonb_set(
  frames,
  '{0,elements}',
  (frames->0->'elements') || '[{"type":"tooltip_term","term":"Conta Profissional","tip":"Tipo de conta do Instagram que permite usar ferramentas externas como agendadores de posts e acessar métricas de alcance."}]'::jsonb
)
WHERE id = 'a9438c1d-0190-4ff3-aa27-160c04f74d82';

-- Step 11: Inject tooltip_term "Integração" into frame 0
UPDATE v10_lesson_steps
SET frames = jsonb_set(
  frames,
  '{0,elements}',
  (frames->0->'elements') || '[{"type":"tooltip_term","term":"Integração","tip":"Conexão entre duas ferramentas que permite trocar dados automaticamente, como o Claude acessando o Post Bridge."}]'::jsonb
)
WHERE id = '5c49ca08-61c0-4ddf-949c-24afec456813';

-- Step 17: Inject tooltip_term "CTA" into frame 0
UPDATE v10_lesson_steps
SET frames = jsonb_set(
  frames,
  '{0,elements}',
  (frames->0->'elements') || '[{"type":"tooltip_term","term":"CTA","tip":"Call to Action — chamada para ação que convida o seguidor a tomar uma atitude, como clicar num link ou enviar mensagem."}]'::jsonb
)
WHERE id = '0bc16bd1-f364-47aa-a527-547c624a518b';
