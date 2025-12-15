// src/services/v7-pipeline.ts
// V7 Pipeline: Processes V7PipelineInput → V7CinematicLesson

import {
  V7PipelineInput,
  V7CinematicLesson,
  CinematicAct,
  SyncPoint,
  InteractionPoint,
} from '@/types/v7-cinematic.types';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

interface ActSegment {
  type: 'narrative' | 'interactive' | 'challenge' | 'revelation' | 'outro';
  title: string;
  content: string;
  duration: number;
  startTime: number;
}

interface ProcessingResult {
  success: boolean;
  lesson?: V7CinematicLesson;
  error?: string;
}

// ============================================================================
// PIPELINE CONFIGURATION
// ============================================================================

const V7_PIPELINE_CONFIG = {
  maxActsPerLesson: 8,
  minActDuration: 30, // seconds
  maxActDuration: 180, // seconds
  targetDuration: 300, // 5 minutes default
};

// ============================================================================
// AI ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyzes narrative script using AI to segment into acts
 */
async function analyzeNarrativeScript(
  script: string,
  targetDuration: number
): Promise<ActSegment[]> {
  console.log('[V7Pipeline] Analyzing narrative script with AI...');

  try {
    // In production, this would call OpenAI/Anthropic API
    // For now, we'll use a rule-based approach with some AI-like logic

    // Split script by double newlines (paragraphs)
    const paragraphs = script
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (paragraphs.length === 0) {
      throw new Error('Script is empty');
    }

    // Estimate reading time (average 150 words per minute)
    const wordCount = script.split(/\s+/).length;
    const estimatedReadingTime = (wordCount / 150) * 60; // in seconds

    // Determine number of acts
    const numActs = Math.min(
      Math.max(Math.ceil(paragraphs.length / 2), 3),
      V7_PIPELINE_CONFIG.maxActsPerLesson
    );

    const actDuration = targetDuration / numActs;

    // Segment paragraphs into acts
    const acts: ActSegment[] = [];
    const paragraphsPerAct = Math.ceil(paragraphs.length / numActs);

    for (let i = 0; i < numActs; i++) {
      const startIdx = i * paragraphsPerAct;
      const endIdx = Math.min((i + 1) * paragraphsPerAct, paragraphs.length);
      const actContent = paragraphs.slice(startIdx, endIdx).join('\n\n');

      // Determine act type based on position
      let actType: ActSegment['type'] = 'narrative';
      if (i === 0) actType = 'narrative'; // Intro
      else if (i === numActs - 1) actType = 'outro'; // Conclusion
      else if (i === Math.floor(numActs / 2)) actType = 'revelation'; // Middle revelation
      else if (actContent.toLowerCase().includes('desafio') || actContent.toLowerCase().includes('prática'))
        actType = 'challenge';
      else if (actContent.toLowerCase().includes('interação') || actContent.toLowerCase().includes('pergunta'))
        actType = 'interactive';

      acts.push({
        type: actType,
        title: generateActTitle(actType, i, numActs),
        content: actContent,
        duration: actDuration,
        startTime: i * actDuration,
      });
    }

    console.log(`[V7Pipeline] Created ${acts.length} acts from narrative`);
    return acts;
  } catch (error: any) {
    console.error('[V7Pipeline] Error analyzing narrative:', error);
    throw error;
  }
}

/**
 * Generates appropriate title for act based on type and position
 */
function generateActTitle(type: string, index: number, total: number): string {
  const titles = {
    narrative: [
      'Bem-vindo',
      'Contexto',
      'Fundamentos',
      'Aprofundamento',
      'Explorando Conceitos',
    ],
    interactive: ['Vamos Praticar', 'Hora de Interagir', 'Sua Vez', 'Experimentando'],
    challenge: [
      'Desafio Proposto',
      'Teste Seus Conhecimentos',
      'Aplicação Prática',
      'Mão na Massa',
    ],
    revelation: ['Revelação', 'O Segredo', 'A Solução', 'Descoberta'],
    outro: ['Parabéns!', 'Conclusão', 'Finalizando', 'Próximos Passos'],
  };

  const typeList = titles[type as keyof typeof titles] || titles.narrative;
  return typeList[Math.min(index, typeList.length - 1)];
}

/**
 * Extracts code examples from narrative script
 */
function extractCodeExamples(script: string): { amateur: string; professional: string }[] {
  const codeBlocks: { amateur: string; professional: string }[] = [];

  // Simple regex to find code blocks marked with comments
  const amateurRegex = /\/\/ ❌.*?\n([\s\S]*?)(?=\/\/|$)/g;
  const professionalRegex = /\/\/ ✅.*?\n([\s\S]*?)(?=\/\/|$)/g;

  let amateurMatches = [...script.matchAll(amateurRegex)];
  let professionalMatches = [...script.matchAll(professionalRegex)];

  for (let i = 0; i < Math.min(amateurMatches.length, professionalMatches.length); i++) {
    codeBlocks.push({
      amateur: amateurMatches[i][1].trim(),
      professional: professionalMatches[i][1].trim(),
    });
  }

  return codeBlocks;
}

// ============================================================================
// VISUAL CONTENT GENERATION
// ============================================================================

/**
 * Generates visual content for an act based on its type and content
 */
function generateVisualContent(actSegment: ActSegment, actIndex: number): any {
  const backgrounds = {
    narrative: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    interactive: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    challenge: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    revelation: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
    outro: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
  };

  const background = backgrounds[actSegment.type];

  return {
    type: 'slide',
    background,
    layers: [
      {
        id: `layer-${actIndex}-content`,
        type: 'text',
        zIndex: 10,
        position: { x: '10%', y: '20%', width: '80%', height: '60%' },
        content: `
          <div class="p-8">
            <h2 class="text-4xl font-bold text-white mb-6">${actSegment.title}</h2>
            <div class="text-xl text-white/90 leading-relaxed">
              ${actSegment.content.split('\n').map((p) => `<p class="mb-4">${p}</p>`).join('')}
            </div>
          </div>
        `,
        animation: {
          type: 'fade',
          duration: 1000,
          delay: 0,
          easing: 'ease-in-out',
        },
      },
    ],
  };
}

/**
 * Generates transitions between acts
 */
function generateTransitions(acts: CinematicAct[]): any[] {
  const transitionTypes = ['fade', 'slide', 'dissolve', 'zoom', 'wipe'];

  return acts.slice(0, -1).map((act, index) => {
    const nextAct = acts[index + 1];
    const transitionType =
      transitionTypes[Math.floor(Math.random() * transitionTypes.length)];

    return {
      id: `trans-${index}`,
      fromActId: act.id,
      toActId: nextAct.id,
      effect: {
        type: transitionType,
        direction: transitionType === 'slide' || transitionType === 'wipe' ? 'right' : undefined,
        easing: 'ease-in-out',
      },
      duration: 600,
    };
  });
}

/**
 * Generates sync points for audio synchronization
 */
function generateSyncPoints(acts: CinematicAct[]): SyncPoint[] {
  const syncPoints: SyncPoint[] = [];

  acts.forEach((act) => {
    // Act start sync point
    syncPoints.push({
      id: `sync-${act.id}-start`,
      timestamp: act.startTime,
      actId: act.id,
      type: 'act-start',
    });

    // Act end sync point
    syncPoints.push({
      id: `sync-${act.id}-end`,
      timestamp: act.startTime + act.duration,
      actId: act.id,
      type: 'act-end',
    });
  });

  return syncPoints;
}

/**
 * Generates interaction points based on act types
 */
function generateInteractionPoints(acts: CinematicAct[]): InteractionPoint[] {
  const interactions: InteractionPoint[] = [];

  acts.forEach((act, index) => {
    if (act.type === 'interactive' || act.type === 'challenge') {
      // Add quiz interaction
      interactions.push({
        id: `interaction-${act.id}`,
        timestamp: act.startTime + act.duration * 0.8, // 80% through the act
        actId: act.id,
        type: 'quiz',
        required: act.type === 'challenge',
        content: {
          question: 'Você compreendeu este conceito?',
          options: [
            { id: 'opt-1', text: 'Sim, entendi perfeitamente', correct: true },
            { id: 'opt-2', text: 'Preciso revisar', correct: false },
            { id: 'opt-3', text: 'Tenho dúvidas', correct: false },
          ],
        },
        points: act.type === 'challenge' ? 50 : 20,
      });
    }
  });

  return interactions;
}

// ============================================================================
// MAIN PIPELINE FUNCTION
// ============================================================================

/**
 * Main V7 Pipeline: Processes V7PipelineInput → V7CinematicLesson
 */
export async function processV7Pipeline(
  input: V7PipelineInput
): Promise<ProcessingResult> {
  console.log('[V7Pipeline] Starting pipeline processing...');

  try {
    // 1. Validate input
    if (!input.title || !input.narrativeScript) {
      throw new Error('Title and narrative script are required');
    }

    const targetDuration = input.duration || V7_PIPELINE_CONFIG.targetDuration;

    // 2. Analyze narrative script and segment into acts
    const actSegments = await analyzeNarrativeScript(input.narrativeScript, targetDuration);

    // 3. Generate cinematic acts
    const cinematicActs: CinematicAct[] = actSegments.map((segment, index) => ({
      id: `act-${index + 1}`,
      type: segment.type,
      title: segment.title,
      startTime: segment.startTime,
      duration: segment.duration,
      content: {
        visual: generateVisualContent(segment, index),
        audio: {
          narrationSegment: {
            start: segment.startTime,
            end: segment.startTime + segment.duration,
            text: segment.content,
          },
        },
        animations: [],
        particles:
          segment.type === 'outro'
            ? [
                {
                  id: 'confetti',
                  type: 'confetti',
                  density: 100,
                  colors: ['#667eea', '#764ba2', '#ffffff', '#ffd700'],
                },
              ]
            : undefined,
      },
      transitions: {
        in: { type: 'fade', easing: 'ease-in' },
        out: { type: 'fade', easing: 'ease-out' },
      },
    }));

    // 4. Generate transitions
    const transitions = generateTransitions(cinematicActs);

    // 5. Generate sync points
    const syncPoints = generateSyncPoints(cinematicActs);

    // 6. Generate interaction points
    const interactionPoints = generateInteractionPoints(cinematicActs);

    // 7. Calculate total duration
    const totalDuration = cinematicActs.reduce((sum, act) => sum + act.duration, 0);

    // 8. Build complete V7 Cinematic Lesson
    const lesson: V7CinematicLesson = {
      id: `v7-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      model: 'v7-cinematic',
      title: input.title,
      subtitle: input.subtitle,
      duration: totalDuration,
      metadata: {
        difficulty: input.difficulty || 'intermediate',
        category: input.category || 'general',
        tags: input.tags || [],
        description: `Lição V7 sobre ${input.title}`,
        learningObjectives: input.learningObjectives || [],
        estimatedTime: Math.ceil(totalDuration / 60),
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'V7 Pipeline',
      },
      cinematicFlow: {
        acts: cinematicActs,
        timeline: {
          totalDuration,
          acts: cinematicActs.map((act) => ({
            actId: act.id,
            startTime: act.startTime,
            endTime: act.startTime + act.duration,
            color: getActColor(act.type),
          })),
          markers: interactionPoints.map((ip) => ({
            id: `marker-${ip.id}`,
            timestamp: ip.timestamp,
            type: 'interaction',
            label: ip.type,
          })),
          chapters: cinematicActs.map((act, index) => ({
            id: `chapter-${index + 1}`,
            title: act.title,
            startTime: act.startTime,
            endTime: act.startTime + act.duration,
          })),
        },
        transitions,
        theme: input.theme ? {
          primary: input.theme.primary || '#667eea',
          secondary: input.theme.secondary || '#764ba2',
          background: input.theme.background || '#0f0f23',
          text: input.theme.text || '#ffffff',
          accent: input.theme.accent || '#00d4ff',
          fonts: input.theme.fonts,
          borderRadius: input.theme.borderRadius,
          shadows: input.theme.shadows,
        } : undefined,
      },
      audioTrack: {
        narration: {
          url: `/audio/v7-${Date.now()}-narration.mp3`,
          duration: totalDuration,
          format: 'mp3',
        },
        syncPoints,
        volume: {
          narration: 1,
          music: 0.3,
          effects: 0.7,
        },
      },
      interactionPoints,
      gamification: {
        enabled: true,
        xpRewards: [
          { id: 'xp-act', event: 'act-complete', amount: 20 },
          { id: 'xp-interaction', event: 'interaction-success', amount: 50 },
          { id: 'xp-complete', event: 'challenge-complete', amount: 100 },
        ],
        achievements: [
          {
            id: 'first-act',
            title: 'Primeira Jornada',
            description: 'Complete o primeiro ato',
            condition: { type: 'complete-all-acts', parameters: { count: 1 } },
            reward: 50,
            rarity: 'common',
          },
        ],
        scoring: {
          maxScore: 100,
          criteria: [
            { id: 'completion', name: 'Completude', weight: 0.5, maxPoints: 50 },
            { id: 'interactions', name: 'Interações', weight: 0.5, maxPoints: 50 },
          ],
        },
      },
      analytics: {
        enabled: true,
        events: [],
        metrics: [],
      },
    };

    console.log('[V7Pipeline] Pipeline processing complete!');
    console.log(`[V7Pipeline] Generated lesson with ${cinematicActs.length} acts`);

    return {
      success: true,
      lesson,
    };
  } catch (error: any) {
    console.error('[V7Pipeline] Pipeline processing failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Helper function to get color for act type
 */
function getActColor(type: string): string {
  const colors: Record<string, string> = {
    narrative: '#667eea',
    interactive: '#f093fb',
    challenge: '#fa709a',
    revelation: '#30cfd0',
    outro: '#a8edea',
  };
  return colors[type] || '#667eea';
}

/**
 * Save V7 lesson to Supabase
 */
export async function saveV7Lesson(lesson: V7CinematicLesson): Promise<boolean> {
  try {
    const { error } = await supabase.from('lessons').insert([
      {
        title: lesson.title,
        description: lesson.subtitle || '',
        model: 'v7',
        lesson_type: 'v7-cinematic',
        content: JSON.parse(JSON.stringify(lesson)),
        estimated_time: Math.ceil(lesson.duration / 60),
        is_active: false,
        status: 'draft',
        order_index: 0,
      },
    ]);

    if (error) {
      console.error('[V7Pipeline] Error saving lesson:', error);
      return false;
    }

    console.log('[V7Pipeline] Lesson saved successfully:', lesson.id);
    return true;
  } catch (error) {
    console.error('[V7Pipeline] Error saving lesson:', error);
    return false;
  }
}
