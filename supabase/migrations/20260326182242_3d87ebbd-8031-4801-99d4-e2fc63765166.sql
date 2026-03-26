
UPDATE public.lessons 
SET content = jsonb_set(
  content,
  '{inlineExercises}',
  '[
    {
      "id": "inline-ex-01",
      "afterSectionIndex": 1,
      "type": "multiple-choice",
      "title": "Sem critério, o GPT tende a…",
      "instruction": "Com base na seção anterior, qual é o comportamento padrão do GPT sem critério?",
      "data": {
        "question": "Quando você pede algo ao GPT sem definir critérios de qualidade, o que normalmente acontece?",
        "options": [
          {"id": "a", "text": "Ele responde no seguro, com texto genérico e neutro", "isCorrect": true},
          {"id": "b", "text": "Ele pede mais contexto antes de responder", "isCorrect": false},
          {"id": "c", "text": "Ele recusa a tarefa por falta de informação", "isCorrect": false},
          {"id": "d", "text": "Ele entrega algo curto e incompleto", "isCorrect": false}
        ],
        "explanation": "Sem critério claro, o GPT compensa com volume e neutralidade — texto educado, bonito, mas vazio de ação."
      },
      "successMessage": "Exato! Sem critério, ele joga no seguro com texto genérico.",
      "tryAgainMessage": "Revise a seção — o ponto é que sem critério, ele compensa com neutralidade."
    },
    {
      "id": "inline-ex-02",
      "afterSectionIndex": 3,
      "type": "flipcard-quiz",
      "title": "Qual critério é esse?",
      "instruction": "Vire cada card e identifique qual critério ele representa.",
      "data": {
        "cards": [
          {
            "id": "card-1",
            "front": {"label": "Clareza", "icon": "Target", "color": "cyan"},
            "back": {"text": "Qual opção melhor define CLAREZA?"},
            "options": [
              {"id": "o1", "text": "Dá pra entender em uma leitura, sem adivinhar", "isCorrect": true},
              {"id": "o2", "text": "O texto termina com um próximo passo", "isCorrect": false}
            ],
            "explanation": "Clareza = a pessoa entende o que você quer sem precisar perguntar de novo."
          },
          {
            "id": "card-2",
            "front": {"label": "Ação", "icon": "ArrowRight", "color": "emerald"},
            "back": {"text": "Qual opção melhor define AÇÃO?"},
            "options": [
              {"id": "o1", "text": "O texto tem um próximo passo explícito", "isCorrect": true},
              {"id": "o2", "text": "O tom é adequado à situação", "isCorrect": false}
            ],
            "explanation": "Ação = o leitor sabe exatamente o que fazer depois de ler."
          },
          {
            "id": "card-3",
            "front": {"label": "Adequação", "icon": "ThumbsUp", "color": "amber"},
            "back": {"text": "Qual opção melhor define ADEQUAÇÃO?"},
            "options": [
              {"id": "o1", "text": "O tom combina com a situação e o destinatário", "isCorrect": true},
              {"id": "o2", "text": "O texto é curto e objetivo", "isCorrect": false}
            ],
            "explanation": "Adequação = o tom certo para a pessoa e o contexto."
          }
        ]
      },
      "successMessage": "Perfeito! Clareza, Ação e Adequação — o trio que transforma qualquer resposta.",
      "tryAgainMessage": "Revise os 3 critérios: Clareza (entende?), Ação (sabe o que fazer?), Adequação (tom certo?)."
    },
    {
      "id": "inline-ex-03",
      "afterSectionIndex": 5,
      "type": "true-false",
      "title": "Verdadeiro ou falso sobre auto-revisão",
      "instruction": "Avalie cada afirmação sobre a técnica de auto-revisão do GPT.",
      "data": {
        "statements": [
          {
            "id": "s1",
            "text": "Pedir ao GPT que revise a própria resposta com critérios melhora a qualidade final.",
            "correct": true,
            "explanation": "Sim! Forçar a revisão com rubrica faz o GPT sair do modo automático e entrar no modo qualidade."
          },
          {
            "id": "s2",
            "text": "A auto-revisão funciona melhor quando você NÃO define os critérios — deixe o GPT escolher.",
            "correct": false,
            "explanation": "Não. Você precisa definir os critérios (clareza, ação, tom). Sem eles, a revisão vira cosmética."
          },
          {
            "id": "s3",
            "text": "Mostrar o antes e depois ajuda você a enxergar a melhoria e aprender junto.",
            "correct": true,
            "explanation": "Exato! O antes/depois torna a melhoria visível e te ensina a escrever melhor."
          }
        ],
        "feedback": {
          "perfect": "Perfeito! Você dominou a lógica da auto-revisão.",
          "good": "Bom trabalho! Quase tudo certo.",
          "needsReview": "Revise a seção — o ponto-chave é: critério definido por você, revisão feita pelo GPT."
        }
      },
      "successMessage": "Excelente! Você entendeu a mecânica da auto-revisão com critérios.",
      "tryAgainMessage": "Revise: o segredo é dar critérios claros e pedir revisão com antes/depois."
    },
    {
      "id": "inline-ex-04",
      "afterSectionIndex": 7,
      "type": "platform-match",
      "title": "Formato certo para cada objetivo",
      "instruction": "Arraste cada situação para o formato de critério mais adequado.",
      "data": {
        "scenarios": [
          {"id": "sc1", "text": "Garantir que nada ficou faltando no texto", "correctPlatform": "checklist", "emoji": "✅"},
          {"id": "sc2", "text": "Melhorar a qualidade de uma resposta de 0 a 10", "correctPlatform": "rubrica", "emoji": "📊"},
          {"id": "sc3", "text": "Comparar duas versões e escolher a melhor", "correctPlatform": "tabela", "emoji": "⚖️"}
        ],
        "platforms": [
          {"id": "checklist", "name": "Checklist", "icon": "✅", "color": "#16A34A"},
          {"id": "rubrica", "name": "Rubrica (0-10)", "icon": "📊", "color": "#4F46E5"},
          {"id": "tabela", "name": "Tabela Comparativa", "icon": "⚖️", "color": "#D97706"}
        ]
      },
      "successMessage": "Perfeito! Cada formato tem seu uso: checklist=presença, rubrica=qualidade, tabela=comparação.",
      "tryAgainMessage": "Revise: Checklist = nada faltando, Rubrica = nota de qualidade, Tabela = comparar versões."
    }
  ]'::jsonb
)
WHERE id = 'd68c8c04-4e5a-46e9-ad6f-18db0878b742';
