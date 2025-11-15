import { Step3Output, Step4Output } from './types';

/**
 * STEP 4: CÁLCULO DE TIMESTAMPS
 * - Distribui timestamps pelo conteúdo
 * - Estrutura content final por modelo (V1/V2/V3)
 */
export function step4CalculateTimestamps(input: Step3Output): Step4Output {
  const startTime = Date.now();
  console.log('⏱️ [STEP 4] Calculando timestamps...');
  console.log(`🐛 [STEP 4] Modelo: ${input.model}`);

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

/**
 * V1: Word timestamps - encontrar início de cada seção
 */
function calculateTimestampsV1(input: Step3Output): Step4Output {
  console.log('⏱️ [V1] Calculando timestamps por word matching...');

  if (!input.sections || !input.wordTimestamps) {
    throw new Error('sections ou wordTimestamps ausentes para V1');
  }

  const sectionsWithTimestamps = input.sections.map((section, idx) => {
    const sectionText = input.sectionTexts[idx];
    const firstWords = getFirstWords(sectionText, 5);
    
    let timestamp = 0;
    for (let i = 0; i < input.wordTimestamps!.length - 4; i++) {
      const windowWords = input.wordTimestamps!
        .slice(i, i + 5)
        .map(w => w.word.toLowerCase())
        .join(' ');
      
      if (windowWords.includes(firstWords.toLowerCase())) {
        timestamp = input.wordTimestamps![i].start_time;
        break;
      }
    }

    console.log(`   Seção ${idx + 1}: timestamp=${timestamp.toFixed(2)}s`);

    return {
      id: section.id,
      title: section.title,
      visualContent: section.visualContent,
      timestamp,
      speechBubbleText: section.speechBubbleText,
      showPlaygroundCall: section.showPlaygroundCall,
      playgroundConfig: section.playgroundConfig
    };
  });

  const totalDuration = input.wordTimestamps[input.wordTimestamps.length - 1]?.end_time || 0;

  const structuredContent = {
    contentVersion: 'v1',
    sections: sectionsWithTimestamps
  };

  console.log(`✅ [V1] Timestamps calculados`);
  console.log(`   Duração total: ${totalDuration.toFixed(1)}s`);

  return {
    ...input,
    structuredContent,
    totalDuration
  };
}

/**
 * V2: Cumulative timestamps baseados em durações
 */
function calculateTimestampsV2(input: Step3Output): Step4Output {
  console.log('⏱️ [V2] Calculando timestamps cumulativos...');

  if (!input.sections || !input.durations || !input.audioUrls) {
    throw new Error('sections, durations ou audioUrls ausentes para V2');
  }

  let cumulativeTime = 0;
  const sectionsWithTimestamps = input.sections.map((section, idx) => {
    const timestamp = cumulativeTime;
    cumulativeTime += input.durations![idx];

    console.log(`   Seção ${idx + 1}: ${timestamp.toFixed(1)}s (duração: ${input.durations![idx].toFixed(1)}s)`);

    return {
      id: section.id,
      title: section.title,
      visualContent: section.visualContent,
      timestamp,
      audioUrl: input.audioUrls![idx],
      speechBubbleText: section.speechBubbleText,
      showPlaygroundCall: section.showPlaygroundCall,
      playgroundConfig: section.playgroundConfig
    };
  });

  const totalDuration = cumulativeTime;

  const structuredContent = {
    contentVersion: 'v2',
    sections: sectionsWithTimestamps
  };

  console.log(`✅ [V2] Timestamps calculados`);
  console.log(`   Duração total: ${totalDuration.toFixed(1)}s`);

  return {
    ...input,
    structuredContent,
    totalDuration
  };
}

/**
 * V3: Distribuir único áudio pelos slides
 */
function calculateTimestampsV3(input: Step3Output): Step4Output {
  console.log('⏱️ [V3] Distribuindo timestamps pelos slides...');

  if (!input.v3Data || !input.wordTimestamps) {
    throw new Error('v3Data ou wordTimestamps ausentes para V3');
  }

  const totalWords = input.wordTimestamps.length;
  const totalSlides = input.v3Data.slides.length;
  const wordsPerSlide = Math.ceil(totalWords / totalSlides);

  const slidesWithTimestamps = input.v3Data.slides.map((slide, idx) => {
    const wordIndex = idx * wordsPerSlide;
    const timestamp = input.wordTimestamps![wordIndex]?.start_time || 0;

    console.log(`   Slide ${idx + 1}: ${timestamp.toFixed(1)}s`);

    return {
      ...slide,
      timestamp
    };
  });

  const totalDuration = input.wordTimestamps[input.wordTimestamps.length - 1]?.end_time || 0;

  const structuredContent = {
    contentVersion: 'v3',
    audioUrl: input.audioUrl,
    slides: slidesWithTimestamps,
    finalPlaygroundConfig: input.v3Data.finalPlaygroundConfig
  };

  console.log(`✅ [V3] Timestamps calculados`);
  console.log(`   Duração total: ${totalDuration.toFixed(1)}s`);

  return {
    ...input,
    structuredContent,
    totalDuration
  };
}

// Helper: extrair primeiras N palavras
function getFirstWords(text: string, count: number): string {
  return text.split(/\s+/).slice(0, count).join(' ');
}
