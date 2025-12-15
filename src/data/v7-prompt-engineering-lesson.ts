// src/data/v7-prompt-engineering-lesson.ts
// V7 Cinematic Lesson Example: Prompt Engineering - R$ 0 vs R$ 500

import { V7CinematicLesson } from '@/types/v7-cinematic.types';

export const v7PromptEngineeringLesson: V7CinematicLesson = {
  id: 'v7-prompt-engineering-r0-vs-r500',
  model: 'v7-cinematic',
  title: 'ChatGPT Profissional - Do Amador ao R$ 30k/mês',
  subtitle: 'A diferença brutal entre quem brinca e quem lucra com IA',
  duration: 480, // 8 minutes

  metadata: {
    difficulty: 'beginner',
    category: 'prompt-engineering',
    tags: ['chatgpt', 'prompts', 'gpt-4', 'dinheiro', 'produtividade'],
    description:
      '98% das pessoas usa IA como brinquedo. Os 2% que dominam fazem R$ 30k/mês. A diferença? Saber COMO pedir.',
    learningObjectives: [
      'Dominar o Método PERFEITO de prompts',
      'Criar prompts que geram resultados vendáveis',
      'Economizar 20+ horas por semana com IA',
      'Transformar IA em ferramenta de renda',
    ],
    prerequisites: [],
    estimatedTime: 8,
    version: '1.0.0',
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: '2025-12-15T00:00:00Z',
    author: 'IA Master Coach',
  },

  cinematicFlow: {
    acts: [
      // ========================================================================
      // ATO 1: ENTRADA DRAMÁTICA - 98%
      // ========================================================================
      {
        id: 'act-1-98-percent',
        type: 'narrative',
        title: '98% das Pessoas',
        startTime: 0,
        duration: 30,
        content: {
          visual: {
            type: 'slide',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              opacity: 1,
            },
            layers: [
              {
                id: 'big-number',
                type: 'text',
                zIndex: 10,
                position: { x: '50%', y: '50%', width: 'auto', height: 'auto' },
                content: {
                  text: '98%',
                  fontSize: '10rem',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  textAlign: 'center',
                  transform: 'translate(-50%, -50%)',
                },
                animation: {
                  type: 'scale',
                  duration: 1000,
                  easing: 'ease-out',
                  keyframes: [
                    { time: 0, properties: { scale: 0, opacity: 0 } },
                    { time: 1, properties: { scale: 1, opacity: 1 } },
                  ],
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 0,
              end: 10,
              text: '98% das pessoas...',
            },
            musicVolume: 0.3,
          },
          animations: [],
          particles: [
            {
              id: 'fade-particles',
              type: 'sparkles',
              density: 20,
              colors: ['#ef4444', '#991b1b'],
              lifetime: 3000,
            },
          ],
        },
        interactions: [],
        transitions: {
          in: { type: 'fade', easing: 'ease-in' },
          out: { type: 'fade', easing: 'ease-out' },
        },
        metadata: {
          importance: 'high',
          skipable: false,
        },
      },

      // ========================================================================
      // ATO 2: REVELAÇÃO - COMO BRINQUEDO
      // ========================================================================
      {
        id: 'act-2-toy-usage',
        type: 'revelation',
        title: 'Usando IA como Brinquedo',
        startTime: 30,
        duration: 45,
        content: {
          visual: {
            type: 'slide',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            },
            layers: [
              {
                id: 'main-text',
                type: 'text',
                zIndex: 10,
                position: { x: '50%', y: '20%', width: '80%', height: 'auto' },
                content: {
                  text: '98% das pessoas\nusam IA como',
                  fontSize: '2.5rem',
                  color: '#ffffff',
                  textAlign: 'center',
                },
                animation: {
                  type: 'slide',
                  duration: 800,
                  delay: 0,
                },
              },
              {
                id: 'toy-text',
                type: 'text',
                zIndex: 11,
                position: { x: '50%', y: '50%', width: 'auto', height: 'auto' },
                content: {
                  text: 'BRINQUEDO',
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  textAlign: 'center',
                  letterSpacing: '0.1em',
                },
                animation: {
                  type: 'scale',
                  duration: 1000,
                  delay: 500,
                },
              },
              {
                id: 'examples',
                type: 'text',
                zIndex: 12,
                position: { x: '50%', y: '70%', width: '70%', height: 'auto' },
                content: {
                  html: `
                    <div style="display: flex; justify-content: space-around; gap: 2rem; margin-top: 2rem;">
                      <div style="text-align: center;">
                        <div style="font-size: 3rem;">😂</div>
                        <div style="font-size: 1rem; color: #9ca3af; margin-top: 0.5rem;">"Conta piada"</div>
                      </div>
                      <div style="text-align: center;">
                        <div style="font-size: 3rem;">🎮</div>
                        <div style="font-size: 1rem; color: #9ca3af; margin-top: 0.5rem;">"Faz poema"</div>
                      </div>
                      <div style="text-align: center;">
                        <div style="font-size: 3rem;">💭</div>
                        <div style="font-size: 1rem; color: #9ca3af; margin-top: 0.5rem;">"Curiosidade"</div>
                      </div>
                      <div style="text-align: center;">
                        <div style="font-size: 3rem;">🎪</div>
                        <div style="font-size: 1rem; color: #9ca3af; margin-top: 0.5rem;">"Teste"</div>
                      </div>
                    </div>
                  `,
                },
                animation: {
                  type: 'fade',
                  duration: 1000,
                  delay: 1000,
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 10,
              end: 30,
              text:
                '98% das pessoas usam IA como um brinquedo. Eles pedem piadas, poemas, curiosidades, fazem testes...',
            },
          },
          animations: [],
        },
        interactions: [],
        transitions: {
          in: { type: 'slide', direction: 'left' },
          out: { type: 'fade' },
        },
        metadata: {
          importance: 'high',
          skipable: false,
        },
      },

      // ========================================================================
      // ATO 3: COMPARAÇÃO - OS 2%
      // ========================================================================
      {
        id: 'act-3-the-2-percent',
        type: 'revelation',
        title: 'Os 2% que Dominam',
        startTime: 75,
        duration: 50,
        content: {
          visual: {
            type: 'split-screen',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            },
            layers: [
              {
                id: 'title',
                type: 'text',
                zIndex: 10,
                position: { x: '50%', y: '10%', width: '80%', height: 'auto' },
                content: {
                  text: 'Enquanto isso...',
                  fontSize: '2rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                },
              },
              {
                id: 'comparison',
                type: 'comparison',
                zIndex: 11,
                position: { x: '50%', y: '50%', width: '90%', height: '70%' },
                content: {
                  leftSide: {
                    title: 'OS 2% QUE DOMINAM',
                    titleColor: '#22c55e',
                    items: [
                      { icon: '💰', text: 'R$ 30.000/mês', highlight: true },
                      { icon: '⏰', text: '2 horas/dia' },
                      { icon: '🚀', text: '10x produtividade' },
                      { icon: '🎯', text: 'Resultados reais' },
                    ],
                  },
                  rightSide: {
                    title: 'OS 98% BRINCANDO',
                    titleColor: '#ef4444',
                    items: [
                      { icon: '😢', text: 'R$ 0', highlight: true },
                      { icon: '😴', text: '8 horas/dia' },
                      { icon: '🐌', text: 'Mesmos resultados' },
                      { icon: '🎪', text: 'Só diversão' },
                    ],
                  },
                },
                animation: {
                  type: 'slide',
                  duration: 1200,
                  delay: 300,
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 30,
              end: 60,
              text:
                'Enquanto isso, os 2% que DOMINAM IA estão fazendo R$ 30.000 por mês, trabalhando apenas 2 horas por dia. A diferença? Eles sabem exatamente COMO pedir.',
            },
            effects: [
              {
                id: 'cash-sound',
                url: '/audio/effects/cash-register.mp3',
                triggerTime: 35,
                volume: 0.5,
              },
            ],
          },
          animations: [],
        },
        interactions: [],
        transitions: {
          in: { type: 'slide', direction: 'up' },
          out: { type: 'dissolve' },
        },
        metadata: {
          importance: 'high',
          skipable: false,
        },
      },

      // ========================================================================
      // ATO 4: INTERAÇÃO - AUTOAVALIAÇÃO
      // ========================================================================
      {
        id: 'act-4-self-assessment',
        type: 'interactive',
        title: 'Teste Relâmpago',
        startTime: 125,
        duration: 40,
        content: {
          visual: {
            type: 'interactive',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            },
            layers: [
              {
                id: 'quiz-container',
                type: 'code',
                zIndex: 10,
                position: { x: '50%', y: '50%', width: '80%', height: '70%' },
                content: {
                  type: 'multiple-choice',
                  question: 'Suas últimas 5 interações com IA foram para:',
                  options: [
                    {
                      id: 'productive',
                      group: 'Profissional',
                      items: [
                        'Resolver problema real',
                        'Automatizar tarefa',
                        'Ganhar dinheiro',
                        'Economizar tempo real',
                      ],
                    },
                    {
                      id: 'playing',
                      group: 'Amador',
                      items: ['Curiosidade', 'Teste', 'Brincadeira', 'Diversão'],
                    },
                  ],
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 60,
              end: 80,
              text:
                'Antes de continuar, vou te fazer um teste rápido. Seja honesto. Suas últimas 5 interações com IA foram para resolver problemas reais ou só por curiosidade?',
            },
          },
          animations: [],
        },
        interactions: [
          {
            id: 'self-check',
            type: 'choice',
            trigger: { element: 'quiz-container', delay: 5000 },
            response: {
              type: 'feedback',
              action: 'show-result',
              parameters: {
                lowScore: {
                  message: 'Você está no grupo dos 98%',
                  color: '#ef4444',
                  subtext: 'Perdendo R$ 2.000/mês',
                },
                highScore: {
                  message: 'Você está caminhando para os 2%',
                  color: '#22c55e',
                  subtext: 'Continue assim!',
                },
              },
            },
          },
        ],
        transitions: {
          in: { type: 'zoom' },
          out: { type: 'fade' },
        },
        metadata: {
          importance: 'medium',
          skipable: false,
        },
      },

      // ========================================================================
      // ATO 5: DESAFIO - PLAYGROUND R$ 0 VS R$ 500
      // ========================================================================
      {
        id: 'act-5-challenge-r0-vs-r500',
        type: 'challenge',
        title: 'Desafio: R$ 0 vs R$ 500',
        startTime: 165,
        duration: 180, // 3 minutes for practice
        content: {
          visual: {
            type: 'split-screen',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #0c0a1f 0%, #1e1b3c 100%)',
            },
            layers: [
              {
                id: 'playground',
                type: 'playground',
                zIndex: 10,
                position: { x: 0, y: 0, width: '100%', height: '100%' },
                content: {
                  type: 'comparative-playground',
                  config: {
                    title: '🎮 DESAFIO: Genérico vs Estratégico',
                    description: 'Veja a diferença entre R$ 0 e R$ 500',
                    mode: 'split-screen',
                    amateur: {
                      id: 'amateur',
                      title: 'ROUND 1: Jeito Amador (98%)',
                      description: 'Digite um prompt GENÉRICO como você normalmente faria:',
                      editor: {
                        language: 'plaintext',
                        initialCode: '',
                        readOnly: false,
                        theme: 'vs-dark',
                      },
                      preview: {
                        type: 'console',
                        autoRefresh: true,
                        showConsole: true,
                      },
                      guidance: {
                        hints: [
                          'A maioria digita algo como: "me ajuda com posts"',
                          'Ou: "crie textos para vender"',
                          'Genérico = R$ 0',
                        ],
                        commonMistakes: [
                          'Não especificar público',
                          'Não definir objetivo',
                          'Não dar contexto',
                        ],
                      },
                    },
                    professional: {
                      id: 'professional',
                      title: 'ROUND 2: Jeito Profissional (2%)',
                      description: 'Use o Método PERFEITO - seja ESPECÍFICO:',
                      editor: {
                        language: 'plaintext',
                        initialCode: `PAPEL: Atue como [especialista em...]
TAREFA: Crie [quantidade e tipo específico]
CONTEXTO: Para [público exato com idade, classe, desejo]
FORMATO: Apresente como [estrutura desejada]
TOM: Use linguagem [estilo específico]
OBJETIVO: Para conseguir [resultado mensurável]`,
                        readOnly: false,
                        theme: 'vs-dark',
                      },
                      preview: {
                        type: 'console',
                        autoRefresh: true,
                        showConsole: true,
                      },
                      guidance: {
                        hints: [
                          'Preencha cada campo com informações específicas',
                          'Quanto mais contexto, melhor o resultado',
                          'Profissional = R$ 500+',
                        ],
                        bestPractices: [
                          'Sempre defina o público-alvo',
                          'Especifique o resultado desejado',
                          'Dê exemplos do que você quer',
                        ],
                      },
                    },
                    comparison: {
                      metrics: [
                        {
                          id: 'specificity',
                          name: 'Especificidade',
                          amateurValue: '10%',
                          professionalValue: '95%',
                          unit: '',
                          description: 'Nível de detalhamento',
                        },
                        {
                          id: 'value',
                          name: 'Valor Comercial',
                          amateurValue: 'R$ 0',
                          professionalValue: 'R$ 500',
                          unit: '',
                          description: 'Quanto alguém pagaria',
                        },
                      ],
                      highlights: [
                        {
                          id: 'context',
                          title: 'Contexto Detalhado',
                          description:
                            'Prompts profissionais sempre incluem contexto completo do público e objetivo',
                          importance: 'high',
                        },
                      ],
                      analysis: {
                        enabled: true,
                        realTime: true,
                        aspects: [
                          {
                            id: 'specificity',
                            name: 'Especificidade',
                            description: 'Quão específico é seu prompt',
                            weight: 0.3,
                          },
                          {
                            id: 'context',
                            name: 'Contexto',
                            description: 'Informações de público e objetivo',
                            weight: 0.3,
                          },
                          {
                            id: 'structure',
                            name: 'Estrutura',
                            description: 'Uso de frameworks como PERFEITO',
                            weight: 0.2,
                          },
                          {
                            id: 'actionability',
                            name: 'Acionabilidade',
                            description: 'Quão pronto o resultado está para uso',
                            weight: 0.2,
                          },
                        ],
                      },
                    },
                    feedback: {
                      type: 'live',
                      aiEnabled: true,
                      showDiff: true,
                      suggestions: [
                        'Adicione mais contexto sobre o público',
                        'Especifique o resultado desejado',
                        'Defina o tom de voz',
                        'Inclua exemplos do que você quer',
                      ],
                    },
                  },
                },
                interactive: true,
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 80,
              end: 120,
              text:
                'Agora vou te dar um desafio real. Um problema que alguém pagaria R$ 500 para resolver. Você vai ver AO VIVO a diferença entre o jeito amador e o jeito profissional.',
            },
          },
          animations: [],
        },
        interactions: [
          {
            id: 'submit-amateur',
            type: 'input',
            trigger: { element: 'amateur-submit', condition: 'click' },
            response: {
              type: 'feedback',
              action: 'show-amateur-result',
            },
            validation: [
              {
                type: 'function',
                rule: (value: string) => value.length > 10,
                message: 'Digite pelo menos 10 caracteres',
              },
            ],
          },
          {
            id: 'submit-professional',
            type: 'input',
            trigger: { element: 'professional-submit', condition: 'click' },
            response: {
              type: 'feedback',
              action: 'show-professional-result',
            },
            validation: [
              {
                type: 'function',
                rule: (value: string) => value.length > 50,
                message: 'Seja mais específico (mínimo 50 caracteres)',
              },
            ],
          },
        ],
        transitions: {
          in: { type: 'slide', direction: 'left' },
          out: { type: 'fade' },
        },
        metadata: {
          importance: 'high',
          skipable: false,
        },
      },

      // ========================================================================
      // ATO 6: REVELAÇÃO - O CAMINHO
      // ========================================================================
      {
        id: 'act-6-the-path',
        type: 'revelation',
        title: 'Os Superpoderes que Você Vai Dominar',
        startTime: 345,
        duration: 90,
        content: {
          visual: {
            type: 'slide',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            },
            layers: [
              {
                id: 'title',
                type: 'text',
                zIndex: 10,
                position: { x: '50%', y: '15%', width: '80%', height: 'auto' },
                content: {
                  text: 'OS SUPERPODERES\nQUE VOCÊ VAI DOMINAR:',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                },
              },
              {
                id: 'tools',
                type: 'text',
                zIndex: 11,
                position: { x: '50%', y: '50%', width: '70%', height: 'auto' },
                content: {
                  html: `
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                      <div style="background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e; padding: 1rem; border-radius: 0.5rem;">
                        <strong style="color: #22c55e;">→ ChatGPT:</strong> O Criativo
                      </div>
                      <div style="background: rgba(59, 130, 246, 0.1); border: 2px solid #3b82f6; padding: 1rem; border-radius: 0.5rem;">
                        <strong style="color: #3b82f6;">→ Claude:</strong> O Analista
                      </div>
                      <div style="background: rgba(168, 85, 247, 0.1); border: 2px solid #a855f7; padding: 1rem; border-radius: 0.5rem;">
                        <strong style="color: #a855f7;">→ Gemini:</strong> O Pesquisador
                      </div>
                      <div style="background: rgba(249, 115, 22, 0.1); border: 2px solid #f97316; padding: 1rem; border-radius: 0.5rem;">
                        <strong style="color: #f97316;">→ Perplexity:</strong> O Detetive
                      </div>
                      <div style="background: rgba(236, 72, 153, 0.1); border: 2px solid #ec4899; padding: 1rem; border-radius: 0.5rem;">
                        <strong style="color: #ec4899;">→ Grok:</strong> O Provocador
                      </div>
                    </div>
                  `,
                },
                animation: {
                  type: 'slide',
                  duration: 2000,
                  delay: 500,
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 120,
              end: 160,
              text:
                'Você não vai dominar apenas ChatGPT. Você vai aprender quando usar cada ferramenta. ChatGPT para criar, Claude para analisar, Gemini para pesquisar, Perplexity para investigar, Grok para provocar.',
            },
            effects: [
              {
                id: 'power-up',
                url: '/audio/effects/power-up.mp3',
                triggerTime: 125,
                volume: 0.4,
              },
            ],
          },
          animations: [],
          particles: [
            {
              id: 'success-confetti',
              type: 'confetti',
              density: 50,
              colors: ['#22c55e', '#3b82f6', '#a855f7', '#f97316'],
              lifetime: 4000,
            },
          ],
        },
        interactions: [],
        transitions: {
          in: { type: 'zoom' },
          out: { type: 'fade' },
        },
        metadata: {
          importance: 'high',
          skipable: false,
        },
      },

      // ========================================================================
      // ATO 7: OUTRO - CALL TO ACTION
      // ========================================================================
      {
        id: 'act-7-outro',
        type: 'outro',
        title: 'Sua Jornada Começa Agora',
        startTime: 435,
        duration: 45,
        content: {
          visual: {
            type: 'slide',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #0c0a1f 0%, #6366f1 100%)',
            },
            layers: [
              {
                id: 'cta',
                type: 'text',
                zIndex: 10,
                position: { x: '50%', y: '50%', width: '80%', height: 'auto' },
                content: {
                  html: `
                    <div style="text-align: center;">
                      <h2 style="font-size: 3rem; font-weight: bold; color: #ffffff; margin-bottom: 2rem;">
                        Pronto para sair dos 98%?
                      </h2>
                      <div style="background: rgba(99, 102, 241, 0.2); border: 2px solid #6366f1; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;">
                        <p style="font-size: 1.5rem; color: #c7d2fe; margin-bottom: 1rem;">
                          Próxima aula: <strong style="color: #ffffff;">Método PERFEITO em Ação</strong>
                        </p>
                        <p style="font-size: 1rem; color: #a5b4fc;">
                          Você vai criar seus primeiros R$ 500 com IA
                        </p>
                      </div>
                      <button style="
                        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                        color: white;
                        font-size: 1.5rem;
                        font-weight: bold;
                        padding: 1rem 3rem;
                        border-radius: 0.5rem;
                        border: none;
                        cursor: pointer;
                        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
                      ">
                        COMEÇAR JORNADA →
                      </button>
                    </div>
                  `,
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 160,
              end: 180,
              text:
                'Essa foi apenas a primeira lição. Agora você sabe a diferença. A pergunta é: você vai continuar brincando ou vai começar a lucrar?',
            },
          },
          animations: [],
        },
        interactions: [
          {
            id: 'continue',
            type: 'click',
            trigger: { element: 'cta-button' },
            response: {
              type: 'navigation',
              action: 'next-lesson',
            },
          },
        ],
        transitions: {
          in: { type: 'fade' },
          out: { type: 'fade' },
        },
        metadata: {
          importance: 'medium',
          skipable: true,
        },
      },
    ],

    timeline: {
      totalDuration: 480,
      acts: [
        {
          actId: 'act-1-98-percent',
          startTime: 0,
          endTime: 30,
          thumbnail: '/thumbnails/act-1.jpg',
          color: '#ef4444',
        },
        {
          actId: 'act-2-toy-usage',
          startTime: 30,
          endTime: 75,
          thumbnail: '/thumbnails/act-2.jpg',
          color: '#f97316',
        },
        {
          actId: 'act-3-the-2-percent',
          startTime: 75,
          endTime: 125,
          thumbnail: '/thumbnails/act-3.jpg',
          color: '#22c55e',
        },
        {
          actId: 'act-4-self-assessment',
          startTime: 125,
          endTime: 165,
          thumbnail: '/thumbnails/act-4.jpg',
          color: '#3b82f6',
        },
        {
          actId: 'act-5-challenge-r0-vs-r500',
          startTime: 165,
          endTime: 345,
          thumbnail: '/thumbnails/act-5.jpg',
          color: '#a855f7',
        },
        {
          actId: 'act-6-the-path',
          startTime: 345,
          endTime: 435,
          thumbnail: '/thumbnails/act-6.jpg',
          color: '#06b6d4',
        },
        {
          actId: 'act-7-outro',
          startTime: 435,
          endTime: 480,
          thumbnail: '/thumbnails/act-7.jpg',
          color: '#6366f1',
        },
      ],
      markers: [
        {
          id: 'first-interaction',
          timestamp: 125,
          type: 'interaction',
          label: 'Autoavaliação',
          icon: '✋',
        },
        {
          id: 'main-challenge',
          timestamp: 165,
          type: 'interaction',
          label: 'Desafio R$ 500',
          icon: '🎯',
        },
      ],
      chapters: [
        {
          id: 'intro',
          title: 'A Verdade Sobre 98%',
          startTime: 0,
          endTime: 125,
        },
        {
          id: 'practice',
          title: 'Desafio Prático',
          startTime: 125,
          endTime: 345,
        },
        {
          id: 'next-steps',
          title: 'Próximos Passos',
          startTime: 345,
          endTime: 480,
        },
      ],
    },

    transitions: [
      {
        id: 'trans-1-2',
        fromActId: 'act-1-98-percent',
        toActId: 'act-2-toy-usage',
        effect: { type: 'fade' },
        duration: 500,
      },
      {
        id: 'trans-2-3',
        fromActId: 'act-2-toy-usage',
        toActId: 'act-3-the-2-percent',
        effect: { type: 'slide', direction: 'up' },
        duration: 700,
      },
      {
        id: 'trans-3-4',
        fromActId: 'act-3-the-2-percent',
        toActId: 'act-4-self-assessment',
        effect: { type: 'zoom' },
        duration: 800,
      },
      {
        id: 'trans-4-5',
        fromActId: 'act-4-self-assessment',
        toActId: 'act-5-challenge-r0-vs-r500',
        effect: { type: 'slide', direction: 'left' },
        duration: 600,
      },
      {
        id: 'trans-5-6',
        fromActId: 'act-5-challenge-r0-vs-r500',
        toActId: 'act-6-the-path',
        effect: { type: 'dissolve' },
        duration: 1000,
      },
      {
        id: 'trans-6-7',
        fromActId: 'act-6-the-path',
        toActId: 'act-7-outro',
        effect: { type: 'fade' },
        duration: 800,
      },
    ],

    theme: {
      primary: '#6366f1',
      secondary: '#a855f7',
      background: '#0c0a1f',
      text: '#ffffff',
      accent: '#22c55e',
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
        code: 'JetBrains Mono, monospace',
      },
      borderRadius: 8,
      shadows: true,
    },
  },

  audioTrack: {
    narration: {
      url: '/audio/v7-prompt-engineering-narration.mp3',
      duration: 180,
      format: 'mp3',
      transcription: 'Full narration transcript...',
    },
    backgroundMusic: {
      url: '/audio/v7-background-music.mp3',
      duration: 480,
      format: 'mp3',
    },
    soundEffects: [
      {
        id: 'cash-sound',
        url: '/audio/effects/cash-register.mp3',
        triggerTime: 80,
        volume: 0.5,
      },
      {
        id: 'success-sound',
        url: '/audio/effects/success.mp3',
        triggerTime: 345,
        volume: 0.6,
      },
    ],
    syncPoints: [
      {
        id: 'sync-1',
        timestamp: 0,
        actId: 'act-1-98-percent',
        type: 'act-start',
      },
      {
        id: 'sync-2',
        timestamp: 30,
        actId: 'act-2-toy-usage',
        type: 'act-start',
      },
      {
        id: 'sync-3',
        timestamp: 75,
        actId: 'act-3-the-2-percent',
        type: 'act-start',
      },
      {
        id: 'sync-4',
        timestamp: 125,
        actId: 'act-4-self-assessment',
        type: 'act-start',
      },
      {
        id: 'sync-5',
        timestamp: 165,
        actId: 'act-5-challenge-r0-vs-r500',
        type: 'act-start',
      },
      {
        id: 'sync-6',
        timestamp: 345,
        actId: 'act-6-the-path',
        type: 'act-start',
      },
      {
        id: 'sync-7',
        timestamp: 435,
        actId: 'act-7-outro',
        type: 'act-start',
      },
    ],
    volume: {
      narration: 1.0,
      music: 0.3,
      effects: 0.5,
    },
  },

  interactionPoints: [
    {
      id: 'interaction-1',
      timestamp: 125,
      actId: 'act-4-self-assessment',
      type: 'choice',
      required: true,
      content: {
        question: 'Suas últimas 5 interações com IA foram para:',
        options: [
          {
            id: 'productive',
            text: 'Resolver problemas reais e ganhar dinheiro',
            correct: true,
            feedback: 'Parabéns! Você está no caminho certo para os 2%.',
          },
          {
            id: 'playing',
            text: 'Curiosidade e brincadeira',
            correct: false,
            feedback: 'Você está no grupo dos 98%. Mas isso muda HOJE.',
          },
        ],
      },
      points: 50,
    },
    {
      id: 'interaction-2',
      timestamp: 165,
      actId: 'act-5-challenge-r0-vs-r500',
      type: 'code-challenge',
      required: true,
      content: {
        question: 'Crie um prompt profissional usando o Método PERFEITO',
        codeTemplate: '',
        expectedCode: '', // Will be validated by AI
        placeholder: 'Digite seu prompt aqui...',
        hint: 'Use a estrutura: PAPEL, TAREFA, CONTEXTO, FORMATO, TOM, OBJETIVO',
      },
      feedback: {
        onSuccess: {
          type: 'combined',
          content: '🎉 Excelente! Seu prompt vale R$ 500+',
          animation: 'confetti',
        },
        onError: {
          type: 'text',
          content: 'Quase lá! Seja mais específico no CONTEXTO e OBJETIVO.',
        },
        realTime: true,
        aiAnalysis: true,
      },
      points: 200,
    },
  ],

  gamification: {
    enabled: true,
    xpRewards: [
      {
        id: 'complete-act',
        event: 'act-complete',
        amount: 25,
      },
      {
        id: 'interaction-success',
        event: 'interaction-success',
        amount: 50,
      },
      {
        id: 'challenge-complete',
        event: 'challenge-complete',
        amount: 200,
      },
      {
        id: 'perfect-score',
        event: 'perfect-score',
        amount: 500,
        multiplier: 2,
      },
    ],
    achievements: [
      {
        id: 'first-step',
        title: 'Saiu do Grupo 98%',
        description: 'Completou a primeira lição sobre IA profissional',
        icon: '🚀',
        condition: {
          type: 'complete-all-acts',
        },
        reward: 100,
        rarity: 'common',
      },
      {
        id: 'prompt-master',
        title: 'Mestre dos Prompts',
        description: 'Criou um prompt que vale R$ 500+',
        icon: '💎',
        condition: {
          type: 'perfect-score',
          parameters: { interactionId: 'interaction-2' },
        },
        reward: 300,
        rarity: 'epic',
      },
      {
        id: 'speed-run',
        title: 'Velocista',
        description: 'Completou a lição em menos de 5 minutos',
        icon: '⚡',
        condition: {
          type: 'speed-run',
          parameters: { maxTime: 300 },
        },
        reward: 150,
        rarity: 'rare',
      },
    ],
    scoring: {
      maxScore: 1000,
      criteria: [
        {
          id: 'completion',
          name: 'Completude',
          weight: 0.3,
          maxPoints: 300,
        },
        {
          id: 'accuracy',
          name: 'Precisão',
          weight: 0.4,
          maxPoints: 400,
        },
        {
          id: 'speed',
          name: 'Velocidade',
          weight: 0.2,
          maxPoints: 200,
        },
        {
          id: 'engagement',
          name: 'Engajamento',
          weight: 0.1,
          maxPoints: 100,
        },
      ],
      penalties: [
        {
          type: 'hint',
          amount: 10,
        },
        {
          type: 'attempt',
          amount: 5,
        },
      ],
    },
  },

  analytics: {
    enabled: true,
    events: [],
    metrics: [],
  },
};
