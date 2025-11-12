import { Step6Output, Step7Output } from './types';

/**
 * STEP 7: CALCULAR TIMESTAMPS E ESTRUTURAR MODELO
 * 
 * V1: Calcular timestamps de seções baseado em word_timestamps
 * V2: Calcular timestamps acumulados
 */
export async function step7CalculateTimestamps(input: Step6Output): Promise<Step7Output> {
  console.log('⏱️ [STEP 7] Calculando timestamps...');

  if (input.model === 'v1') {
    return calculateTimestampsV1(input);
  } else if (input.model === 'v2') {
    return calculateTimestampsV2(input);
  } else if (input.model === 'v3') {
    return calculateTimestampsV3(input);
  } else {
    throw new Error(`Modelo desconhecido: ${input.model}`);
  }
}

function calculateTimestampsV1(input: Step6Output): Step7Output {
  console.log('   📊 Calculando timestamps V1 (baseado em word_timestamps)...');

  if (!input.wordTimestamps || input.wordTimestamps.length === 0) {
    throw new Error('wordTimestamps não disponível para modelo V1');
  }

  // Buscar content atual do banco
  const sections = input.sections.map((section, idx) => {
    // Tentar encontrar timestamp baseado nas primeiras palavras da seção
    const sectionText = input.sectionTexts[idx];
    const firstWords = sectionText.split(' ').slice(0, 3).join(' ').toLowerCase();
    
    // Procurar no wordTimestamps
    let timestamp = 0;
    for (let i = 0; i < input.wordTimestamps!.length - 2; i++) {
      const wordSequence = input.wordTimestamps!
        .slice(i, i + 3)
        .map((w: any) => w.word)
        .join(' ')
        .toLowerCase();
      
      if (wordSequence.includes(firstWords.substring(0, 10))) {
        timestamp = input.wordTimestamps![i].start;
        break;
      }
    }

    console.log(`   Seção ${idx + 1}: timestamp ${timestamp.toFixed(2)}s`);

    return {
      id: section.id,
      title: section.title,
      timestamp,
      type: 'text' as const,
      speechBubbleText: section.speechBubbleText || section.visualContent.substring(0, 100),
      visualContent: section.visualContent,
    };
  });

  // Calcular duração total
  const lastWordTimestamp = input.wordTimestamps[input.wordTimestamps.length - 1];
  const totalDuration = lastWordTimestamp ? lastWordTimestamp.end : 0;

  // Posicionar playground mid-lesson (se existir)
  const playgroundSectionIndex = sections.findIndex((s: any) => s.showPlaygroundCall);
  if (playgroundSectionIndex !== -1) {
    const playgroundTime = sections[playgroundSectionIndex].timestamp + 
      (sections[playgroundSectionIndex + 1]?.timestamp - sections[playgroundSectionIndex].timestamp) * 0.8;
    
    (sections[playgroundSectionIndex] as any).playgroundConfig = {
      instruction: 'Complete o desafio prático',
      type: 'real-playground' as const,
      triggerKeyword: 'playground',
      triggerAfterSection: playgroundSectionIndex,
    };
    (sections[playgroundSectionIndex] as any).showPlaygroundCall = true;
    
    console.log(`   🎮 Playground posicionado na seção ${playgroundSectionIndex + 1} (~${playgroundTime.toFixed(1)}s)`);
  }

  const structuredContent = {
    contentVersion: 1,
    schemaVersion: 1,
    duration: totalDuration,
    sections,
    exercisesConfig: input.exercisesConfig,
  };

  console.log(`✅ [STEP 7] V1 timestamps calculados - Duração total: ${totalDuration.toFixed(1)}s`);

  return {
    ...input,
    structuredContent,
    totalDuration,
  };
}

function calculateTimestampsV2(input: Step6Output): Step7Output {
  console.log('   📊 Calculando timestamps V2 (acumulativo)...');

  if (!input.audioUrls || !input.durations) {
    throw new Error('audioUrls ou durations não disponível para modelo V2');
  }

  let accumulatedTime = 0;
  const sections = input.sections.map((section, idx) => {
    const timestamp = accumulatedTime;
    const duration = input.durations![idx];
    accumulatedTime += duration;

    console.log(`   Seção ${idx + 1}: ${timestamp.toFixed(1)}s - ${accumulatedTime.toFixed(1)}s (${duration.toFixed(1)}s)`);

    return {
      id: section.id,
      title: section.title,
      timestamp,
      type: 'text' as const,
      speechBubbleText: section.speechBubbleText || section.visualContent.substring(0, 100),
      visualContent: section.visualContent,
      audio_url: input.audioUrls![idx],
    };
  });

  const totalDuration = accumulatedTime;

  const structuredContent = {
    contentVersion: 3,
    schemaVersion: 2,
    duration: totalDuration,
    sections,
    exercisesConfig: input.exercisesConfig,
  };

  console.log(`✅ [STEP 7] V2 timestamps calculados - Duração total: ${totalDuration.toFixed(1)}s`);

  return {
    ...input,
    structuredContent,
    totalDuration,
  };
}

function calculateTimestampsV3(input: Step6Output): Step7Output {
  console.log('   📊 Calculando timestamps V3 (slides com áudio único)...');

  if (!input.wordTimestamps || input.wordTimestamps.length === 0) {
    throw new Error('wordTimestamps não disponível para modelo V3');
  }

  // V3: Dividir o áudio total pelos N slides (~7)
  const totalWords = input.wordTimestamps.length;
  const slidesCount = input.sections.length;
  const wordsPerSlide = Math.floor(totalWords / slidesCount);

  const sections = input.sections.map((section, idx) => {
    // Calcular timestamp baseado na posição do slide
    const wordIndex = idx * wordsPerSlide;
    const timestamp = idx < slidesCount - 1 
      ? input.wordTimestamps![wordIndex]?.start || 0
      : input.wordTimestamps![input.wordTimestamps!.length - 1]?.start || 0;

    console.log(`   Slide ${idx + 1}: timestamp ${timestamp.toFixed(2)}s`);

    return {
      id: section.id,
      title: section.title || `Slide ${idx + 1}`,
      timestamp,
      type: 'text' as const,
      speechBubbleText: section.speechBubbleText || section.visualContent.substring(0, 100),
      visualContent: section.visualContent,
      imageUrl: (section as any).imageUrl, // Imagem do slide (se existir)
      slideNumber: idx + 1,
    };
  });

  // Calcular duração total
  const lastWordTimestamp = input.wordTimestamps[input.wordTimestamps.length - 1];
  const totalDuration = lastWordTimestamp ? lastWordTimestamp.end : 0;

  const structuredContent = {
    contentVersion: 4, // V3 usa contentVersion 4
    schemaVersion: 3,
    duration: totalDuration,
    sections,
    exercisesConfig: input.exercisesConfig,
  };

  console.log(`✅ [STEP 7] V3 timestamps calculados - ${slidesCount} slides em ${totalDuration.toFixed(1)}s`);

  return {
    ...input,
    structuredContent,
    totalDuration,
  };
}
