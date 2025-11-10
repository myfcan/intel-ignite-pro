import { cleanAudioText, validateAndCleanAudioText } from './audioTextValidator';
import type { GuidedLessonData } from '@/types/guidedLesson';

/**
 * PROCESSADOR CENTRALIZADO DE DADOS DE LIÇÃO
 * 
 * Este é o ÚNICO ponto de entrada para processar dados de lição.
 * Garante consistência total entre sync, create, batch e qualquer operação.
 * 
 * ✅ Valida estrutura dos dados
 * ✅ Limpa audioText automaticamente (remove emojis, markdown)
 * ✅ Arredonda duration para INTEGER (para estimated_time)
 * ✅ Estrutura content JSONB corretamente
 * ✅ Retorna dados separados para banco e áudio
 * ✅ Fornece metadata de validação
 */

export interface LessonDataInput {
  lessonData: GuidedLessonData;
  audioText: string;
  trailId: string;
  orderIndex: number;
  title?: string;
  description?: string;
  passingScore?: number;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ProcessedLessonData {
  // Dados prontos para insert/update no banco
  databaseData: {
    title: string;
    description?: string;
    trail_id: string;
    order_index: number;
    lesson_type: 'guided' | 'interactive' | 'fill-blanks' | 'quiz-playground';
    passing_score: number;
    estimated_time: number; // INTEGER (arredondado)
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    content: any; // JSONB com duration preciso
    is_active: boolean;
  };
  
  // Dados prontos para geração de áudio
  audioData: {
    cleanAudioText: string;
    originalAudioText: string;
    validation: {
      isValid: boolean;
      warnings: string[];
      errors: string[];
    };
  };
  
  // Metadata para debug e logs
  validation: {
    allPassed: boolean;
    checks: {
      name: string;
      passed: boolean;
      details?: string;
    }[];
    warnings: string[];
  };
}

/**
 * Processa dados de lição para garantir consistência total
 */
export function processLessonData(input: LessonDataInput): ProcessedLessonData {
  const {
    lessonData,
    audioText,
    trailId,
    orderIndex,
    title,
    description,
    passingScore = 70,
    difficultyLevel = 'beginner'
  } = input;

  // 1. Validar e limpar audioText
  const audioValidation = validateAndCleanAudioText(audioText, { strict: false });
  
  // 2. Arredondar duration para INTEGER
  const estimatedTime = Math.round(lessonData.duration);
  
  // 3. Estruturar content JSONB (mantém duration preciso)
  const content = {
    contentVersion: lessonData.contentVersion,
    duration: lessonData.duration, // Valor preciso em JSONB
    audioText: audioValidation.cleanText, // Texto limpo
    sections: lessonData.sections,
    exercisesConfig: lessonData.exercisesConfig
  };

  // 4. Validações de consistência
  const checks = [
    {
      name: 'estimated_time é INTEGER',
      passed: Number.isInteger(estimatedTime),
      details: `${estimatedTime} (original: ${lessonData.duration})`
    },
    {
      name: 'audioText está limpo',
      passed: audioValidation.isValid,
      details: audioValidation.warnings.length > 0 
        ? `Warnings: ${audioValidation.warnings.join(', ')}` 
        : 'OK'
    },
    {
      name: 'content tem duration preciso',
      passed: typeof content.duration === 'number' && content.duration > 0,
      details: `${content.duration}s`
    },
    {
      name: 'sem emojis no audioText',
      passed: !/[\u{1F300}-\u{1F9FF}]/u.test(audioValidation.cleanText),
      details: 'Verified'
    },
    {
      name: 'sem markdown no audioText',
      passed: !audioValidation.cleanText.includes('**') && 
              !audioValidation.cleanText.includes('##') &&
              !audioValidation.cleanText.includes('```'),
      details: 'Verified'
    },
    {
      name: 'sections existem',
      passed: Array.isArray(lessonData.sections) && lessonData.sections.length > 0,
      details: `${lessonData.sections?.length || 0} seções`
    },
    {
      name: 'trail_id válido',
      passed: typeof trailId === 'string' && trailId.length > 0,
      details: trailId
    }
  ];

  const allPassed = checks.every(check => check.passed);
  const warnings = [...audioValidation.warnings];

  if (!allPassed) {
    const failedChecks = checks.filter(c => !c.passed).map(c => c.name);
    warnings.push(`Validações falharam: ${failedChecks.join(', ')}`);
  }

  // 5. Montar resultado
  return {
    databaseData: {
      title: title || lessonData.title,
      description,
      trail_id: trailId,
      order_index: orderIndex,
      lesson_type: 'guided',
      passing_score: passingScore,
      estimated_time: estimatedTime,
      difficulty_level: difficultyLevel,
      content: content as any,
      is_active: true
    },
    audioData: {
      cleanAudioText: audioValidation.cleanText,
      originalAudioText: audioText,
      validation: {
        isValid: audioValidation.isValid,
        warnings: audioValidation.warnings,
        errors: audioValidation.errors
      }
    },
    validation: {
      allPassed,
      checks,
      warnings
    }
  };
}

/**
 * Helper: Log de validação formatado
 */
export function logValidation(processed: ProcessedLessonData, lessonTitle: string) {
  console.log(`\n🔍 Validação: ${lessonTitle}`);
  console.log('=====================================');
  
  processed.validation.checks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}: ${check.details || (check.passed ? 'OK' : 'FALHOU')}`);
  });
  
  if (processed.validation.warnings.length > 0) {
    console.log('\n⚠️ Avisos:');
    processed.validation.warnings.forEach(w => console.log(`  - ${w}`));
  }
  
  console.log(`\n🎯 Status: ${processed.validation.allPassed ? 'APROVADO ✅' : 'COM PROBLEMAS ⚠️'}`);
  console.log('=====================================\n');
}
