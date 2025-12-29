// src/services/v7-lesson-adapter.ts
// Adaptador que converte JSON simples do admin para V7CinematicLesson completo

import type {
  V7CinematicLesson,
  CinematicAct,
  AudioTrack,
  InteractionPoint,
  GamificationConfig
} from '@/types/v7-cinematic.types';

/**
 * JSON simplificado que vem do admin/pipeline
 */
interface AdminLessonInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimated_time: number;
  learning_objectives: string[];
  cinematic_flow: {
    timeline: {
      totalDuration: number;
    };
    acts: AdminAct[];
  };
}

interface AdminAct {
  id: string;
  type: string; // "dramatic", "comparison", "quiz", etc.
  title: string;
  duration: number;
  content: {
    visual: any;
    audio: {
      narration: string; // Texto simples da narração
    };
  };
}

/**
 * Converte tipo do admin para tipo V7
 */
function mapActType(adminType: string): CinematicAct['type'] {
  const typeMap: Record<string, CinematicAct['type']> = {
    'dramatic': 'narrative',
    'comparison': 'revelation',
    'narrative': 'narrative',
    'quiz': 'interactive',
    'interaction': 'interactive',
    'playground': 'challenge',
    'challenge': 'challenge',
    'reveal': 'revelation',
    'revelation': 'revelation',
    'cta': 'outro',
    'outro': 'outro',
    'gamification': 'outro',
  };

  return typeMap[adminType] || 'narrative';
}

/**
 * Gera URL de áudio placeholder (silencioso) para testes
 * Retorna data URI com 1 segundo de silêncio em MP3
 */
function generatePlaceholderAudioURL(actId: string, duration: number): string {
  // Data URI para 1 segundo de silêncio em MP3 (muito pequeno ~200 bytes)
  // O player vai fazer loop ou simplesmente não ter áudio durante o teste
  // Em produção, isso seria substituído por TTS real (ElevenLabs, etc.)

  // Usando URL vazia para evitar erros de carregamento
  // O V7AdvancedAudioEngine deve tratar URLs vazias graciosamente
  return '';

  // Alternativa: retornar caminho para arquivo de placeholder real
  // return '/audio/placeholder-silence.mp3';
}

/**
 * Converte ato do admin para ato V7 completo
 */
function adaptAct(adminAct: AdminAct, startTime: number): CinematicAct {
  const actType = mapActType(adminAct.type);

  // Determina background baseado no tipo
  const getBackground = () => {
    switch (adminAct.type) {
      case 'dramatic':
        return {
          type: 'gradient' as const,
          value: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          opacity: 1,
        };
      case 'comparison':
        return {
          type: 'gradient' as const,
          value: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          opacity: 1,
        };
      case 'quiz':
      case 'interaction':
        return {
          type: 'gradient' as const,
          value: 'linear-gradient(135deg, #312e81 0%, #4c1d95 100%)',
          opacity: 1,
        };
      case 'playground':
      case 'challenge':
        return {
          type: 'gradient' as const,
          value: 'linear-gradient(135deg, #0c0a1f 0%, #1e1b3c 100%)',
          opacity: 1,
        };
      default:
        return {
          type: 'gradient' as const,
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 1,
        };
    }
  };

  // Extract visual content from admin act
  const visualData = adminAct.content?.visual || {};

  // Create appropriate layers based on available data
  const layers: any[] = [];

  // Main text layer (title, narrative, or question)
  const mainText =
    visualData.text ||
    visualData.narrative ||
    visualData.question ||
    adminAct.title ||
    '';

  if (mainText) {
    layers.push({
      id: `${adminAct.id}-text`,
      type: 'text',
      zIndex: 10,
      position: { x: '50%', y: '50%', width: '80%', height: 'auto' },
      content: mainText,
    });
  }

  // Store interaction data separately in content for later extraction
  // This allows generateInteractionPoints to find quiz/challenge/cta data
  // Using type 'data' (not recognized by renderer) so it won't try to render it
  if (visualData.question || visualData.options || visualData.choices || visualData.code) {
    layers.push({
      id: `${adminAct.id}-interaction-data`,
      type: 'data' as any, // Not a recognized layer type, so renderer will skip it
      zIndex: 0,
      position: { x: '0', y: '0', width: '0', height: '0' },
      content: visualData, // Store full visual data for interaction extraction
    });
  }

  return {
    id: adminAct.id,
    type: actType,
    title: adminAct.title,
    startTime,
    duration: adminAct.duration,
    content: {
      visual: {
        type: 'slide',
        background: getBackground(),
        layers,
      },
      audio: {
        narrationSegment: {
          start: startTime,
          end: startTime + adminAct.duration,
          text: adminAct.content.audio?.narration || '',
        },
      },
      animations: [],
    },
    interactions: [],
    transitions: {
      in: { type: 'fade', easing: 'ease-in-out' },
      out: { type: 'fade', easing: 'ease-in-out' },
    },
    metadata: {
      importance: adminAct.type === 'dramatic' || adminAct.type === 'cta' ? 'high' : 'medium',
      skipable: false,
    },
  };
}

/**
 * Gera configuração de áudio para a lição
 */
function generateAudioTrack(
  lessonId: string,
  acts: CinematicAct[],
  totalDuration: number
): AudioTrack {
  return {
    narration: {
      url: generatePlaceholderAudioURL(lessonId, totalDuration),
      duration: totalDuration,
      format: 'mp3',
      // ✅ V7-v2 FIX: Check BOTH formats (V7-v2 direct + legacy nested)
      transcription: acts
        .map((act: any) =>
          act.narration ||                           // V7-v2 format (direct)
          act.content?.audio?.narration ||           // V7-v2 nested
          act.content?.audio?.narrationSegment?.text || // Legacy format
          ''
        )
        .join(' '),
    },
    backgroundMusic: {
      url: `/audio/background-music-${lessonId}.mp3`,
      duration: totalDuration,
      format: 'mp3',
    },
    soundEffects: [],
    syncPoints: acts.map((act) => ({
      id: `sync-${act.id}`,
      timestamp: act.startTime,
      actId: act.id,
      type: 'act-start' as const,
    })),
    volume: {
      narration: 1.0,
      music: 0.3,
      effects: 0.5,
    },
  };
}

/**
 * Gera pontos de interação baseados nos atos
 * Extrai dados de quizzes, desafios e CTAs dos atos interativos
 */
function generateInteractionPoints(acts: CinematicAct[]): InteractionPoint[] {
  const interactions: InteractionPoint[] = [];

  acts.forEach((act) => {
    // Check all layers for interaction data (quiz, playground, cta)
    let visualContent: any = null;

    // CORREÇÃO: Primeiro verifica act.content.interaction (V7-v2 format)
    const interactionData = (act as any).content?.interaction || {};
    if (interactionData.question || interactionData.options) {
      visualContent = interactionData;
    }

    // Se não encontrou em interaction, busca nos layers (legacy format)
    if (!visualContent) {
      for (const layer of act.content?.visual?.layers || []) {
        if (
          typeof layer.content === 'object' &&
          layer.content !== null &&
          (layer.content.question || layer.content.options || layer.content.choices || layer.content.code)
        ) {
          visualContent = layer.content;
          break;
        }
      }
    }

    if (!visualContent) return;

    // Quiz interactions (from admin "quiz" type or "interaction" type)
    if (act.type === 'interactive' && visualContent.question) {
      interactions.push({
        id: `interaction-${act.id}`,
        timestamp: act.startTime,
        actId: act.id,
        type: 'quiz',
        required: true,
        content: {
          question: visualContent.question || '',
          options: (visualContent.options || []).map((opt: any, idx: number) => ({
            id: opt.id || `opt-${idx + 1}`,
            text: opt.text || opt.label || '',
            correct: opt.correct || false,
            feedback: opt.feedback,
          })),
          hint: visualContent.hint,
        },
        feedback: {
          onSuccess: {
            type: 'combined',
            content: visualContent.successMessage || 'Excelente! Você está no caminho certo! 🎯',
            duration: 3000,
          },
          onError: {
            type: 'text',
            content: visualContent.errorMessage || 'Quase lá! Reflita mais sobre sua resposta.',
            duration: 3000,
          },
          realTime: true,
          aiAnalysis: false,
        },
        points: visualContent.points || 50,
      } as InteractionPoint);
    }

    // Code challenge interactions (from admin "playground" or "challenge" type)
    if (act.type === 'challenge' && visualContent.code) {
      interactions.push({
        id: `interaction-${act.id}`,
        timestamp: act.startTime,
        actId: act.id,
        type: 'code-challenge',
        required: true,
        content: {
          question: visualContent.question || visualContent.challenge || '',
          initialCode: visualContent.code || visualContent.initialCode || '',
          solution: visualContent.solution || '',
          language: visualContent.language || 'javascript',
        },
        feedback: {
          onSuccess: {
            type: 'combined',
            content: 'Código correto! Você dominou o conceito! 💻',
            duration: 3000,
          },
          onError: {
            type: 'text',
            content: 'Quase lá! Revise a lógica.',
            duration: 3000,
          },
          realTime: true,
          aiAnalysis: false,
        },
        points: visualContent.points || 100,
      } as InteractionPoint);
    }

    // CTA/Choice interactions (from admin "cta" or "gamification" type)
    if (act.type === 'outro' && visualContent.choices) {
      interactions.push({
        id: `interaction-${act.id}`,
        timestamp: act.startTime,
        actId: act.id,
        type: 'reflection',
        required: false,
        content: {
          question: visualContent.question || visualContent.prompt || 'O que você vai fazer agora?',
          options: (visualContent.choices || []).map((choice: any, idx: number) => ({
            id: choice.id || `choice-${idx + 1}`,
            text: choice.text || choice.label || '',
            correct: false, // CTAs don't have "correct" answers
          })),
        },
        feedback: {
          onSuccess: {
            type: 'text',
            content: 'Ótima escolha! Continue aprendendo! 🚀',
            duration: 2000,
          },
          onError: {
            type: 'text',
            content: '',
            duration: 0,
          },
          realTime: false,
          aiAnalysis: false,
        },
        points: 0,
      } as InteractionPoint);
    }
  });

  return interactions;
}

/**
 * Gera configuração de gamificação
 */
function generateGamification(): GamificationConfig {
  return {
    enabled: true,
    xpRewards: [
      {
        id: 'act-complete',
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
        amount: 100,
      },
    ],
    achievements: [
      {
        id: 'first-lesson',
        title: 'Primeira Lição',
        description: 'Completou sua primeira lição V7',
        icon: '🎓',
        condition: {
          type: 'complete-all-acts',
        },
        reward: 100,
        rarity: 'common',
      },
      {
        id: 'perfect-score',
        title: 'Pontuação Perfeita',
        description: 'Acertou todas as interações',
        icon: '💯',
        condition: {
          type: 'perfect-score',
        },
        reward: 250,
        rarity: 'epic',
      },
    ],
    scoring: {
      maxScore: 1000,
      criteria: [
        {
          id: 'completion',
          name: 'Completude',
          weight: 0.4,
          maxPoints: 400,
        },
        {
          id: 'accuracy',
          name: 'Precisão',
          weight: 0.6,
          maxPoints: 600,
        },
      ],
    },
  };
}

/**
 * FUNÇÃO PRINCIPAL: Adapta JSON do admin para V7CinematicLesson completo
 */
export function adaptAdminLessonToV7(
  lessonId: string,
  adminLesson: AdminLessonInput
): V7CinematicLesson {
  // Calcula startTime acumulativo para cada ato
  let currentTime = 0;
  const acts: CinematicAct[] = [];

  for (const adminAct of adminLesson.cinematic_flow.acts) {
    const act = adaptAct(adminAct, currentTime);
    acts.push(act);
    currentTime += adminAct.duration;
  }

  const totalDuration = adminLesson.cinematic_flow.timeline.totalDuration || currentTime;

  // Monta V7CinematicLesson completo
  const v7Lesson: V7CinematicLesson = {
    id: lessonId,
    model: 'v7-cinematic',
    title: adminLesson.title,
    subtitle: adminLesson.subtitle,
    duration: totalDuration,

    metadata: {
      difficulty: adminLesson.difficulty,
      category: adminLesson.category,
      tags: [],
      description: adminLesson.subtitle || '',
      learningObjectives: adminLesson.learning_objectives,
      prerequisites: [],
      estimatedTime: Math.ceil(totalDuration / 60),
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    cinematicFlow: {
      acts,
      timeline: {
        totalDuration,
        acts: acts.map((act) => ({
          actId: act.id,
          startTime: act.startTime,
          endTime: act.startTime + act.duration,
        })),
        markers: [],
        chapters: [],
      },
      transitions: acts.slice(0, -1).map((act, index) => ({
        id: `trans-${index}`,
        fromActId: act.id,
        toActId: acts[index + 1].id,
        effect: { type: 'fade' },
        duration: 500,
      })),
    },

    audioTrack: generateAudioTrack(lessonId, acts, totalDuration),
    interactionPoints: generateInteractionPoints(acts),
    gamification: generateGamification(),

    analytics: {
      enabled: true,
      events: [],
      metrics: [],
    },
  };

  return v7Lesson;
}

/**
 * Valida se o JSON do admin está no formato esperado
 */
export function validateAdminLesson(data: any): data is AdminLessonInput {
  return (
    data &&
    typeof data.title === 'string' &&
    typeof data.difficulty === 'string' &&
    data.cinematic_flow &&
    Array.isArray(data.cinematic_flow.acts)
  );
}
