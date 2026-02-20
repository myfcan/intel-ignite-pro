/**
 * V7 Pipeline - Step 2: Construir Narração
 * 
 * Concatena todas as narrações das cenas em um único texto para áudio.
 */

import { V7ScriptInput } from '@/types/V7ScriptInput';
import { V7PipelineContext, V7Step1Output, V7Step2Output } from '../types';

interface Step2Context extends V7PipelineContext {
  validated: V7Step1Output;
}

export async function v7Step2BuildNarration(
  context: Step2Context
): Promise<V7Step2Output> {
  const { validated, logger } = context;
  const { validatedInput } = validated;
  const startTime = Date.now();
  
  await logger.info(2, 'Build Narration', '📝 Construindo texto de narração...');

  // ============================================================
  // 1. EXTRAIR NARRAÇÕES DE CADA CENA
  // ============================================================
  const sceneNarrations: V7Step2Output['sceneNarrations'] = [];
  
  for (const scene of validatedInput.scenes) {
    const narration = scene.narration?.trim() || '';
    const wordCount = narration.split(/\s+/).filter(w => w.length > 0).length;
    
    sceneNarrations.push({
      sceneId: scene.id,
      narration,
      wordCount
    });
    
    await logger.info(2, 'Build Narration', `   📄 ${scene.id}: ${wordCount} palavras`);
  }

  // ============================================================
  // 2. CONCATENAR EM TEXTO ÚNICO
  // ============================================================
  // Separar cenas com pausa natural (dois espaços = pausa breve no TTS)
  const fullNarration = sceneNarrations
    .map(s => s.narration)
    .filter(n => n.length > 0)
    .join('\n\n');

  const totalWords = sceneNarrations.reduce((sum, s) => sum + s.wordCount, 0);

  // ============================================================
  // 3. LIMPAR TEXTO PARA TTS
  // ============================================================
  const cleanedNarration = cleanTextForTTS(fullNarration);

  await logger.info(2, 'Build Narration', `📊 Texto limpo: ${cleanedNarration.length} caracteres`);

  const elapsedTime = Date.now() - startTime;
  await logger.success(2, 'Build Narration', `✅ Narração construída em ${elapsedTime}ms`, {
    totalWords,
    characters: cleanedNarration.length,
    scenes: sceneNarrations.length
  });

  return {
    fullNarration: cleanedNarration,
    sceneNarrations,
    totalWords
  };
}

/**
 * Limpa o texto para geração de áudio TTS.
 *
 * PRESERVA audio tags eleven_v3 do tipo [excited], [calm], [pause], etc.
 * Estas tags têm 1-30 caracteres e não contêm parênteses ou URLs.
 *
 * Audio tags REMOVIDAS pelo bridge dependendo do modelo:
 *   - eleven_v3          → preserva [tags], remove SSML
 *   - eleven_multilingual_v2 → remove [tags], preserva SSML
 */
function cleanTextForTTS(text: string): string {
  let cleaned = text;

  // 1. Remover emojis (fora de colchetes)
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');

  // 2. Remover markdown — imagens PRIMEIRO (para não confundir [texto] com audio tags)
  // Imagens: ![alt](url)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
  // Links: [texto](url) — APENAS quando seguido de parêntese (não é audio tag)
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  // Separadores
  cleaned = cleaned.replace(/^[-_*]{3,}$/gm, '');

  // 3. Remover markdown de formatação (NÃO toca em [tags])
  // Títulos
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  // Negrito e itálico
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
  // Código inline
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  // Listas
  cleaned = cleaned.replace(/^[\s]*[-*]\s+/gm, '');
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');

  // 4. Normalizar espaços
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

  // 5. Trim final
  cleaned = cleaned.trim();

  return cleaned;
}
