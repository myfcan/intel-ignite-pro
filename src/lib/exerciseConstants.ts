/**
 * ============================================================
 * CONSTANTES PARA EXERCÍCIOS
 * ============================================================
 *
 * Define padrões centralizados para placeholders de exercícios.
 * Garante consistência entre validadores, transformadores e componentes.
 *
 * @see AUDITORIA-PIPELINE-COMPLETA.md - Ação Corretiva #6
 */

/**
 * Placeholder padrão para exercícios complete-sentence e fill-in-blanks
 *
 * ✅ PADRÃO RECOMENDADO: 7 underscores
 * ⚠️ RETROCOMPATIBILIDADE: 11 underscores também suportado
 *
 * @example
 * "A IA aprende com _______."
 * "O Brasil foi descoberto em ___________."
 */
export const EXERCISE_PLACEHOLDER = '_______';

/**
 * Regex que aceita 7 a 11 underscores consecutivos
 * Usado para split e validação retrocompatível
 *
 * @example
 * EXERCISE_PLACEHOLDER_REGEX.test('_______')      // true
 * EXERCISE_PLACEHOLDER_REGEX.test('___________')  // true
 * EXERCISE_PLACEHOLDER_REGEX.test('____')         // false
 */
export const EXERCISE_PLACEHOLDER_REGEX = /_{7,11}/;

/**
 * Verifica se texto contém placeholder válido
 *
 * @param text Texto a verificar
 * @returns true se contém placeholder válido (7-11 underscores)
 *
 * @example
 * hasValidPlaceholder('Texto com _______.')      // true
 * hasValidPlaceholder('Texto com ___________.')  // true
 * hasValidPlaceholder('Texto sem placeholder')   // false
 */
export function hasValidPlaceholder(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return EXERCISE_PLACEHOLDER_REGEX.test(text);
}

/**
 * Split de texto usando placeholder (aceita variações)
 *
 * Divide o texto em partes separadas pelo placeholder.
 * Aceita tanto 7 quanto 11 underscores para retrocompatibilidade.
 *
 * @param text Texto a dividir
 * @returns Array com partes do texto [antes, depois]
 *
 * @example
 * splitByPlaceholder('A IA aprende com _______.')
 * // ['A IA aprende com ', '.']
 *
 * splitByPlaceholder('Brasil em ___________.')
 * // ['Brasil em ', '.']
 */
export function splitByPlaceholder(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [text || ''];
  }
  return text.split(EXERCISE_PLACEHOLDER_REGEX);
}

/**
 * Conta quantos placeholders existem no texto
 *
 * @param text Texto a analisar
 * @returns Número de placeholders encontrados
 *
 * @example
 * countPlaceholders('Um _______ e outro _______.')  // 2
 * countPlaceholders('Sem placeholder')              // 0
 */
export function countPlaceholders(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  const matches = text.match(new RegExp(EXERCISE_PLACEHOLDER_REGEX, 'g'));
  return matches ? matches.length : 0;
}

/**
 * Normaliza texto substituindo variações de underscores pelo padrão
 *
 * @param text Texto a normalizar
 * @returns Texto com placeholder padrão (7 underscores)
 *
 * @example
 * normalizePlaceholder('Texto com ___________.')
 * // 'Texto com _______.'
 */
export function normalizePlaceholder(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }
  return text.replace(EXERCISE_PLACEHOLDER_REGEX, EXERCISE_PLACEHOLDER);
}
