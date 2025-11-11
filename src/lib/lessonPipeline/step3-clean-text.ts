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

  const sectionTexts: string[] = [];
  
  for (let i = 0; i < input.sections.length; i++) {
    const section = input.sections[i];
    let cleanText = section.visualContent;

    console.log(`   Limpando seção ${i + 1}/${input.sections.length}...`);

    // 1. Remover emojis
    cleanText = cleanText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    
    // 2. Remover markdown
    // Headers (##, ###, etc)
    cleanText = cleanText.replace(/^#{1,6}\s+/gm, '');
    // Bold (**texto** ou __texto__)
    cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, '$2');
    // Italic (*texto* ou _texto_)
    cleanText = cleanText.replace(/(\*|_)(.*?)\1/g, '$2');
    // Links [texto](url)
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    // Código inline `código`
    cleanText = cleanText.replace(/`([^`]+)`/g, '$1');
    // Listas (- item, * item, 1. item)
    cleanText = cleanText.replace(/^[\s]*[-*]\s+/gm, '');
    cleanText = cleanText.replace(/^[\s]*\d+\.\s+/gm, '');
    
    // 3. Remover referências a imagens
    cleanText = cleanText.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
    
    // 4. Remover separadores decorativos
    cleanText = cleanText.replace(/^[-_*]{3,}$/gm, '');
    
    // 5. Converter CAIXA ALTA para minúsculas (exceto primeira letra de frases)
    const sentences = cleanText.split(/([.!?]\s+)/);
    cleanText = sentences.map((sentence, idx) => {
      // Pular separadores (pontos, etc)
      if (idx % 2 === 1) return sentence;
      
      // Primeira letra maiúscula, resto minúsculo
      const trimmed = sentence.trim();
      if (trimmed.length === 0) return sentence;
      
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }).join('');
    
    // 6. Limpar múltiplos espaços e quebras de linha
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n'); // Max 2 quebras
    cleanText = cleanText.replace(/[ \t]{2,}/g, ' '); // Max 1 espaço
    cleanText = cleanText.trim();
    
    // 7. Validar que não há caracteres problemáticos restantes
    const problematicChars = /[🎵🎶📱💡🚀✨⚡🔥💪🎯📊🤖]/g;
    if (problematicChars.test(cleanText)) {
      console.warn(`   ⚠️ Seção ${i + 1} ainda contém emojis após limpeza`);
      cleanText = cleanText.replace(problematicChars, '');
    }

    sectionTexts.push(cleanText);
    console.log(`   ✅ Seção ${i + 1} limpa (${cleanText.length} caracteres)`);
  }

  // Concatenar todas as seções com separação dupla
  const audioText = sectionTexts.join('\n\n');

  console.log(`✅ [STEP 3] Texto limpo gerado: ${audioText.length} caracteres totais`);
  console.log(`   Preview: "${audioText.substring(0, 100)}..."`);

  return {
    ...input,
    audioText,
    sectionTexts,
  };
}
