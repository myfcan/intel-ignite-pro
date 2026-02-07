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
  /**
   * V7-vv: Tempo exato da palavra no áudio (pré-calculado pelo Pipeline)
   * Quando disponível, usa detecção direta por tempo ao invés de busca por keyword
   */
  keywordTime?: number;
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
  /** @param keywordTime - Tempo exato onde a keyword termina (para seek-back preciso) */
  onPause?: (keywordTime?: number) => void;
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
  
  // ✅ V7-v5 FIX: Usar useState para pausedByAnchor para causar re-render
  const [isPausedByAnchorState, setIsPausedByAnchorState] = useState(false);
  
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const [highlightedElements, setHighlightedElements] = useState<Set<string>>(new Set());
  
  // ✅ V7-v60 CROSSING DETECTION: Track previous time for crossing detection
  const prevTimeRef = useRef<number>(-1);
  
  // ✅ V7 DEBUG HUD: Track last crossed action for debugging
  const [lastCrossedAction, setLastCrossedAction] = useState<AnchorAction | null>(null);
  
  // ✅ FIRST-LOAD FIX: Track if we've done initial recompute after audio is ready
  const hasInitializedRef = useRef<boolean>(false);
  const lastVisibleCountRef = useRef<number>(0);

  // Normaliza palavra para comparação
  const normalizeWord = useCallback((word: string): string => {
    return word
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[.,!?;:'"()[\]{}]/g, '')
      .trim();
  }, []);

  // Encontra timestamp de uma palavra-chave (suporta frases com múltiplas palavras)
  const findKeywordTimestamp = useCallback((keyword: string, afterTime: number = 0): WordTimestamp | null => {
    if (!wordTimestamps.length) {
      console.log(`[AnchorText] ❌ findKeywordTimestamp: No wordTimestamps!`);
      return null;
    }
    
    console.log(`[AnchorText] 🔎 Searching for keyword: "${keyword}" (afterTime: ${afterTime.toFixed(1)}s)`);
    
    const keywordParts = keyword.toLowerCase().split(/\s+/).map(w => normalizeWord(w));
    const isMultiWord = keywordParts.length > 1;
    
    console.log(`[AnchorText] 📝 Keyword parts: [${keywordParts.join(', ')}] (isMultiWord: ${isMultiWord})`);
    
    // Para keywords com múltiplas palavras, procurar sequência exata
    if (isMultiWord) {
      for (let i = 0; i <= wordTimestamps.length - keywordParts.length; i++) {
        const ts = wordTimestamps[i];
        if (ts.start < afterTime) continue;
        
        // Verificar se as próximas palavras formam a frase
        let allMatch = true;
        for (let j = 0; j < keywordParts.length; j++) {
          const wordTs = wordTimestamps[i + j];
          const normalizedWord = normalizeWord(wordTs.word);
          if (normalizedWord !== keywordParts[j]) {
            allMatch = false;
            break;
          }
        }
        
        if (allMatch) {
          // Retorna o timestamp da ÚLTIMA palavra da frase (momento exato do trigger)
          const lastWordTs = wordTimestamps[i + keywordParts.length - 1];
          console.log(`[AnchorText] ✅ Found multi-word keyword "${keyword}" at ${lastWordTs.start.toFixed(1)}s-${lastWordTs.end.toFixed(1)}s`);
          return lastWordTs;
        }
      }
      console.log(`[AnchorText] ⚠️ Multi-word keyword "${keyword}" not found in ${wordTimestamps.length} words`);
      return null;
    }
    
    // Para keywords de uma só palavra, match EXATO apenas
    const normalizedKeyword = keywordParts[0];
    
    // ✅ V7-v9: Log compacto para debug
    console.log(`[AnchorText] 🎯 Looking for exact match: "${normalizedKeyword}"`);
    
    for (const ts of wordTimestamps) {
      if (ts.start < afterTime) continue;
      
      const normalizedWord = normalizeWord(ts.word);
      
      // ✅ V7-v9 FIX: Match EXATO apenas - sem matches parciais
      // O normalize já remove pontuação, então "IA." vira "ia" e "IA" vira "ia"
      if (normalizedWord === normalizedKeyword) {
        console.log(`[AnchorText] ✅ Found keyword "${keyword}" at ${ts.start.toFixed(1)}s (word: "${ts.word}")`);
        return ts;
      }
    }
    
    console.log(`[AnchorText] ❌ Keyword "${keyword}" NOT FOUND (searched ${wordTimestamps.length} words)`);
    return null;
  }, [wordTimestamps, normalizeWord]);

  // ✅ V7-v60 CROSSING DETECTION: Detects when time crosses a trigger point
  // This REPLACES window-based detection for 100% reliability
  // Logic: prevTime < triggerPoint && currentTime >= triggerPoint
  const hasCrossedTrigger = useCallback((triggerPoint: number, prevTime: number, currTime: number): boolean => {
    const crossed = prevTime < triggerPoint && currTime >= triggerPoint;
    
    if (crossed) {
      console.log(`[AnchorText] ✅ CROSSED: prevTime ${prevTime.toFixed(3)}s < trigger ${triggerPoint.toFixed(3)}s <= currTime ${currTime.toFixed(3)}s`);
    }
    
    return crossed;
  }, []);
  
  // ✅ LEGACY: Keep isTimeNearWord as fallback for cases without keywordTime
  const isTimeNearWord = useCallback((wordTs: WordTimestamp, time: number, windowMs: number = 500): boolean => {
    const windowSec = windowMs / 1000;
    const isAfterWordEnd = time >= wordTs.end;
    const isWithinWindow = time <= wordTs.end + windowSec;
    const result = isAfterWordEnd && isWithinWindow;
    
    if (result) {
      console.log(`[AnchorText] ✅ isTimeNearWord (legacy): time ${time.toFixed(2)}s MATCH @ word end ${wordTs.end.toFixed(2)}s (window ${windowMs}ms)`);
    }
    
    return result;
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
      
      // ✅ V7 DEBUG HUD: Track last crossed action
      setLastCrossedAction({
        ...action,
        keywordTime: wordTs.end,
      });

      // Emite evento genérico
      const event: AnchorEvent = { action, timestamp: currentTime, wordTimestamp: wordTs };
      onAnchorEvent?.(event);

      // Executa ação específica
      switch (action.type) {
        case 'pause':
          stateRef.current.pausedByAnchor = true;
          setIsPausedByAnchorState(true); // ✅ V7-v5: Atualiza state para causar re-render
          // ✅ V7-v42: Passa keywordTime exato (wordTs.end) para seek-back preciso no Player
          onPause?.(wordTs.end);
          break;
          
        case 'resume':
          stateRef.current.pausedByAnchor = false;
          setIsPausedByAnchorState(false); // ✅ V7-v5: Atualiza state para causar re-render
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

  // ✅ FIRST-LOAD FIX: Log when visibleElements changes
  useEffect(() => {
    const size = visibleElements.size;
    const lastId = Array.from(visibleElements).pop() || 'none';
    if (size !== lastVisibleCountRef.current) {
      console.log(`[ANCHOR_VISIBLE] visibleElements changed: size=${size} lastId="${lastId}"`);
      lastVisibleCountRef.current = size;
    }
  }, [visibleElements]);

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
    // ✅ DEBUG: Log on every check
    const timeStr = currentTime.toFixed(3);
    const prevTime = prevTimeRef.current;
    
    // ✅ DETERMINISTIC LOG: Init state (only on significant time changes)
    if (Math.floor(currentTime) !== Math.floor(prevTime) || prevTime < 0) {
      console.log(`[ANCHOR_INIT] phaseId="${phaseId}" prevTime=${prevTime.toFixed(3)} currTime=${timeStr} hasTimestamps=${wordTimestamps.length > 0} count=${wordTimestamps.length} actions=${actions.length} enabled=${enabled}`);
    }
    
    if (!enabled) {
      if (Math.floor(currentTime) % 5 === 0 && currentTime - Math.floor(currentTime) < 0.1) {
        console.log(`[AnchorText] ⚠️ System DISABLED at ${timeStr}s`);
      }
      return;
    }
    
    if (!actions.length) {
      if (Math.floor(currentTime) % 5 === 0 && currentTime - Math.floor(currentTime) < 0.1) {
        console.log(`[AnchorText] ⚠️ No actions to monitor at ${timeStr}s`);
      }
      return;
    }
    
    // ✅ V7-vv: Se todas as ações têm keywordTime, não precisamos de wordTimestamps
    const allActionsHaveKeywordTime = actions.every(a => a.keywordTime !== undefined && a.keywordTime > 0);

    if (!wordTimestamps.length && !allActionsHaveKeywordTime) {
      if (Math.floor(currentTime) % 5 === 0 && currentTime - Math.floor(currentTime) < 0.1) {
        console.log(`[AnchorText] ⚠️ No wordTimestamps at ${timeStr}s and actions don't have keywordTime - anchor system CANNOT work!`);
      }
      return;
    }

    // ✅ FIRST-LOAD FIX: On first tick with data ready, do FULL RECOMPUTE of all actions <= currentTime
    // This fixes the "second time works" bug where actions are missed on first load
    if (!hasInitializedRef.current && (wordTimestamps.length > 0 || allActionsHaveKeywordTime)) {
      hasInitializedRef.current = true;
      console.log(`[ANCHOR_FIRST_LOAD] 🚀 First tick with data ready at ${timeStr}s - doing FULL RECOMPUTE`);
      
      // Recompute: execute all actions whose trigger point is <= currentTime
      for (const action of actions) {
        const actionKey = `${phaseId}-${action.id}`;
        if (action.once !== false && stateRef.current.executedActions.has(actionKey)) {
          continue;
        }
        
        // Get trigger point
        // ✅ C09 FIX: Reduzido preemptiveMs de 100ms para 20ms
        // O pause agora é calculado no FIM da última palavra, então não precisa antecipar tanto
        let triggerPoint: number | null = null;
        if (action.keywordTime !== undefined && action.keywordTime > 0) {
          const preemptiveMs = action.type === 'pause' ? 20 : 0; // ← C09: 100 → 20
          triggerPoint = action.keywordTime - (preemptiveMs / 1000);
          triggerPoint = action.keywordTime - (preemptiveMs / 1000);
        } else {
          const wordTs = findKeywordTimestamp(action.keyword);
          if (wordTs) {
            triggerPoint = wordTs.end;
          }
        }
        
        // If trigger point is in the past, execute it now
        if (triggerPoint !== null && triggerPoint <= currentTime) {
          console.log(`[ANCHOR_FIRST_LOAD] 🎯 Executing missed action "${action.keyword}" (trigger: ${triggerPoint.toFixed(3)}s <= current: ${timeStr}s)`);
          const syntheticWordTs: WordTimestamp = {
            word: action.keyword,
            start: triggerPoint - 0.5,
            end: triggerPoint,
          };
          executeAction(action, syntheticWordTs);
        }
      }
      
      // Set prevTime to current so future crossings work correctly
      prevTimeRef.current = currentTime;
      return; // Don't do normal crossing detection on first tick
    }
    
    // ✅ SEEK DETECTION: If time jumped backwards significantly, do full recompute
    const isSeekBack = prevTime > 0 && currentTime < prevTime - 0.5;
    if (isSeekBack) {
      console.log(`[ANCHOR_SEEK] ⏪ Seek-back detected: ${prevTime.toFixed(3)}s → ${timeStr}s - resetting executed actions`);
      stateRef.current.executedActions.clear();
      
      // Recompute all actions <= currentTime
      for (const action of actions) {
        let triggerPoint: number | null = null;
        if (action.keywordTime !== undefined && action.keywordTime > 0) {
          const preemptiveMs = action.type === 'pause' ? 20 : 0; // ← C09: 100 → 20
          triggerPoint = action.keywordTime - (preemptiveMs / 1000);
        } else {
          const wordTs = findKeywordTimestamp(action.keyword);
          if (wordTs) {
            triggerPoint = wordTs.end;
          }
        }
        
        if (triggerPoint !== null && triggerPoint <= currentTime) {
          console.log(`[ANCHOR_SEEK] 🎯 Re-executing action "${action.keyword}" after seek`);
          const syntheticWordTs: WordTimestamp = {
            word: action.keyword,
            start: triggerPoint - 0.5,
            end: triggerPoint,
          };
          executeAction(action, syntheticWordTs);
        }
      }
      
      prevTimeRef.current = currentTime;
      return;
    }

    // ✅ DEBUG: Log current monitoring state every 2 seconds
    if (Math.floor(currentTime) % 2 === 0 && currentTime - Math.floor(currentTime) < 0.1) {
      console.log(`[AnchorText] 🔄 Monitoring at ${timeStr}s | Phase: ${phaseId} | prevTime: ${prevTime.toFixed(3)}s | Actions: ${actions.map(a => `${a.keyword}(${a.type})`).join(', ')} | Playing: ${isPlaying}`);
    }

    for (const action of actions) {
      const actionKey = `${phaseId}-${action.id}`;

      // Pula se já executada e once=true
      if (action.once !== false && stateRef.current.executedActions.has(actionKey)) {
        continue;
      }

      // ✅ V7-v33 FIX: Removido check de isPlaying para ações de pause
      // MOTIVO: Quando áudio termina naturalmente (onEnded), isPlaying fica false imediatamente
      // Mas ainda queremos executar a ação de pause para sinalizar ao sistema que é uma fase blocking
      // O áudio terminar naturalmente NÃO deve pular a ação de pause - queremos marcar isPausedByAnchor = true
      // ANTES: if (action.type === 'pause' && !isPlaying) continue; ← isso causava o bug
      // AGORA: Só pula se já estamos pausados E a ação já foi executada
      if (action.type === 'pause' && stateRef.current.pausedByAnchor) {
        console.log(`[AnchorText] ⏸️ Skipping pause action "${action.keyword}" - already paused by anchor`);
        continue;
      }

      // Para ações de resume, só monitora se estiver pausado pelo anchor
      if (action.type === 'resume' && !stateRef.current.pausedByAnchor) continue;

      // ✅ V7-v60 CROSSING DETECTION: Se keywordTime está disponível, usar detecção por cruzamento
      // ✅ C09 FIX: preemptiveMs reduzido de 100ms para 20ms
      if (action.keywordTime !== undefined && action.keywordTime > 0) {
        const preemptiveMs = action.type === 'pause' ? 20 : 0; // ← C09: 100 → 20
        const preemptiveSec = preemptiveMs / 1000;
        const triggerPoint = action.keywordTime - preemptiveSec;
        
        // ✅ V7-v60: CROSSING DETECTION - prevTime < trigger && currentTime >= trigger
        const crossed = hasCrossedTrigger(triggerPoint, prevTime, currentTime);

        if (crossed) {
          console.log(`[AnchorText] 🎯 V7-v60 CROSSING MATCH! "${action.keyword}" crossed @ ${triggerPoint.toFixed(3)}s (prev: ${prevTime.toFixed(3)}s, current: ${timeStr}s)`);
          const syntheticWordTs: WordTimestamp = {
            word: action.keyword,
            start: action.keywordTime - 0.5,
            end: action.keywordTime - preemptiveSec,
          };
          executeAction(action, syntheticWordTs);
        }
        continue;
      }

      // Fallback: Encontra o timestamp da palavra-chave (método legado)
      const wordTs = findKeywordTimestamp(action.keyword);
      if (!wordTs) {
        console.log(`[AnchorText] ❌ Action "${action.keyword}" - keyword not found in timestamps`);
        continue;
      }

      // ✅ V7-v60: CROSSING DETECTION para keywords sem keywordTime pré-calculado
      const crossed = hasCrossedTrigger(wordTs.end, prevTime, currentTime);
      
      if (crossed) {
        console.log(`[AnchorText] 🎯🎯🎯 CROSSED! Keyword "${action.keyword}" @ ${wordTs.end.toFixed(3)}s (prev: ${prevTime.toFixed(3)}s, current: ${timeStr}s)`);
        executeAction(action, wordTs);
      }
    }
    
    // ✅ V7-v60: Atualizar prevTime APÓS processar todas as ações
    prevTimeRef.current = currentTime;
  }, [enabled, actions, wordTimestamps, currentTime, isPlaying, phaseId, findKeywordTimestamp, hasCrossedTrigger, executeAction]);

  // Reset quando a fase muda
  useEffect(() => {
    console.log(`[ANCHOR_PHASE_CHANGE] 🔄 Phase changed to "${phaseId}" - RESETTING ALL STATE`);
    stateRef.current.executedActions.clear();
    stateRef.current.pausedByAnchor = false;
    // ✅ V7-v11 FIX: CRITICAL - Reset React state too, not just ref!
    // Without this, isPausedByAnchor stays true when entering new phases
    setIsPausedByAnchorState(false);
    setVisibleElements(new Set());
    setHighlightedElements(new Set());
    // ✅ V7-v60: Reset prevTime to -1 to force recompute on new phase
    prevTimeRef.current = -1;
    // ✅ FIRST-LOAD FIX: Reset initialization flag for new phase
    hasInitializedRef.current = false;
    lastVisibleCountRef.current = 0;
  }, [phaseId]);

  // Funções manuais de controle
  const manualResume = useCallback(() => {
    if (stateRef.current.pausedByAnchor || isPausedByAnchorState) {
      console.log(`[AnchorText] 🟢 Manual resume triggered for phase: ${phaseId}`);
      stateRef.current.pausedByAnchor = false;
      setIsPausedByAnchorState(false); // ✅ V7-v5: Atualiza state
      onResume?.();
    }
  }, [phaseId, onResume, isPausedByAnchorState]);

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
    isPausedByAnchor: isPausedByAnchorState, // ✅ V7-v5: Usar state que causa re-render
    visibleElements,
    highlightedElements,
    
    // ✅ V7 DEBUG HUD: Expose debug state
    lastCrossedAction,
    prevTime: prevTimeRef.current,
    
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
