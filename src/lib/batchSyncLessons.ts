import { GuidedLessonData } from '@/types/guidedLesson';
import { syncLessonV2Generic } from './syncLessonV2Generic';
import { analyzeLessonIntonation, formatIntonationReport, IntonationAnalysisResult } from './ttsIntonationAnalyzer';
import { validateAllExercises, formatValidationReport, ValidationResult } from './exerciseValidator';

/**
 * 🎯 SISTEMA DE CRIAÇÃO EM LOTE (BATCH PROCESSING)
 * 
 * Sincroniza múltiplas lições em sequência com:
 * ✅ Validação automática de dados
 * ✅ Geração de áudios via API
 * ✅ Upload para Storage
 * ✅ Cálculo de timestamps
 * ✅ Logs detalhados
 * ✅ Relatório final
 */

interface BatchLesson {
  lessonData: GuidedLessonData;
  audioText: string;
  trailTitle: string;
  folderName: string; // Ex: 'aula-04'
  orderIndex?: number; // Ordem na trilha (opcional)
}

interface BatchResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    title: string;
    success: boolean;
    message: string;
    lessonId?: string;
    intonationAnalysis?: IntonationAnalysisResult;
    exerciseValidation?: ValidationResult[]; // 🆕 NOVO
  }>;
}

/**
 * Sincroniza múltiplas lições em lote
 * 
 * @param lessons - Array de lições para sincronizar
 * @param delayBetweenLessons - Delay em ms entre cada lição (evitar rate limit)
 */
export async function batchSyncLessons(
  lessons: BatchLesson[],
  delayBetweenLessons: number = 2000
): Promise<BatchResult> {
  
  console.log('\n' + '='.repeat(70));
  console.log(`📚 [BATCH SYNC] Iniciando lote de ${lessons.length} aula(s)`);
  console.log('='.repeat(70) + '\n');
  
  // 🔍 VALIDAÇÃO: Detectar duplicatas de order_index DENTRO do batch
  console.log('🔍 Validando order_index no batch...');
  const orderIndexMap = new Map<number, string>();
  const duplicates: string[] = [];
  
  lessons.forEach((lesson, index) => {
    if (lesson.orderIndex !== undefined) {
      const existing = orderIndexMap.get(lesson.orderIndex);
      if (existing) {
        duplicates.push(
          `  [${index + 1}] order_index ${lesson.orderIndex}: "${existing}" ↔️ "${lesson.lessonData.title}"`
        );
      } else {
        orderIndexMap.set(lesson.orderIndex, lesson.lessonData.title);
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.error('\n❌ ERRO: Batch contém order_index duplicados:');
    duplicates.forEach(d => console.error(d));
    console.error('\n💡 Corrija os índices duplicados antes de continuar.\n');
    
    throw new Error(
      `❌ Batch contém ${duplicates.length} order_index duplicado(s):\n${duplicates.join('\n')}`
    );
  }
  
  console.log('✅ Nenhuma duplicata detectada no batch\n');
  
  const results: BatchResult['results'] = [];
  let successful = 0;
  let failed = 0;
  
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const currentNumber = i + 1;
    
    console.log(`\n🔄 [${currentNumber}/${lessons.length}] Iniciando: ${lesson.lessonData.title}`);
    console.log('-'.repeat(70));
    
    // 🔍 Validar exercícios ANTES de sincronizar
    let exerciseValidation: ValidationResult[] = [];
    if (lesson.lessonData.exercisesConfig && lesson.lessonData.exercisesConfig.length > 0) {
      exerciseValidation = validateAllExercises(lesson.lessonData.exercisesConfig);
      
      console.log(`\n📋 Validação de Exercícios: ${lesson.lessonData.title}`);
      console.log(formatValidationReport(exerciseValidation));
      
      // Bloquear se houver erros críticos
      const hasErrors = exerciseValidation.some(v => !v.isValid);
      if (hasErrors) {
        results.push({
          title: lesson.lessonData.title,
          success: false,
          message: '❌ Exercícios com erros estruturais',
          exerciseValidation
        });
        failed++;
        continue; // Pular para próxima lição
      }
    }
    
    // 🎙️ ANÁLISE DE ENTONAÇÃO TTS (antes de sincronizar)
    console.log('\n🎙️ Analisando entonação TTS...');
    const intonationAnalysis = analyzeLessonIntonation(lesson.lessonData.sections);
    console.log(formatIntonationReport(intonationAnalysis));
    
    if (intonationAnalysis.hasIssues) {
      console.log('\n⚠️ Problemas de entonação detectados! Prosseguindo com sincronização...\n');
    }
    
    try {
      const result = await syncLessonV2Generic(
        lesson.lessonData,
        lesson.audioText,
        lesson.trailTitle,
        lesson.folderName,
        lesson.orderIndex
      );
      
      results.push({
        title: lesson.lessonData.title,
        success: result.success,
        message: result.message,
        lessonId: result.lessonId,
        intonationAnalysis, // Incluir análise nos resultados
        exerciseValidation // 🆕 INCLUIR NO RESULTADO
      });
      
      if (result.success) {
        successful++;
        console.log(`✅ [${currentNumber}/${lessons.length}] ${lesson.lessonData.title}`);
        console.log(`   ID: ${result.lessonId}`);
        console.log(`   ${result.message}`);
      } else {
        failed++;
        console.error(`❌ [${currentNumber}/${lessons.length}] ${lesson.lessonData.title}`);
        console.error(`   Erro: ${result.message}`);
      }
      
    } catch (error: any) {
      failed++;
      const errorMessage = error.message || 'Erro desconhecido';
      
      console.error(`❌ [${currentNumber}/${lessons.length}] ${lesson.lessonData.title}`);
      console.error(`   Exceção: ${errorMessage}`);
      
      results.push({
        title: lesson.lessonData.title,
        success: false,
        message: errorMessage,
        intonationAnalysis, // Incluir análise mesmo em caso de erro
        exerciseValidation // 🆕 INCLUIR NO RESULTADO
      });
    }
    
    // Delay entre lições (evitar rate limit da API)
    if (i < lessons.length - 1) {
      const delaySeconds = delayBetweenLessons / 1000;
      console.log(`\n⏳ Aguardando ${delaySeconds}s antes da próxima lição...\n`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenLessons));
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(70));
  console.log('📊 RELATÓRIO FINAL DO BATCH');
  console.log('='.repeat(70));
  console.log(`Total de aulas processadas: ${lessons.length}`);
  console.log(`✅ Sucesso: ${successful} (${((successful / lessons.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Falhas: ${failed} (${((failed / lessons.length) * 100).toFixed(1)}%)`);
  console.log('='.repeat(70));
  
  // Detalhamento por aula
  if (failed > 0) {
    console.log('\n❌ AULAS COM FALHA:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   • ${r.title}: ${r.message}`);
      });
  }
  
  if (successful > 0) {
    console.log('\n✅ AULAS SINCRONIZADAS:');
    results
      .filter(r => r.success)
      .forEach(r => {
        console.log(`   • ${r.title} (ID: ${r.lessonId})`);
      });
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  return {
    total: lessons.length,
    successful,
    failed,
    results
  };
}

/**
 * Helper para criar configuração de lição para batch
 */
export function createBatchLesson(
  lessonData: GuidedLessonData,
  audioText: string,
  options: {
    trailTitle?: string;
    folderName?: string;
    orderIndex?: number;
  } = {}
): BatchLesson {
  return {
    lessonData,
    audioText,
    trailTitle: options.trailTitle || 'Fundamentos de IA',
    folderName: options.folderName || lessonData.id.replace('fundamentos-', 'aula-'),
    orderIndex: options.orderIndex
  };
}
