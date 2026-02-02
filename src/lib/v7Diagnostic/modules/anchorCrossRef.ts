/**
 * V7 Diagnostic - Anchor Cross Reference Module
 * ==============================================
 * 
 * O coração do sistema de diagnóstico.
 * Cruza cada anchorText com wordTimestamps para identificar problemas de sincronização.
 */

import type { 
  V7Finding, 
  PhaseData, 
  NormalizedWordTimestamp,
  INTERACTIVE_PHASE_TYPES 
} from '../types';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normaliza wordTimestamps para formato consistente
 */
export function normalizeTimestamps(
  timestamps: Array<{ word: string; start?: number; end?: number; start_time?: number; end_time?: number }>
): NormalizedWordTimestamp[] {
  return timestamps.map((ts, index) => ({
    word: ts.word,
    start: ts.start ?? ts.start_time ?? 0,
    end: ts.end ?? ts.end_time ?? 0,
    index
  }));
}

/**
 * Normaliza keyword para comparação (lowercase, remove pontuação)
 */
function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, '')
    .trim();
}

/**
 * Busca keyword em todos os timestamps (suporta multi-word)
 */
export function findKeywordGlobally(
  keyword: string,
  timestamps: NormalizedWordTimestamp[]
): { timestamp: number; wordIndex: number; matchedWords: string[] } | null {
  const normalizedKeyword = normalizeKeyword(keyword);
  const keywordParts = normalizedKeyword.split(/\s+/);
  
  // Single word search
  if (keywordParts.length === 1) {
    for (const ts of timestamps) {
      if (normalizeKeyword(ts.word) === normalizedKeyword) {
        return {
          timestamp: ts.end, // Usa end time para trigger
          wordIndex: ts.index,
          matchedWords: [ts.word]
        };
      }
    }
    return null;
  }
  
  // Multi-word search
  for (let i = 0; i <= timestamps.length - keywordParts.length; i++) {
    let match = true;
    const matchedWords: string[] = [];
    
    for (let j = 0; j < keywordParts.length; j++) {
      if (normalizeKeyword(timestamps[i + j].word) !== keywordParts[j]) {
        match = false;
        break;
      }
      matchedWords.push(timestamps[i + j].word);
    }
    
    if (match) {
      const lastWord = timestamps[i + keywordParts.length - 1];
      return {
        timestamp: lastWord.end,
        wordIndex: lastWord.index,
        matchedWords
      };
    }
  }
  
  return null;
}

/**
 * Encontra palavras similares (para sugestões de typo)
 */
export function findSimilarWords(
  keyword: string,
  timestamps: NormalizedWordTimestamp[],
  maxDistance: number = 2
): string[] {
  const normalizedKeyword = normalizeKeyword(keyword);
  const similar: Array<{ word: string; distance: number }> = [];
  
  for (const ts of timestamps) {
    const normalizedWord = normalizeKeyword(ts.word);
    const distance = levenshteinDistance(normalizedKeyword, normalizedWord);
    
    if (distance <= maxDistance && distance > 0) {
      similar.push({ word: ts.word, distance });
    }
  }
  
  return similar
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map(s => s.word);
}

/**
 * Levenshtein distance para fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Encontra a fase que contém um timestamp específico
 */
export function findPhaseByTime(phases: PhaseData[], time: number): PhaseData | null {
  for (const phase of phases) {
    if (time >= phase.startTime && time <= phase.endTime) {
      return phase;
    }
  }
  // Se não encontrar exato, busca a mais próxima
  let closest: PhaseData | null = null;
  let minDistance = Infinity;
  
  for (const phase of phases) {
    const distance = Math.min(
      Math.abs(time - phase.startTime),
      Math.abs(time - phase.endTime)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = phase;
    }
  }
  
  return closest;
}

/**
 * Extrai todas as anchors de uma fase
 */
export function extractAnchorsFromPhase(phase: PhaseData): Array<{
  id: string;
  keyword: string;
  source: 'anchorText' | 'anchorAction' | 'microVisual';
}> {
  const anchors: Array<{ id: string; keyword: string; source: 'anchorText' | 'anchorAction' | 'microVisual' }> = [];
  
  // anchorText.pauseAt
  if (phase.anchorText?.pauseAt) {
    anchors.push({
      id: `${phase.id}_pauseAt`,
      keyword: phase.anchorText.pauseAt,
      source: 'anchorText'
    });
  }
  
  // anchorText.transitionAt
  if (phase.anchorText?.transitionAt) {
    anchors.push({
      id: `${phase.id}_transitionAt`,
      keyword: phase.anchorText.transitionAt,
      source: 'anchorText'
    });
  }
  
  // anchorActions
  if (phase.anchorActions) {
    for (const action of phase.anchorActions) {
      const keyword = action.keyword || action.anchorText;
      if (keyword) {
        anchors.push({
          id: action.id || `${phase.id}_action_${anchors.length}`,
          keyword,
          source: 'anchorAction'
        });
      }
    }
  }
  
  // microVisuals
  if (phase.microVisuals) {
    for (const mv of phase.microVisuals) {
      if (mv.anchorText) {
        anchors.push({
          id: mv.id || `${phase.id}_mv_${anchors.length}`,
          keyword: mv.anchorText,
          source: 'microVisual'
        });
      }
    }
  }
  
  return anchors;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analisa cross-references entre anchors e timestamps
 */
export function analyzeAnchorCrossReferences(
  phases: PhaseData[],
  timestamps: NormalizedWordTimestamp[]
): V7Finding[] {
  const findings: V7Finding[] = [];
  const seenKeywords = new Map<string, { phaseId: string; timestamp: number }>();
  const seenAnchorIds = new Set<string>();
  
  for (const phase of phases) {
    const anchors = extractAnchorsFromPhase(phase);
    
    for (const anchor of anchors) {
      // Check 12: IDs únicos
      if (seenAnchorIds.has(anchor.id)) {
        findings.push({
          id: `duplicate_anchor_${anchor.id}_${phase.id}`,
          type: 'duplicate_id',
          severity: 'error',
          location: { phaseId: phase.id, elementId: anchor.id },
          problem: `Anchor ID "${anchor.id}" duplicado`,
          evidence: {
            expected: 'IDs únicos para cada anchor',
            actual: `ID "${anchor.id}" já existe`,
            data: { anchorId: anchor.id }
          }
        });
      }
      seenAnchorIds.add(anchor.id);
      
      // Check 1: Keyword existe globalmente
      const globalMatch = findKeywordGlobally(anchor.keyword, timestamps);
      
      if (!globalMatch) {
        const similarWords = findSimilarWords(anchor.keyword, timestamps);
        
        findings.push({
          id: `anchor_missing_${anchor.id}`,
          type: 'anchor_not_found',
          severity: 'critical',
          location: { phaseId: phase.id, elementId: anchor.id },
          problem: `Keyword "${anchor.keyword}" não existe na narração`,
          evidence: {
            expected: `Deveria existir em ${phase.id} (${phase.startTime.toFixed(1)}s - ${phase.endTime.toFixed(1)}s)`,
            actual: 'Não encontrada em nenhum timestamp',
            data: { 
              keyword: anchor.keyword,
              source: anchor.source,
              similarWords,
              suggestion: similarWords.length > 0 ? `Você quis dizer "${similarWords[0]}"?` : null
            }
          }
        });
        continue;
      }
      
      // Check 2: Keyword no range correto
      if (globalMatch.timestamp < phase.startTime || globalMatch.timestamp > phase.endTime) {
        const correctPhase = findPhaseByTime(phases, globalMatch.timestamp);
        
        findings.push({
          id: `anchor_wrong_${anchor.id}`,
          type: 'anchor_wrong_phase',
          severity: 'error',
          location: { phaseId: phase.id, elementId: anchor.id },
          problem: `Keyword "${anchor.keyword}" está na fase errada`,
          evidence: {
            expected: `${phase.id} (${phase.startTime.toFixed(1)}s - ${phase.endTime.toFixed(1)}s)`,
            actual: `Encontrada em ${globalMatch.timestamp.toFixed(2)}s (${correctPhase?.id || 'unknown'})`,
            data: {
              keyword: anchor.keyword,
              source: anchor.source,
              foundAt: globalMatch.timestamp,
              correctPhaseId: correctPhase?.id,
              currentPhaseRange: { start: phase.startTime, end: phase.endTime }
            }
          }
        });
      }
      
      // Check 3: Keyword duplicada
      const normalizedKw = normalizeKeyword(anchor.keyword);
      if (seenKeywords.has(normalizedKw)) {
        const previous = seenKeywords.get(normalizedKw)!;
        findings.push({
          id: `anchor_duplicate_${anchor.id}`,
          type: 'anchor_duplicate',
          severity: 'warning',
          location: { phaseId: phase.id, elementId: anchor.id },
          problem: `Keyword "${anchor.keyword}" usada em múltiplas fases`,
          evidence: {
            expected: 'Keywords únicas por fase',
            actual: `Também usada em ${previous.phaseId}`,
            data: {
              keyword: anchor.keyword,
              previousPhase: previous.phaseId,
              previousTimestamp: previous.timestamp
            }
          }
        });
      }
      seenKeywords.set(normalizedKw, { 
        phaseId: phase.id, 
        timestamp: globalMatch.timestamp 
      });
    }
    
    // Check 5: pauseAt configurado para fases interativas
    const interactiveTypes: string[] = ['interaction', 'playground', 'cta', 'secret-reveal'];
    if (interactiveTypes.includes(phase.type) && !phase.anchorText?.pauseAt) {
      findings.push({
        id: `no_pause_at_${phase.id}`,
        type: 'anchor_no_pause_at',
        severity: 'error',
        location: { phaseId: phase.id },
        problem: `Fase interativa "${phase.id}" não tem pauseAt configurado`,
        evidence: {
          expected: 'anchorText.pauseAt obrigatório para fases interativas',
          actual: 'Não configurado',
          data: { phaseType: phase.type }
        }
      });
    }
  }
  
  return findings;
}
