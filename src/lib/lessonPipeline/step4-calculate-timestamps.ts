import { Step3Output, Step4Output } from './types';

/**
 * STEP 4: CÁLCULO DE TIMESTAMPS
 * - Distribui timestamps pelo conteúdo
 * - Estrutura content final por modelo (V1/V2/V3/V4/V5)
 */
export function step4CalculateTimestamps(input: Step3Output): Step4Output {
  const startTime = Date.now();
  console.log('⏱️ [STEP 4] Calculando timestamps...');
  console.log(`🐛 [STEP 4] Modelo: ${input.model}`);

  if (input.model === 'v1') {
    return calculateTimestampsV1(input);
  } else if (input.model === 'v2' || input.model === 'v4' || input.model === 'v5') {
    // V2, V4 e V5 usam mesma lógica: timestamps cumulativos por seção
    // V5 adiciona experienceCards mas a lógica de timestamps é a mesma
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
 * V2/V4/V5: Cumulative timestamps baseados em durações
 */
function calculateTimestampsV2(input: Step3Output): Step4Output {
  console.log('⏱️ [V2/V4/V5] Calculando timestamps cumulativos...');

  if (!input.sections || !input.durations || !input.audioUrls) {
    throw new Error('sections, durations ou audioUrls ausentes para V2/V4/V5');
  }

  let cumulativeTime = 0;
  const sectionsWithTimestamps = input.sections.map((section, idx) => {
    const timestamp = cumulativeTime;
    const sectionDuration = input.durations![idx];
    cumulativeTime += sectionDuration;

    console.log(`   Seção ${idx + 1}: ${timestamp.toFixed(1)}s (duração: ${sectionDuration.toFixed(1)}s)`);

    const result: any = {
      id: section.id,
      title: section.title,
      visualContent: section.visualContent,
      timestamp,
      audio_url: input.audioUrls![idx],
      speechBubbleText: section.speechBubbleText,
      showPlaygroundCall: section.showPlaygroundCall,
      playgroundConfig: section.playgroundConfig
    };

    // V5: Processar experienceCards com cálculo de duration
    if (input.model === 'v5' && (section as any).experienceCards) {
      const sectionCards = (section as any).experienceCards;
      const sectionText = input.sectionTexts?.[idx] || section.visualContent || '';
      
      // Calcular duration para cada card usando word_timestamps da seção
      result.experienceCards = calculateCardDurations(
        sectionCards,
        sectionText,
        sectionDuration,
        idx + 1 // sectionNumber para logs
      );
    }

    return result;
  });

  const totalDuration = cumulativeTime;

  const structuredContent = {
    contentVersion: input.model === 'v5' ? 'v5' : 'v2',
    sections: sectionsWithTimestamps
  };

  console.log(`✅ [${input.model.toUpperCase()}] Timestamps calculados`);
  console.log(`   Duração total: ${totalDuration.toFixed(1)}s`);

  return {
    ...input,
    structuredContent,
    totalDuration
  };
}

/**
 * V5: Calcula duration para cada experienceCard baseado no anchorText
 * 
 * Lógica:
 * 1. Encontra posição do anchorText no texto da seção
 * 2. Estima duração do trecho (palavras até próximo card ou fim)
 * 3. Usa heurística: ~2.5 palavras/segundo (velocidade ElevenLabs 1.0)
 */
function calculateCardDurations(
  cards: any[],
  sectionText: string,
  sectionDuration: number,
  sectionNumber: number
): any[] {
  if (!cards || cards.length === 0) return [];

  const words = sectionText.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  const wordsPerSecond = totalWords / sectionDuration; // Velocidade real da seção
  
  console.log(`   📊 Seção ${sectionNumber}: ${totalWords} palavras em ${sectionDuration.toFixed(1)}s (${wordsPerSecond.toFixed(1)} palavras/seg)`);

  // Encontrar posição de cada anchorText no texto
  const cardPositions = cards.map((card, cardIdx) => {
    const anchorText = card.anchorText?.toLowerCase() || '';
    const textLower = sectionText.toLowerCase();
    
    // Encontrar posição do anchorText
    const charPosition = textLower.indexOf(anchorText);
    
    if (charPosition === -1) {
      console.log(`   ⚠️ Card ${cardIdx + 1}: anchorText "${anchorText.substring(0, 30)}..." não encontrado`);
      return { card, wordPosition: -1, charPosition: -1 };
    }

    // Contar palavras até essa posição
    const textBeforeAnchor = sectionText.substring(0, charPosition);
    const wordPosition = textBeforeAnchor.split(/\s+/).filter(w => w.length > 0).length;
    
    return { card, wordPosition, charPosition };
  });

  // Ordenar por posição no texto
  const sortedCards = [...cardPositions].sort((a, b) => {
    if (a.wordPosition === -1) return 1;
    if (b.wordPosition === -1) return -1;
    return a.wordPosition - b.wordPosition;
  });

  // Calcular duration para cada card
  const cardsWithDuration = sortedCards.map((item, idx) => {
    const { card, wordPosition } = item;
    
    if (wordPosition === -1) {
      // Fallback: duração padrão de 15 segundos
      console.log(`   🎬 Card "${card.cardType}": duration=15s (fallback)`);
      return { ...card, duration: 15 };
    }

    // Encontrar fim do trecho (próximo card ou fim do texto)
    const nextCard = sortedCards[idx + 1];
    const endWordPosition = nextCard && nextCard.wordPosition !== -1 
      ? nextCard.wordPosition 
      : totalWords;

    // Calcular número de palavras do trecho
    const wordsInSegment = endWordPosition - wordPosition;
    
    // Calcular duração baseada na velocidade real
    const duration = Math.max(5, Math.min(60, wordsInSegment / wordsPerSecond));
    
    console.log(`   🎬 Card "${card.cardType}": palavras ${wordPosition}-${endWordPosition} (${wordsInSegment} palavras) → duration=${duration.toFixed(1)}s`);

    return { ...card, duration: Math.round(duration * 10) / 10 }; // Arredondar para 1 decimal
  });

  // Reordenar de volta para ordem original
  return cards.map(originalCard => {
    const processed = cardsWithDuration.find(c => c.anchorText === originalCard.anchorText);
    return processed || { ...originalCard, duration: 15 };
  });
}

/**
 * V3: Distribuir único áudio pelos slides
 * CORRIGIDO: Usa audioMarker para fazer word matching inteligente
 */
function calculateTimestampsV3(input: Step3Output): Step4Output {
  console.log('⏱️ [V3] Distribuindo timestamps pelos slides...');

  if (!input.v3Data || !input.wordTimestamps) {
    throw new Error('v3Data ou wordTimestamps ausentes para V3');
  }

  const totalWords = input.wordTimestamps.length;
  const totalSlides = input.v3Data.slides.length;

  // CORREÇÃO: Usar audioMarker para word matching inteligente
  const slidesWithTimestamps = input.v3Data.slides.map((slide, idx) => {
    let timestamp = 0;

    // Se o slide tem audioMarker, fazer word matching
    if (slide.audioMarker) {
      const markerWords = getFirstWords(slide.audioMarker, 6).toLowerCase();

      // Buscar no wordTimestamps
      for (let i = 0; i < input.wordTimestamps!.length - 5; i++) {
        const windowWords = input.wordTimestamps!
          .slice(i, i + 6)
          .map(w => w.word.toLowerCase().replace(/[.,!?]/g, ''))
          .join(' ');

        if (windowWords.includes(markerWords.replace(/[.,!?]/g, ''))) {
          timestamp = input.wordTimestamps![i].start_time;
          console.log(`   Slide ${idx + 1}: ${timestamp.toFixed(1)}s (matched: "${markerWords.substring(0, 30)}...")`);
          break;
        }
      }

      // Se não encontrou match, usar fallback proporcional
      if (timestamp === 0 && idx > 0) {
        const wordsPerSlide = Math.ceil(totalWords / totalSlides);
        const wordIndex = idx * wordsPerSlide;
        timestamp = input.wordTimestamps![wordIndex]?.start_time || 0;
        console.log(`   Slide ${idx + 1}: ${timestamp.toFixed(1)}s (fallback proporcional)`);
      }
    } else {
      // Fallback: distribuição uniforme (comportamento anterior)
      const wordsPerSlide = Math.ceil(totalWords / totalSlides);
      const wordIndex = idx * wordsPerSlide;
      timestamp = input.wordTimestamps![wordIndex]?.start_time || 0;
      console.log(`   Slide ${idx + 1}: ${timestamp.toFixed(1)}s (sem audioMarker, fallback)`);
    }

    // Retornar apenas campos necessários (evitar dados duplicados)
    return {
      id: slide.id,
      slideNumber: slide.slideNumber,
      contentIdea: slide.contentIdea,
      imagePrompt: slide.imagePrompt,
      imageUrl: slide.imageUrl,
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

  // DEBUG: Verificar tamanho do content
  const contentSize = JSON.stringify(structuredContent).length;
  console.log(`🐛 [V3] Tamanho do structuredContent: ${contentSize} caracteres (${(contentSize / 1000).toFixed(1)}KB)`);

  if (contentSize > 1_000_000) {
    console.warn(`⚠️ [V3] Content muito grande! ${(contentSize / 1_000_000).toFixed(1)}MB`);
    console.warn(`   - ${totalSlides} slides`);
    console.warn(`   - ${totalWords} word timestamps`);
    console.warn(`   - Verificar se há duplicação de dados`);
  }

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
