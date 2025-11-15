import { PipelineInput, PipelineResult } from './types';
import { supabase } from '@/integrations/supabase/client';
import { step1Intake } from './step1-intake';
import { step2CleanText } from './step2-clean-text';
import { step3GenerateAudio } from './step3-generate-audio';
import { step4CalculateTimestamps } from './step4-calculate-timestamps';
import { step5GenerateExercises } from './step5-generate-exercises';
import { step5_5ProcessPlayground } from './step5-5-process-playground';
import { step6ValidateAll } from './step6-validate';
import { step7Consolidate } from './step7-consolidate';
import { step8Activate } from './step8-activate';
import { PipelineLogger } from './logger';

export async function runLessonPipeline(
  input: PipelineInput,
  executionId: string
): Promise<PipelineResult> {
  const logger = new PipelineLogger(executionId);
  
  const updateDB = async (status: 'running' | 'completed' | 'failed', currentStep: number, error?: string) => {
    await supabase.from('pipeline_executions').update({
      status, current_step: currentStep, error_message: error, updated_at: new Date().toISOString()
    }).eq('id', executionId);
  };

  try {
    await updateDB('running', 1);
    await logger.info(1, 'Intake', '🔍 Validando entrada do pipeline...');
    const step1 = await step1Intake(input);
    await logger.success(1, 'Intake', '✅ Entrada validada com sucesso', {
      model: step1.model,
      sectionsCount: step1.sections?.length || 0,
      exercisesCount: step1.exercises?.length || 0
    });
    
    await updateDB('running', 2);
    await logger.info(2, 'Clean Text', '🧹 Limpando texto para áudio...');
    const step2 = await step2CleanText(step1);
    await logger.success(2, 'Clean Text', '✅ Texto limpo e preparado', {
      audioTextLength: step2.audioText.length,
      sectionsProcessed: step2.sectionTexts?.length || 0
    });
    
    await updateDB('running', 3);
    await logger.info(3, 'Generate Audio', '🎙️ Gerando áudio via ElevenLabs...');
    const step3 = await step3GenerateAudio(step2);
    await logger.success(3, 'Generate Audio', '✅ Áudio gerado com sucesso', {
      audioUrl: step3.audioUrl,
      wordCount: step3.wordTimestamps?.length || 0
    });
    
    await updateDB('running', 4);
    await logger.info(4, 'Calculate Timestamps', '⏱️ Calculando timestamps...');
    const step4 = step4CalculateTimestamps(step3);
    await logger.success(4, 'Calculate Timestamps', '✅ Timestamps calculados', {
      totalDuration: step4.totalDuration,
      sectionsWithTimestamps: step4.structuredContent?.sections?.length || 0
    });
    
    await updateDB('running', 5);
    await logger.info(5, 'Generate Exercises', '📝 Gerando e validando exercícios...');
    const step5 = await step5GenerateExercises(step4, logger);
    await logger.success(5, 'Generate Exercises', '✅ Exercícios prontos', {
      totalExercises: step5.exercisesConfig?.length || 0
    });

    // ============================================================================
    // STEP 5.5: PROCESSAR PLAYGROUND CONFIG (NOVO - 2025-11-15)
    // ============================================================================
    // Este step foi adicionado para expandir automaticamente playgroundConfig
    // quando tipo = 'real-playground' mas não tem realConfig completo.
    // Busque por "STEP 5.5" no GitHub para mais detalhes.
    // ============================================================================

    await updateDB('running', 5.5);
    await logger.info(5.5, 'Process Playground', '🎮 Processando playground config...');
    const step5_5 = await step5_5ProcessPlayground(step5, logger);
    await logger.success(5.5, 'Process Playground', '✅ Playground config processado');

    await updateDB('running', 6);
    await logger.info(6, 'Validate All', '🔍 Validação final de todos os componentes...');
    const step6 = await step6ValidateAll(step5_5);
    await logger.success(6, 'Validate All', '✅ Validação completa bem-sucedida', {
      validationWarnings: step6.validationWarnings?.length || 0
    });
    
    await updateDB('running', 7);
    await logger.info(7, 'Consolidate', '💾 Salvando draft no banco de dados...');
    const step7 = await step7Consolidate(step6);
    await logger.success(7, 'Consolidate', '✅ Draft salvo com sucesso', {
      lessonId: step7.lessonId
    });
    
    await updateDB('running', 8);
    await logger.info(8, 'Activate', '🚀 Ativando lição...');
    const step8 = await step8Activate(step7);
    await logger.success(8, 'Activate', '✅ Lição ativada e disponível!', {
      lessonId: step8.lessonId
    });
    
    await updateDB('completed', 8);
    return step8;
  } catch (error: any) {
    await logger.error(0, 'Pipeline', '❌ Erro fatal no pipeline', {
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

export type * from './types';
