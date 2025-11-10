/**
 * Valida e limpa texto para geração de áudio
 * Remove emojis, formatação markdown, caracteres especiais e outros elementos inválidos
 */

interface ValidationResult {
  isValid: boolean;
  cleanText: string;
  warnings: string[];
  errors: string[];
}

/**
 * Remove emojis do texto
 * Regex abrangente que captura TODOS os emojis Unicode modernos
 */
function removeEmojis(text: string): string {
  return text.replace(
    /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}\u{2623}\u{2626}\u{262A}\u{262E}\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}\u{2660}\u{2663}\u{2665}\u{2666}\u{2668}\u{267B}\u{267E}\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}\u{269C}\u{26A0}\u{26A1}\u{26A7}\u{26AA}\u{26AB}\u{26B0}\u{26B1}\u{26BD}\u{26BE}\u{26C4}\u{26C5}\u{26C8}\u{26CE}\u{26CF}\u{26D1}\u{26D3}\u{26D4}\u{26E9}\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{FE0F}]/gu,
    ''
  );
}

/**
 * Remove formatação markdown básica
 */
function removeMarkdownFormatting(text: string): string {
  return text
    // Remove headers (#, ##, ###, etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic (**texto**, *texto*, __texto__, _texto_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links [texto](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove imagens ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove código inline `codigo`
    .replace(/`([^`]+)`/g, '$1')
    // Remove blocos de código ```
    .replace(/```[\s\S]*?```/g, '')
    // Remove listas (* item, - item, + item)
    .replace(/^[\*\-\+]\s+/gm, '')
    // Remove listas numeradas (1. item)
    .replace(/^\d+\.\s+/gm, '')
    // Remove blockquotes (> texto)
    .replace(/^>\s+/gm, '')
    // Remove linhas horizontais (---, ___, ***)
    .replace(/^[\-_\*]{3,}$/gm, '');
}

/**
 * Remove caracteres especiais problemáticos para TTS
 */
function removeInvalidCharacters(text: string): string {
  return text
    // Remove separadores markdown (---)
    .replace(/^---+$/gm, '')
    // Remove múltiplas quebras de linha (mais de 2)
    .replace(/\n{3,}/g, '\n\n')
    // Remove espaços em excesso
    .replace(/[ \t]+/g, ' ')
    // Remove espaços no início e fim de linhas
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    // Normaliza aspas
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Remove caracteres de controle
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Detecta problemas comuns no texto
 */
function detectIssues(originalText: string, cleanText: string): { warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Verifica se texto está vazio após limpeza
  if (!cleanText.trim()) {
    errors.push('Texto vazio após limpeza');
    return { warnings, errors };
  }

  // Verifica se texto é muito curto
  if (cleanText.trim().length < 10) {
    warnings.push('Texto muito curto (menos de 10 caracteres)');
  }

  // Verifica se há emojis removidos
  const emojiCount = (originalText.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
  if (emojiCount > 0) {
    warnings.push(`${emojiCount} emoji(s) removido(s)`);
  }

  // Verifica se há markdown removido
  if (originalText.includes('```') || originalText.includes('![')) {
    warnings.push('Formatação markdown removida (código/imagens)');
  }

  // Verifica se há separadores removidos
  if (originalText.includes('---')) {
    warnings.push('Separadores (---) removidos');
  }

  // Verifica se o texto mudou significativamente
  const changePercent = ((originalText.length - cleanText.length) / originalText.length) * 100;
  if (changePercent > 20) {
    warnings.push(`${changePercent.toFixed(1)}% do texto original foi removido na limpeza`);
  }

  return { warnings, errors };
}

/**
 * Valida e limpa texto para geração de áudio
 * @param text - Texto original que pode conter formatação
 * @param options - Opções de validação
 * @returns Resultado da validação com texto limpo
 */
export function validateAndCleanAudioText(
  text: string,
  options: { strict?: boolean } = {}
): ValidationResult {
  const { strict = false } = options;

  // Passo 1: Remove emojis
  let cleanText = removeEmojis(text);

  // Passo 2: Remove formatação markdown
  cleanText = removeMarkdownFormatting(cleanText);

  // Passo 3: Remove caracteres inválidos
  cleanText = removeInvalidCharacters(cleanText);

  // Passo 4: Trim final
  cleanText = cleanText.trim();

  // Passo 5: Detecta problemas
  const { warnings, errors } = detectIssues(text, cleanText);

  // Determina se é válido
  const isValid = errors.length === 0 && (!strict || warnings.length === 0);

  return {
    isValid,
    cleanText,
    warnings,
    errors,
  };
}

/**
 * Limpa texto de forma simples (sem validação)
 * Útil quando você quer apenas limpar sem feedback
 */
export function cleanAudioText(text: string): string {
  return validateAndCleanAudioText(text).cleanText;
}

/**
 * Valida se o texto é adequado para geração de áudio
 * Retorna apenas true/false
 */
export function isValidAudioText(text: string): boolean {
  return validateAndCleanAudioText(text).isValid;
}
