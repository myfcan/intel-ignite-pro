-- Migration: O Fim da Brincadeira com IA - 10 CENAS EXATAS DO ROTEIRO CINEMATOGRÁFICO
--
-- ESTRUTURA CORRETA:
-- pauseKeyword deve estar na PHASE INTERATIVA (quiz/playground) que APARECE quando a palavra é detectada
-- NÃO na phase narrativa onde a palavra é falada!
--
-- Fluxo:
-- 1. CENA 1-5: Narração toca, menciona "brinquedo" na CENA 2
-- 2. Quando "brinquedo" detectado → CENA 6 (quiz) aparece com pauseKeyword: "brinquedo"
-- 3. Usuário responde quiz
-- 4. CENA 7-9: Narração continua, menciona "PERFEITO" na CENA 9
-- 5. Quando "PERFEITO" detectado → CENA 10 (playground) aparece com pauseKeyword: "PERFEITO"

UPDATE lessons
SET
  content = '{
    "title": "O Fim da Brincadeira com IA",
    "subtitle": "98% brinca. 2% lucra com método.",
    "model": "v7-cinematic",
    "version": "7.2",
    "difficulty": "intermediate",
    "category": "prompts",
    "tags": ["prompts", "profissional", "ia", "metodo-perfeito"],
    "learningObjectives": [
      "Reconhecer o padrão de uso amador vs profissional de I.A.",
      "Tomar consciência do seu nível atual (98% vs 2%)",
      "Entender e memorizar o Método PERFEITO",
      "Testar, na prática, a diferença entre prompt amador e prompt profissional"
    ],
    "metadata": {
      "totalDuration": 240,
      "actCount": 10,
      "format": "acts"
    },
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
          "pauseKeyword": "brinquedo",
          "pauseKeywords": ["brinquedo"],
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
          "pauseKeyword": "PERFEITO",
          "pauseKeywords": ["PERFEITO", "dominam"],
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

-- Verify: 10 CENAS with correct pauseKeywords
DO $$
DECLARE
  act_count INTEGER;
  lesson_title TEXT;
  quiz_pause_keyword TEXT;
  playground_pause_keyword TEXT;
BEGIN
  SELECT
    title,
    jsonb_array_length(content->'cinematic_flow'->'acts'),
    content->'cinematic_flow'->'acts'->5->>'pauseKeyword',
    content->'cinematic_flow'->'acts'->9->>'pauseKeyword'
  INTO lesson_title, act_count, quiz_pause_keyword, playground_pause_keyword
  FROM lessons
  WHERE model = 'v7' AND title ILIKE '%fim da brincadeira%'
  LIMIT 1;

  IF act_count = 10 THEN
    RAISE NOTICE '✅ SUCCESS: Lesson "%" updated with 10 CENAS', lesson_title;
    RAISE NOTICE '   - Quiz (CENA 6) pauseKeyword: %', quiz_pause_keyword;
    RAISE NOTICE '   - Playground (CENA 10) pauseKeyword: %', playground_pause_keyword;
  ELSIF act_count IS NOT NULL THEN
    RAISE WARNING '⚠️ Lesson has % acts instead of 10', act_count;
  ELSE
    RAISE WARNING '❌ Lesson "O Fim da Brincadeira com IA" not found';
  END IF;
END $$;
