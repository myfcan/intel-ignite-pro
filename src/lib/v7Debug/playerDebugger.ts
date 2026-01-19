/**
 * V7 Player Debugger
 * ==================
 * 
 * Hook e utilitários para capturar métricas de execução no Player.
 * Gera Níveis 3-5 do relatório de debug.
 * 
 * @version 1.0.0
 */

import { useRef, useCallback, useEffect } from 'react';
import type {
  V7DebugReport,
  V7DebugExecution,
  V7DebugExecutedEvent,
  V7DebugRendering,
  V7DebugRender,
  V7DebugAsset,
  V7DebugPlayer,
  V7DebugPlayerEvent,
  V7DebugPlayerState,
  V7DebugIssue,
  V7EventStatus,
} from '@/types/V7DebugSchema';
import { createIssue, analyzeDebugReport, createEmptyDebugReport } from '@/types/V7DebugSchema';

// ============================================================================
// TIPOS INTERNOS
// ============================================================================

interface PlannedEvent {
  eventId: string;
  expectedAt: number;
  anchorText: string | null;
}

interface DebuggerState {
  lessonId: string;
  lessonTitle: string;
  plannedEvents: Map<string, PlannedEvent>;
  executedEvents: V7DebugExecutedEvent[];
  renders: V7DebugRender[];
  assets: Map<string, V7DebugAsset>;
  playerEvents: V7DebugPlayerEvent[];
  stateSnapshots: V7DebugPlayerState[];
  eventsOutsideViewport: string[];
  eventsBeforeAssetReady: string[];
  eventsOnlyAfterSeek: Set<string>;
  seekCount: number;
  startTime: number;
}

// ============================================================================
// HOOK: useV7PlayerDebugger
// ============================================================================

export function useV7PlayerDebugger(lessonId: string, lessonTitle: string) {
  const stateRef = useRef<DebuggerState>({
    lessonId,
    lessonTitle,
    plannedEvents: new Map(),
    executedEvents: [],
    renders: [],
    assets: new Map(),
    playerEvents: [],
    stateSnapshots: [],
    eventsOutsideViewport: [],
    eventsBeforeAssetReady: [],
    eventsOnlyAfterSeek: new Set(),
    seekCount: 0,
    startTime: Date.now(),
  });

  // Reset quando lessonId muda
  useEffect(() => {
    stateRef.current = {
      lessonId,
      lessonTitle,
      plannedEvents: new Map(),
      executedEvents: [],
      renders: [],
      assets: new Map(),
      playerEvents: [],
      stateSnapshots: [],
      eventsOutsideViewport: [],
      eventsBeforeAssetReady: [],
      eventsOnlyAfterSeek: new Set(),
      seekCount: 0,
      startTime: Date.now(),
    };
  }, [lessonId, lessonTitle]);

  /**
   * Registra um evento planejado (da timeline)
   */
  const registerPlannedEvent = useCallback((eventId: string, expectedAt: number, anchorText: string | null) => {
    stateRef.current.plannedEvents.set(eventId, { eventId, expectedAt, anchorText });
  }, []);

  /**
   * Registra a execução de um evento
   */
  const recordEventExecution = useCallback((
    eventId: string,
    status: V7EventStatus,
    actualAt: number | null,
    error: string | null = null,
    metadata: { attempts?: number; usedFallback?: boolean; reason?: string } = {}
  ) => {
    const planned = stateRef.current.plannedEvents.get(eventId);
    const driftMs = (actualAt !== null && planned) 
      ? (actualAt - planned.expectedAt) * 1000 
      : null;

    stateRef.current.executedEvents.push({
      eventId,
      status,
      actualAt,
      driftMs,
      executionTimeMs: null,
      error,
      metadata: {
        attempts: metadata.attempts || 1,
        usedFallback: metadata.usedFallback || false,
        reason: metadata.reason || null,
      },
    });

    // Track if event only worked after seek
    if (stateRef.current.seekCount > 0 && status === 'executed') {
      // Check if this event was previously missed
      const previousMiss = stateRef.current.executedEvents.find(
        e => e.eventId === eventId && e.status === 'not_fired'
      );
      if (previousMiss) {
        stateRef.current.eventsOnlyAfterSeek.add(eventId);
      }
    }
  }, []);

  /**
   * Registra carregamento de asset
   */
  const recordAssetLoad = useCallback((
    assetId: string,
    assetType: V7DebugAsset['assetType'],
    url: string | null,
    status: V7DebugAsset['status'],
    loadTimeMs: number | null,
    error: string | null = null
  ) => {
    stateRef.current.assets.set(assetId, {
      assetId,
      assetType,
      url,
      status,
      loadTimeMs,
      sizeBytes: null,
      usedFallback: false,
      error,
    });
  }, []);

  /**
   * Registra renderização de fase/cena
   */
  const recordRender = useCallback((
    targetId: string,
    visualType: string,
    rendered: boolean,
    firstRenderMs: number | null,
    error: string | null = null
  ) => {
    const assets = Array.from(stateRef.current.assets.values());
    stateRef.current.renders.push({
      targetId,
      visualType,
      rendered,
      firstRenderMs,
      fullRenderMs: null,
      assets,
      animations: [],
      error,
    });
  }, []);

  /**
   * Registra evento do player
   */
  const recordPlayerEvent = useCallback((
    eventType: V7DebugPlayerEvent['eventType'],
    timestamp: number,
    data: Record<string, unknown> | null = null
  ) => {
    stateRef.current.playerEvents.push({ eventType, timestamp, data });
    
    if (eventType === 'seek') {
      stateRef.current.seekCount++;
    }
  }, []);

  /**
   * Captura snapshot do estado do player
   */
  const captureStateSnapshot = useCallback((
    status: string,
    currentPhaseIndex: number,
    currentTime: number,
    audioCurrentTime: number | null
  ) => {
    const audioSyncDriftMs = audioCurrentTime !== null 
      ? (currentTime - audioCurrentTime) * 1000 
      : 0;

    stateRef.current.stateSnapshots.push({
      status,
      currentPhaseIndex,
      currentTime,
      audioCurrentTime,
      audioSyncDriftMs,
    });
  }, []);

  /**
   * Marca evento como fora do viewport
   */
  const markEventOutsideViewport = useCallback((eventId: string) => {
    stateRef.current.eventsOutsideViewport.push(eventId);
  }, []);

  /**
   * Marca evento como disparado antes do asset estar pronto
   */
  const markEventBeforeAssetReady = useCallback((eventId: string) => {
    stateRef.current.eventsBeforeAssetReady.push(eventId);
  }, []);

  /**
   * Gera o relatório de debug completo
   */
  const generateReport = useCallback((pipelineReport?: Partial<V7DebugReport>): V7DebugReport => {
    const state = stateRef.current;
    const report = createEmptyDebugReport(state.lessonId, state.lessonTitle);
    report.source = pipelineReport ? 'combined' : 'player';

    // Merge pipeline data if provided
    if (pipelineReport) {
      if (pipelineReport.audio) report.audio = pipelineReport.audio;
      if (pipelineReport.timeline) report.timeline = pipelineReport.timeline;
    }

    // === NÍVEL 3: EXECUÇÃO ===
    report.execution = analyzeExecution(state);

    // === NÍVEL 4: RENDERIZAÇÃO ===
    report.rendering = analyzeRendering(state);

    // === NÍVEL 5: PLAYER/UX ===
    report.player = analyzePlayer(state);

    // Análise final
    analyzeDebugReport(report);

    return report;
  }, []);

  /**
   * Log do estado atual para console
   */
  const logCurrentState = useCallback(() => {
    const state = stateRef.current;
    console.group('🐛 V7 Player Debug State');
    console.log('Executed Events:', state.executedEvents.length);
    console.log('Renders:', state.renders.length);
    console.log('Assets:', state.assets.size);
    console.log('Player Events:', state.playerEvents.length);
    console.log('Seek Count:', state.seekCount);
    console.log('Events Only After Seek:', Array.from(state.eventsOnlyAfterSeek));
    console.groupEnd();
  }, []);

  return {
    registerPlannedEvent,
    recordEventExecution,
    recordAssetLoad,
    recordRender,
    recordPlayerEvent,
    captureStateSnapshot,
    markEventOutsideViewport,
    markEventBeforeAssetReady,
    generateReport,
    logCurrentState,
  };
}

// ============================================================================
// ANÁLISE DE EXECUÇÃO
// ============================================================================

function analyzeExecution(state: DebuggerState): V7DebugExecution {
  const issues: V7DebugIssue[] = [];
  const missedEvents: string[] = [];
  const delayedEvents: string[] = [];
  let totalDrift = 0;
  let maxDrift = 0;
  let driftCount = 0;

  // Encontrar eventos planejados que não foram executados
  state.plannedEvents.forEach((planned, eventId) => {
    const executed = state.executedEvents.find(e => e.eventId === eventId && e.status === 'executed');
    if (!executed) {
      missedEvents.push(eventId);
    }
  });

  // Analisar drifts
  state.executedEvents.forEach(event => {
    if (event.driftMs !== null) {
      const absDrift = Math.abs(event.driftMs);
      totalDrift += absDrift;
      driftCount++;
      if (absDrift > maxDrift) maxDrift = absDrift;

      // Drift > 100ms é considerado "atrasado"
      if (absDrift > 100) {
        delayedEvents.push(event.eventId);
      }
    }
  });

  const averageDriftMs = driftCount > 0 ? totalDrift / driftCount : 0;

  // Issues
  if (missedEvents.length > 0) {
    issues.push(createIssue(
      'high',
      'sync',
      `${missedEvents.length} eventos não dispararam`,
      `Eventos: ${missedEvents.slice(0, 5).join(', ')}${missedEvents.length > 5 ? '...' : ''}`,
      'Palavras âncora não encontradas ou timing incorreto',
      'Verificar se anchorText existe nos wordTimestamps e está no range correto',
      { missedEvents }
    ));
  }

  if (delayedEvents.length > 0) {
    issues.push(createIssue(
      'medium',
      'sync',
      `${delayedEvents.length} eventos atrasados (>100ms)`,
      `Drift médio: ${averageDriftMs.toFixed(0)}ms, máximo: ${maxDrift.toFixed(0)}ms`,
      'Latência do navegador ou cálculo de timing impreciso',
      'Verificar performance do browser e precisão dos wordTimestamps',
      { delayedEvents, averageDriftMs, maxDrift }
    ));
  }

  if (state.eventsOnlyAfterSeek.size > 0) {
    issues.push(createIssue(
      'high',
      'sync',
      `${state.eventsOnlyAfterSeek.size} eventos só funcionaram após seek/rewind`,
      `Eventos: ${Array.from(state.eventsOnlyAfterSeek).join(', ')}`,
      'Race condition ou evento perdeu a janela de disparo',
      'Verificar se evento tem tolerância adequada e não depende de estado anterior',
      { eventsOnlyAfterSeek: Array.from(state.eventsOnlyAfterSeek) }
    ));
  }

  return {
    executedEvents: state.executedEvents,
    missedEvents,
    delayedEvents,
    executed: state.executedEvents.filter(e => e.status === 'executed').length,
    failed: state.executedEvents.filter(e => e.status === 'error').length,
    averageDriftMs,
    maxDriftMs: maxDrift,
    issues,
  };
}

// ============================================================================
// ANÁLISE DE RENDERIZAÇÃO
// ============================================================================

function analyzeRendering(state: DebuggerState): V7DebugRendering {
  const issues: V7DebugIssue[] = [];
  const failedAssets: V7DebugAsset[] = [];
  const fallbackAssets: V7DebugAsset[] = [];
  let totalLoadTime = 0;
  let maxLoadTime = 0;
  let loadCount = 0;

  state.assets.forEach(asset => {
    if (asset.status === 'failed' || asset.status === 'not_found') {
      failedAssets.push(asset);
    }
    if (asset.usedFallback) {
      fallbackAssets.push(asset);
    }
    if (asset.loadTimeMs !== null) {
      totalLoadTime += asset.loadTimeMs;
      loadCount++;
      if (asset.loadTimeMs > maxLoadTime) maxLoadTime = asset.loadTimeMs;
    }
  });

  const averageLoadTimeMs = loadCount > 0 ? totalLoadTime / loadCount : 0;

  // Issues
  if (failedAssets.length > 0) {
    issues.push(createIssue(
      'high',
      'rendering',
      `${failedAssets.length} assets falharam ao carregar`,
      `Assets: ${failedAssets.map(a => a.assetId).join(', ')}`,
      'Rede instável ou URLs incorretas',
      'Verificar URLs dos assets e adicionar tratamento de erro/fallback',
      { failedAssets }
    ));
  }

  if (state.eventsBeforeAssetReady.length > 0) {
    issues.push(createIssue(
      'medium',
      'rendering',
      `${state.eventsBeforeAssetReady.length} eventos dispararam antes do asset estar pronto`,
      `Eventos: ${state.eventsBeforeAssetReady.join(', ')}`,
      'Race condition: evento tentou renderizar antes do asset carregar',
      'Implementar preload de assets antes de iniciar playback',
      { events: state.eventsBeforeAssetReady }
    ));
  }

  if (maxLoadTime > 3000) {
    issues.push(createIssue(
      'low',
      'rendering',
      'Tempo de carregamento lento',
      `Tempo máximo: ${maxLoadTime}ms, média: ${averageLoadTimeMs.toFixed(0)}ms`,
      'Assets grandes ou rede lenta',
      'Otimizar tamanho de assets e implementar lazy loading',
      { maxLoadTime, averageLoadTimeMs }
    ));
  }

  return {
    renders: state.renders,
    failedAssets,
    fallbackAssets,
    averageLoadTimeMs,
    maxLoadTimeMs: maxLoadTime,
    issues,
  };
}

// ============================================================================
// ANÁLISE DO PLAYER
// ============================================================================

function analyzePlayer(state: DebuggerState): V7DebugPlayer {
  const issues: V7DebugIssue[] = [];

  // Verificar sincronização áudio/player
  const syncDrifts = state.stateSnapshots
    .filter(s => Math.abs(s.audioSyncDriftMs) > 200)
    .map(s => s.audioSyncDriftMs);

  if (syncDrifts.length > 0) {
    const avgDrift = syncDrifts.reduce((a, b) => a + b, 0) / syncDrifts.length;
    issues.push(createIssue(
      'medium',
      'sync',
      'Dessincronização áudio/player detectada',
      `${syncDrifts.length} snapshots com drift >200ms. Drift médio: ${avgDrift.toFixed(0)}ms`,
      'Diferença entre currentTime do player e do elemento HTML5 audio',
      'Verificar atualização do currentTime e intervalo de polling',
      { syncDrifts, avgDrift }
    ));
  }

  if (state.eventsOutsideViewport.length > 0) {
    issues.push(createIssue(
      'low',
      'rendering',
      `${state.eventsOutsideViewport.length} eventos dispararam fora do viewport`,
      `Eventos: ${state.eventsOutsideViewport.join(', ')}`,
      'Componente não estava visível quando evento disparou',
      'Verificar se componente está montado antes de processar evento',
      { events: state.eventsOutsideViewport }
    ));
  }

  return {
    eventHistory: state.playerEvents,
    stateSnapshots: state.stateSnapshots,
    eventsOutsideViewport: state.eventsOutsideViewport,
    eventsBeforeAssetReady: state.eventsBeforeAssetReady,
    eventsOnlyAfterSeek: Array.from(state.eventsOnlyAfterSeek),
    issues,
  };
}
