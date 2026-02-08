/**
 * V7 Pipeline - Step 5: Construir Content
 * 
 * Monta a estrutura final de content para salvar no banco.
 * 
 * CHANGELOG:
 * - v1.1.1-c10b-boundaryfix: Adicionado BOUNDARY_FIX_GUARD para garantir invariantes de timeline
 */

import { V7ScriptInput } from '@/types/V7ScriptInput';
import { 
  V7PipelineContext, 
  V7Step1Output,
  V7Step3Output, 
  V7Step4Output, 
  V7Step5Output,
  V7LessonContent,
  V7Phase
} from '../types';

interface Step5Context extends V7PipelineContext {
  validated: V7Step1Output;
  audio: V7Step3Output;
  anchors: V7Step4Output;
}

// Constantes para boundary fix
const MIN_PHASE_DURATION = 0.05; // 50ms mínimo absoluto
const MIN_INTERACTIVE_DURATION = 5.0; // 5s para fases interativas
const INTERACTIVE_PHASE_TYPES = ['interaction', 'playground', 'secret-reveal', 'cta', 'gamification', 'quiz'];

/**
 * BOUNDARY_FIX_GUARD: Garante invariantes de timeline invioláveis
 * 
 * Invariantes:
 * 1. Para cada fase: endTime >= startTime + MIN_DURATION
 * 2. Para cada par de fases: phases[i].endTime <= phases[i+1].startTime (monotonicidade)
 * 3. Todas as durações > 0
 * 
 * Se violar, aplica correção automática e loga o ajuste.
 */
function applyBoundaryFixGuard(
  phases: V7Phase[],
  totalDuration: number,
  logger: { info: Function; warn: Function }
): { fixedPhases: V7Phase[]; boundaryFixesApplied: number; failedBoundaries: string[] } {
  let boundaryFixesApplied = 0;
  const failedBoundaries: string[] = [];
  const fixedPhases = phases.map((phase, idx) => ({ ...phase }));

  // PASS 1: Garantir duração mínima para cada fase
  for (let i = 0; i < fixedPhases.length; i++) {
    const phase = fixedPhases[i];
    const isInteractive = INTERACTIVE_PHASE_TYPES.includes(phase.type);
    const minDuration = isInteractive ? MIN_INTERACTIVE_DURATION : MIN_PHASE_DURATION;
    
    // Invariante 1: endTime >= startTime + minDuration
    const currentDuration = phase.endTime - phase.startTime;
    
    if (currentDuration < minDuration) {
      const oldEndTime = phase.endTime;
      phase.endTime = phase.startTime + minDuration;
      
      // Clamp ao totalDuration
      if (phase.endTime > totalDuration) {
        phase.endTime = totalDuration;
      }
      
      boundaryFixesApplied++;
      logger.warn(4, 'Boundary Fix', 
        `   🔧 BOUNDARY_FIX: ${phase.id} endTime ${oldEndTime.toFixed(3)}s → ${phase.endTime.toFixed(3)}s (duration was ${currentDuration.toFixed(3)}s)`
      );
    }
  }

  // PASS 2: Garantir monotonicidade (endTime <= next.startTime)
  for (let i = 0; i < fixedPhases.length - 1; i++) {
    const current = fixedPhases[i];
    const next = fixedPhases[i + 1];
    
    // Invariante 2: phases[i].endTime <= phases[i+1].startTime
    if (current.endTime > next.startTime) {
      const oldEndTime = current.endTime;
      const oldNextStart = next.startTime;
      
      // Estratégia: ajustar next.startTime para current.endTime (shift forward)
      next.startTime = current.endTime;
      
      boundaryFixesApplied++;
      logger.warn(4, 'Boundary Fix', 
        `   🔧 MONOTONICITY_FIX: ${next.id} startTime ${oldNextStart.toFixed(3)}s → ${next.startTime.toFixed(3)}s (was overlapping ${current.id})`
      );
    }
  }

  // PASS 3: Validação final - nenhuma duração pode ser <= 0
  for (const phase of fixedPhases) {
    const duration = phase.endTime - phase.startTime;
    if (duration <= 0) {
      failedBoundaries.push(`${phase.id}: duration=${duration.toFixed(3)}s (CRITICAL)`);
    }
  }

  return { fixedPhases, boundaryFixesApplied, failedBoundaries };
}

export async function v7Step5BuildContent(
  context: Step5Context
): Promise<V7Step5Output> {
  const { validated, audio, anchors, logger } = context;
  const { validatedInput } = validated;
  const startTime = Date.now();
  
  await logger.info(5, 'Build Content', '🏗️ Construindo estrutura de content...');

  // ============================================================
  // 1. CONSTRUIR METADATA
  // ============================================================
  const metadata = {
    title: validatedInput.title,
    subtitle: validatedInput.subtitle,
    difficulty: validatedInput.difficulty,
    category: validatedInput.category,
    tags: validatedInput.tags,
    learningObjectives: validatedInput.learningObjectives,
    totalDuration: audio.totalDuration,
    phasesCount: anchors.phases.length
  };

  await logger.info(5, 'Build Content', '   📋 Metadata construído');

  // ============================================================
  // 2. CONSTRUIR ESTRUTURA DE ÁUDIO (formato esperado pelo useV7PhaseScript)
  // ============================================================
  const audioSection = {
    mainAudio: {
      id: 'main',
      url: audio.audioUrl,
      wordTimestamps: audio.wordTimestamps,
      duration: audio.totalDuration
    }
  };

  await logger.info(5, 'Build Content', `   🎙️ Áudio: ${audio.wordTimestamps.length} timestamps`);

  // ============================================================
  // 3. APLICAR BOUNDARY FIX GUARD (C10B-BOUNDARYFIX)
  // ============================================================
  await logger.info(5, 'Build Content', '   🛡️ Aplicando BOUNDARY_FIX_GUARD...');
  
  const { fixedPhases, boundaryFixesApplied, failedBoundaries } = applyBoundaryFixGuard(
    anchors.phases,
    audio.totalDuration,
    logger
  );

  if (failedBoundaries.length > 0) {
    const errorMsg = `BOUNDARY_FIX_GUARD FALHOU: ${failedBoundaries.join(', ')}`;
    await logger.error(5, 'Build Content', errorMsg);
    throw new Error(errorMsg);
  }

  if (boundaryFixesApplied > 0) {
    await logger.warn(5, 'Build Content', 
      `   ⚠️ ${boundaryFixesApplied} boundary fixes aplicados`
    );
  } else {
    await logger.info(5, 'Build Content', '   ✅ Boundaries válidos, sem correções necessárias');
  }

  // ============================================================
  // 4. PROCESSAR PHASES COM BOUNDARY FIX APLICADO
  // ============================================================
  const phases = fixedPhases.map(phase => ({
    ...phase,
    // Garantir que todos os campos obrigatórios estão presentes
    visual: {
      type: phase.visual.type,
      content: phase.visual.content,
      effects: phase.visual.effects || {},
      microVisuals: phase.visual.microVisuals || []
    }
  }));

  await logger.info(5, 'Build Content', `   📄 ${phases.length} phases processadas`);

  // ============================================================
  // 5. EXTRAIR EXERCÍCIOS PÓS-AULA
  // ============================================================
  const postLessonExercises = extractPostLessonExercises(validatedInput);

  if (postLessonExercises.length > 0) {
    await logger.info(5, 'Build Content', `   📝 ${postLessonExercises.length} exercícios pós-aula`);
  }

  // ============================================================
  // 6. MONTAR CONTENT FINAL
  // ============================================================
  const content: V7LessonContent = {
    contentVersion: 'v7-vv',
    metadata,
    audio: audioSection,
    phases,
    anchorActions: anchors.anchorActions,
    postLessonExercises: postLessonExercises.length > 0 ? postLessonExercises : undefined
  };

  // Validar tamanho do content
  const contentSize = JSON.stringify(content).length;
  await logger.info(5, 'Build Content', `   📦 Tamanho: ${(contentSize / 1024).toFixed(1)}KB`);

  if (contentSize > 5_000_000) {
    throw new Error(`Content muito grande (${(contentSize / 1_000_000).toFixed(1)}MB). Máximo: 5MB.`);
  }

  const elapsedTime = Date.now() - startTime;
  await logger.success(5, 'Build Content', `✅ Content construído em ${elapsedTime}ms`, {
    contentSize: `${(contentSize / 1024).toFixed(1)}KB`,
    phases: phases.length,
    anchorActions: anchors.anchorActions.length,
    boundaryFixesApplied
  });

  return {
    content
  };
}

/**
 * Extrai exercícios que devem aparecer após a aula
 * (não inline durante a narrativa)
 */
function extractPostLessonExercises(input: V7ScriptInput): any[] {
  const exercises: any[] = [];

  // Extrair exercícios do tipo 'gamification' como resultado final
  input.scenes.forEach(scene => {
    if (scene.type === 'gamification' && scene.visual.content) {
      const content = scene.visual.content as any;
      if (content.metrics) {
        exercises.push({
          id: `exercise-${scene.id}`,
          type: 'gamification-result',
          title: content.title || 'Resultado',
          data: {
            emoji: content.emoji,
            title: content.title,
            message: content.message,
            metrics: content.metrics,
            ctaText: content.ctaText
          }
        });
      }
    }
  });

  // Futuramente: extrair outros tipos de exercícios pós-aula

  return exercises;
}
