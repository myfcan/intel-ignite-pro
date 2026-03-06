UPDATE public.lessons
SET content = jsonb_set(
  content::jsonb,
  '{inlineInsights,0,insightText}',
  '"Dica de ouro: quando precisar de algo específico, inclua no prompt quem você é, o que precisa e em qual formato. Essa fórmula simples transforma qualquer resposta genérica em algo diretamente aplicável ao seu dia a dia."'::jsonb
)
WHERE id = '0638b200-0fd6-4534-8141-f4e3c5c08c2a';