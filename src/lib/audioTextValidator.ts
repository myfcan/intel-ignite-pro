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
 */
function removeEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
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
