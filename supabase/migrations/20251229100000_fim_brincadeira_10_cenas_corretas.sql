-- Migration: O Fim da Brincadeira com IA - 10 CENAS EXATAS DO ROTEIRO CINEMATOGRÁFICO
--
-- CENA 1: "98%" Hook - Explosão imediata do número
-- CENA 2: Brincadeira vs Resultado - Exemplos amadores
-- CENA 3: Os 2% e o dinheiro - R$ 30.000
-- CENA 4: Comparação 98% vs 2% - Divisão visual
-- CENA 5: Espelho/reflexão - Pausa com "brinquedo" -> Quiz
-- CENA 6: Quiz com 3 opções
-- CENA 7: Promessa do segredo - "O método"
-- CENA 8: Clique/transição - Revelação com "PERFEITO"
-- CENA 9: PERFEITO letra por letra
-- CENA 10: Playground - Comparação amador vs profissional

UPDATE lessons
SET
  content = '{
    "title": "O Fim da Brincadeira com IA",
    "subtitle": "98% brinca. 2% lucra com método.",
    "difficulty": "intermediate",
    "category": "prompts",
    "tags": ["prompts", "profissional", "ia", "metodo-perfeito"],
    "learningObjectives": [
      "Reconhecer o padrão de uso amador vs profissional de I.A.",
      "Tomar consciência do seu nível atual (98% vs 2%)",
      "Entender e memorizar o Método PERFEITO",
      "Testar, na prática, a diferença entre prompt amador e prompt profissional"
    ],
    "duration": 240,
    "generate_audio": true,
    "voice_id": "Xb7hH8MSUJpSbSDYk0k2",
    "narrativeScript": "Noventa e oito por cento. Das pessoas que usam inteligência artificial hoje tratam ela como brinquedo. Conta uma piada. Escreve como pirata. Faz um poema sobre meu gato. Enquanto isso, os outros dois por cento estão faturando trinta mil reais por mês. Eles conhecem o segredo. O método PERFEITO. Persona. Especificidade. Resultado. Formato. Exemplos. Instruções. Tom. Otimização. A diferença entre brincar e lucrar está no método. E você está prestes a dominá-lo. Aqueles que dominam o método transformam IA em ferramenta de trabalho real.",
    "cinematic_flow": {
      "timeline": {
        "totalDuration": 240
      },
      "acts": [
        {
          "id": "cena-1-hook-98",
          "type": "dramatic",
          "title": "98% - Explosão Imediata",
          "startTime": 0,
          "duration": 8,
          "narration": "Noventa e oito por cento.",
          "visual": {
            "type": "number-explosion",
            "mainValue": "98%",
            "animation": "scale-pulse",
            "showLetterboxInitial": false,
            "showNumberImmediate": true,
            "mood": "danger",
            "glow": true,
            "particles": {
              "enabled": true,
              "type": "ember",
              "intensity": 1.0
            }
          }
        },
        {
          "id": "cena-2-brincadeira",
          "type": "narrative",
          "title": "Brincadeira vs Resultado",
          "startTime": 8,
          "duration": 15,
          "narration": "Das pessoas que usam inteligência artificial hoje tratam ela como brinquedo. Conta uma piada. Escreve como pirata. Faz um poema sobre meu gato.",
          "anchorActions": [
            {
              "id": "pause-quiz-brinquedo",
              "keyword": "brinquedo",
              "type": "pause"
            }
          ],
          "visual": {
            "type": "list-reveal",
            "title": "O QUE OS 98% FAZEM",
            "subtitle": "tratam a IA como brinquedo",
            "highlightWord": "BRINQUEDO",
            "items": [
              {"icon": "🎭", "text": "Conta uma piada sobre banana"},
              {"icon": "🏴‍☠️", "text": "Escreve como pirata"},
              {"icon": "🐱", "text": "Faz um poema sobre meu gato"}
            ],
            "mood": "danger"
          }
        },
        {
          "id": "cena-3-dinheiro",
          "type": "dramatic",
          "title": "Os 2% e o Dinheiro",
          "startTime": 23,
          "duration": 12,
          "narration": "Enquanto isso, os outros dois por cento estão faturando trinta mil reais por mês.",
          "visual": {
            "type": "number-explosion",
            "mainValue": "R$ 30.000",
            "subtitle": "por mês",
            "highlightWord": "LUCRAM",
            "mood": "success",
            "animation": "count-up",
            "particles": {
              "enabled": true,
              "type": "gold",
              "intensity": 1.0
            }
          }
        },
        {
          "id": "cena-4-comparacao",
          "type": "comparison",
          "title": "98% vs 2%",
          "startTime": 35,
          "duration": 15,
          "narration": "",
          "visual": {
            "type": "split-comparison",
            "title": "A DIFERENÇA",
            "leftCard": {
              "label": "98%",
              "value": "R$ 0",
              "isPositive": false,
              "details": ["Usa IA como brinquedo", "Prompts genéricos", "Resultados mediocres"],
              "mood": "danger"
            },
            "rightCard": {
              "label": "2%",
              "value": "R$ 30K",
              "isPositive": true,
              "details": ["Usa IA como ferramenta", "Método estruturado", "Resultados extraordinários"],
              "mood": "success"
            }
          }
        },
        {
          "id": "cena-5-espelho",
          "type": "narrative",
          "title": "Espelho - Reflexão",
          "startTime": 50,
          "duration": 10,
          "narration": "",
          "visual": {
            "type": "reflection",
            "title": "E VOCÊ?",
            "subtitle": "Em qual grupo você está?",
            "mood": "neutral"
          }
        },
        {
          "id": "cena-6-quiz",
          "type": "interaction",
          "title": "Quiz - Auto-avaliação",
          "startTime": 60,
          "duration": 45,
          "narration": "",
          "visual": {
            "title": "TESTE RELÂMPAGO",
            "subtitle": "AUTO-AVALIAÇÃO"
          },
          "interaction": {
            "type": "quiz",
            "question": "Suas últimas 5 interações com IA foram para:",
            "revealButtonText": "REVELAR VERDADE",
            "options": [
              {"id": "opt-1", "text": "Criar conteúdo profissional", "category": "good", "isCorrect": true},
              {"id": "opt-2", "text": "Curiosidade e brincadeira", "category": "bad", "isCorrect": false},
              {"id": "opt-3", "text": "Não uso muito IA", "category": "bad", "isCorrect": false}
            ],
            "correctFeedback": "Você já pensa como os 2%. Agora vamos adicionar método.",
            "incorrectFeedback": "Sem problema. Em poucos minutos você vai virar a chave."
          },
          "contextualLoops": [
            {"triggerAfter": 7, "text": "Reflita com calma...", "volume": 0.4},
            {"triggerAfter": 15, "text": "Seja honesto consigo mesmo...", "volume": 0.35},
            {"triggerAfter": 25, "text": "Escolha a opção que mais te representa...", "volume": 0.3}
          ],
          "audioBehavior": {
            "onStart": "pause",
            "duringInteraction": {"mainVolume": 0, "ambientVolume": 0.2},
            "onComplete": "resume"
          }
        },
        {
          "id": "cena-7-promessa",
          "type": "narrative",
          "title": "Promessa do Segredo",
          "startTime": 105,
          "duration": 12,
          "narration": "Eles conhecem o segredo. O método PERFEITO.",
          "anchorActions": [
            {
              "id": "pause-playground-perfeito",
              "keyword": "PERFEITO",
              "type": "pause"
            }
          ],
          "visual": {
            "type": "teaser",
            "title": "ELES CONHECEM",
            "subtitle": "O SEGREDO",
            "highlightWord": "SEGREDO",
            "mood": "mysterious"
          }
        },
        {
          "id": "cena-8-transicao",
          "type": "revelation",
          "title": "Revelação - Transição",
          "startTime": 117,
          "duration": 8,
          "narration": "",
          "visual": {
            "type": "transition",
            "title": "O MÉTODO",
            "mainValue": "P.E.R.F.E.I.T.O",
            "animation": "fade-in",
            "mood": "success"
          }
        },
        {
          "id": "cena-9-perfeito",
          "type": "revelation",
          "title": "PERFEITO Letra por Letra",
          "startTime": 125,
          "duration": 35,
          "narration": "Persona. Especificidade. Resultado. Formato. Exemplos. Instruções. Tom. Otimização.",
          "visual": {
            "type": "letter-reveal",
            "title": "O MÉTODO",
            "mainValue": "P.E.R.F.E.I.T.O",
            "highlightWord": "PERFEITO",
            "revealType": "letter-by-letter",
            "mood": "success",
            "items": [
              {"letter": "P", "text": "Persona", "description": "Defina quem a IA deve ser"},
              {"letter": "E", "text": "Especificidade", "description": "Elimine ambiguidade"},
              {"letter": "R", "text": "Resultado", "description": "Deixe claro o objetivo"},
              {"letter": "F", "text": "Formato", "description": "Estruture a saída"},
              {"letter": "E", "text": "Exemplos", "description": "Forneça referências"},
              {"letter": "I", "text": "Instruções", "description": "Detalhe cada passo"},
              {"letter": "T", "text": "Tom", "description": "Defina a personalidade"},
              {"letter": "O", "text": "Otimização", "description": "Refine sempre"}
            ],
            "particles": {
              "enabled": true,
              "type": "sparkle",
              "intensity": 0.8
            }
          }
        },
        {
          "id": "cena-10-playground",
          "type": "playground",
          "title": "Playground - Amador vs Profissional",
          "startTime": 160,
          "duration": 80,
          "narration": "A diferença entre brincar e lucrar está no método. E você está prestes a dominá-lo. Aqueles que dominam o método transformam IA em ferramenta de trabalho real.",
          "anchorActions": [
            {
              "id": "pause-cta-dominam",
              "keyword": "dominam",
              "type": "pause"
            }
          ],
          "visual": {
            "title": "VEJA A DIFERENÇA NA PRÁTICA",
            "instruction": "Compare os dois prompts e veja a diferença nos resultados"
          },
          "interaction": {
            "type": "playground",
            "context": "Objetivo: vender mais para restaurantes",
            "amateurPrompt": "Me ajude a vender mais.",
            "professionalPrompt": "Persona: Atue como consultor de vendas B2B com 15 anos de experiência.\n\nEspecificidade: Minha empresa vende software para restaurantes. Ticket médio R$ 500/mês. Conversão atual 2%.\n\nResultado: Criar sequência de 5 e-mails de follow-up para elevar conversão para 5%.\n\nFormato: Cada e-mail com: assunto + corpo + CTA.\n\nTom: Direto, consultivo e persuasivo.",
            "amateurResult": {
              "title": "Resultado Amador",
              "content": "Para vender mais: faça promoções, use redes sociais, melhore o atendimento...",
              "score": 15,
              "verdict": "bad"
            },
            "professionalResult": {
              "title": "Resultado Profissional",
              "content": "E-mail 1: assunto forte + contexto do lead + CTA claro.\nE-mail 2: objeção principal + prova + CTA.\nE-mail 3: história curta + benefício + CTA.\nE-mail 4: urgência real + alternativa + CTA.\nE-mail 5: última chamada + opção de resposta rápida + CTA.",
              "score": 95,
              "verdict": "excellent"
            },
            "ctaButtons": [
              {"id": "cta-continue", "label": "Continuar Aprendendo", "emoji": "🚀", "variant": "positive", "action": "next-lesson"},
              {"id": "cta-later", "label": "Voltar Depois", "emoji": "↩️", "variant": "negative", "action": "exit"}
            ]
          },
          "contextualLoops": [
            {"triggerAfter": 5, "text": "Observe a diferença...", "volume": 0.4},
            {"triggerAfter": 15, "text": "Veja como o prompt estruturado gera resultados melhores...", "volume": 0.35}
          ],
          "audioBehavior": {
            "onStart": "pause",
            "duringInteraction": {"mainVolume": 0, "ambientVolume": 0.2},
            "onComplete": "resume"
          }
        }
      ]
    },
    "audioConfig": {
      "narrationVoice": "Xb7hH8MSUJpSbSDYk0k2",
      "voiceSettings": {
        "stability": 0.5,
        "similarity_boost": 0.75
      },
      "backgroundMusic": {
        "enabled": true,
        "track": "cinematic-ambient",
        "volume": 0.15
      }
    }
  }'::jsonb,
  estimated_time = 4,
  updated_at = NOW()
WHERE
  title = 'O Fim da Brincadeira com IA'
  AND model = 'v7';

-- Verify: 10 CENAS
DO $$
DECLARE
  act_count INTEGER;
  lesson_title TEXT;
  first_act_type TEXT;
  last_act_type TEXT;
BEGIN
  SELECT
    title,
    jsonb_array_length(content->'cinematic_flow'->'acts'),
    content->'cinematic_flow'->'acts'->0->>'type',
    content->'cinematic_flow'->'acts'->9->>'type'
  INTO lesson_title, act_count, first_act_type, last_act_type
  FROM lessons
  WHERE model = 'v7' AND title ILIKE '%fim da brincadeira%'
  LIMIT 1;

  IF act_count = 10 THEN
    RAISE NOTICE '✅ SUCCESS: Lesson "%" updated with 10 CENAS', lesson_title;
    RAISE NOTICE '   - CENA 1: % (dramatic)', first_act_type;
    RAISE NOTICE '   - CENA 10: % (playground)', last_act_type;
  ELSIF act_count IS NOT NULL THEN
    RAISE WARNING '⚠️ Lesson has % acts instead of 10', act_count;
  ELSE
    RAISE WARNING '❌ Lesson "O Fim da Brincadeira com IA" not found';
  END IF;
END $$;
