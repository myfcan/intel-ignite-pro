import { Step2Output, Step3Output } from './types';

/**
 * STEP 3: CRIAÇÃO DO TEXTO LIMPO (PARA ÁUDIO)
 * - Remove emojis, markdown, imagens
 * - Remove CAIXA ALTA
 * - Limpa múltiplos espaços
 * - Gera audioText único (concatenar todas as seções)
 */
export async function step3CleanText(input: Step2Output): Promise<Step3Output> {
  console.log('🧹 [STEP 3] Limpando texto para geração de áudio...');

  // Para V3, o audioText já vem pronto no v3Data
  if (input.model === 'v3' && input.v3Data) {
    console.log('✅ [STEP 3] V3 detectado - usando audioText do v3Data');
    console.log(`   audioText: ${input.v3Data.audioText.length} caracteres`);
    
    return {
      ...input,
      audioText: input.v3Data.audioText,
      sectionTexts: [], // V3 não usa sectionTexts
    };
  }

  // V1 e V2: processar seções
  const sectionTexts: string[] = [];
  
  if (!input.sections || input.sections.length === 0) {
    throw new Error('sections não disponível para modelo V1/V2');
  }
  
  for (let i = 0; i < input.sections.length; i++) {
    const section = input.sections[i];
    let cleanText = section.visualContent;

    console.log(`   Limpando seção ${i + 1}/${input.sections.length}...`);

    // 1. Remover emojis
    cleanText = cleanText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    
    // 2. Remover markdown
    cleanText = cleanText.replace(/^#{1,6}\s+/gm, '');
    cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleanText = cleanText.replace(/(\*|_)(.*?)\1/g, '$2');
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    cleanText = cleanText.replace(/`([^`]+)`/g, '$1');
    cleanText = cleanText.replace(/^[\s]*[-*]\s+/gm, '');
    cleanText = cleanText.replace(/^[\s]*\d+\.\s+/gm, '');
    
    // 3. Remover referências a imagens
    cleanText = cleanText.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
    
    // 4. Remover separadores decorativos
    cleanText = cleanText.replace(/^[-_*]{3,}$/gm, '');
    
    // 5. Converter CAIXA ALTA para minúsculas
    const sentences = cleanText.split(/([.!?]\s+)/);
    cleanText = sentences.map((sentence, idx) => {
      if (idx % 2 === 1) return sentence;
      const trimmed = sentence.trim();
      if (trimmed.length === 0) return sentence;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }).join('');
    
    // 6. Limpar múltiplos espaços e quebras de linha
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
    cleanText = cleanText.replace(/[ \t]{2,}/g, ' ');
    cleanText = cleanText.trim();
    
    // 7. Validar caracteres problemáticos
    const problematicChars = /[🎵🎶📱💡🚀✨⚡🔥💪🎯📊🤖]/g;
    if (problematicChars.test(cleanText)) {
      console.warn(`   ⚠️ Seção ${i + 1} ainda contém emojis após limpeza`);
      cleanText = cleanText.replace(problematicChars, '');
    }

    sectionTexts.push(cleanText);
    console.log(`   ✅ Seção ${i + 1} limpa (${cleanText.length} caracteres)`);
  }

  // Concatenar todas as seções
  const audioText = sectionTexts.join('\n\n');

  console.log(`✅ [STEP 3] Texto limpo gerado: ${audioText.length} caracteres totais`);

  return {
    ...input,
    audioText,
    sectionTexts,
  };
}
