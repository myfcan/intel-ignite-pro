
UPDATE public.lessons
SET content = jsonb_set(
  content::jsonb,
  '{inlineExercises,0}',
  '{
    "id": "inline-ex-00",
    "type": "multiple-choice",
    "afterSectionIndex": 2,
    "title": "Teste rápido: respostas genéricas",
    "instruction": "Selecione a alternativa correta.",
    "successMessage": "Exato! Sem contexto como bairro ou horário, o GPT recorre ao padrão mais seguro: uma lista genérica de opções que tenta servir a todos.",
    "tryAgainMessage": "Pense no que aprendemos: sem direção clara, o GPT escolhe a resposta mais estatisticamente segura — ampla e genérica.",
    "data": {
      "question": "Ao perguntar apenas \"Onde pedir uma pizza?\", qual tipo de resposta o GPT provavelmente vai gerar?",
      "options": [
        {"id": "mc-1", "text": "Uma lista genérica de dicas sobre como escolher pizzarias", "isCorrect": true},
        {"id": "mc-2", "text": "O endereço exato da pizzaria mais próxima de você", "isCorrect": false},
        {"id": "mc-3", "text": "Uma receita de pizza caseira passo a passo", "isCorrect": false}
      ],
      "explanation": "Como o prompt não especifica cidade, bairro, horário ou preferência, o GPT não tem contexto para ser específico. Ele recorre ao padrão mais seguro: dicas genéricas que sirvam para qualquer pessoa."
    }
  }'::jsonb
)
WHERE id = '0638b200-0fd6-4534-8141-f4e3c5c08c2a'
