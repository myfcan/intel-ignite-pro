// Hook to load and transform V7 lessons into phase-based format for V7PhasePlayer
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { V7LessonScript, V7Phase, V7Scene } from '@/components/lessons/v7/cinematic/phases/V7PhaseController';
import type {
  WordTimestamp,
  V7PipelineAct,
  V7AudioBehavior,
  V7TimeoutConfig,
  V7AnchorPoint,
  normalizeTimestamp,
  extractNarration
} from '@/types/v7-unified.types';

// ============================================================================
// DATABASE TYPES - For type-safe data fetching
// ============================================================================

/** Raw timestamp format from database (may have different field names) */
interface RawWordTimestamp {
  word: string;
  start?: number;
  end?: number;
  start_time?: number;  // Legacy format
  end_time?: number;    // Legacy format
}

/** V7 lesson content structure from database */
interface V7LessonContent {
  model?: string;
  version?: string;
  // ✅ V7-vv: Phases diretamente no content (Pipeline Cinematográfico)
  phases?: any[];
  metadata?: {
    title?: string;
    subtitle?: string;
    totalDuration?: number;
    phaseCount?: number;
    [key: string]: any;
  };
  // ✅ V7-v3: New structure with phases array and anchorText-only transitions
  cinematicFlow?: {
    totalPhases?: number;
    transitionMethod?: 'anchorText-only' | 'hybrid';
    phases?: V7DatabasePhase[];
    // Legacy support
    acts?: V7DatabaseAct[];
    timeline?: { totalDuration?: number };
  };
  // Legacy: cinematic_flow snake_case
  cinematic_flow?: {
    acts?: V7DatabaseAct[];
    phases?: V7DatabasePhase[];
    timeline?: { totalDuration?: number };
  };
  cinematicStructure?: {
    acts: V7DatabaseAct[];
    totalDuration?: number;
  };
  // ✅ UNIFIED audioConfig - supports both V7-vv and legacy formats
  audioConfig?: {
    // V7-vv format
    url?: string;
    duration?: number;
    wordTimestampsCount?: number;
    // Legacy format
    mainAudioUrl?: string;
    ambientAudioUrl?: string;
    soundEffects?: {
      click?: string;
      select?: string;
      success?: string;
      error?: string;
      hint?: string;
      timeout?: string;
      whoosh?: string;
      reveal?: string;
    };
  };
  // ✅ V7.1: NO FALLBACKS - AnchorText is the ONLY sync mechanism
  anchorPoints?: Array<{
    id: string;
    keyword: string;
    phaseId: string;
    action: string;
  }>;
}

    scenes.push({
      id: `${act.id || 'act'}-micro-${index}`,
      type: sceneType,
      startTime: segment.startTime,
      duration,
      content: {
        ...content,
        ...commonFields,
      },
      animation,
    });
  });

  return scenes;
}

// Generate scenes for a phase based on act content
function generateScenesForPhase(
  act: any,
  phaseType: V7Phase['type'],
  startTime: number,
  duration: number,
  wordTimestamps: Array<{ word: string; start: number; end: number }> = [],
  enableMicroScenes: boolean = true
): V7Scene[] {
  const visual = act.content?.visual || {};
  const interaction = act.content?.interaction || {};
  const audio = act.content?.audio || {};
  const scenes: V7Scene[] = [];

  // Extract common fields that can appear in any act
  const commonFields = {
    narration: audio.narration || act.narration || '',
    explanation: visual.explanation || interaction.explanation || act.explanation || '',
    tip: visual.tip || interaction.tip || '',
    warning: visual.warning || '',
  };

  // ✅ V7-v2.3: MICRO-SCENE GENERATION
  // Generate fine-grained scenes aligned with narration for cinematic feel
  // Only for dramatic and narrative phases (interaction phases keep their structure)
  if (enableMicroScenes && wordTimestamps.length > 0 && (phaseType === 'dramatic' || phaseType === 'narrative')) {
    const narration = commonFields.narration;
    const endTime = startTime + duration;

    const segments = segmentNarrationForMicroScenes(
      narration,
      wordTimestamps,
      startTime,
      endTime
    );

    if (segments.length >= 2) {
      // Enough segments to create micro-scenes
      const microScenes = generateMicroScenesFromNarration(
        act,
        segments,
        startTime,
        duration,
        phaseType
      );

      if (microScenes.length > 0) {
        console.log(`[generateScenesForPhase] ✨ Generated ${microScenes.length} micro-scenes for ${phaseType} phase (was ${7} fixed scenes)`);
        return microScenes;
      }
    }

    console.log(`[generateScenesForPhase] ⚠️ Not enough segments for micro-scenes (${segments.length}), falling back to fixed scenes`);
  }

  switch (phaseType) {
    case 'dramatic':
      // 🎬 6 CINEMATIC SCENES (Netflix Bandersnatch-inspired)
      // ✅ SYNC FIX: Timings adjusted to match typical narration flow
      // Narration typically says "98%" in the first 2-3 seconds
      // Extract all dramatic content from visual
      const dramaticNumber = String(visual.mainValue || visual.number || '01');
      const dramaticSubtitle = visual.subtitle || act.title || '';
      const dramaticHighlight = visual.highlightWord || '';
      const dramaticImpact = visual.impactWord || visual.mainText || dramaticHighlight || 'IMPACTO';

      // ✅ Extract hookQuestion from visual, or detect from narration, or use default
      let dramaticHook = visual.hookQuestion || visual.hook || '';
      if (!dramaticHook && commonFields.narration) {
        // Check if narration starts with "Você sabia" pattern
        const narrationLower = commonFields.narration.toLowerCase();
        if (narrationLower.includes('você sabia') || narrationLower.includes('voce sabia')) {
          dramaticHook = 'VOCÊ SABIA?';
        }
      }

      // Scene 0: Letterbox with hook question "VOCÊ SABIA?" (15% - give more time)
      scenes.push({
        id: `${act.id}-hook`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.15,
        content: {
          mainText: dramaticHook,
          hookQuestion: dramaticHook,
          subtitle: '',
          backgroundColor: 'black',
          aspectRatio: 'cinematic',
          ...commonFields,
        },
        animation: 'letterbox',
      });

      // Scene 1: Hook question continues with glow effect (10% - more time for "VOCÊ SABIA?")
      scenes.push({
        id: `${act.id}-hook-glow`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.15,
        duration: duration * 0.10,
        content: {
          hookQuestion: dramaticHook,
          glowEffect: true,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // ✅ Extract secondary number (2%) from visual or use default
      const dramaticSecondaryNumber = visual.secondaryNumber || visual.contrastValue || '2%';

      // Scene 2: Number appears with glow effect (10% - 98% appears here)
      scenes.push({
        id: `${act.id}-number-appear`,
        type: 'number-reveal',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.10,
        content: {
          number: dramaticNumber,
          secondaryNumber: dramaticSecondaryNumber,
          subtitle: '', // No subtitle yet - builds suspense
          highlightWord: dramaticHighlight,
          glowEffect: true,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 3: Number count-up animation + subtitle reveal (15%)
      scenes.push({
        id: `${act.id}-count-up`,
        type: 'number-reveal',
        startTime: startTime + duration * 0.35,
        duration: duration * 0.15,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          highlightWord: dramaticHighlight,
          countUpAnimation: true,
          ...commonFields,
        },
        animation: 'count-up',
      });

      // Scene 4: Particle explosion transition (10%)
      scenes.push({
        id: `${act.id}-explosion`,
        type: 'particle-effect',
        startTime: startTime + duration * 0.50,
        duration: duration * 0.10,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          particleType: 'sparks',
          particleColor: visual.mood === 'danger' ? '#ff0040' : '#22D3EE',
          ...commonFields,
        },
        animation: 'particle-burst',
      });

      // Scene 5: Subtitle reveal letter-by-letter with highlight (20%)
      scenes.push({
        id: `${act.id}-subtitle`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.60,
        duration: duration * 0.20,
        content: {
          number: dramaticNumber,
          mainText: dramaticSubtitle,
          subtitle: dramaticHighlight,
          highlightWord: dramaticHighlight,
          letterByLetter: true,
          ...commonFields,
        },
        animation: 'letter-by-letter',
      });

      // Scene 6: Impact with 98% VS 2% (20% - show contrast)
      scenes.push({
        id: `${act.id}-impact`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.80,
        duration: duration * 0.20,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          mainText: dramaticImpact,
          highlightWord: dramaticHighlight,
          cameraZoom: true,
          cameraShake: true,
          particleEffect: 'confetti',
          ...commonFields,
        },
        animation: 'zoom-in',
      });
      break;

    case 'narrative':
      // 🎬 6 CINEMATIC SCENES (Split-screen comparisons)
      // Scene 0: Title fade in with letterboxing (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: visual.title || act.title,
          subtitle: visual.subtitle || '',
          aspectRatio: 'cinematic',
          ...commonFields,
        },
        animation: 'letterbox',
      });

      // Scene 1: Split-screen slide transition (15%)
      scenes.push({
        id: `${act.id}-split`,
        type: 'split-screen',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: visual.title || act.title,
          splitPosition: 0.5,
          dividerAnimation: true,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 2: Left card details animate in (20%)
      scenes.push({
        id: `${act.id}-left-card`,
        type: 'comparison',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.2,
        content: {
          mainText: visual.leftCard?.label || 'AMADOR',
          items: [
            {
              label: visual.leftCard?.label || 'Opção A',
              value: visual.leftCard?.value || '',
              details: visual.leftCard?.details || '',
              isNegative: !visual.leftCard?.isPositive,
            },
          ],
          amateurPrompt: visual.amateurPrompt || visual.leftCard?.prompt || '',
          amateurScore: visual.amateurScore || visual.leftCard?.score || 0,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 3: Right card details animate in (20%)
      scenes.push({
        id: `${act.id}-right-card`,
        type: 'comparison',
        startTime: startTime + duration * 0.45,
        duration: duration * 0.2,
        content: {
          mainText: visual.rightCard?.label || 'PROFISSIONAL',
          items: [
            {
              label: visual.rightCard?.label || 'Opção B',
              value: visual.rightCard?.value || '',
              details: visual.rightCard?.details || '',
              isPositive: visual.rightCard?.isPositive,
            },
          ],
          professionalPrompt: visual.professionalPrompt || visual.rightCard?.prompt || '',
          professionalScore: visual.professionalScore || visual.rightCard?.score || 100,
          ...commonFields,
        },
        animation: 'slide-right',
      });

      // Scene 4: Comparison highlight effects (20%)
      scenes.push({
        id: `${act.id}-highlight`,
        type: 'comparison',
        startTime: startTime + duration * 0.65,
        duration: duration * 0.2,
        content: {
          mainText: visual.subtitle || 'DIFERENÇA BRUTAL',
          items: [
            {
              label: 'Comparação',
              left: visual.leftCard?.details || '',
              right: visual.rightCard?.details || '',
            },
          ],
          pulseEffect: true,
          glowColor: '#22D3EE',
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 5: Warning/urgency with color shift (15%)
      scenes.push({
        id: `${act.id}-warning`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.85,
        duration: duration * 0.15,
        content: {
          mainText: visual.mainText || act.title,
          subtitle: visual.warning || '',
          warning: visual.warning || '',
          backgroundColor: 'from-black to-red-900/20',
          ...commonFields,
        },
        animation: 'slide-up',
      });
      break;

    case 'interaction':
      // 🎬 5 CINEMATIC SCENES (Interactive quiz with feedback)
      // Extract quiz-specific fields
      const quizOptions = (visual.options || interaction.options || []).map((opt: any) => ({
        id: opt.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
        label: opt.text || opt.label || '',
        text: opt.text || opt.label || '',
        isCorrect: opt.isCorrect ?? false,
        category: opt.category || (opt.isCorrect ? 'good' : 'bad'),
        feedback: opt.feedback || '',
      }));

      // Scene 0: Quiz title with icon bounce (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'quiz-intro',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: visual.title || interaction.title || 'AUTO-AVALIAÇÃO',
          subtitle: '',
          iconBounce: true,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 1: Question reveal (15%)
      scenes.push({
        id: `${act.id}-question`,
        type: 'quiz-question',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          subtitle: visual.subtitle || '',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 2: Options slide in one by one (20%)
      scenes.push({
        id: `${act.id}-options`,
        type: 'quiz-options',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.2,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          title: visual.title || interaction.title || 'Avaliação',
          options: quizOptions,
          staggerChildren: 0.15,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 3: User interaction pause (40%)
      scenes.push({
        id: `${act.id}-interaction`,
        type: 'quiz',
        startTime: startTime + duration * 0.45,
        duration: duration * 0.4,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          title: visual.title || interaction.title || 'Avaliação',
          options: quizOptions,
          correctFeedback: interaction.correctFeedback || visual.correctFeedback || 'Correto! 🎉',
          incorrectFeedback: interaction.incorrectFeedback || visual.incorrectFeedback || 'Tente novamente',
          revealGoodMessage: interaction.revealGoodMessage || visual.revealGoodMessage || '',
          revealBadMessage: interaction.revealBadMessage || visual.revealBadMessage || '',
          highlightOnHover: true,
          scaleOnHover: 1.02,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 4: Result reveal with feedback glow (15%)
      scenes.push({
        id: `${act.id}-result`,
        type: 'quiz-result',
        startTime: startTime + duration * 0.85,
        duration: duration * 0.15,
        content: {
          mainText: visual.correctFeedback || 'Excelente!',
          subtitle: visual.revealGoodMessage || '',
          particles: 'confetti',
          glowEffect: true,
          ...commonFields,
        },
        animation: 'explode',
      });
      break;

    case 'playground':
      // 🎬 6 CINEMATIC SCENES (Code typing + results comparison)
      // Extract playground-specific fields
      const playgroundVisual = visual.playground || visual;

      // Scene 0: Challenge title with code effect (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'playground-intro',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: playgroundVisual.title || 'DESAFIO PRÁTICO',
          subtitle: playgroundVisual.subtitle || act.title,
          challenge: playgroundVisual.challenge || '',
          glitchEffect: true,
          ...commonFields,
        },
        animation: 'glitch',
      });

      // Scene 1: Amateur prompt typewriter (15%)
      scenes.push({
        id: `${act.id}-amateur-prompt`,
        type: 'playground-code',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: 'PROMPT AMADOR',
          subtitle: '',
          amateurPrompt: playgroundVisual.amateurPrompt || playgroundVisual.amateur?.prompt || '',
          typewriterSpeed: 50,
          cursor: true,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 2: Amateur result with score animation (15%)
      scenes.push({
        id: `${act.id}-amateur-result`,
        type: 'playground-result',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.15,
        content: {
          mainText: 'RESULTADO',
          amateurResult: playgroundVisual.amateurResult || playgroundVisual.amateur?.result || {
            title: 'Resultado Amador',
            content: '',
            score: 40,
            maxScore: 100,
            verdict: 'fraco',
          },
          countUpAnimation: true,
          scoreColor: 'red',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 3: Professional prompt typewriter (15%)
      scenes.push({
        id: `${act.id}-professional-prompt`,
        type: 'playground-code',
        startTime: startTime + duration * 0.4,
        duration: duration * 0.15,
        content: {
          mainText: 'PROMPT PROFISSIONAL',
          subtitle: '',
          professionalPrompt: playgroundVisual.professionalPrompt || playgroundVisual.professional?.prompt || '',
          typewriterSpeed: 30, // Faster = more professional
          cursor: true,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 4: Professional result with score animation (15%)
      scenes.push({
        id: `${act.id}-professional-result`,
        type: 'playground-result',
        startTime: startTime + duration * 0.55,
        duration: duration * 0.15,
        content: {
          mainText: 'RESULTADO',
          professionalResult: playgroundVisual.professionalResult || playgroundVisual.professional?.result || {
            title: 'Resultado Profissional',
            content: '',
            score: 95,
            maxScore: 100,
            verdict: 'excelente',
          },
          countUpAnimation: true,
          scoreColor: 'green',
          particles: 'sparks',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 5: Comparison bars with winner effect (30%)
      scenes.push({
        id: `${act.id}-comparison`,
        type: 'playground',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.3,
        content: {
          mainText: playgroundVisual.title || 'COMPARAÇÃO FINAL',
          subtitle: playgroundVisual.subtitle || act.title,
          challenge: playgroundVisual.challenge || '',
          amateurPrompt: playgroundVisual.amateurPrompt || playgroundVisual.amateur?.prompt || '',
          professionalPrompt: playgroundVisual.professionalPrompt || playgroundVisual.professional?.prompt || '',
          amateurResult: playgroundVisual.amateurResult || playgroundVisual.amateur?.result || {
            title: 'Resultado Amador',
            content: '',
            score: 40,
            maxScore: 100,
            verdict: 'fraco',
          },
          professionalResult: playgroundVisual.professionalResult || playgroundVisual.professional?.result || {
            title: 'Resultado Profissional',
            content: '',
            score: 95,
            maxScore: 100,
            verdict: 'excelente',
          },
          raceAnimation: true,
          winnerEffect: 'confetti',
          context: playgroundVisual.context || '',
          hints: playgroundVisual.hints || [],
          successCriteria: playgroundVisual.successCriteria || [],
          ...commonFields,
        },
        animation: 'fade',
      });
      break;

    case 'revelation':
      // 🎬 5 CINEMATIC SCENES (Method reveal + CTA)
      // Scene 0: Dramatic pause with black screen (5%)
      scenes.push({
        id: `${act.id}-pause`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.05,
        content: {
          mainText: '',
          subtitle: '',
          backgroundColor: 'black',
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 1: Method name reveal with glow (15%)
      scenes.push({
        id: `${act.id}-method-name`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.05,
        duration: duration * 0.15,
        content: {
          mainText: visual.title || visual.mainValue || '✨ REVELAÇÃO',
          subtitle: visual.subtitle || act.title,
          highlightWord: visual.highlightWord,
          glowEffect: true,
          ...commonFields,
        },
        animation: 'zoom-in',
      });

      // Scene 2: Items reveal sequentially (50%)
      scenes.push({
        id: `${act.id}-items`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.2,
        duration: duration * 0.5,
        content: {
          mainText: visual.subtitle || act.title,
          subtitle: '',
          items: visual.items || visual.bullets || [],
          metrics: visual.metrics || [],
          staggerChildren: 0.25,
          iconBounce: true,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 3: CTA options slide in (20%)
      scenes.push({
        id: `${act.id}-cta-slide`,
        type: 'cta',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.2,
        content: {
          mainText: visual.ctaTitle || 'O QUE VOCÊ VAI FAZER AGORA?',
          subtitle: 'Escolha seu caminho',
          options: visual.options || visual.ctaOptions || [
            { label: 'Aplicar AGORA', emoji: '🎯', variant: 'primary' },
            { label: 'Revisar Tudo', emoji: '📚', variant: 'secondary' },
          ],
          staggerChildren: 0.15,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 4: Final CTA pulse effect (10%)
      scenes.push({
        id: `${act.id}-cta-pulse`,
        type: 'cta',
        startTime: startTime + duration * 0.9,
        duration: duration * 0.1,
        content: {
          mainText: visual.ctaTitle || 'Próximos Passos',
          options: visual.options || visual.ctaOptions || [
            { label: 'Revisar', emoji: '📚', variant: 'secondary' },
            { label: 'Continuar', emoji: '🚀', variant: 'primary' },
          ],
          pulseAnimation: true,
          ...commonFields,
        },
        animation: 'fade',
      });
      break;

    case 'gamification':
      // 🎬 3 CINEMATIC SCENES (Achievement celebration)
      // Scene 0: Title with celebration effect (20%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'text-reveal',
        startTime,
        duration: duration * 0.2,
        content: {
          mainText: visual.mainText || '🏆 CONQUISTAS',
          subtitle: visual.subtitle || 'Parabéns!',
          glowEffect: true,
          particles: 'confetti',
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 1: Achievements list (50%)
      scenes.push({
        id: `${act.id}-achievements`,
        type: 'result',
        startTime: startTime + duration * 0.2,
        duration: duration * 0.5,
        content: {
          mainText: visual.mainText || 'CONQUISTAS',
          subtitle: visual.subtitle || '',
          items: visual.items || [],
          staggerChildren: 0.2,
          iconBounce: true,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 2: XP and metrics (30%)
      scenes.push({
        id: `${act.id}-metrics`,
        type: 'result',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.3,
        content: {
          mainText: 'RECOMPENSAS',
          subtitle: '',
          metrics: visual.metrics || [{ label: 'XP Ganho', value: '+100' }],
          particles: 'sparks',
          ...commonFields,
        },
        animation: 'explode',
      });
      break;

    default:
      scenes.push({
        id: `${act.id}-default`,
        type: 'text-reveal',
        startTime,
        duration,
        content: {
          mainText: act.title || 'Conteúdo',
          subtitle: visual.subtitle || '',
          ...commonFields,
        },
        animation: 'fade',
      });
  }

  return scenes;
}

// ❌ getDefaultPhases REMOVIDO - SEM FALLBACK
// Se não houver acts, o sistema DEVE falhar para forçar correção do banco de dados
