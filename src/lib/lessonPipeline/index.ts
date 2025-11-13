import { PipelineInput, PipelineResult } from './types';
import { supabase } from '@/integrations/supabase/client';
import { step1Intake } from './step1-intake';
import { step2CleanText } from './step2-clean-text';
import { step3GenerateAudio } from './step3-generate-audio';
import { step4CalculateTimestamps } from './step4-calculate-timestamps';
import { step5GenerateExercises } from './step5-generate-exercises';
import { step6ValidateAll } from './step6-validate';
import { step7Consolidate } from './step7-consolidate';
import { step8Activate } from './step8-activate';

export async function runLessonPipeline(
  input: PipelineInput,
  executionId: string
): Promise<PipelineResult> {
  const updateDB = async (status: 'running' | 'completed' | 'failed', currentStep: number, error?: string) => {
    await supabase.from('pipeline_executions').update({
      status, current_step: currentStep, error_message: error, updated_at: new Date().toISOString()
    }).eq('id', executionId);
  };

  try {
    await updateDB('running', 1);
    const step1 = await step1Intake(input);
    
    await updateDB('running', 2);
    const step2 = await step2CleanText(step1);
    
    await updateDB('running', 3);
    const step3 = await step3GenerateAudio(step2);
    
    await updateDB('running', 4);
    const step4 = step4CalculateTimestamps(step3);
    
    await updateDB('running', 5);
    const step5 = await step5GenerateExercises(step4);
    
    await updateDB('running', 6);
    const step6 = await step6ValidateAll(step5);
    
    await updateDB('running', 7);
    const step7 = await step7Consolidate(step6);
    
    await updateDB('running', 8);
    const step8 = await step8Activate(step7);
    
    await updateDB('completed', 8);
    return step8;
  } catch (error: any) {
    await updateDB('failed', 0, error.message);
    return { success: false, status: 'failed', error: error.message, logs: [] };
  }
}

export type * from './types';
