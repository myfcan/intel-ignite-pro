/**
 * V7 Correction Status Component
 * ================================
 * 
 * Sistema REAL de status de correções baseado em verificação de dados.
 * 
 * Status:
 * - 🔴 ERRO: Problema detectado e não corrigido
 * - 🟡 TENTATIVA: Correção aplicada mas não verificada ou parcial
 * - 🟢 CORRIGIDO: Verificação passou, problema resolvido
 * 
 * IMPORTANTE: Status são baseados em DADOS REAIS, não em checkboxes manuais.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export type CorrectionStatusType = 'error' | 'warning' | 'success' | 'unknown';

export interface CorrectionVerification {
  id: string;
  label: string;
  category: 'audio' | 'timeline' | 'anchors' | 'rendering' | 'player' | 'sync';
  status: CorrectionStatusType;
  reason: string;
  details?: string;
}

interface V7CorrectionStatusProps {
  verification: CorrectionVerification;
}

const statusConfig: Record<CorrectionStatusType, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/30',
    label: 'Erro',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    label: 'Parcial',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/30',
    label: 'OK',
  },
  unknown: {
    icon: HelpCircle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10 border-gray-500/30',
    label: '?',
  },
};

export function V7CorrectionStatus({ verification }: V7CorrectionStatusProps) {
  const config = statusConfig[verification.status];
  const Icon = config.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{verification.label}</p>
              <p className="text-xs text-muted-foreground truncate">{verification.reason}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`${config.color} border-current flex-shrink-0`}
            >
              {config.label}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[300px]">
          <div className="space-y-1">
            <p className="font-medium">{verification.label}</p>
            <p className="text-sm text-muted-foreground">{verification.reason}</p>
            {verification.details && (
              <p className="text-xs text-cyan-400 mt-2">{verification.details}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Analisa os dados REAIS do debug report e retorna o status de cada verificação
 */
/**
 * Analisa os dados REAIS do debug report e retorna o status de cada verificação
 * 
 * @param audioReport - Dados de áudio do pipeline
 * @param timelineReport - Dados de timeline do pipeline
 * @param allIssues - Todas as issues detectadas
 * @param executionReport - Dados de execução do player (opcional)
 */
export function analyzeCorrections(
  audioReport: any,
  timelineReport: any,
  allIssues: any[],
  executionReport?: any
): CorrectionVerification[] {
  const verifications: CorrectionVerification[] = [];
  
  // ========================================
  // 1. TRUNCAMENTO DE NARRAÇÃO
  // ========================================
  if (audioReport?.isTruncated === true) {
    verifications.push({
      id: 'truncation',
      label: 'Truncamento de narração',
      category: 'audio',
      status: 'error',
      reason: `Áudio truncado: ${audioReport.truncationDetails?.percentageSpoken || 0}% falado`,
      details: audioReport.truncationDetails?.missingWords?.slice(0, 5).join(', '),
    });
  } else if (audioReport?.isTruncated === false && audioReport?.wordCount > 0) {
    verifications.push({
      id: 'truncation',
      label: 'Truncamento de narração',
      category: 'audio',
      status: 'success',
      reason: `✓ Áudio completo: ${audioReport.wordCount} palavras (${audioReport.actualDuration?.toFixed(1)}s)`,
    });
  } else {
    verifications.push({
      id: 'truncation',
      label: 'Truncamento de narração',
      category: 'audio',
      status: 'unknown',
      reason: 'Sem dados de áudio para verificar',
    });
  }
  
  // ========================================
  // 2. TIMESTAMPS WORD-LEVEL
  // ========================================
  const hasWordTimestamps = audioReport?.wordCount > 0 && 
                            audioReport?.firstWord && 
                            audioReport?.lastWord;
  
  if (hasWordTimestamps) {
    const duration = audioReport.lastWord.end - audioReport.firstWord.start;
    if (duration > 0 && audioReport.wordCount >= 10) {
      verifications.push({
        id: 'timestamps',
        label: 'Timestamps word-level',
        category: 'audio',
        status: 'success',
        reason: `✓ ${audioReport.wordCount} timestamps sincronizados`,
        details: `"${audioReport.firstWord.word}" (0s) → "${audioReport.lastWord.word}" (${duration.toFixed(1)}s)`,
      });
    } else {
      verifications.push({
        id: 'timestamps',
        label: 'Timestamps word-level',
        category: 'audio',
        status: 'warning',
        reason: 'Poucos timestamps detectados',
        details: `Apenas ${audioReport.wordCount} palavras`,
      });
    }
  } else {
    verifications.push({
      id: 'timestamps',
      label: 'Timestamps word-level',
      category: 'audio',
      status: 'unknown',
      reason: 'Sem dados de timestamps',
    });
  }
  
  // ========================================
  // 3. OVERLAPS DE FASES
  // ========================================
  const phaseDetails = timelineReport?.phaseDetails || [];
  const hasOverlaps = phaseDetails.some((p: any) => p.hasOverlap === true);
  
  if (phaseDetails.length > 0) {
    if (hasOverlaps) {
      const overlappingPhases = phaseDetails.filter((p: any) => p.hasOverlap);
      verifications.push({
        id: 'phase-overlap',
        label: 'Overlaps de fases',
        category: 'timeline',
        status: 'error',
        reason: `${overlappingPhases.length} fases com overlap`,
        details: overlappingPhases.map((p: any) => `${p.id} ↔ ${p.overlapsWith}`).join(', '),
      });
    } else {
      verifications.push({
        id: 'phase-overlap',
        label: 'Overlaps de fases',
        category: 'timeline',
        status: 'success',
        reason: `✓ ${phaseDetails.length} fases sequenciais sem overlap`,
      });
    }
  } else {
    verifications.push({
      id: 'phase-overlap',
      label: 'Overlaps de fases',
      category: 'timeline',
      status: 'unknown',
      reason: 'Sem dados de fases',
    });
  }
  
  // ========================================
  // 4. ÂNCORAS - AGORA COM DADOS REAIS DE EXECUÇÃO
  // ========================================
  const plannedAnchors = timelineReport?.plannedEvents?.filter((e: any) => 
    e.triggerType === 'anchor_text'
  ) || [];
  
  // Verificar issues de âncoras não encontradas
  const anchorIssue = allIssues?.find(i => 
    i.message?.toLowerCase().includes('âncora') || 
    i.message?.toLowerCase().includes('anchor') ||
    i.relatedData?.missedEvents?.length > 0
  );
  
  // Verificar dados de execução do player
  const executedEvents = executionReport?.executedEvents || [];
  const missedEvents = executionReport?.missedEvents || anchorIssue?.relatedData?.missedEvents || [];
  
  if (missedEvents.length > 0) {
    const missedCount = missedEvents.length;
    const totalPlanned = plannedAnchors.length || missedCount;
    const executedCount = totalPlanned - missedCount;
    
    verifications.push({
      id: 'anchor-found',
      label: 'Âncoras encontradas',
      category: 'anchors',
      status: missedCount > 5 ? 'error' : 'warning',
      reason: `${executedCount}/${totalPlanned} âncoras dispararam (${missedCount} faltando)`,
      details: `Não encontrados: ${missedEvents.slice(0, 4).join(', ')}${missedCount > 4 ? '...' : ''}`,
    });
  } else if (plannedAnchors.length > 0) {
    verifications.push({
      id: 'anchor-found',
      label: 'Âncoras encontradas',
      category: 'anchors',
      status: 'success',
      reason: `✓ ${plannedAnchors.length} âncoras planejadas e encontradas`,
    });
  } else {
    verifications.push({
      id: 'anchor-found',
      label: 'Âncoras encontradas',
      category: 'anchors',
      status: 'unknown',
      reason: 'Sem dados de âncoras',
    });
  }
  
  // ========================================
  // 5. SYNC DRIFT (EVENTOS ATRASADOS) - THRESHOLD CORRIGIDO
  // ========================================
  const driftIssue = allIssues?.find(i => 
    i.message?.toLowerCase().includes('atrasad') || 
    i.relatedData?.averageDriftMs > 100
  );
  
  if (driftIssue) {
    const avgDrift = driftIssue.relatedData?.averageDriftMs || 0;
    const maxDrift = driftIssue.relatedData?.maxDrift || 0;
    const delayedCount = driftIssue.relatedData?.delayedEvents?.length || 0;
    
    // CRITICAL: maxDrift > 5000ms
    // ERROR: avgDrift > 500 || maxDrift > 2000ms  
    // WARNING: avgDrift > 100ms
    if (maxDrift > 5000) {
      verifications.push({
        id: 'sync-drift',
        label: 'Sincronização de eventos',
        category: 'sync',
        status: 'error',
        reason: `CRÍTICO: ${delayedCount} eventos com drift extremo (máx ${Math.round(maxDrift)}ms)`,
        details: 'Drift > 5s indica problema grave de timing. Verificar cálculo de startTime das fases.',
      });
    } else if (avgDrift > 500 || maxDrift > 2000) {
      verifications.push({
        id: 'sync-drift',
        label: 'Sincronização de eventos',
        category: 'sync',
        status: 'error',
        reason: `${delayedCount} eventos atrasados (média ${Math.round(avgDrift)}ms)`,
        details: driftIssue.suggestedFix,
      });
    } else {
      verifications.push({
        id: 'sync-drift',
        label: 'Sincronização de eventos',
        category: 'sync',
        status: 'warning',
        reason: `Drift moderado: média ${Math.round(avgDrift)}ms`,
        details: 'Dentro do limite aceitável mas pode ser melhorado',
      });
    }
  } else {
    verifications.push({
      id: 'sync-drift',
      label: 'Sincronização de eventos',
      category: 'sync',
      status: 'success',
      reason: '✓ Sem drift significativo detectado',
    });
  }
  
  // ========================================
  // 6. FASES INTERATIVAS (QUIZ/PLAYGROUND)
  // ========================================
  const interactivePhases = timelineReport?.interactivePhases || [];
  const hasQuiz = interactivePhases.some((p: string) => p.includes('quiz'));
  const hasPlayground = interactivePhases.some((p: string) => p.includes('playground'));
  
  if (interactivePhases.length > 0) {
    const pauseEvents = timelineReport?.plannedEvents?.filter((e: any) => 
      e.eventType === 'anchor_pause'
    ) || [];
    
    if (pauseEvents.length >= interactivePhases.length) {
      verifications.push({
        id: 'interactive-phases',
        label: 'Fases interativas',
        category: 'player',
        status: 'success',
        reason: `✓ ${interactivePhases.length} fases com pause configurado`,
        details: `Quiz: ${hasQuiz ? '✓' : '✗'}, Playground: ${hasPlayground ? '✓' : '✗'}`,
      });
    } else {
      verifications.push({
        id: 'interactive-phases',
        label: 'Fases interativas',
        category: 'player',
        status: 'warning',
        reason: `Apenas ${pauseEvents.length}/${interactivePhases.length} fases têm pause`,
        details: 'Algumas fases interativas podem não pausar o áudio',
      });
    }
  } else {
    verifications.push({
      id: 'interactive-phases',
      label: 'Fases interativas',
      category: 'player',
      status: 'unknown',
      reason: 'Nenhuma fase interativa detectada',
    });
  }
  
  // ========================================
  // 7. TAGS VAZADAS (LEAKED TAGS)
  // ========================================
  if (audioReport?.leakedTags && audioReport.leakedTags.length > 0) {
    verifications.push({
      id: 'leaked-tags',
      label: 'Tags vazadas para TTS',
      category: 'audio',
      status: 'error',
      reason: `${audioReport.leakedTags.length} tags faladas na narração`,
      details: audioReport.leakedTags.slice(0, 3).join(', '),
    });
  } else if (audioReport?.leakedTags !== undefined) {
    verifications.push({
      id: 'leaked-tags',
      label: 'Tags vazadas para TTS',
      category: 'audio',
      status: 'success',
      reason: '✓ Nenhuma tag vazou para narração',
    });
  }
  
  // ========================================
  // 8. DURAÇÃO DO PLAYGROUND - THRESHOLD 5s (PIPELINE FIX)
  // ========================================
  const playgroundPhase = phaseDetails.find((p: any) => 
    p.type === 'playground' || p.id?.includes('playground')
  );
  
  if (playgroundPhase) {
    // Pipeline agora garante mínimo de 5s
    if (playgroundPhase.duration < 3) {
      verifications.push({
        id: 'playground-duration',
        label: 'Duração do Playground',
        category: 'timeline',
        status: 'error',
        reason: `Duração insuficiente: ${playgroundPhase.duration.toFixed(2)}s`,
        details: 'Pipeline deveria garantir mínimo de 5s. Verificar v7-vv Edge Function.',
      });
    } else if (playgroundPhase.duration < 5) {
      verifications.push({
        id: 'playground-duration',
        label: 'Duração do Playground',
        category: 'timeline',
        status: 'warning',
        reason: `Duração curta: ${playgroundPhase.duration.toFixed(2)}s`,
        details: 'Mínimo recomendado de 5s para fases interativas',
      });
    } else {
      verifications.push({
        id: 'playground-duration',
        label: 'Duração do Playground',
        category: 'timeline',
        status: 'success',
        reason: `✓ Duração adequada: ${playgroundPhase.duration.toFixed(2)}s`,
      });
    }
  }
  
  // ========================================
  // 9. NOVO: EVENTOS QUE SÓ FUNCIONAM APÓS SEEK
  // ========================================
  const seekIssue = allIssues?.find(i => 
    i.message?.toLowerCase().includes('seek') || 
    i.relatedData?.eventsOnlyAfterSeek?.length > 0
  );
  const eventsOnlyAfterSeek = seekIssue?.relatedData?.eventsOnlyAfterSeek || 
                              executionReport?.eventsOnlyAfterSeek || [];
  
  if (eventsOnlyAfterSeek.length > 0) {
    verifications.push({
      id: 'seek-recovery',
      label: 'Eventos first-play vs seek',
      category: 'player',
      status: 'error',
      reason: `${eventsOnlyAfterSeek.length} eventos só funcionam após rewind`,
      details: `Race condition detectada: ${eventsOnlyAfterSeek.slice(0, 3).join(', ')}`,
    });
  } else if (executionReport) {
    verifications.push({
      id: 'seek-recovery',
      label: 'Eventos first-play vs seek',
      category: 'player',
      status: 'success',
      reason: '✓ Todos os eventos disparam no first-play',
    });
  }
  
  // ========================================
  // 10. NOVO: REVELATION (PERFEITO) PHASE
  // ========================================
  const revelationPhase = phaseDetails.find((p: any) => 
    p.type === 'revelation' || p.id?.includes('perfeito') || p.id?.includes('revelation')
  );
  
  if (revelationPhase) {
    // Verificar se há micro_visual events para revelation
    const revelationEvents = timelineReport?.plannedEvents?.filter((e: any) => 
      e.phaseId === revelationPhase.id && e.eventType === 'micro_visual'
    ) || [];
    
    if (revelationEvents.length >= 7) { // PERFEITO tem 8 letras
      verifications.push({
        id: 'revelation-render',
        label: 'Revelation (PERFEITO)',
        category: 'rendering',
        status: 'success',
        reason: `✓ ${revelationEvents.length} eventos de letter-reveal planejados`,
        details: `Fase: ${revelationPhase.id} (${revelationPhase.duration?.toFixed(1)}s)`,
      });
    } else if (revelationEvents.length > 0) {
      verifications.push({
        id: 'revelation-render',
        label: 'Revelation (PERFEITO)',
        category: 'rendering',
        status: 'warning',
        reason: `Apenas ${revelationEvents.length} eventos de revelation`,
        details: 'Esperado 8 eventos para "PERFEITO"',
      });
    } else {
      verifications.push({
        id: 'revelation-render',
        label: 'Revelation (PERFEITO)',
        category: 'rendering',
        status: 'unknown',
        reason: 'Fase revelation sem eventos configurados',
      });
    }
  }
  
  return verifications;
}

/**
 * Calcula estatísticas gerais das verificações
 */
export function getCorrectionStats(verifications: CorrectionVerification[]) {
  const total = verifications.length;
  const success = verifications.filter(v => v.status === 'success').length;
  const error = verifications.filter(v => v.status === 'error').length;
  const warning = verifications.filter(v => v.status === 'warning').length;
  const unknown = verifications.filter(v => v.status === 'unknown').length;
  
  const healthPercentage = total > 0 
    ? Math.round((success / (total - unknown)) * 100) || 0
    : 0;
  
  return {
    total,
    success,
    error,
    warning,
    unknown,
    healthPercentage,
    hasErrors: error > 0,
    hasWarnings: warning > 0,
  };
}
