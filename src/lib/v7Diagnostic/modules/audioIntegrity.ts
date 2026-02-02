/**
 * V7 Diagnostic - Audio Integrity Module
 * =======================================
 * 
 * Valida integridade do áudio: truncamento, tags vazadas, timestamps.
 */

import type { V7Finding, LessonData, NormalizedWordTimestamp } from '../types';

const LEAKED_TAGS = ['[pause]', '[PAUSE]', '[breath]', '[BREATH]', '<break', '</break>'];
const MIN_TIMESTAMP_COUNT = 10;
const TRUNCATION_THRESHOLD = 0.95; // 95%

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export function analyzeAudioIntegrity(
  lesson: LessonData,
  timestamps: NormalizedWordTimestamp[]
): V7Finding[] {
  const findings: V7Finding[] = [];
  
  // Check 6: Timestamps presentes
  if (!lesson.word_timestamps || lesson.word_timestamps.length === 0) {
    findings.push({
      id: 'no_timestamps',
      type: 'audio_missing_timestamps',
      severity: 'critical',
      location: {},
      problem: 'Aula não tem word_timestamps',
      evidence: {
        expected: 'Array word_timestamps com dados',
        actual: 'Vazio ou não definido',
        data: {}
      }
    });
    return findings; // Não faz sentido continuar sem timestamps
  }
  
  // Check 7: Timestamps suficientes
  if (timestamps.length < MIN_TIMESTAMP_COUNT) {
    findings.push({
      id: 'few_timestamps',
      type: 'audio_missing_timestamps',
      severity: 'warning',
      location: {},
      problem: `Apenas ${timestamps.length} word_timestamps (esperado > ${MIN_TIMESTAMP_COUNT})`,
      evidence: {
        expected: `Mais de ${MIN_TIMESTAMP_COUNT} palavras`,
        actual: `${timestamps.length} palavras`,
        data: { count: timestamps.length }
      }
    });
  }
  
  // Check 2: Tags vazadas no texto
  const allWords = timestamps.map(t => t.word).join(' ');
  for (const tag of LEAKED_TAGS) {
    if (allWords.includes(tag)) {
      findings.push({
        id: `leaked_tag_${tag.replace(/[^a-z]/gi, '')}`,
        type: 'audio_leaked_tags',
        severity: 'critical',
        location: {},
        problem: `Tag "${tag}" encontrada nos word_timestamps (foi falada pelo TTS)`,
        evidence: {
          expected: 'Tags removidas antes da geração de áudio',
          actual: `Tag "${tag}" presente na narração`,
          data: { 
            tag,
            context: findTagContext(timestamps, tag)
          }
        }
      });
    }
  }
  
  // Check 8: Cobertura temporal
  if (timestamps.length > 0) {
    const firstWord = timestamps[0];
    const lastWord = timestamps[timestamps.length - 1];
    
    // Primeiro word deveria começar perto de 0
    if (firstWord.start > 2) {
      findings.push({
        id: 'late_audio_start',
        type: 'audio_gap',
        severity: 'warning',
        location: {},
        problem: `Áudio começa em ${firstWord.start.toFixed(2)}s (esperado: ~0s)`,
        evidence: {
          expected: 'Primeira palavra em ~0s',
          actual: `Primeira palavra em ${firstWord.start.toFixed(2)}s`,
          data: { 
            firstWord: firstWord.word, 
            startTime: firstWord.start 
          }
        }
      });
    }
    
    // Check 3: Gaps de silêncio grandes
    for (let i = 1; i < timestamps.length; i++) {
      const gap = timestamps[i].start - timestamps[i - 1].end;
      if (gap > 3) { // Gap maior que 3 segundos
        findings.push({
          id: `audio_gap_${i}`,
          type: 'audio_gap',
          severity: 'warning',
          location: {},
          problem: `Gap de ${gap.toFixed(2)}s entre palavras ${i - 1} e ${i}`,
          evidence: {
            expected: 'Transição suave entre palavras',
            actual: `Silêncio de ${gap.toFixed(2)}s`,
            data: {
              before: { word: timestamps[i - 1].word, end: timestamps[i - 1].end },
              after: { word: timestamps[i].word, start: timestamps[i].start },
              gap
            }
          }
        });
      }
    }
  }
  
  // Check 5: URL de áudio acessível
  if (!lesson.audio_url) {
    findings.push({
      id: 'no_audio_url',
      type: 'missing_required_field',
      severity: 'error',
      location: {},
      problem: 'Aula não tem audio_url definida',
      evidence: {
        expected: 'URL de áudio válida',
        actual: 'Não definida',
        data: {}
      }
    });
  }
  
  // Check 1: Truncamento (baseado em content se disponível)
  const content = lesson.content as Record<string, unknown>;
  const metadata = content.metadata as Record<string, unknown> | undefined;
  const expectedDuration = metadata?.totalDuration as number | undefined;
  
  if (expectedDuration && timestamps.length > 0) {
    const lastWord = timestamps[timestamps.length - 1];
    const actualDuration = lastWord.end;
    const ratio = actualDuration / expectedDuration;
    
    if (ratio < TRUNCATION_THRESHOLD) {
      findings.push({
        id: 'audio_truncated',
        type: 'audio_truncated',
        severity: 'critical',
        location: {},
        problem: `Áudio truncado: ${(ratio * 100).toFixed(1)}% do esperado`,
        evidence: {
          expected: `${expectedDuration.toFixed(2)}s`,
          actual: `${actualDuration.toFixed(2)}s (${(ratio * 100).toFixed(1)}%)`,
          data: {
            expectedDuration,
            actualDuration,
            ratio,
            lastWord: lastWord.word
          }
        }
      });
    }
  }
  
  return findings;
}

// ============================================================================
// HELPERS
// ============================================================================

function findTagContext(
  timestamps: NormalizedWordTimestamp[], 
  tag: string
): string {
  for (let i = 0; i < timestamps.length; i++) {
    if (timestamps[i].word.includes(tag)) {
      const before = timestamps.slice(Math.max(0, i - 2), i).map(t => t.word).join(' ');
      const after = timestamps.slice(i + 1, i + 3).map(t => t.word).join(' ');
      return `...${before} [${timestamps[i].word}] ${after}...`;
    }
  }
  return '';
}
