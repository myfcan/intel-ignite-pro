/**
 * V7-VV Pipeline - Sistema Cinematográfico de Criação de Aulas
 * 
 * Este módulo processa V7ScriptInput e gera aulas V7 completas com:
 * - Áudio sincronizado com word timestamps
 * - Anchor actions para interações
 * - Exercícios integrados (quizzes, playgrounds)
 * - Efeitos visuais e micro-visuais
 * 
 * @version VV-Definitive
 * @see docs/V7-VV-DOCUMENTACAO-TECNICA.md
 */

import { V7ScriptInput, validateV7ScriptInput, estimateDuration } from '@/types/V7ScriptInput';
import { supabase } from '@/integrations/supabase/client';
import { V7PipelineLogger } from './logger';
import { v7Step1Validate } from './steps/step1-validate';
import { v7Step2BuildNarration } from './steps/step2-build-narration';
import { v7Step3GenerateAudio } from './steps/step3-generate-audio';
import { v7Step4CalculateAnchors } from './steps/step4-calculate-anchors';
import { v7Step5BuildContent } from './steps/step5-build-content';
import { v7Step6Consolidate } from './steps/step6-consolidate';
import { v7Step7Activate } from './steps/step7-activate';
import { V7PipelineResult, V7PipelineContext } from './types';

export interface V7PipelineOptions {
  /** Se true, falha se áudio não puder ser gerado */
  failOnAudioError?: boolean;
  /** Voice ID do ElevenLabs (default: Alice Brasil) */
  voiceId?: string;
  /** Gerar áudio? (default: true) */
  generateAudio?: boolean;
  /** ID da execução para logs */
  executionId?: string;
}

/**
 * Executa o Pipeline V7-VV completo
 * 
 * @param input - Script de entrada no formato V7ScriptInput
 * @param options - Opções de execução
 * @returns Resultado do pipeline com lessonId e metadados
 */
export async function runV7Pipeline(
  input: V7ScriptInput,
  options: V7PipelineOptions = {}
): Promise<V7PipelineResult> {
  const executionId = options.executionId || `v7-${Date.now()}`;
  const logger = new V7PipelineLogger(executionId);
  
  const startTime = Date.now();
  
  // Contexto compartilhado entre steps
  const context: V7PipelineContext = {
    input,
    options: {
      failOnAudioError: options.failOnAudioError ?? input.fail_on_audio_error ?? true,
      voiceId: options.voiceId ?? input.voice_id ?? 'Xb7hH8MSUJpSbSDYk0k2', // Alice Brasil
      generateAudio: options.generateAudio ?? input.generate_audio ?? true,
    },
    executionId,
    logger,
  };

  const updateDB = async (status: 'running' | 'completed' | 'failed', currentStep: number, error?: string) => {
    await supabase.from('pipeline_executions').update({
      status, 
      current_step: currentStep, 
      error_message: error, 
      updated_at: new Date().toISOString()
    }).eq('id', executionId).maybeSingle();
  };

  try {
    // ============================================================
    // STEP 1: VALIDAÇÃO
    // ============================================================
    await updateDB('running', 1);
    await logger.info(1, 'Validate', '🔍 Validando V7ScriptInput...');
    
    const step1 = await v7Step1Validate(context);
    
    await logger.success(1, 'Validate', '✅ Input validado', {
      scenes: step1.validatedInput.scenes.length,
      estimatedDuration: estimateDuration(step1.validatedInput)
    });

    // ============================================================
    // STEP 2: CONSTRUIR NARRAÇÃO
    // ============================================================
    await updateDB('running', 2);
    await logger.info(2, 'Build Narration', '📝 Construindo texto de narração...');
    
    const step2 = await v7Step2BuildNarration({ ...context, validated: step1 });
    
    await logger.success(2, 'Build Narration', '✅ Narração construída', {
      totalWords: step2.totalWords,
      narrationLength: step2.fullNarration.length
    });

    // ============================================================
    // STEP 3: GERAR ÁUDIO
    // ============================================================
    await updateDB('running', 3);
    await logger.info(3, 'Generate Audio', '🎙️ Gerando áudio via ElevenLabs...');
    
    const step3 = await v7Step3GenerateAudio({ ...context, narration: step2 });
    
    await logger.success(3, 'Generate Audio', '✅ Áudio gerado', {
      audioUrl: step3.audioUrl,
      wordTimestampsCount: step3.wordTimestamps.length,
      totalDuration: step3.totalDuration
    });

    // ============================================================
    // STEP 4: CALCULAR ANCHORS
    // ============================================================
    await updateDB('running', 4);
    await logger.info(4, 'Calculate Anchors', '⚓ Calculando anchor actions...');
    
    const step4 = await v7Step4CalculateAnchors({ 
      ...context, 
      audio: step3,
      scenes: step1.validatedInput.scenes
    });
    
    await logger.success(4, 'Calculate Anchors', '✅ Anchors calculados', {
      phasesCount: step4.phases.length,
      anchorActionsCount: step4.anchorActions.length
    });

    // ============================================================
    // STEP 5: CONSTRUIR CONTENT
    // ============================================================
    await updateDB('running', 5);
    await logger.info(5, 'Build Content', '🏗️ Construindo estrutura de content...');
    
    const step5 = await v7Step5BuildContent({
      ...context,
      validated: step1,
      audio: step3,
      anchors: step4
    });
    
    await logger.success(5, 'Build Content', '✅ Content construído', {
      contentSize: JSON.stringify(step5.content).length
    });

    // ============================================================
    // STEP 6: CONSOLIDAR
    // ============================================================
    await updateDB('running', 6);
    await logger.info(6, 'Consolidate', '💾 Salvando no banco de dados...');
    
    const step6 = await v7Step6Consolidate({
      ...context,
      validated: step1,
      audio: step3,
      content: step5
    });
    
    await logger.success(6, 'Consolidate', '✅ Lição salva como draft', {
      lessonId: step6.lessonId
    });

    // Atualizar lesson_id na pipeline_executions
    await supabase.from('pipeline_executions').update({
      lesson_id: step6.lessonId
    }).eq('id', executionId);

    // ============================================================
    // STEP 7: ATIVAR
    // ============================================================
    await updateDB('running', 7);
    await logger.info(7, 'Activate', '🚀 Ativando lição...');
    
    const step7 = await v7Step7Activate({
      ...context,
      lessonId: step6.lessonId,
      content: step5,
      audio: step3
    });
    
    await logger.success(7, 'Activate', '✅ Lição ativada!', {
      lessonId: step7.lessonId
    });

    // ============================================================
    // RESULTADO FINAL
    // ============================================================
    await updateDB('completed', 7);
    
    const elapsedTime = Date.now() - startTime;
    await logger.info(0, 'Pipeline', `🎉 Pipeline V7 completo em ${elapsedTime}ms`);

    return {
      success: true,
      lessonId: step7.lessonId,
      status: 'active',
      metadata: {
        duration: step3.totalDuration,
        phasesCount: step4.phases.length,
        scenesCount: step1.validatedInput.scenes.length,
        audioUrl: step3.audioUrl,
        wordTimestampsCount: step3.wordTimestamps.length,
      },
      logs: logger.getLogs().map(l => `[${l.timestamp}] ${l.message}`)
    };

  } catch (error: any) {
    await logger.error(0, 'Pipeline', '❌ Erro fatal no pipeline V7', {
      error: error.message,
      stack: error.stack
    });
    
    await updateDB('failed', 0, error.message);
    
    return {
      success: false,
      status: 'failed',
      error: error.message,
      logs: logger.getLogs().map(l => `[${l.timestamp}] ${l.message}`)
    };
  }
}

// Re-exportar tipos
export * from './types';
export { V7PipelineLogger } from './logger';
