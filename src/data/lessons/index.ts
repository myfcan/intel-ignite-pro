import { fundamentos01 } from './fundamentos-01';
import { fundamentos02 } from './fundamentos-02';
import { fundamentos03 } from './fundamentos-03';
import { GuidedLessonData } from '@/types/guidedLesson';

/**
 * 🎯 SISTEMA DE AUTO-DESCOBERTA DE AULAS
 * 
 * Para adicionar uma nova aula:
 * 1. Crie o arquivo fundamentos-XX.ts
 * 2. Importe aqui
 * 3. Adicione ao objeto ALL_LESSONS
 * 
 * ✅ O resto é AUTOMÁTICO! Todos os componentes admin vão detectar a nova aula.
 */

export const ALL_LESSONS = {
  'fundamentos-01': fundamentos01,
  'fundamentos-02': fundamentos02,
  'fundamentos-03': fundamentos03,
} as const;

export type LessonKey = keyof typeof ALL_LESSONS;

export interface LessonMetadata {
  key: LessonKey;
  lesson: GuidedLessonData;
  trackName: string;
  title: string;
  orderIndex: number;
  emoji: string;
  model: 'V1' | 'V2';
  description: string;
}

/**
 * Array formatado com metadados para uso nos componentes admin
 */
export const LESSONS_ARRAY: LessonMetadata[] = Object.entries(ALL_LESSONS).map(([key, lesson]) => ({
  key: key as LessonKey,
  lesson,
  trackName: lesson.trackName,
  title: lesson.title,
  orderIndex: parseInt(key.split('-')[1]), // Extrai número da chave (fundamentos-01 -> 1)
  emoji: getEmojiForLesson(key),
  model: lesson.contentVersion === 1 ? 'V2' : 'V1',
  description: getLessonDescription(key)
}));

/**
 * Mapeia emoji por aula (adicione novos aqui quando criar novas aulas)
 */
function getEmojiForLesson(key: string): string {
  const emojiMap: Record<string, string> = {
    'fundamentos-01': '🎯',
    'fundamentos-02': '📚',
    'fundamentos-03': '🧠',
  };
  return emojiMap[key] || '📖';
}

/**
 * Mapeia descrição por aula (adicione novas aqui quando criar novas aulas)
 */
function getLessonDescription(key: string): string {
  const descMap: Record<string, string> = {
    'fundamentos-01': 'O que é a IA e por que nós precisamos dela - Áudios separados + Timestamps reais',
    'fundamentos-02': 'Como a IA Aprende com Você',
    'fundamentos-03': 'Como a IA Aprende: O Cérebro Digital por Trás das Máquinas Inteligentes',
  };
  return descMap[key] || 'Descrição não disponível';
}

/**
 * Helper para obter uma aula específica
 */
export function getLesson(key: LessonKey): GuidedLessonData {
  return ALL_LESSONS[key];
}

/**
 * Helper para obter metadados de uma aula
 */
export function getLessonMetadata(key: LessonKey): LessonMetadata | undefined {
  return LESSONS_ARRAY.find(lesson => lesson.key === key);
}
