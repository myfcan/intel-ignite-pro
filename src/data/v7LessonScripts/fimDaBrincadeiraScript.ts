// V7 Lesson Script: "O Fim da Brincadeira com IA"
// Complete cinematic experience with 7 phases

import { V7LessonScript } from '@/components/lessons/v7/cinematic/phases/V7PhaseController';

export const fimDaBrincadeiraScript: V7LessonScript = {
  id: 'fim-da-brincadeira-ia',
  title: 'O Fim da Brincadeira com IA',
  totalDuration: 480, // 8 minutes
  audioUrl: '', // Will be populated from database
  phases: [
    // FASE 1: LOADING (0-3s)
    {
      id: 'loading',
      title: 'Carregando',
      startTime: 0,
      endTime: 3,
      type: 'loading',
      scenes: [],
      mood: 'neutral'
    },

    // FASE 2: ENTRADA DRAMÁTICA (3-30s)
    // 6 SCENES with progressive content reveal
    {
      id: 'dramatic-entry',
      title: 'Entrada Dramática',
      startTime: 3,
      endTime: 30,
      type: 'dramatic',
      mood: 'danger',
      scenes: [
        {
          id: 'scene-letterbox',
          type: 'letterbox',
          startTime: 3,
          duration: 3,
          content: {
            hookQuestion: 'VOCÊ SABIA?',
            mainText: '',
            subtitle: '',
            backgroundColor: 'black',
            aspectRatio: 'cinematic'
          },
          animation: 'letterbox'
        },
        {
          id: 'scene-number-glow',
          type: 'number-reveal',
          startTime: 6,
          duration: 4,
          content: {
            number: '98%',
            subtitle: '',
            highlightWord: 'BRINQUEDO',
            glowEffect: true
          },
          animation: 'scale-up'
        },
        {
          id: 'scene-count-up',
          type: 'number-reveal',
          startTime: 10,
          duration: 4,
          content: {
            number: '98%',
            subtitle: 'das pessoas usam IA como BRINQUEDO',
            highlightWord: 'BRINQUEDO',
            countUpAnimation: true
          },
          animation: 'count-up'
        },
        {
          id: 'scene-explosion',
          type: 'particle-effect',
          startTime: 14,
          duration: 3,
          content: {
            number: '98%',
            subtitle: 'das pessoas usam IA como BRINQUEDO',
            particleType: 'sparks',
            particleColor: '#ff0040'
          },
          animation: 'particle-burst'
        },
        {
          id: 'scene-subtitle',
          type: 'text-reveal',
          startTime: 17,
          duration: 8,
          content: {
            number: '98%',
            mainText: 'das pessoas usam IA como BRINQUEDO',
            subtitle: 'BRINQUEDO',
            highlightWord: 'BRINQUEDO',
            letterByLetter: true
          },
          animation: 'letter-by-letter'
        },
        {
          id: 'scene-impact',
          type: 'text-reveal',
          startTime: 25,
          duration: 5,
          content: {
            number: '98%',
            subtitle: 'das pessoas usam IA como BRINQUEDO',
            mainText: 'DESPERDIÇAM',
            highlightWord: 'BRINQUEDO',
            cameraZoom: true,
            cameraShake: true,
            particleEffect: 'confetti'
          },
          animation: 'zoom-in'
        }
      ]
    },

    // FASE 3: NARRATIVA COMPARATIVA (30-90s)
    {
      id: 'narrative-comparison',
      title: 'Narrativa Comparativa',
      startTime: 30,
      endTime: 90,
      type: 'narrative',
      mood: 'warning',
      scenes: [
        {
          id: 'scene-transition',
          type: 'split-screen',
          startTime: 30,
          duration: 15,
          content: {
            mainText: '98% 😂 vs 2% 💰',
            items: [
              { label: '98% BRINCANDO', value: 'R$ 0/mês', isNegative: true },
              { label: '2% DOMINANDO', value: 'R$ 30.000/mês', isPositive: true }
            ]
          },
          animation: 'slide-left'
        },
        {
          id: 'scene-comparison-details',
          type: 'comparison',
          startTime: 45,
          duration: 15,
          content: {
            items: [
              { label: 'Trabalho', left: '8h/dia', right: '2h/dia' },
              { label: 'Resultado', left: 'Mesmo', right: '10x produtividade' },
              { label: 'Renda extra', left: 'R$ 0', right: 'R$ 30.000' }
            ]
          },
          animation: 'slide-up'
        },
        {
          id: 'scene-urgency',
          type: 'text-reveal',
          startTime: 60,
          duration: 30,
          content: {
            mainText: '⚠️ EM 7 ANOS',
            subtitle: 'Quem não dominar IA será dominado por ela',
            highlightWord: '7 ANOS'
          },
          animation: 'fade'
        }
      ]
    },

    // FASE 4: INTERAÇÃO - AUTOAVALIAÇÃO (90-150s)
    // ✅ pauseKeywords: Audio pauses when "honesto" is spoken (end of quiz intro narration)
    {
      id: 'interaction-quiz',
      title: 'Autoavaliação',
      startTime: 90,
      endTime: 150,
      type: 'interaction',
      mood: 'danger',
      autoAdvance: false,
      pauseKeywords: ['honesto'], // Pauses after "Seja honesto."
      resumeKeywords: ['calma'], // Resumes when quiz completes and narration says "Mas calma..."
      scenes: [
        {
          id: 'scene-quiz-intro',
          type: 'text-reveal',
          startTime: 90,
          duration: 10,
          content: {
            mainText: '⚡ TESTE RELÂMPAGO',
            subtitle: 'Vamos descobrir em qual grupo você está'
          },
          animation: 'fade'
        },
        {
          id: 'scene-quiz-options',
          type: 'quiz',
          startTime: 100,
          duration: 30,
          content: {
            mainText: 'Suas últimas 5 vezes com IA:',
            options: [
              { id: 'problem', label: 'Resolver problema real', isCorrect: true },
              { id: 'automate', label: 'Automatizar tarefa', isCorrect: true },
              { id: 'money', label: 'Ganhar dinheiro', isCorrect: true },
              { id: 'curiosity', label: 'Curiosidade', isCorrect: false, isDefault: true },
              { id: 'play', label: 'Brincadeira', isCorrect: false, isDefault: true }
            ],
            // ✅ Feedback messages for quiz results
            explanation: 'Sem problemas! Vou te ensinar o método agora.',
            correctFeedback: 'Continue assim! Você já pensa como profissional.',
            incorrectFeedback: 'Esse é o jeito amador! Mas calma, vou te mostrar como mudar isso.'
          },
          animation: 'slide-up'
        },
        {
          id: 'scene-quiz-result',
          type: 'result',
          startTime: 130,
          duration: 20,
          content: {
            mainText: '😱 ALERTA',
            subtitle: 'VOCÊ ESTÁ NO GRUPO 98%',
            metrics: [
              { label: 'Perda mensal', value: 'R$ 2.000' },
              { label: 'Perda anual', value: 'R$ 24.000' }
            ]
          },
          animation: 'fade'
        }
      ]
    },

    // FASE 5: DESAFIO PLAYGROUND (150-300s)
    // ✅ pauseKeywords: Audio pauses when "observe" is spoken (before playground starts)
    {
      id: 'playground-challenge',
      title: 'Desafio Playground',
      startTime: 150,
      endTime: 300,
      type: 'playground',
      mood: 'success',
      autoAdvance: false,
      pauseKeywords: ['observe'], // Pauses after "Observe." - user interacts with playground
      resumeKeywords: ['diferença'], // Resumes when playground completes - "Viu a diferença?"
      scenes: [
        {
          id: 'scene-challenge-intro',
          type: 'text-reveal',
          startTime: 150,
          duration: 20,
          content: {
            mainText: '🎮 DESAFIO DOS R$ 500',
            subtitle: 'Vou provar que em 30 segundos você pode cobrar R$ 500'
          },
          animation: 'fade'
        },
        {
          id: 'scene-amateur-mode',
          type: 'playground',
          startTime: 170,
          duration: 60,
          content: {
            mainText: 'MODO AMADOR',
            subtitle: 'Como 98% fazem:',
            items: [
              { type: 'input', placeholder: 'me ajuda com posts' },
              { type: 'result', text: '"Compre agora!" "Promoção imperdível!" "Novidades chegaram!"' }
            ],
            metrics: [{ label: 'Valor', value: 'R$ 0' }]
          },
          animation: 'slide-up'
        },
        {
          id: 'scene-pro-mode',
          type: 'playground',
          startTime: 230,
          duration: 50,
          content: {
            mainText: 'MODO PROFISSIONAL',
            subtitle: 'Como os 2% fazem:',
            items: [
              { type: 'template', lines: [
                'P - PAPEL: Especialista em moda feminina',
                'E - ESPECIFICIDADE: 5 posts Instagram',
                'R - REFERÊNCIA: Mulheres 25-40 anos',
                'F - FORMATO: Emoji + título + CTA sutil',
                'E - EXEMPLO: Tom Vogue Brasil',
                'I - INTENÇÃO: Despertar desejo',
                'T - TOM: Sofisticado, íntimo',
                'O - OBSTÁCULOS: Evitar "compre agora"'
              ]},
              { type: 'result', text: '"🌙 O Pretinho Que Não É Básico - Aquele vestido que transita do board meeting para o happy hour sem pedir licença."' }
            ],
            metrics: [{ label: 'Valor', value: 'R$ 500' }]
          },
          animation: 'slide-up'
        },
        {
          id: 'scene-comparison-scores',
          type: 'comparison',
          startTime: 280,
          duration: 20,
          content: {
            mainText: 'ANÁLISE AUTOMÁTICA',
            items: [
              { label: 'Especificidade', value: '85%' },
              { label: 'Originalidade', value: '92%' },
              { label: 'Valor', value: '88%' }
            ],
            subtitle: '💡 Diferença: 30 segundos = R$ 500'
          },
          animation: 'fade'
        }
      ]
    },

    // FASE 6: REVELAÇÃO E TRANSFORMAÇÃO (300-420s)
    {
      id: 'revelation',
      title: 'Revelação',
      startTime: 300,
      endTime: 420,
      type: 'revelation',
      mood: 'success',
      scenes: [
        {
          id: 'scene-truth',
          type: 'text-reveal',
          startTime: 300,
          duration: 30,
          content: {
            mainText: 'A DIFERENÇA NÃO É TALENTO',
            subtitle: 'É  M É T O D O',
            highlightWord: 'MÉTODO'
          },
          animation: 'letter-by-letter'
        },
        {
          id: 'scene-roadmap',
          type: 'cards-reveal',
          startTime: 330,
          duration: 30,
          content: {
            mainText: 'PRÓXIMAS 7 AULAS:',
            items: [
              { emoji: '🦎', title: 'ChatGPT', subtitle: 'O Camaleão Digital' },
              { emoji: '🎓', title: 'Claude', subtitle: 'O Professor Particular' },
              { emoji: '🔍', title: 'Gemini', subtitle: 'O Pesquisador Obsessivo' },
              { emoji: '🕵️', title: 'Perplexity', subtitle: 'O Detetive da Internet' },
              { emoji: '🃏', title: 'Grok', subtitle: 'O Comediante Inteligente' }
            ]
          },
          animation: 'slide-up'
        },
        {
          id: 'scene-projection',
          type: 'text-reveal',
          startTime: 360,
          duration: 30,
          content: {
            mainText: 'SUA PROJEÇÃO:',
            items: [
              { time: 'EM 30 DIAS', text: 'Você cobrando R$ 500/post' },
              { time: 'EM 90 DIAS', text: 'R$ 5.000/mês extras' },
              { time: 'EM 6 MESES', text: 'Ensinando outros' }
            ]
          },
          animation: 'fade'
        },
        {
          id: 'scene-cta',
          type: 'cta',
          startTime: 390,
          duration: 30,
          content: {
            mainText: 'ESCOLHA SEU DESTINO:',
            options: [
              { label: 'CONTINUAR 98%', emoji: '😴', variant: 'negative' },
              { label: 'ENTRAR NOS 2%', emoji: '🚀', variant: 'positive' }
            ]
          },
          animation: 'fade'
        }
      ]
    },

    // FASE 7: GAMIFICAÇÃO (420-480s)
    {
      id: 'gamification',
      title: 'Gamificação',
      startTime: 420,
      endTime: 480,
      type: 'gamification',
      mood: 'success',
      scenes: [
        {
          id: 'scene-achievements',
          type: 'result',
          startTime: 420,
          duration: 30,
          content: {
            mainText: '🎊 PARABÉNS!',
            subtitle: 'CONQUISTAS DESBLOQUEADAS:',
            items: [
              { emoji: '✅', text: 'Saiu da Matrix' },
              { emoji: '✅', text: 'Primeiro R$ 500' },
              { emoji: '✅', text: 'Método PERFEITO' }
            ],
            metrics: [
              { label: 'XP Ganho', value: '+250' },
              { label: 'Nível', value: 'DESPERTO' }
            ]
          },
          animation: 'fade'
        },
        {
          id: 'scene-next-steps',
          type: 'cta',
          startTime: 450,
          duration: 30,
          content: {
            mainText: 'PRÓXIMA AULA EM:',
            subtitle: 'ChatGPT: O Camaleão Digital',
            options: [
              { label: 'AGENDAR LEMBRETE', emoji: '🔔', variant: 'secondary' },
              { label: 'COMEÇAR AGORA', emoji: '🚀', variant: 'primary' }
            ]
          },
          animation: 'fade'
        }
      ]
    }
  ]
};

// Narration script for audio generation
export const fimDaBrincadeiraNarration = `
98 por cento...

[pausa de 2 segundos]

...das pessoas...

[pausa de 2 segundos]

...usam inteligência artificial como...

[pausa dramática]

...BRINQUEDO.

Sim. Brinquedo.

"Conta uma piada."
"Faz um poema sobre batata."
"Escreve como pirata."

Curiosidade. Teste. Diversão passageira.

Enquanto 98% brincam...

Os outros 2% faturam 30 mil reais por mês.
Trabalhando 2 horas por dia.
Com 10 vezes mais produtividade.

Não é exagero. É matemática.

98% perguntam: "O que a IA pode fazer?"
2% perguntam: "O que EU posso fazer com a IA?"

98% ganham zero reais extras.
2% criaram uma nova profissão.

E tem mais...

Eric Schmidt, ex-CEO do Google, acabou de alertar:
"Vem aí um caos de 7 anos. 
Quem não dominar IA agora, será dominado por ela."

Não em 20 anos. 
Não em 10 anos.
Em 7 anos.

A janela está fechando.
E você? De que lado vai estar?

Vamos descobrir em qual grupo você está.

Teste relâmpago.
Seja honesto.

Suas últimas 5 interações com IA foram para quê?

Se você marcou mais curiosidade que estratégia...

Você está no grupo dos 98%.

E está literalmente perdendo 2 mil reais por mês.

Todo mês.
24 mil por ano.
Jogados fora.

Mas calma...

Isso muda hoje.
Nos próximos 5 minutos.

Vou te provar uma coisa.

A diferença entre ganhar ZERO e ganhar 500 reais 
está em 30 segundos de conhecimento.

Observe.

DESAFIO: Criar posts para uma loja de roupas femininas.

Primeiro, o jeito AMADOR - como 98% fazem:

Genérico. Sem alma. Sem personalidade.
Qualquer IA grátis faz isso.
Valor comercial: ZERO reais.

Agora observe o modo PROFISSIONAL - como os 2% fazem:

Viu a diferença?

Primeiro: genérico, esquecível, gratuito.
Segundo: único, memorável, vendedor.

Tempo extra investido: 30 segundos.
Valor comercial: 500 reais.

500 reais por 30 segundos.
Isso é mil reais por minuto.
60 mil reais por hora.

E você ainda está brincando de "conta piada"?

A diferença entre zero e 500 reais não é talento.
Não é experiência.
Não é diploma.

É MÉTODO.

Os 2% conhecem o método.
Os 98% não.

Simples assim.

E aqui está o mapa completo do que você vai dominar:

ChatGPT - O Camaleão Digital
Adapta-se a qualquer situação.

Claude - O Professor Particular  
Explica o complexo como se fosse simples.

Gemini - O Pesquisador Obsessivo
Conectado ao Google. Informações em tempo real.

Perplexity - O Detetive da Internet
Sempre mostra as fontes. Verifica tudo.

Grok - O Comediante Inteligente
Respostas não convencionais. Humor que vende.

Em 30 dias:
Você cobrando 500 reais por post.

Em 90 dias:
5 mil reais mensais extras.

Em 6 meses:
Você ensinando outros e cobrando por isso.

Não é promessa.
É matemática.
É o que acontece quando você sai dos 98%
e entra nos 2%.

Agora você tem duas opções.

Opção 1: 
Continuar nos 98%.
Brincando com IA.
Perdendo 2 mil por mês.

Opção 2:
Entrar nos 2%.
Dominar o método.
Começar a faturar.

A escolha é sua.
E é agora.
`;
