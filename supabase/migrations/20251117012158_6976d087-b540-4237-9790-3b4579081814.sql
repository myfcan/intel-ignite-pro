-- Adicionar realConfig completo ao playgroundConfig da lição
-- Corrige lição criada antes do step 5.5 do pipeline

UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections,0,playgroundConfig}',
  '{
    "type": "real-playground",
    "instruction": "Peça para a Liv te ajudar com algo do seu dia a dia!",
    "realConfig": {
      "title": "Hora da Prática! 🚀",
      "maiaMessage": "Peça para a Liv te ajudar com algo do seu dia a dia!",
      "scenario": {
        "title": "Desafio Prático",
        "description": "Peça para a Liv te ajudar com algo do seu dia a dia!"
      },
      "prefilledText": "",
      "userPlaceholder": "Digite seu prompt aqui... 💭",
      "validation": {
        "minLength": 20,
        "requiredKeywords": [],
        "feedback": {
          "tooShort": "⚠️ Seu prompt precisa ter pelo menos 20 caracteres. Tente ser mais específico!",
          "good": "✅ Bom trabalho! Seu prompt está bem estruturado.",
          "excellent": "🎉 Excelente! Você dominou a técnica de criar prompts eficazes!"
        }
      }
    }
  }'::jsonb
)
WHERE id = 'a9c76e57-90cf-4644-a723-b4ee963eb85f';