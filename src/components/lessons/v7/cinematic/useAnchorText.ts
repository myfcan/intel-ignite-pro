/**
 * useAnchorText - Sistema flexível de sincronização por palavra-chave
 * 
 * Inspirado no V5 anchorText, mas usando wordTimestamps para precisão.
 * Suporta múltiplas ações além de pause/resume:
 * - pause: Pausa o áudio
 * - resume: Retoma o áudio
 * - show: Mostra um elemento (via callback)
 * - hide: Esconde um elemento (via callback)
 * - highlight: Destaca texto (via callback)
 * - trigger: Dispara callback customizado
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============= TYPES =============

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export type AnchorActionType = 
  | 'pause'      // Pausa o áudio
  | 'resume'     // Retoma o áudio
  | 'show'       // Mostra elemento
  | 'hide'       // Esconde elemento
  | 'highlight'  // Destaca texto
  | 'trigger';   // Callback customizado

export interface AnchorAction {
  /** ID único da ação */
  id: string;
  /** Palavra-chave a detectar no áudio */
  keyword: string;
  /** Tipo da ação */
  type: AnchorActionType;
  /** ID do elemento alvo (para show/hide/highlight) */
  targetId?: string;
  /** Dados extras para o callback */
  payload?: any;
  /** Executar apenas uma vez? (default: true) */
  once?: boolean;
  /** Delay após detectar a palavra (ms) */
  delayMs?: number;
}

export interface AnchorEvent {
  action: AnchorAction;
  timestamp: number;
  wordTimestamp: WordTimestamp;
}

interface UseAnchorTextProps {
  /** Array de timestamps de palavras do áudio */
  wordTimestamps: WordTimestamp[];
  /** Tempo atual do áudio em segundos */
  currentTime: number;
  /** Lista de ações a monitorar */
  actions: AnchorAction[];
  /** Se o áudio está tocando */
  isPlaying: boolean;
  /** ID da fase atual (para reset de estado) */
  phaseId: string;
  /** Habilitar/desabilitar o sistema */
  enabled?: boolean;
  
  // Callbacks de ação
  onPause?: () => void;
  onResume?: () => void;
  onShow?: (targetId: string, payload?: any) => void;
  onHide?: (targetId: string, payload?: any) => void;
  onHighlight?: (targetId: string, payload?: any) => void;
  onTrigger?: (action: AnchorAction) => void;
  
  /** Callback genérico para qualquer ação */
  onAnchorEvent?: (event: AnchorEvent) => void;
}

interface AnchorState {
  executedActions: Set<string>;
  pausedByAnchor: boolean;
  lastEventTime: number;
}

// ============= HOOK =============

export function useAnchorText({
  wordTimestamps,
  currentTime,
  actions,
  isPlaying,
  phaseId,
  enabled = true,
  onPause,
  onResume,
  onShow,
  onHide,
  onHighlight,
  onTrigger,
  onAnchorEvent,
}: UseAnchorTextProps) {
  const stateRef = useRef<AnchorState>({
    executedActions: new Set(),
    pausedByAnchor: false,
    lastEventTime: -1,
  });
  
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const [highlightedElements, setHighlightedElements] = useState<Set<string>>(new Set());

  // Normaliza palavra para comparação
  const normalizeWord = useCallback((word: string): string => {
    return word
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[.,!?;:'"()[\]{}]/g, '')
      .trim();
  }, []);

  // Encontra timestamp de uma palavra-chave
  const findKeywordTimestamp = useCallback((keyword: string, afterTime: number = 0): WordTimestamp | null => {
    if (!wordTimestamps.length) return null;
    
    const normalizedKeyword = normalizeWord(keyword);
    
    for (const ts of wordTimestamps) {
      if (ts.start < afterTime) continue;
      
      const normalizedWord = normalizeWord(ts.word);
      
      // Match exato ou parcial (mais flexível)
      const isMatch = 
        normalizedWord === normalizedKeyword || 
        normalizedWord.includes(normalizedKeyword) || 
        normalizedKeyword.includes(normalizedWord) ||
        // Also check if keyword is at the start of the word (for compound words)
        normalizedWord.startsWith(normalizedKeyword) ||
        normalizedKeyword.startsWith(normalizedWord);
        
      if (isMatch) {
        console.log(`[AnchorText] 🔍 Found keyword "${keyword}" at ${ts.start.toFixed(1)}s (word: "${ts.word}")`);
        return ts;
      }
    }
    
    console.log(`[AnchorText] ⚠️ Keyword "${keyword}" not found in wordTimestamps (searched ${wordTimestamps.length} words)`);
    return null;
  }, [wordTimestamps, normalizeWord]);

  // Verifica se o tempo atual está próximo de uma palavra
  // Increased window from 500ms to 800ms for more reliable triggering
  const isTimeNearWord = useCallback((wordTs: WordTimestamp, time: number, windowMs: number = 800): boolean => {
    const windowSec = windowMs / 1000;
    return time >= wordTs.start - windowSec && time <= wordTs.end + windowSec;
  }, []);

  // Executa uma ação
  const executeAction = useCallback((action: AnchorAction, wordTs: WordTimestamp) => {
    const actionKey = `${phaseId}-${action.id}`;
    
    // Verifica se já foi executada (se once=true)
    if (action.once !== false && stateRef.current.executedActions.has(actionKey)) {
      return;
    }

    const execute = () => {
      console.log(`[AnchorText] 🎯 Executing action "${action.id}" (${action.type}) at ${currentTime.toFixed(1)}s`);
      
      // Marca como executada
      stateRef.current.executedActions.add(actionKey);
      stateRef.current.lastEventTime = currentTime;

      // Emite evento genérico
      const event: AnchorEvent = { action, timestamp: currentTime, wordTimestamp: wordTs };
      onAnchorEvent?.(event);

      // Executa ação específica
      switch (action.type) {
        case 'pause':
          stateRef.current.pausedByAnchor = true;
          onPause?.();
          break;
          
        case 'resume':
          stateRef.current.pausedByAnchor = false;
          onResume?.();
          break;
          
        case 'show':
          if (action.targetId) {
            setVisibleElements(prev => new Set([...prev, action.targetId!]));
            onShow?.(action.targetId, action.payload);
          }
          break;
          
        case 'hide':
          if (action.targetId) {
            setVisibleElements(prev => {
              const next = new Set(prev);
              next.delete(action.targetId!);
              return next;
            });
            onHide?.(action.targetId, action.payload);
          }
          break;
          
        case 'highlight':
          if (action.targetId) {
            setHighlightedElements(prev => new Set([...prev, action.targetId!]));
            onHighlight?.(action.targetId, action.payload);
          }
          break;
          
        case 'trigger':
          onTrigger?.(action);
          break;
      }
    };

    // Aplica delay se configurado
    if (action.delayMs && action.delayMs > 0) {
      setTimeout(execute, action.delayMs);
    } else {
      execute();
    }
  }, [phaseId, currentTime, onPause, onResume, onShow, onHide, onHighlight, onTrigger, onAnchorEvent]);

  // ✅ DEBUG: Log every time currentTime changes
  const lastLoggedTimeRef = useRef(-1);
  useEffect(() => {
    if (!enabled || !actions.length) return;
    
    // Log every second for debugging
    const roundedTime = Math.floor(currentTime);
    if (roundedTime !== lastLoggedTimeRef.current && roundedTime % 2 === 0) {
      lastLoggedTimeRef.current = roundedTime;
      console.log(`[AnchorText] ⏱️ Time: ${currentTime.toFixed(1)}s | Actions: ${actions.map(a => a.keyword).join(', ')} | WordTimestamps: ${wordTimestamps.length}`);
    }
  }, [enabled, actions, currentTime, wordTimestamps.length]);

  // Monitora ações
  useEffect(() => {
    if (!enabled) {
      console.log(`[AnchorText] ⚠️ System DISABLED`);
      return;
    }
    
    if (!actions.length) {
      console.log(`[AnchorText] ⚠️ No actions to monitor`);
      return;
    }
    
    if (!wordTimestamps.length) {
      console.log(`[AnchorText] ⚠️ No wordTimestamps available - anchor system cannot work!`);
      return;
    }

    for (const action of actions) {
      const actionKey = `${phaseId}-${action.id}`;
      
      // Pula se já executada e once=true
      if (action.once !== false && stateRef.current.executedActions.has(actionKey)) {
        continue;
      }

      // Para ações de pause, só monitora se estiver tocando
      if (action.type === 'pause' && !isPlaying) continue;
      
      // Para ações de resume, só monitora se estiver pausado pelo anchor
      if (action.type === 'resume' && !stateRef.current.pausedByAnchor) continue;

      // Encontra o timestamp da palavra-chave
      const wordTs = findKeywordTimestamp(action.keyword);
      if (!wordTs) continue;

      // Verifica se o tempo atual está próximo
      if (isTimeNearWord(wordTs, currentTime)) {
        console.log(`[AnchorText] 🎯 MATCH! Keyword "${action.keyword}" near time ${currentTime.toFixed(1)}s (word at ${wordTs.start.toFixed(1)}s)`);
        executeAction(action, wordTs);
      }
    }
  }, [enabled, actions, wordTimestamps, currentTime, isPlaying, phaseId, findKeywordTimestamp, isTimeNearWord, executeAction]);

  // Reset quando a fase muda
  useEffect(() => {
    console.log(`[AnchorText] Phase changed to ${phaseId} - resetting state`);
    stateRef.current.executedActions.clear();
    stateRef.current.pausedByAnchor = false;
    setVisibleElements(new Set());
    setHighlightedElements(new Set());
  }, [phaseId]);

  // Funções manuais de controle
  const manualResume = useCallback(() => {
    if (stateRef.current.pausedByAnchor) {
      console.log(`[AnchorText] 🟢 Manual resume triggered for phase: ${phaseId}`);
      stateRef.current.pausedByAnchor = false;
      onResume?.();
    }
  }, [phaseId, onResume]);

  const resetActions = useCallback(() => {
    stateRef.current.executedActions.clear();
  }, []);

  const isElementVisible = useCallback((elementId: string) => {
    return visibleElements.has(elementId);
  }, [visibleElements]);

  const isElementHighlighted = useCallback((elementId: string) => {
    return highlightedElements.has(elementId);
  }, [highlightedElements]);

  return {
    // Estado
    isPausedByAnchor: stateRef.current.pausedByAnchor,
    visibleElements,
    highlightedElements,
    
    // Helpers
    isElementVisible,
    isElementHighlighted,
    
    // Controles manuais
    manualResume,
    resetActions,
    
    // Utilitários
    findKeywordTimestamp,
  };
}

// ============= HELPERS =============

/**
 * Cria uma ação de pause a partir de uma palavra-chave
 */
export function createPauseAction(id: string, keyword: string, delayMs?: number): AnchorAction {
  return { id, keyword, type: 'pause', once: true, delayMs };
}

/**
 * Cria uma ação de show a partir de uma palavra-chave
 */
export function createShowAction(id: string, keyword: string, targetId: string, payload?: any): AnchorAction {
  return { id, keyword, type: 'show', targetId, payload, once: true };
}

/**
 * Cria uma ação de highlight a partir de uma palavra-chave
 */
export function createHighlightAction(id: string, keyword: string, targetId: string): AnchorAction {
  return { id, keyword, type: 'highlight', targetId, once: true };
}

/**
 * Cria uma ação de trigger customizado
 */
export function createTriggerAction(id: string, keyword: string, payload?: any): AnchorAction {
  return { id, keyword, type: 'trigger', payload, once: true };
}

/**
 * Converte pauseKeywords legados para AnchorActions
 */
export function convertPauseKeywordsToActions(pauseKeywords: string[]): AnchorAction[] {
  return pauseKeywords.map((keyword, index) => ({
    id: `pause-${index}`,
    keyword,
    type: 'pause' as const,
    once: true,
  }));
}
