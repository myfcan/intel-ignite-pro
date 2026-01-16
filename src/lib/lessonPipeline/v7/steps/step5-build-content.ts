/**
 * V7 Pipeline - Step 5: Construir Content
 * 
 * Monta a estrutura final de content para salvar no banco.
 */

import { V7ScriptInput } from '@/types/V7ScriptInput';
import { 
  V7PipelineContext, 
  V7Step1Output,
  V7Step3Output, 
  V7Step4Output, 
  V7Step5Output,
  V7LessonContent 
} from '../types';

interface Step5Context extends V7PipelineContext {
  validated: V7Step1Output;
  audio: V7Step3Output;
  anchors: V7Step4Output;
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
  // 3. PROCESSAR PHASES
  // ============================================================
  // As phases já vêm do step 4 com todos os dados necessários
  const phases = anchors.phases.map(phase => ({
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
  // 4. EXTRAIR EXERCÍCIOS PÓS-AULA
  // ============================================================
  // Exercícios de quiz inline são parte das phases
  // Aqui extraímos exercícios adicionais se houver
  const postLessonExercises = extractPostLessonExercises(validatedInput);

  if (postLessonExercises.length > 0) {
    await logger.info(5, 'Build Content', `   📝 ${postLessonExercises.length} exercícios pós-aula`);
  }

  // ============================================================
  // 5. MONTAR CONTENT FINAL
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
    anchorActions: anchors.anchorActions.length
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
