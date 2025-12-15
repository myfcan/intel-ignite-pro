// src/data/v7-test-lesson.ts
// Sample V7 Cinematic Lesson for testing

import { V7CinematicLesson } from '@/types/v7-cinematic.types';

export const v7TestLesson: V7CinematicLesson = {
  id: 'v7-test-async-await-001',
  model: 'v7-cinematic',
  title: 'JavaScript Async/Await - A Jornada Assíncrona',
  subtitle: 'Uma experiência cinematográfica pelo mundo do JavaScript assíncrono',
  duration: 420, // 7 minutes

  metadata: {
    difficulty: 'intermediate',
    category: 'javascript',
    tags: ['javascript', 'async', 'await', 'promises', 'asynchronous'],
    description:
      'Aprenda async/await de forma cinematográfica, comparando código amador com código profissional',
    learningObjectives: [
      'Compreender o funcionamento de async/await',
      'Dominar o tratamento de erros assíncronos',
      'Escrever código assíncrono profissional',
      'Evitar armadilhas comuns',
    ],
    prerequisites: ['JavaScript básico', 'Promises'],
    estimatedTime: 7,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'V7 Pipeline',
  },

  cinematicFlow: {
    acts: [
      // ACT 1: NARRATIVE - Introduction
      {
        id: 'act-1-intro',
        type: 'narrative',
        title: 'Bem-vindo à Era Assíncrona',
        startTime: 0,
        duration: 60,
        content: {
          visual: {
            type: 'slide',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: 1,
            },
            layers: [
              {
                id: 'layer-title',
                type: 'text',
                zIndex: 10,
                position: { x: '50%', y: '40%', width: '80%', height: 'auto' },
                content: `
                  <h1 class="text-6xl font-bold text-white text-center transform -translate-x-1/2 -translate-y-1/2">
                    JavaScript Async/Await
                  </h1>
                  <p class="text-2xl text-white/80 text-center mt-4 transform -translate-x-1/2">
                    Uma Jornada Assíncrona
                  </p>
                `,
                animation: {
                  type: 'fade',
                  duration: 1000,
                  delay: 0,
                  easing: 'ease-in-out',
                },
              },
              {
                id: 'layer-sparkles',
                type: 'animation',
                zIndex: 5,
                position: { x: '0', y: '0', width: '100%', height: '100%' },
                content: {},
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 0,
              end: 60,
              text:
                'Bem-vindo à jornada pelo mundo assíncrono do JavaScript. Hoje, vamos descobrir como o async/await revolucionou a forma como escrevemos código que lida com operações demoradas.',
            },
          },
          animations: [
            {
              id: 'anim-title-fade',
              target: 'layer-title',
              type: 'entrance',
              effect: 'fadeIn',
              duration: 1000,
              delay: 0,
            },
          ],
          particles: [
            {
              id: 'particle-sparkles',
              type: 'sparkles',
              density: 20,
              colors: ['#ffffff', '#667eea', '#764ba2'],
            },
          ],
        },
        transitions: {
          in: { type: 'fade', easing: 'ease-in' },
          out: { type: 'dissolve', easing: 'ease-out' },
        },
      },

      // ACT 2: INTERACTIVE - The Problem
      {
        id: 'act-2-problem',
        type: 'interactive',
        title: 'O Problema: Callback Hell',
        startTime: 60,
        duration: 90,
        content: {
          visual: {
            type: 'split-screen',
            background: {
              type: 'color',
              value: '#0f172a',
            },
            layers: [
              {
                id: 'layer-code-bad',
                type: 'code',
                zIndex: 10,
                position: { x: '5%', y: '10%', width: '90%', height: '70%' },
                content: {
                  code: `// ❌ Callback Hell - Código Difícil de Ler
fetchUser(userId, function(user) {
  fetchPosts(user.id, function(posts) {
    fetchComments(posts[0].id, function(comments) {
      fetchLikes(comments[0].id, function(likes) {
        // Agora temos os likes...
        // Mas olha essa bagunça! 😱
        console.log(likes);
      });
    });
  });
});`,
                },
                animation: {
                  type: 'slide',
                  duration: 800,
                  delay: 200,
                  easing: 'ease-out',
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 60,
              end: 150,
              text:
                'Antes do async/await, tínhamos o temido callback hell. Veja este código: callbacks dentro de callbacks, criando uma pirâmide do terror. Difícil de ler, difícil de manter, e impossível de debugar.',
            },
          },
          animations: [],
        },
        interactions: [
          {
            id: 'interaction-spot-problems',
            type: 'click',
            trigger: {
              element: 'layer-code-bad',
            },
            response: {
              type: 'visual',
              action: 'highlight',
              parameters: { color: 'red' },
            },
          },
        ],
        transitions: {
          in: { type: 'slide', direction: 'left', easing: 'ease-in' },
          out: { type: 'slide', direction: 'right', easing: 'ease-out' },
        },
      },

      // ACT 3: REVELATION - The Solution
      {
        id: 'act-3-solution',
        type: 'revelation',
        title: 'A Solução: Async/Await',
        startTime: 150,
        duration: 90,
        content: {
          visual: {
            type: 'split-screen',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            },
            layers: [
              {
                id: 'layer-code-good',
                type: 'code',
                zIndex: 10,
                position: { x: '5%', y: '10%', width: '90%', height: '70%' },
                content: {
                  code: `// ✅ Async/Await - Código Limpo e Elegante
async function getUserData(userId) {
  const user = await fetchUser(userId);
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  const likes = await fetchLikes(comments[0].id);

  // Limpo, sequencial, fácil de ler! 🎉
  return likes;
}`,
                },
                animation: {
                  type: 'fade',
                  duration: 1000,
                  delay: 0,
                  easing: 'ease-in',
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 150,
              end: 240,
              text:
                'E então surgiu async/await! Veja a diferença: o mesmo código, mas agora linear, legível, elegante. Parece código síncrono, mas com todos os benefícios do assíncrono.',
            },
          },
          animations: [
            {
              id: 'anim-code-reveal',
              target: 'layer-code-good',
              type: 'entrance',
              effect: 'fadeIn',
              duration: 1000,
              delay: 0,
            },
          ],
          particles: [
            {
              id: 'particle-success',
              type: 'stars',
              density: 15,
              colors: ['#10b981', '#34d399'],
            },
          ],
        },
        transitions: {
          in: { type: 'zoom', easing: 'ease-out' },
          out: { type: 'fade', easing: 'ease-in' },
        },
      },

      // ACT 4: CHALLENGE - Amateur vs Professional
      {
        id: 'act-4-comparison',
        type: 'challenge',
        title: 'Amateur vs Professional',
        startTime: 240,
        duration: 150,
        content: {
          visual: {
            type: 'split-screen',
            background: {
              type: 'color',
              value: '#000000',
            },
            layers: [
              {
                id: 'layer-comparison',
                type: 'comparison',
                zIndex: 10,
                position: { x: '0', y: '0', width: '100%', height: '100%' },
                content: {
                  id: 'comparison-1',
                  type: 'amateur-vs-professional',
                  layout: 'split-vertical',
                  amateur: {
                    id: 'amateur-pane',
                    title: '🟠 Código Amador',
                    description: 'Sem tratamento de erros',
                    editor: {
                      language: 'javascript',
                      initialCode: `async function getData() {
  // ❌ Sem tratamento de erros!
  const data = await fetch('/api/data');
  const json = await data.json();
  return json;
}`,
                      readOnly: false,
                      theme: 'dark',
                    },
                    preview: {
                      type: 'console',
                      autoRefresh: true,
                      showConsole: true,
                    },
                    guidance: {
                      hints: [
                        'O que acontece se fetch falhar?',
                        'E se data.json() lançar um erro?',
                        'Usuário vai ver erro genérico',
                      ],
                      bestPractices: ['Sempre use try/catch', 'Valide dados', 'Trate erros'],
                      commonMistakes: ['Esquecer try/catch', 'Não validar response'],
                    },
                  },
                  professional: {
                    id: 'professional-pane',
                    title: '🟢 Código Professional',
                    description: 'Com tratamento completo de erros',
                    editor: {
                      language: 'javascript',
                      initialCode: `async function getData() {
  try {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const json = await response.json();
    return { success: true, data: json };

  } catch (error) {
    console.error('Failed to fetch data:', error);
    return { success: false, error: error.message };
  }
}`,
                      readOnly: true,
                      highlightLines: [3, 4, 5, 10, 11, 12],
                      theme: 'dark',
                    },
                    preview: {
                      type: 'console',
                      autoRefresh: true,
                      showConsole: true,
                    },
                  },
                  comparison: {
                    metrics: [
                      {
                        id: 'metric-error-handling',
                        name: 'Tratamento de Erros',
                        amateurValue: '0%',
                        professionalValue: '100%',
                        unit: '',
                        description: 'Robustez do código',
                      },
                      {
                        id: 'metric-user-experience',
                        name: 'Experiência do Usuário',
                        amateurValue: 'Ruim',
                        professionalValue: 'Excelente',
                        description: 'Feedback e mensagens',
                      },
                    ],
                    highlights: [
                      {
                        id: 'highlight-1',
                        title: 'Validação de Response',
                        description: 'Código profissional verifica se response.ok é true',
                        professionalLines: [3, 4, 5],
                        importance: 'high',
                      },
                      {
                        id: 'highlight-2',
                        title: 'Try/Catch Block',
                        description: 'Captura qualquer erro e trata adequadamente',
                        professionalLines: [2, 10, 11, 12],
                        importance: 'high',
                      },
                    ],
                    analysis: {
                      enabled: true,
                      realTime: true,
                      aspects: [
                        {
                          id: 'aspect-reliability',
                          name: 'Confiabilidade',
                          description: 'Código profissional é muito mais confiável',
                          weight: 0.4,
                        },
                        {
                          id: 'aspect-maintainability',
                          name: 'Manutenibilidade',
                          description: 'Mais fácil de manter e debugar',
                          weight: 0.3,
                        },
                      ],
                    },
                  },
                  feedback: {
                    type: 'continuous',
                    aiEnabled: true,
                    showDiff: true,
                    suggestions: [
                      'Adicione try/catch',
                      'Valide response.ok',
                      'Retorne objeto com success/error',
                    ],
                  },
                },
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 240,
              end: 390,
              text:
                'Agora vamos comparar: à esquerda, código amador sem tratamento de erros. À direita, código profissional robusto. Veja as diferenças: validação de response, try/catch completo, mensagens de erro informativas. Esta é a diferença entre código que quebra e código que funciona.',
            },
          },
          animations: [],
        },
        transitions: {
          in: { type: 'wipe', direction: 'left', easing: 'ease-in-out' },
          out: { type: 'fade', easing: 'ease-out' },
        },
      },

      // ACT 5: OUTRO - Conclusion
      {
        id: 'act-5-outro',
        type: 'outro',
        title: 'Parabéns!',
        startTime: 390,
        duration: 30,
        content: {
          visual: {
            type: 'slide',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
            layers: [
              {
                id: 'layer-outro',
                type: 'text',
                zIndex: 10,
                position: { x: '50%', y: '50%', width: '80%', height: 'auto' },
                content: `
                  <div class="text-center transform -translate-x-1/2 -translate-y-1/2">
                    <h1 class="text-6xl font-bold text-white mb-4">🎉 Parabéns!</h1>
                    <p class="text-2xl text-white/90 mb-6">
                      Você dominou Async/Await
                    </p>
                    <div class="text-xl text-white/80">
                      <p>✅ Entendeu o problema do callback hell</p>
                      <p>✅ Aprendeu a sintaxe async/await</p>
                      <p>✅ Dominou tratamento de erros</p>
                    </div>
                  </div>
                `,
              },
            ],
          },
          audio: {
            narrationSegment: {
              start: 390,
              end: 420,
              text:
                'Parabéns! Você completou esta jornada cinematográfica pelo async/await. Agora você está pronto para escrever código assíncrono profissional!',
            },
          },
          animations: [],
          particles: [
            {
              id: 'particle-confetti',
              type: 'confetti',
              density: 100,
              colors: ['#667eea', '#764ba2', '#ffffff', '#ffd700'],
            },
          ],
        },
        transitions: {
          in: { type: 'zoom', easing: 'ease-out' },
          out: { type: 'fade', easing: 'ease-in' },
        },
      },
    ],

    timeline: {
      totalDuration: 420,
      acts: [
        {
          actId: 'act-1-intro',
          startTime: 0,
          endTime: 60,
          color: '#667eea',
        },
        {
          actId: 'act-2-problem',
          startTime: 60,
          endTime: 150,
          color: '#ef4444',
        },
        {
          actId: 'act-3-solution',
          startTime: 150,
          endTime: 240,
          color: '#10b981',
        },
        {
          actId: 'act-4-comparison',
          startTime: 240,
          endTime: 390,
          color: '#f59e0b',
        },
        {
          actId: 'act-5-outro',
          startTime: 390,
          endTime: 420,
          color: '#8b5cf6',
        },
      ],
      markers: [
        {
          id: 'marker-problem-intro',
          timestamp: 60,
          type: 'highlight',
          label: 'Problema Introduzido',
        },
        {
          id: 'marker-solution-reveal',
          timestamp: 150,
          type: 'highlight',
          label: 'Solução Revelada',
        },
        {
          id: 'marker-comparison-start',
          timestamp: 240,
          type: 'interaction',
          label: 'Comparação Começa',
        },
      ],
      chapters: [
        {
          id: 'chapter-1',
          title: 'Introdução',
          startTime: 0,
          endTime: 60,
        },
        {
          id: 'chapter-2',
          title: 'O Problema',
          startTime: 60,
          endTime: 150,
        },
        {
          id: 'chapter-3',
          title: 'A Solução',
          startTime: 150,
          endTime: 240,
        },
        {
          id: 'chapter-4',
          title: 'Prática',
          startTime: 240,
          endTime: 390,
        },
        {
          id: 'chapter-5',
          title: 'Conclusão',
          startTime: 390,
          endTime: 420,
        },
      ],
    },

    transitions: [
      {
        id: 'trans-1-to-2',
        fromActId: 'act-1-intro',
        toActId: 'act-2-problem',
        effect: { type: 'dissolve', easing: 'ease-in-out' },
        duration: 500,
      },
      {
        id: 'trans-2-to-3',
        fromActId: 'act-2-problem',
        toActId: 'act-3-solution',
        effect: { type: 'slide', direction: 'right', easing: 'ease-in-out' },
        duration: 700,
      },
      {
        id: 'trans-3-to-4',
        fromActId: 'act-3-solution',
        toActId: 'act-4-comparison',
        effect: { type: 'wipe', direction: 'left', easing: 'ease-in-out' },
        duration: 800,
      },
      {
        id: 'trans-4-to-5',
        fromActId: 'act-4-comparison',
        toActId: 'act-5-outro',
        effect: { type: 'zoom', easing: 'ease-out' },
        duration: 600,
      },
    ],
  },

  audioTrack: {
    narration: {
      url: '/audio/v7-async-await-narration.mp3',
      duration: 420,
      format: 'mp3',
      transcription: 'Full transcription would be here...',
    },
    backgroundMusic: {
      url: '/audio/v7-background-music.mp3',
      duration: 420,
      format: 'mp3',
    },
    syncPoints: [
      {
        id: 'sync-1',
        timestamp: 60,
        actId: 'act-2-problem',
        type: 'act-start',
      },
      {
        id: 'sync-2',
        timestamp: 150,
        actId: 'act-3-solution',
        type: 'act-start',
      },
      {
        id: 'sync-3',
        timestamp: 240,
        actId: 'act-4-comparison',
        type: 'act-start',
      },
      {
        id: 'sync-4',
        timestamp: 390,
        actId: 'act-5-outro',
        type: 'act-start',
      },
    ],
    volume: {
      narration: 1,
      music: 0.3,
      effects: 0.7,
    },
  },

  interactionPoints: [
    {
      id: 'interaction-1',
      timestamp: 145,
      actId: 'act-2-problem',
      type: 'reflection',
      required: false,
      content: {
        question: 'Você já enfrentou callback hell no seu código?',
        options: [
          { id: 'opt-1', text: 'Sim, muitas vezes', correct: false },
          { id: 'opt-2', text: 'Algumas vezes', correct: false },
          { id: 'opt-3', text: 'Nunca', correct: false },
        ],
      },
      points: 10,
    },
    {
      id: 'interaction-2',
      timestamp: 235,
      actId: 'act-3-solution',
      type: 'quiz',
      required: true,
      content: {
        question: 'Qual a principal vantagem do async/await?',
        options: [
          { id: 'opt-1', text: 'Código mais rápido', correct: false },
          { id: 'opt-2', text: 'Código mais legível', correct: true },
          { id: 'opt-3', text: 'Usa menos memória', correct: false },
        ],
      },
      feedback: {
        onSuccess: {
          type: 'combined',
          content: '🎉 Correto! Async/await torna o código assíncrono muito mais legível!',
          duration: 3000,
        },
        onError: {
          type: 'text',
          content: '❌ Não exatamente. A principal vantagem é a legibilidade!',
          duration: 3000,
        },
      },
      points: 50,
    },
  ],

  gamification: {
    enabled: true,
    xpRewards: [
      {
        id: 'xp-act-complete',
        event: 'act-complete',
        amount: 20,
      },
      {
        id: 'xp-interaction-success',
        event: 'interaction-success',
        amount: 50,
      },
      {
        id: 'xp-lesson-complete',
        event: 'challenge-complete',
        amount: 100,
      },
    ],
    achievements: [
      {
        id: 'achievement-first-act',
        title: 'Primeira Jornada',
        description: 'Complete o primeiro ato',
        condition: {
          type: 'complete-all-acts',
          parameters: { count: 1 },
        },
        reward: 50,
        rarity: 'common',
      },
      {
        id: 'achievement-perfect-score',
        title: 'Mestre Assíncrono',
        description: 'Complete a lição com pontuação perfeita',
        condition: {
          type: 'perfect-score',
        },
        reward: 200,
        rarity: 'epic',
      },
    ],
    scoring: {
      maxScore: 100,
      criteria: [
        {
          id: 'criterion-completion',
          name: 'Completude',
          weight: 0.4,
          maxPoints: 40,
        },
        {
          id: 'criterion-interactions',
          name: 'Interações',
          weight: 0.3,
          maxPoints: 30,
        },
        {
          id: 'criterion-time',
          name: 'Tempo',
          weight: 0.3,
          maxPoints: 30,
        },
      ],
    },
    leaderboard: {
      enabled: true,
      scope: 'lesson',
    },
  },

  analytics: {
    enabled: true,
    events: [],
    metrics: [],
  },
};
