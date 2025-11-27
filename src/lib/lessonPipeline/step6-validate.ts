import { Step5Output, Step6Output } from './types';

/**
 * STEP 6: VALIDAÇÃO COMPLETA
 * - Valida que TODOS os componentes foram criados corretamente
 * - Verifica áudio, timestamps, exercícios, metadados
 * - Garante integridade antes de consolidar
 */
export async function step6ValidateAll(input: Step5Output): Promise<Step6Output> {
  const startTime = Date.now();
  console.log('✅ [STEP 6] Validando todos os componentes...');

  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. VALIDAR ÁUDIO
  console.log('   🔍 Validando áudio...');
  if (input.model === 'v1' || input.model === 'v3') {
    if (!input.audioUrl) {
      errors.push('❌ audioUrl ausente');
    } else {
      console.log(`      ✅ audioUrl presente: ${input.audioUrl}`);
    }
    
    if (!input.wordTimestamps || input.wordTimestamps.length === 0) {
      errors.push('❌ wordTimestamps ausentes');
    } else {
      console.log(`      ✅ ${input.wordTimestamps.length} word timestamps`);
    }
  } else if (input.model === 'v2') {
    if (!input.audioUrls || input.audioUrls.length === 0) {
      errors.push('❌ audioUrls ausentes');
    } else {
      console.log(`      ✅ ${input.audioUrls.length} audioUrls presentes`);
    }
    
    if (!input.durations || input.durations.length === 0) {
      errors.push('❌ durations ausentes');
    } else {
      console.log(`      ✅ ${input.durations.length} durações`);
    }
  }

  // 2. VALIDAR TIMESTAMPS
  console.log('   🔍 Validando timestamps...');
  if (!input.structuredContent) {
    errors.push('❌ structuredContent ausente');
    console.error('      ❌ structuredContent está undefined');
  } else if (input.model === 'v1' || input.model === 'v2') {
    const sections = input.structuredContent.sections || [];
    if (sections.length === 0) {
      errors.push('❌ Nenhuma seção em structuredContent');
    } else {
      console.log(`      ✅ ${sections.length} seções`);
    }

    sections.forEach((section: any, idx: number) => {
      if (section.timestamp === undefined) {
        errors.push(`❌ Seção ${idx + 1} sem timestamp`);
      }
    });

    const sectionsWithTimestamps = sections.filter((s: any) => s.timestamp !== undefined).length;
    console.log(`      ✅ ${sectionsWithTimestamps}/${sections.length} seções com timestamps`);

  } else if (input.model === 'v3') {
    const slides = input.structuredContent.slides || [];
    if (slides.length === 0) {
      errors.push('❌ Nenhum slide em structuredContent');
    } else {
      console.log(`      ✅ ${slides.length} slides`);
    }

    slides.forEach((slide: any, idx: number) => {
      if (slide.timestamp === undefined) {
        errors.push(`❌ Slide ${idx + 1} sem timestamp`);
      }
      if (!slide.imageUrl) {
        warnings.push(`⚠️ Slide ${idx + 1} sem imagem`);
      }
    });

    const slidesWithTimestamps = slides.filter((s: any) => s.timestamp !== undefined).length;
    console.log(`      ✅ ${slidesWithTimestamps}/${slides.length} slides com timestamps`);
  }

  // 3. VALIDAR EXERCÍCIOS
  console.log('   🔍 Validando exercícios...');
  if (!input.exercisesConfig || input.exercisesConfig.length === 0) {
    errors.push('❌ Nenhum exercício gerado');
  } else {
    console.log(`      ✅ ${input.exercisesConfig.length} exercícios`);

    input.exercisesConfig.forEach((exercise: any, idx: number) => {
      if (!exercise.id) errors.push(`❌ Exercício ${idx + 1} sem ID`);
      if (!exercise.type) errors.push(`❌ Exercício ${idx + 1} sem tipo`);

      // Validar conteúdo baseado no tipo
      const hasContent =
        exercise.question ||
        exercise.instruction ||
        exercise.statements ||  // true-false
        exercise.sentences ||   // complete-sentence
        exercise.title;         // fallback

      if (!hasContent) {
        errors.push(`❌ Exercício ${idx + 1} sem conteúdo válido`);
      }
    });

    const validExercises = input.exercisesConfig.filter((e: any) =>
      e.id && e.type && (e.question || e.instruction || e.statements || e.sentences || e.title)
    ).length;
    console.log(`      ✅ ${validExercises}/${input.exercisesConfig.length} exercícios válidos`);
  }

  // 4. VALIDAR METADADOS
  console.log('   🔍 Validando metadados...');
  if (!input.title) errors.push('❌ Título ausente');
  else console.log(`      ✅ Título: "${input.title}"`);
  
  if (!input.trackId) errors.push('❌ trackId ausente');
  else console.log(`      ✅ trackId: ${input.trackId}`);
  
  if (input.orderIndex === undefined) errors.push('❌ orderIndex ausente');
  else console.log(`      ✅ orderIndex: ${input.orderIndex}`);
  
  if (!input.audioText) errors.push('❌ audioText ausente');
  else console.log(`      ✅ audioText: ${input.audioText.length} caracteres`);

  // 5. VALIDAR DURAÇÃO TOTAL
  console.log('   🔍 Validando duração...');
  if (!input.totalDuration || input.totalDuration <= 0) {
    errors.push('❌ totalDuration inválida');
  } else {
    const minutes = Math.floor(input.totalDuration / 60);
    const seconds = Math.floor(input.totalDuration % 60);
    console.log(`      ✅ Duração total: ${minutes}min ${seconds}s`);
  }

  // RESUMO DA VALIDAÇÃO
  const elapsedTime = Date.now() - startTime;
  console.log(`\n📊 [STEP 6] Validação completa em ${elapsedTime}ms:`);
  console.log(`   ✅ Checks passados: ${20 - errors.length - warnings.length}/20`);
  
  if (warnings.length > 0) {
    console.warn(`   ⚠️ Warnings: ${warnings.length}`);
    warnings.forEach(w => console.warn(`      ${w}`));
  }
  
  if (errors.length > 0) {
    console.error(`   ❌ Erros críticos: ${errors.length}`);
    errors.forEach(e => console.error(`      ${e}`));
    throw new Error(`Validação falhou com ${errors.length} erro(s): ${errors.join(', ')}`);
  }

  console.log('✅ [STEP 6] Todos os componentes validados com sucesso!');

  return {
    ...input,
    validationPassed: true,
    validationWarnings: warnings
  };
}
