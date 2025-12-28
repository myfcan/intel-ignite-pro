-- Migration: Update "O Fim da Brincadeira com IA" lesson with complete 7-act structure
-- Problem: Lesson JSON in database only had 3 acts, causing skip from quiz to gamification
-- Solution: Update content field with complete 7-act cinematic flow

-- This migration updates the V7 lesson content to include all 7 acts:
-- 1. act-1-hook (dramatic)
-- 2. act-2-comparison (comparison)
-- 3. act-3-quiz (interaction)
-- 4. act-4-secret-teaser (revelation)
-- 5. act-5-method-reveal (revelation)
-- 6. act-6-playground (playground)
-- 7. act-7-gamification (gamification)

UPDATE lessons
SET
  content = '{
    "title": "O Fim da Brincadeira com IA",
    "subtitle": "98% brinca. 2% lucra com método.",
    "difficulty": "intermediate",
    "category": "prompts",
    "tags": ["prompts", "profissional", "ia", "chatgpt", "metodo-perfeito"],
    "learningObjectives": [
      "Reconhecer o padrão de uso amador vs profissional de I.A.",
      "Tomar consciência do seu nível atual (98% vs 2%)",
      "Entender e memorizar o Método PERFEITO",
      "Testar, na prática, a diferença entre prompt amador e prompt profissional"
    ],
    "duration": 190,
    "generate_audio": true,
    "voice_id": "Xb7hH8MSUJpSbSDYk0k2",
    "fail_on_audio_error": false,
    "narrativeScript": "Noventa e oito por cento das pessoas que usam a Inteligência Artificial hoje tratam isso como brinquedo. Isso mesmo. Elas transformam a Inteligência Artificial em passatempo. Perguntas rápidas, sem contexto, só para ver o que sai.\n\nEnquanto noventa e oito por cento brinca, um grupo pequeno faz diferente. Não é magia. É método. E quando você aplica método, a Inteligência Artificial deixa de ser curiosidade e vira ferramenta de resultado.\n\nAgora é o momento mais importante. Seja honesto consigo mesmo. Você faz parte dos noventa e oito por cento… ou dos dois por cento? Selecione a opção que representa o seu uso atual.\n\nEu vou te mostrar o segredo desses dois por cento. O que eles fazem para usar a Inteligência Artificial em projetos, em renda extra, e para ganhar clareza de verdade. Um método simples. E quando você aprende, você nunca mais volta para o jeito amador.\n\nEles conhecem o segredo. O método PERFEITO. Persona. Especificidade. Resultado. Formato. Exemplos. Instruções. Tom. Otimização. Isso é o que separa tentativa de resultado.\n\nAgora, observe a diferença na prática. Um prompt amador pede qualquer coisa e recebe qualquer coisa. Um prompt profissional usa o método PERFEITO e recebe uma entrega aplicável. Navegue pelos slides até o final e faça o teste agora.\n\nParabéns. Agora você tem um método. O próximo passo é simples: aplicar, ajustar e otimizar. Nos vemos na próxima aula.",
    "cinematic_flow": {
      "timeline": {
        "totalDuration": 190
      },
      "acts": [
        {
          "id": "act-1-hook",
          "type": "dramatic",
          "title": "Tela preta. Um número. Um choque.",
          "startTime": 0,
          "duration": 22,
          "narration": "Noventa e oito por cento das pessoas que usam a Inteligência Artificial hoje tratam isso como brinquedo. Isso mesmo. Elas transformam a Inteligência Artificial em passatempo. Perguntas rápidas, sem contexto, só para ver o que sai.",
          "visual": {
            "mainValue": "98%",
            "subtitle": "tratam a Inteligência Artificial como brinquedo",
            "hookQuestion": "VOCÊ SABIA?",
            "highlightWord": "BRINCADEIRA",
            "mood": "danger",
            "particles": {
              "enabled": true,
              "type": "ember",
              "intensity": 0.6
            },
            "glow": true
          },
          "transitions": {
            "enter": "letterbox",
            "exit": "fade"
          }
        },
        {
          "id": "act-2-comparison",
          "type": "comparison",
          "title": "98% vs 2%. A divisão real.",
          "startTime": 22,
          "duration": 28,
          "narration": "Enquanto noventa e oito por cento brinca, um grupo pequeno faz diferente. Não é magia. É método. E quando você aplica método, a Inteligência Artificial deixa de ser curiosidade e vira ferramenta de resultado.",
          "visual": {
            "title": "A DIVISÃO REAL",
            "subtitle": "Dois grupos. Dois resultados.",
            "mood": "dramatic"
          },
          "interaction": {
            "type": "comparison",
            "leftCard": {
              "label": "98% — BRINCANDO",
              "value": "Resultado: genérico",
              "isPositive": false,
              "icon": "X",
              "details": [
                "Prompt curto",
                "Sem contexto",
                "Sem objetivo claro",
                "Saída comum",
                "Pouca ou nenhuma aplicação"
              ]
            },
            "rightCard": {
              "label": "2% — USO PROFISSIONAL",
              "value": "Resultado: aplicável",
              "isPositive": true,
              "icon": "Check",
              "details": [
                "Prompt estruturado",
                "Contexto rico",
                "Objetivo mensurável",
                "Formato definido",
                "Iteração e otimização"
              ]
            }
          },
          "transitions": {
            "enter": "split-reveal",
            "exit": "fade"
          }
        },
        {
          "id": "act-3-quiz",
          "type": "interaction",
          "title": "Seja honesto. Você é 98% ou 2%?",
          "startTime": 50,
          "duration": 34,
          "narration": "Agora é o momento mais importante. Seja honesto consigo mesmo. Você faz parte dos noventa e oito por cento… ou dos dois por cento? Selecione a opção que representa o seu uso atual.",
          "pauseKeyword": "uso atual",
          "pauseKeywords": ["uso atual"],
          "anchorActions": [
            {
              "id": "pause-for-quiz",
              "keyword": "uso atual",
              "type": "pause"
            }
          ],
          "visual": {
            "title": "SEJA HONESTO CONSIGO MESMO.",
            "subtitle": "Escolha a opção que mais te representa agora."
          },
          "interaction": {
            "type": "quiz",
            "question": "Como você usa a I.A. hoje?",
            "options": [
              {
                "id": "opt-1",
                "text": "Eu faço prompts curtos, do tipo: \"faz pra mim\", sem muito contexto.",
                "isCorrect": false,
                "category": "bad",
                "feedback": "Esse é o padrão dos 98%. Sem contexto, a saída fica genérica."
              },
              {
                "id": "opt-2",
                "text": "Eu dou contexto, defino objetivo e peço num formato específico.",
                "isCorrect": true,
                "category": "good",
                "feedback": "Você já pensa como os 2%. Estrutura muda tudo."
              },
              {
                "id": "opt-3",
                "text": "Eu copio prompts prontos e torço para funcionar no meu caso.",
                "isCorrect": false,
                "category": "bad",
                "feedback": "Prompts genéricos geram respostas genéricas — e pouca aplicação real."
              }
            ],
            "correctFeedback": "Boa. Você já está no caminho profissional. Agora vamos colocar método em cima disso.",
            "incorrectFeedback": "Sem problema. Em poucos minutos você vai virar a chave — com método e estrutura."
          },
          "audioBehavior": {
            "onStart": "pause",
            "duringInteraction": {
              "mainVolume": 0,
              "ambientVolume": 0.3
            },
            "onComplete": "resume"
          },
          "timeout": {
            "soft": 8,
            "medium": 15,
            "hard": 25,
            "hints": [
              "Pense nas suas últimas interações com IA...",
              "Seja honesto consigo mesmo...",
              "Vamos continuar? A resposta é só pra você refletir."
            ],
            "autoAction": { "action": "continue" }
          },
          "transitions": {
            "enter": "zoom-in",
            "exit": "fade"
          }
        },
        {
          "id": "act-4-secret-teaser",
          "type": "revelation",
          "title": "A ponte. O segredo dos 2%.",
          "startTime": 84,
          "duration": 22,
          "narration": "Eu vou te mostrar o segredo desses dois por cento. O que eles fazem para usar a Inteligência Artificial em projetos, em renda extra, e para ganhar clareza de verdade. Um método simples. E quando você aprende, você nunca mais volta para o jeito amador.",
          "pauseKeyword": "jeito amador",
          "pauseKeywords": ["jeito amador"],
          "anchorActions": [
            {
              "id": "show-cta-button",
              "keyword": "jeito amador",
              "type": "pause"
            }
          ],
          "visual": {
            "title": "O SEGREDO DOS 2%",
            "subtitle": "Não é talento. É um método simples.",
            "mood": "dramatic"
          },
          "interaction": {
            "type": "cta",
            "ctaTitle": "Quer descobrir o método?",
            "options": [
              {
                "id": "cta-discover",
                "label": "QUERO DESCOBRIR AGORA",
                "emoji": "lightning",
                "variant": "primary",
                "action": "continue"
              }
            ]
          },
          "audioBehavior": {
            "onStart": "pause",
            "duringInteraction": {
              "mainVolume": 0,
              "ambientVolume": 0.2
            },
            "onComplete": "resume"
          },
          "transitions": {
            "enter": "scale-up",
            "exit": "fade"
          }
        },
        {
          "id": "act-5-method-reveal",
          "type": "revelation",
          "title": "Método PERFEITO. Revelação letra por letra.",
          "startTime": 106,
          "duration": 32,
          "narration": "Eles conhecem o segredo. O método PERFEITO. Persona. Especificidade. Resultado. Formato. Exemplos. Instruções. Tom. Otimização. Isso é o que separa tentativa de resultado.",
          "visual": {
            "title": "ELES CONHECEM O MÉTODO.",
            "subtitle": "O método PERFEITO.",
            "mainValue": "P.E.R.F.E.I.T.O",
            "highlightWord": "PERFEITO",
            "mood": "success",
            "items": [
              { "emoji": "theater", "letter": "P", "text": "Persona: Defina quem a I.A. deve ser" },
              { "emoji": "target", "letter": "E", "text": "Especificidade: Elimine ambiguidade" },
              { "emoji": "check", "letter": "R", "text": "Resultado: Deixe claro o objetivo" },
              { "emoji": "clipboard", "letter": "F", "text": "Formato: Estruture a saída" },
              { "emoji": "lightbulb", "letter": "E", "text": "Exemplos: Forneça referências" },
              { "emoji": "pencil", "letter": "I", "text": "Instruções: Detalhe cada passo" },
              { "emoji": "speech", "letter": "T", "text": "Tom: Defina a personalidade" },
              { "emoji": "refresh", "letter": "O", "text": "Otimização: Refine sempre" }
            ]
          },
          "transitions": {
            "enter": "letter-by-letter",
            "exit": "fade"
          }
        },
        {
          "id": "act-6-playground",
          "type": "playground",
          "title": "Playground. A diferença na prática.",
          "startTime": 138,
          "duration": 40,
          "narration": "Agora, observe a diferença na prática. Um prompt amador pede qualquer coisa e recebe qualquer coisa. Um prompt profissional usa o método PERFEITO e recebe uma entrega aplicável. Navegue pelos slides até o final e faça o teste agora.",
          "pauseKeyword": "teste agora",
          "pauseKeywords": ["teste agora"],
          "anchorActions": [
            {
              "id": "start-playground",
              "keyword": "teste agora",
              "type": "pause"
            }
          ],
          "visual": {
            "title": "AGORA, A DIFERENÇA AO VIVO.",
            "subtitle": "Prompt amador vs prompt profissional usando PERFEITO.",
            "instruction": "Navegue pelos slides e compare. No final, faça o teste."
          },
          "interaction": {
            "type": "playground",
            "challenge": "Compare prompt amador vs profissional",
            "context": "Objetivo: vender mais para restaurantes",
            "amateurPrompt": "Me ajude a vender mais.",
            "professionalPrompt": "Persona: Atue como consultor de vendas B2B com 15 anos de experiência.\n\nEspecificidade + Contexto: Minha empresa vende software para restaurantes. Ticket médio R$ 500/mês. Conversão atual 2%.\n\nResultado: Criar uma sequência de 5 e-mails de follow-up para elevar conversão para 5%.\n\nFormato: Cada e-mail com: assunto + corpo + CTA.\n\nTom: Direto, consultivo e persuasivo.\n\nOtimização: Gere 2 versões por e-mail e destaque a melhor.",
            "options": [
              { "id": "amateur", "text": "Prompt Amador", "isCorrect": false },
              { "id": "professional", "text": "Prompt Profissional", "isCorrect": true }
            ],
            "amateurResult": {
              "title": "Resultado Amador",
              "content": "Para vender mais: faça promoções, use redes sociais, melhore o atendimento…",
              "score": 15,
              "maxScore": 100,
              "verdict": "bad"
            },
            "professionalResult": {
              "title": "Resultado Profissional",
              "content": "E-mail 1: assunto forte + contexto do lead + CTA claro.\nE-mail 2: objeção principal + prova + CTA.\nE-mail 3: história curta + benefício + CTA.\nE-mail 4: urgência real + alternativa + CTA.\nE-mail 5: última chamada + opção de resposta rápida + CTA.",
              "score": 95,
              "maxScore": 100,
              "verdict": "excellent"
            }
          },
          "audioBehavior": {
            "onStart": "pause",
            "duringInteraction": {
              "mainVolume": 0,
              "ambientVolume": 0.2
            },
            "onComplete": "resume"
          },
          "timeout": {
            "soft": 15,
            "medium": 30,
            "hard": 60,
            "hints": [
              "Navegue pelos slides para ver a diferença...",
              "Compare o prompt amador com o profissional...",
              "Quando estiver pronto, avance para finalizar."
            ],
            "autoAction": { "action": "continue" }
          },
          "transitions": {
            "enter": "slide-up",
            "exit": "fade"
          }
        },
        {
          "id": "act-7-gamification",
          "type": "gamification",
          "title": "Conclusão. Recompensa.",
          "startTime": 178,
          "duration": 12,
          "narration": "Parabéns. Agora você tem um método. O próximo passo é simples: aplicar, ajustar e otimizar. Nos vemos na próxima aula.",
          "visual": {
            "title": "AULA CONCLUÍDA!",
            "mainText": "Você virou a chave.",
            "subtitle": "Agora você tem método — não sorte.",
            "mood": "success",
            "items": [
              { "emoji": "check", "text": "Entendeu a divisão 98% vs 2%" },
              { "emoji": "check", "text": "Aprendeu o Método PERFEITO" },
              { "emoji": "check", "text": "Testou na prática a diferença" }
            ]
          },
          "interaction": {
            "type": "gamification",
            "xpEarned": 150,
            "coinsEarned": 50,
            "badges": ["prompting-pro", "first-method"],
            "metrics": [
              { "label": "XP Ganho", "value": "+150", "isHighlight": true },
              { "label": "Nível", "value": "Prompting PRO", "isHighlight": false }
            ],
            "celebrationLevel": "high"
          },
          "transitions": {
            "enter": "scale-up",
            "exit": "fade"
          }
        }
      ]
    },
    "audioConfig": {
      "narrationVoice": "Xb7hH8MSUJpSbSDYk0k2",
      "voiceSettings": {
        "stability": 0.5,
        "similarity_boost": 0.75,
        "style": 0.0,
        "use_speaker_boost": true
      },
      "backgroundMusic": {
        "enabled": true,
        "track": "cinematic-ambient",
        "volume": 0.15
      }
    },
    "fallbacks": {
      "noWordTimestamps": {
        "strategy": "percentage",
        "pauseAt": 0.8,
        "duration": 3000
      },
      "audioLoadError": {
        "showSubtitles": true,
        "continueWithText": true
      },
      "interactionTimeout": {
        "action": "continue",
        "showHint": true
      }
    }
  }'::jsonb,
  estimated_time = 4,
  updated_at = NOW()
WHERE
  title = 'O Fim da Brincadeira com IA'
  AND model = 'v7';

-- Also update by similar title patterns (in case of slight variations)
UPDATE lessons
SET
  content = (SELECT content FROM lessons WHERE title = 'O Fim da Brincadeira com IA' AND model = 'v7' LIMIT 1),
  estimated_time = 4,
  updated_at = NOW()
WHERE
  (title ILIKE '%fim da brincadeira%' OR title ILIKE '%98%brinca%')
  AND model = 'v7'
  AND title != 'O Fim da Brincadeira com IA';

-- Verify the update
DO $$
DECLARE
  act_count INTEGER;
  lesson_title TEXT;
BEGIN
  SELECT
    title,
    jsonb_array_length(content->'cinematic_flow'->'acts')
  INTO lesson_title, act_count
  FROM lessons
  WHERE model = 'v7' AND title ILIKE '%fim da brincadeira%'
  LIMIT 1;

  IF act_count IS NOT NULL THEN
    RAISE NOTICE 'Updated lesson "%" - now has % acts', lesson_title, act_count;
  ELSE
    RAISE WARNING 'Lesson "O Fim da Brincadeira com IA" not found or content structure invalid';
  END IF;
END $$;
