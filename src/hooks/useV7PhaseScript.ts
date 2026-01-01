// Hook to load and transform V7 lessons into phase-based format for V7PhasePlayer
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { V7LessonScript, V7Phase, V7Scene } from '@/components/lessons/v7/cinematic/phases/V7PhaseController';
import type {
  WordTimestamp,
  V7PipelineAct,
  V7AudioBehavior,
  V7TimeoutConfig,
  V7AnchorPoint,
  normalizeTimestamp,
  extractNarration
} from '@/types/v7-unified.types';

// ============================================================================
// DATABASE TYPES - For type-safe data fetching
// ============================================================================

/** Raw timestamp format from database (may have different field names) */
interface RawWordTimestamp {
  word: string;
  start?: number;
  end?: number;
  start_time?: number;  // Legacy format
  end_time?: number;    // Legacy format
}

/** V7 lesson content structure from database */
interface V7LessonContent {
  model?: string;
  version?: string;
  // ✅ V7-vv: Phases diretamente no content (Pipeline Cinematográfico)
  phases?: any[];
  metadata?: {
    title?: string;
    subtitle?: string;
    totalDuration?: number;
    phaseCount?: number;
    [key: string]: any;
  };
  // ✅ V7-v3: New structure with phases array and anchorText-only transitions
  cinematicFlow?: {
    totalPhases?: number;
    transitionMethod?: 'anchorText-only' | 'hybrid';
    phases?: V7DatabasePhase[];
    // Legacy support
    acts?: V7DatabaseAct[];
    timeline?: { totalDuration?: number };
  };
  // Legacy: cinematic_flow snake_case
  cinematic_flow?: {
    acts?: V7DatabaseAct[];
    phases?: V7DatabasePhase[];
    timeline?: { totalDuration?: number };
  };
  cinematicStructure?: {
    acts: V7DatabaseAct[];
    totalDuration?: number;
  };
  // ✅ UNIFIED audioConfig - supports both V7-vv and legacy formats
  audioConfig?: {
    // V7-vv format
    url?: string;
    duration?: number;
    wordTimestampsCount?: number;
    // Legacy format
    mainAudioUrl?: string;
    ambientAudioUrl?: string;
    soundEffects?: {
      click?: string;
      select?: string;
      success?: string;
      error?: string;
      hint?: string;
      timeout?: string;
      whoosh?: string;
      reveal?: string;
    };
  };
  // ✅ V7.1: NO FALLBACKS - AnchorText is the ONLY sync mechanism
  anchorPoints?: Array<{
    id: string;
    keyword: string;
    phaseId: string;
    action: string;
  }>;
}

/** ✅ V7-v3: New phase structure with cinematography and triggers */
interface V7DatabasePhase {
  id?: string;
  type?: string;
  title?: string;
  order?: number;
  
  // ✅ V7-v3: Trigger-based phase start (no startTime!)
  trigger?: {
    type?: 'auto-start' | 'anchorText' | 'quiz-complete' | 'button-click' | 'playground-complete';
    previousPhaseAnchor?: string;
    previousPhaseButton?: string;
    notes?: string;
  };
  
  // ✅ V7-v3: AnchorText-only transitions (no endTime!)
  anchorText?: {
    endPhrase?: string;      // Transits to next phase when detected
    pausePhrase?: string;    // Pauses audio when detected (for interactions)
    notes?: string;
  };
  
  // ✅ V7-v3: Narration with text only (timing from wordTimestamps)
  narration?: {
    text?: string;
    estimatedDuration?: number;
  };
  
  // ✅ V7-v3: Detailed cinematography per phase
  cinematography?: {
    opening?: {
      type?: string;
      effect?: string;
      duration?: number;
    };
    scenes?: Array<{
      id?: string;
      trigger?: string;  // 'auto', 'word:keyword', 'pause:keyword', 'delay:seconds'
      layout?: string;
      visual?: Record<string, unknown>;
      animation?: string;
      effects?: Record<string, unknown>;
      interaction?: Record<string, unknown>;
      left?: Record<string, unknown>;
      right?: Record<string, unknown>;
      overlay?: Record<string, unknown>;
    }>;
    duringInteraction?: {
      background?: string;
      ambient?: string;
    };
    closing?: {
      type?: string;
      effect?: string;
      duration?: number;
    };
  };
  
  visualContent?: Record<string, unknown>;
  interaction?: Record<string, unknown>;
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
  soundEffects?: Record<string, unknown>;
  transitions?: Record<string, unknown>;
}

/** Act structure from database (supports both V7-v2 and legacy) */
interface V7DatabaseAct {
  id?: string;
  type?: string;
  title?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;

  // V7-v2 format (direct)
  narration?: string;
  visual?: Record<string, unknown>;
  audio?: Record<string, unknown>;
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
  interaction?: Record<string, unknown>;
  transitions?: Record<string, unknown>;
  anchorPoints?: Array<{ keyword: string; action: string }>;

  // Legacy format (nested in content)
  content?: {
    visual?: Record<string, unknown>;
    audio?: {
      narration?: string;
      narrationSegment?: { text: string };
    };
    interaction?: Record<string, unknown>;
    audioBehavior?: V7AudioBehavior;
    timeout?: V7TimeoutConfig;
  };
  narrativeSegment?: string;
  visualEffects?: Record<string, unknown>;
}

// ✅ V7-vv Definitive: Feedback audio structure
interface FeedbackAudioSegment {
  id: string;
  url: string;
  duration: number;
  wordTimestamps?: Array<{ word: string; start: number; end: number }>;
}

interface UseV7PhaseScriptResult {
  script: V7LessonScript | null;
  audioUrl: string | null;
  wordTimestamps: Array<{ word: string; start: number; end: number }>;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  // ✅ DEBUG: For V7DebugPanel
  rawContent: any;
  detectionPath: 'v7-vv' | 'emergency' | 'v7-v3' | 'legacy' | 'error' | null;
  // ✅ V7-vv Definitive: Feedback audios for quiz
  feedbackAudios: Record<string, FeedbackAudioSegment> | null;
}

export function useV7PhaseScript(lessonId: string | undefined): UseV7PhaseScriptResult {
  const [script, setScript] = useState<V7LessonScript | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wordTimestamps, setWordTimestamps] = useState<Array<{ word: string; start: number; end: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ✅ DEBUG: Track raw content and detection path
  const [rawContent, setRawContent] = useState<any>(null);
  const [detectionPath, setDetectionPath] = useState<'v7-vv' | 'emergency' | 'v7-v3' | 'legacy' | 'error' | null>(null);
  // ✅ V7-vv Definitive: Feedback audios for quiz
  const [feedbackAudios, setFeedbackAudios] = useState<Record<string, FeedbackAudioSegment> | null>(null);
  const { toast } = useToast();

  const fetchLesson = useCallback(async () => {
    console.log('[useV7PhaseScript] 🚀 Starting fetch for lessonId:', lessonId);
    
    if (!lessonId) {
      console.log('[useV7PhaseScript] ❌ No lessonId provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useV7PhaseScript] 📡 Fetching from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();

      console.log('[useV7PhaseScript] 📦 Supabase response:', {
        hasData: !!data,
        error: fetchError?.message,
        dataId: data?.id,
        dataTitle: data?.title
      });

      if (fetchError) {
        console.error('[useV7PhaseScript] ❌ Fetch error:', fetchError);
        throw fetchError;
      }
      if (!data) {
        console.error('[useV7PhaseScript] ❌ No data returned for lessonId:', lessonId);
        throw new Error('Aula não encontrada');
      }

      console.log('[useV7PhaseScript] ✅ Lesson data received:', {
        id: data.id,
        title: data.title,
        hasContent: !!data.content,
        hasTimestamps: !!data.word_timestamps,
        hasAudioUrl: !!data.audio_url
      });

      // ✅ P1 FIX: Use typed interfaces instead of 'as any'
      const content = data.content as V7LessonContent | null;
      const rawTimestamps = (data.word_timestamps as unknown as RawWordTimestamp[] | null) || [];

      // ✅ CRITICAL FIX: Normalize timestamps - some lessons use start_time/end_time, others use start/end
      const timestamps: WordTimestamp[] = rawTimestamps.map((ts: RawWordTimestamp) => ({
        word: ts.word || '',
        start: ts.start ?? ts.start_time ?? 0,
        end: ts.end ?? ts.end_time ?? 0
      }));
      
      console.log('[useV7PhaseScript] ✅ Normalized timestamps:', timestamps.length, 'words');
      if (timestamps.length > 0) {
        console.log('[useV7PhaseScript] First word:', timestamps[0]);
        console.log('[useV7PhaseScript] Last word:', timestamps[timestamps.length - 1]);
      }

      // ============================================================================
      // ✅ V7-vv DETECTION: Pipeline Cinematográfico - Caminho Simplificado
      // Se a aula foi criada pelo V7-vv Pipeline, os dados já vêm prontos
      // SEM necessidade de transformação - zero fallbacks
      // ============================================================================
      const contentAny = content as any;

      // ✅ DEBUG: Save raw content for V7DebugPanel
      setRawContent(contentAny);

      // ✅ DEBUG: Log ANTES da detecção para ver exatamente o que está chegando
      console.log('[useV7PhaseScript] 🔍 CONTENT ANALYSIS:');
      console.log('[useV7PhaseScript] - content exists:', !!content);
      console.log('[useV7PhaseScript] - content.version:', contentAny?.version);
      console.log('[useV7PhaseScript] - content.model:', contentAny?.model);
      console.log('[useV7PhaseScript] - content.phases:', Array.isArray(contentAny?.phases) ? `array(${contentAny.phases.length})` : typeof contentAny?.phases);
      console.log('[useV7PhaseScript] - content.cinematicFlow:', !!contentAny?.cinematicFlow);
      console.log('[useV7PhaseScript] - content.cinematic_flow:', !!contentAny?.cinematic_flow);
      console.log('[useV7PhaseScript] - content keys:', content ? Object.keys(content) : 'N/A');

      // ✅ V7-vv DETECTION: SUPER SIMPLIFICADA - se tem phases[] é V7-vv!
      // CRITÉRIO ÚNICO: Se content.phases é um array válido, usar V7-vv path!
      const hasValidPhases = Array.isArray(contentAny?.phases) && contentAny.phases.length > 0;
      
      // ✅ Indicadores secundários (para debug apenas)
      const hasV7vvVersion = contentAny?.version === 'vv' || contentAny?.version === 'VV';
      const hasV7vvModel = contentAny?.model === 'v7-cinematic';
      const hasV7vvGeneratedBy = contentAny?.metadata?.generatedBy === 'V7-vv' || contentAny?.generatedBy === 'V7-vv';
      const hasV7vvAudioStructure = !!contentAny?.audio?.mainAudio;
      
      // ✅ CRITÉRIO SIMPLIFICADO: Se tem phases[], é V7-vv! Ponto final.
      const isV7vvFormat = hasValidPhases;
      
      console.log('[useV7PhaseScript] 🎯 V7-vv Detection SIMPLIFICADA:', {
        hasValidPhases,
        isV7vvFormat,
        phasesCount: contentAny?.phases?.length || 0,
        // Debug secondary indicators
        hasV7vvVersion,
        hasV7vvModel,
        hasV7vvGeneratedBy,
        hasV7vvAudioStructure
      });

      if (isV7vvFormat) {
        console.log('[useV7PhaseScript] 🎬 V7-vv DETECTED - Usando caminho simplificado!');
        setDetectionPath('v7-vv');
        
        // ✅ DEBUG LOGS SOLICITADOS
        console.log('[V7-vv DEBUG] ==========================================');
        console.log('[V7-vv DEBUG] FORMATO V7-vv DETECTADO!');
        console.log('[V7-vv DEBUG] content.version:', contentAny?.version);
        console.log('[V7-vv DEBUG] content.model:', contentAny?.model);
        console.log('[V7-vv DEBUG] phases count:', contentAny?.phases?.length);
        console.log('[V7-vv DEBUG] Primeira phase:', JSON.stringify(contentAny?.phases?.[0], null, 2));
        console.log('[V7-vv DEBUG] ==========================================');

        // V7-vv: Dados já vêm prontos do Pipeline
        const v7vvContent = contentAny;
        const v7vvPhases = v7vvContent.phases || [];

        // Usar totalDuration do metadata ou calcular de wordTimestamps
        const v7vvTotalDuration = v7vvContent.metadata?.totalDuration ||
          (timestamps.length > 0 ? timestamps[timestamps.length - 1].end : 120);

        console.log('[useV7PhaseScript] V7-vv phases:', v7vvPhases.length);
        console.log('[useV7PhaseScript] V7-vv totalDuration:', v7vvTotalDuration);

        // ✅ V7-vv: Usar phases diretamente (já vêm com anchorActions, scenes, etc)
        // Suporte a múltiplos formatos de audio URL
        const audioUrlResolved = data.audio_url || 
          v7vvContent.audioConfig?.url || 
          v7vvContent.audio?.mainAudio?.url || 
          '';
        
        const lessonScript: V7LessonScript = {
          id: data.id,
          title: v7vvContent.metadata?.title || data.title,
          totalDuration: v7vvTotalDuration,
          audioUrl: audioUrlResolved,
          wordTimestamps: timestamps,
          phases: v7vvPhases,
          audioConfig: {
            mainAudioUrl: audioUrlResolved,
          },
          anchorPoints: [],
        };

        console.log('[useV7PhaseScript] ✅ V7-vv Script criado:', {
          id: lessonScript.id,
          title: lessonScript.title,
          phases: lessonScript.phases.length,
          totalDuration: lessonScript.totalDuration,
        });

        // ✅ V7-vv Definitive: Extract feedbackAudios from audio config
        const v7vvFeedbackAudios = v7vvContent.audio?.feedbackAudios || null;
        if (v7vvFeedbackAudios) {
          console.log('[useV7PhaseScript] 🎧 V7-vv feedbackAudios encontrados:', Object.keys(v7vvFeedbackAudios));
        }
        setFeedbackAudios(v7vvFeedbackAudios);

        setScript(lessonScript);
        setAudioUrl(data.audio_url || null);
        setWordTimestamps(timestamps);
        setIsLoading(false);
        return; // ✅ Caminho rápido - sem mais transformações!
      }

      // ✅ LOG: V7-vv não detectado - vamos entender por quê
      console.log('[useV7PhaseScript] ⚠️ V7-vv NOT DETECTED - usando caminho legacy');
      console.log('[useV7PhaseScript] ⚠️ Razões da falha:');
      console.log('[useV7PhaseScript]   - version !== "vv":', contentAny?.version);
      console.log('[useV7PhaseScript]   - model !== "v7-cinematic":', contentAny?.model);
      console.log('[useV7PhaseScript]   - phases is array:', Array.isArray(contentAny?.phases));
      console.log('[useV7PhaseScript]   - phases length:', contentAny?.phases?.length || 0);
      console.log('[useV7PhaseScript]   - metadata.generatedBy:', contentAny?.metadata?.generatedBy);

      // ============================================================================
      // 🚨 EMERGENCY FALLBACK: Se content.phases existe, usar diretamente!
      // Isso resolve o caso onde a detecção V7-vv falhou mas os dados estão lá
      // ============================================================================
      if (Array.isArray(contentAny?.phases) && contentAny.phases.length > 0) {
        console.log('[useV7PhaseScript] 🚨 EMERGENCY FALLBACK: Usando content.phases diretamente!');
        console.log('[useV7PhaseScript] 🚨 Phases encontradas:', contentAny.phases.length);
        setDetectionPath('emergency');

        const v7vvContent = contentAny;
        const v7vvPhases = v7vvContent.phases || [];
        const v7vvTotalDuration = v7vvContent.metadata?.totalDuration ||
          (timestamps.length > 0 ? timestamps[timestamps.length - 1].end : 120);

        // ✅ Suporte a múltiplos formatos de audio URL (mesmo do caminho principal)
        const audioUrlResolved = data.audio_url || 
          v7vvContent.audioConfig?.url || 
          v7vvContent.audio?.mainAudio?.url || 
          '';

        const lessonScript: V7LessonScript = {
          id: data.id,
          title: v7vvContent.metadata?.title || data.title,
          totalDuration: v7vvTotalDuration,
          audioUrl: audioUrlResolved,
          wordTimestamps: timestamps,
          phases: v7vvPhases,
          audioConfig: {
            mainAudioUrl: audioUrlResolved,
          },
          anchorPoints: [],
        };

        console.log('[useV7PhaseScript] ✅ EMERGENCY Script criado:', {
          id: lessonScript.id,
          title: lessonScript.title,
          phases: lessonScript.phases.length,
          totalDuration: lessonScript.totalDuration,
        });

        // ✅ V7-vv Definitive: Extract feedbackAudios from audio config (emergency path)
        const emergencyFeedbackAudios = v7vvContent.audio?.feedbackAudios || null;
        if (emergencyFeedbackAudios) {
          console.log('[useV7PhaseScript] 🎧 EMERGENCY feedbackAudios encontrados:', Object.keys(emergencyFeedbackAudios));
        }
        setFeedbackAudios(emergencyFeedbackAudios);

        setScript(lessonScript);
        setAudioUrl(data.audio_url || null);
        setWordTimestamps(timestamps);
        setIsLoading(false);
        return; // ✅ Fallback de emergência - não vai para o caminho legacy!
      }

      // ============================================================================
      // LEGACY PATH: V7-v3 e anteriores (mantido para compatibilidade)
      // ============================================================================

      // ✅ V7-v3: Detect new structure with phases array (anchorText-only)
      const rawPhases = content?.cinematicFlow?.phases || 
                        content?.cinematic_flow?.phases || 
                        [];
      const isV7v3Format = rawPhases.length > 0;
      
      // ✅ Legacy: Check if using old cinematic_flow structure with acts
      const rawActs = content?.cinematicFlow?.acts || 
                      content?.cinematic_flow?.acts || 
                      content?.cinematicStructure?.acts || 
                      [];
      const hasCinematicFlow = rawActs.length > 0 || isV7v3Format;

      // ✅ PRIORITY ORDER for total duration:
      // 1. word_timestamps (actual audio length) - most accurate
      // 2. cinematic_flow.timeline.totalDuration (pipeline-calculated)
      // 3. Sum of act durations (may be pre-scaled by pipeline)
      // 4. estimated_time in minutes (fallback)
      const audioDurationFromTimestamps = timestamps.length > 0
        ? Math.ceil(timestamps[timestamps.length - 1].end)
        : null;

      const totalDuration = audioDurationFromTimestamps ||
        content?.cinematic_flow?.timeline?.totalDuration ||
        content?.cinematicFlow?.timeline?.totalDuration ||
        (data.estimated_time || 8) * 60;

      console.log('[useV7PhaseScript] Loading lesson:', data.id);
      console.log('[useV7PhaseScript] ✅ V7-v3 format detected:', isV7v3Format);
      console.log('[useV7PhaseScript] Has cinematic_flow:', hasCinematicFlow);
      console.log('[useV7PhaseScript] Phases count (v3):', rawPhases.length);
      console.log('[useV7PhaseScript] Acts count (legacy):', rawActs.length);
      console.log('[useV7PhaseScript] Audio duration from timestamps:', audioDurationFromTimestamps);
      console.log('[useV7PhaseScript] Total duration used:', totalDuration);

      // ✅ V7-v3: Use new transformation for phases array, otherwise use legacy acts
      let phases: V7Phase[];
      if (isV7v3Format) {
        console.log('[useV7PhaseScript] 🚀 Using V7-v3 transformPhasesToV7Phases');
        setDetectionPath('v7-v3');
        phases = transformPhasesToV7Phases(rawPhases, totalDuration, timestamps);
      } else {
        console.log('[useV7PhaseScript] 📦 Using legacy transformActsToPhases');
        setDetectionPath('legacy');
        console.log('[useV7PhaseScript] ⚠️ ATENÇÃO: rawActs está vazio?', rawActs.length === 0);
        console.log('[useV7PhaseScript] ⚠️ Se rawActs vazio, vai dar erro "Nenhum act encontrado"');
        console.log('[useV7PhaseScript] ⚠️ Isso significa que a detecção V7-vv FALHOU!');
        console.log('[useV7PhaseScript] ⚠️ Verifique se content.version === "vv" ou content.model === "v7-cinematic"');
        phases = transformActsToPhases(rawActs, totalDuration, hasCinematicFlow, timestamps);
      }

      // ✅ V7.1: Extract lesson-level configs (NO FALLBACKS - AnchorText only)
      const audioConfig = content?.audioConfig || {};

      const globalAnchorPoints: V7AnchorPoint[] = (content?.anchorPoints || []).map(ap => ({
        id: ap.id,
        keyword: ap.keyword,
        phaseId: ap.phaseId,
        action: (ap.action === 'pause' || ap.action === 'show' || ap.action === 'highlight' || ap.action === 'trigger') 
          ? ap.action 
          : 'pause' as const,
      }));

      // Create script
      const lessonScript: V7LessonScript = {
        id: data.id,
        title: data.title,
        totalDuration,
        audioUrl: data.audio_url || '',
        wordTimestamps: timestamps,
        phases,
        // ✅ V7.1: Lesson-level configs (NO FALLBACKS - AnchorText only)
        audioConfig: {
          mainAudioUrl: data.audio_url || audioConfig.mainAudioUrl,
          ambientAudioUrl: audioConfig.ambientAudioUrl,
          soundEffects: audioConfig.soundEffects,
        },
        anchorPoints: globalAnchorPoints,
      };

      setScript(lessonScript);
      setAudioUrl(data.audio_url || null);
      setWordTimestamps(timestamps);
    } catch (err: any) {
      console.error('[useV7PhaseScript] Error:', err);
      setError(err.message);
      setDetectionPath('error');
      toast({
        title: 'Erro ao carregar aula',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, toast]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return { script, audioUrl, wordTimestamps, isLoading, error, refetch: fetchLesson, rawContent, detectionPath, feedbackAudios };
}

// ============================================================================
// V7-v3 TRANSFORMATION: Phases with anchorText-only transitions
// ============================================================================

/**
 * ✅ V7-v3: Transform new phases structure to V7Phase format
 * Uses ONLY anchorText for transitions - no startTime/endTime
 */
function transformPhasesToV7Phases(
  phases: V7DatabasePhase[],
  totalDuration: number,
  wordTimestamps: Array<{ word: string; start: number; end: number }>
): V7Phase[] {
  if (!phases || phases.length === 0) {
    console.error('[transformPhasesToV7Phases] ❌ ERRO CRÍTICO: Nenhuma phase encontrada!');
    throw new Error('Nenhuma phase encontrada na aula V7-v3.');
  }

  console.log(`[transformPhasesToV7Phases] 🚀 Processing ${phases.length} phases (anchorText-only mode)`);
  
  const result: V7Phase[] = [];
  
  // ✅ V7-v28: Loading phase is shown BEFORE audio starts (negative time range)
  result.push({
    id: 'loading',
    title: 'Carregando',
    startTime: -10,
    endTime: 0,
    type: 'loading',
    scenes: [],
    mood: 'neutral',
  });

  // ✅ Calculate estimated timings from wordTimestamps based on anchorText
  // This is for visual purposes only - actual transitions use anchorText detection
  let estimatedCurrentTime = 0; // ✅ V7-v28: Start at 0 since phases use DB timestamps
  
  phases.forEach((phase, index) => {
    const phaseType = mapActTypeToPhaseType(phase.type || 'dramatic');
    
    // ✅ Find timing from wordTimestamps using anchorText.endPhrase
    let estimatedEndTime = estimatedCurrentTime + 10; // Default 10s per phase
    
    if (phase.anchorText?.endPhrase && wordTimestamps.length > 0) {
      const anchorWord = findWordTimestamp(wordTimestamps, phase.anchorText.endPhrase);
      if (anchorWord) {
        estimatedEndTime = anchorWord.end + 0.5; // Small buffer after anchor word
        console.log(`[transformPhasesToV7Phases] Phase "${phase.id}": anchor "${phase.anchorText.endPhrase}" found at ${anchorWord.end.toFixed(1)}s`);
      }
    }
    
    // For phases with pausePhrase, find when audio should pause
    let pauseKeywords: string[] = [];
    if (phase.anchorText?.pausePhrase) {
      pauseKeywords = [phase.anchorText.pausePhrase];
      console.log(`[transformPhasesToV7Phases] Phase "${phase.id}": will pause at "${phase.anchorText.pausePhrase}"`);
    }
    
    // ✅ Extract visual and interaction content
    const visualContent = phase.visualContent || {};
    const interaction = phase.interaction || {};
    const cinematography = phase.cinematography || {};
    
    // ✅ Generate scenes from cinematography
    const scenes = generateScenesFromCinematography(
      phase,
      phaseType,
      estimatedCurrentTime,
      estimatedEndTime - estimatedCurrentTime,
      wordTimestamps
    );
    
    // ✅ Create anchorActions from anchorText config
    const anchorActions: Array<{
      id: string;
      keyword: string;
      type: 'pause' | 'trigger' | 'show' | 'highlight';
      targetId?: string;
      once?: boolean;
    }> = [];
    
    if (phase.anchorText?.pausePhrase) {
      anchorActions.push({
        id: `anchor-pause-${phase.id}`,
        keyword: phase.anchorText.pausePhrase,
        type: 'pause',
        once: true,
      });
    }
    
    if (phase.anchorText?.endPhrase) {
      anchorActions.push({
        id: `anchor-next-${phase.id}`,
        keyword: phase.anchorText.endPhrase,
        type: 'trigger',
        targetId: phases[index + 1]?.id,
        once: true,
      });
    }
    
    // Determine if phase should auto-advance
    const isInteractivePhase = 
      phaseType === 'interaction' || 
      phaseType === 'playground' || 
      phaseType === 'secret-reveal' ||
      phase.trigger?.type === 'quiz-complete' ||
      phase.trigger?.type === 'button-click' ||
      phase.trigger?.type === 'playground-complete';
    
    const v7Phase: V7Phase = {
      id: phase.id || `phase-${index + 1}`,
      title: phase.title || `Fase ${index + 1}`,
      startTime: estimatedCurrentTime,
      endTime: estimatedEndTime,
      type: phaseType,
      mood: extractMood(visualContent),
      autoAdvance: !isInteractivePhase,
      
      // ✅ V7-v3: AnchorText-based transitions
      anchorActions: anchorActions.length > 0 ? anchorActions : undefined,
      pauseKeywords: pauseKeywords.length > 0 ? pauseKeywords : undefined,
      
      // ✅ Audio and timeout configs
      audioBehavior: phase.audioBehavior,
      timeout: phase.timeout,
      
      // ✅ Interaction data for quiz/playground phases
      interaction: interaction,
      
      // ✅ Generated scenes
      scenes,
    };
    
    result.push(v7Phase);
    
    // Update estimated time for next phase
    estimatedCurrentTime = estimatedEndTime;
    
    console.log(`[transformPhasesToV7Phases] ✅ Phase ${index + 1}/${phases.length}: "${phase.title}" (${phaseType}) @ ${v7Phase.startTime.toFixed(1)}s-${v7Phase.endTime.toFixed(1)}s`);
  });
  
  console.log(`[transformPhasesToV7Phases] ✅ Completed: ${result.length} phases total (including loading)`);
  
  return result;
}

/**
 * Find word timestamp by searching for a phrase in the wordTimestamps array
 */
function findWordTimestamp(
  wordTimestamps: Array<{ word: string; start: number; end: number }>,
  phrase: string
): { word: string; start: number; end: number } | null {
  const normalizeWord = (w: string) => 
    w.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:'"()[\]{}…]+/g, '')
      .trim();
  
  // Split phrase into words
  const phraseWords = phrase.split(/\s+/).map(normalizeWord).filter(w => w.length > 0);
  
  if (phraseWords.length === 0) return null;
  
  // For single word, find exact match
  if (phraseWords.length === 1) {
    const target = phraseWords[0];
    const match = wordTimestamps.find(ts => normalizeWord(ts.word) === target);
    return match || null;
  }
  
  // For multi-word phrase, find the LAST word of the phrase
  const lastWord = phraseWords[phraseWords.length - 1];
  
  // Find occurrences of the last word
  for (let i = 0; i < wordTimestamps.length; i++) {
    const ts = wordTimestamps[i];
    if (normalizeWord(ts.word) === lastWord) {
      // Check if previous words match
      let allMatch = true;
      for (let j = 0; j < phraseWords.length - 1; j++) {
        const prevIndex = i - (phraseWords.length - 1 - j);
        if (prevIndex < 0 || normalizeWord(wordTimestamps[prevIndex].word) !== phraseWords[j]) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        return ts; // Return the last word's timestamp
      }
    }
  }
  
  // Fallback: just find the last word anywhere
  const fallback = wordTimestamps.find(ts => normalizeWord(ts.word) === lastWord);
  return fallback || null;
}

/**
 * Generate V7Scenes from V7-v3 cinematography structure
 */
function generateScenesFromCinematography(
  phase: V7DatabasePhase,
  phaseType: V7Phase['type'],
  startTime: number,
  duration: number,
  wordTimestamps: Array<{ word: string; start: number; end: number }>
): V7Scene[] {
  const scenes: V7Scene[] = [];
  const cinematography = phase.cinematography;
  const visualContent = phase.visualContent || {};
  const narrationText = phase.narration?.text || '';
  
  // Common fields for all scenes
  const commonFields = {
    narration: narrationText,
  };
  
  // If no cinematography defined, generate default scenes based on phase type
  if (!cinematography?.scenes || cinematography.scenes.length === 0) {
    return generateDefaultScenesForPhaseType(phase, phaseType, startTime, duration, commonFields);
  }
  
  // Process cinematography scenes
  let sceneStartTime = startTime;
  const sceneDuration = duration / Math.max(1, cinematography.scenes.length);
  
  cinematography.scenes.forEach((scene, index) => {
    // Parse trigger to determine timing
    let sceneTime = sceneStartTime;
    if (scene.trigger) {
      if (scene.trigger.startsWith('word:')) {
        // Find word in timestamps
        const word = scene.trigger.replace('word:', '');
        const ts = findWordTimestamp(wordTimestamps, word);
        if (ts) sceneTime = ts.start;
      } else if (scene.trigger.startsWith('delay:')) {
        const delay = parseFloat(scene.trigger.replace('delay:', ''));
        sceneTime = startTime + delay;
      } else if (scene.trigger.startsWith('pause:')) {
        // Pause scenes are triggered by anchor detection
        sceneTime = sceneStartTime;
      }
    }
    
    // Determine scene type and animation
    const visual = scene.visual || {};
    let sceneType: V7Scene['type'] = 'text-reveal';
    let animation: V7Scene['animation'] = 'fade';
    
    if (visual.element) {
      const element = String(visual.element);
      if (element.includes('number')) sceneType = 'number-reveal';
      else if (element.includes('split')) sceneType = 'split-screen';
      else if (element.includes('quiz')) sceneType = 'quiz';
      else if (element.includes('playground')) sceneType = 'playground';
      else if (element.includes('letterbox')) sceneType = 'letterbox';
    }
    
    if (scene.animation) {
      animation = scene.animation as V7Scene['animation'];
    }
    
    scenes.push({
      id: scene.id || `${phase.id}-scene-${index}`,
      type: sceneType,
      startTime: sceneTime,
      duration: sceneDuration,
      content: {
        ...visualContent,
        ...visual,
        ...commonFields,
      },
      animation,
    });
    
    sceneStartTime = sceneTime + sceneDuration;
  });
  
  return scenes;
}

/**
 * Generate default scenes for a phase type when no cinematography is defined
 */
function generateDefaultScenesForPhaseType(
  phase: V7DatabasePhase,
  phaseType: V7Phase['type'],
  startTime: number,
  duration: number,
  commonFields: Record<string, unknown>
): V7Scene[] {
  const visual = phase.visualContent || {} as Record<string, any>;
  const scenes: V7Scene[] = [];
  
  switch (phaseType) {
    case 'dramatic':
      scenes.push({
        id: `${phase.id}-main`,
        type: 'number-reveal',
        startTime,
        duration,
        content: {
          number: String(visual.mainValue || visual.number || '98%'),
          subtitle: String(visual.subtitle || ''),
          highlightWord: String(visual.highlightWord || ''),
          ...commonFields,
        },
        animation: 'count-up',
      });
      break;
      
    case 'narrative':
      scenes.push({
        id: `${phase.id}-main`,
        type: 'split-screen',
        startTime,
        duration,
        content: {
          title: String(visual.title || phase.title || ''),
          leftCard: visual.leftCard as any,
          rightCard: visual.rightCard as any,
          ...commonFields,
        },
        animation: 'slide-left',
      });
      break;
      
    case 'interaction':
      scenes.push({
        id: `${phase.id}-main`,
        type: 'quiz',
        startTime,
        duration,
        content: {
          title: String(visual.title || 'AUTO-AVALIAÇÃO'),
          subtitle: String(visual.subtitle || ''),
          ...commonFields,
        },
        animation: 'fade',
      });
      break;
      
    case 'revelation':
      scenes.push({
        id: `${phase.id}-main`,
        type: 'text-reveal',
        startTime,
        duration,
        content: {
          title: String(visual.title || phase.title || ''),
          items: Array.isArray(visual.items) ? visual.items : [],
          highlightWord: String(visual.highlightWord || ''),
          ...commonFields,
        },
        animation: 'scale-up',
      });
      break;
      
    case 'gamification':
      scenes.push({
        id: `${phase.id}-main`,
        type: 'result',
        startTime,
        duration,
        content: {
          title: String(visual.title || 'PARABÉNS!'),
          subtitle: String(visual.subtitle || ''),
          achievement: String(visual.achievement || ''),
          xp: Number(visual.xp) || 100,
          ...commonFields,
        },
        animation: 'scale-up',
      });
      break;
      
    default:
      scenes.push({
        id: `${phase.id}-main`,
        type: 'text-reveal',
        startTime,
        duration,
        content: {
          mainText: String(visual.title || phase.title || ''),
          ...commonFields,
        },
        animation: 'fade',
      });
  }
  
  return scenes;
}


// ✅ Now receives wordTimestamps to auto-generate pauseKeywords for interactive phases
function transformActsToPhases(
  acts: any[], 
  totalDuration: number, 
  hasCinematicFlow: boolean = false,
  wordTimestamps: Array<{ word: string; start: number; end: number }> = []
): V7Phase[] {
  // ⚠️ NO FALLBACK - If no acts, throw error immediately
  if (!acts || acts.length === 0) {
    console.error('[transformActsToPhases] ❌ ERRO CRÍTICO: Nenhum act encontrado no banco de dados!');
    throw new Error('Nenhum act encontrado na aula. Verifique o conteúdo no banco de dados.');
  }

  let currentTime = 0;
  const phases: V7Phase[] = [];

  // ✅ Check if acts already have pre-scaled timings from pipeline v2.0+
  const hasPreScaledTimings = acts[0]?.startTime !== undefined && acts[0]?.endTime !== undefined;

  // Calculate total duration from acts
  let totalActsDuration: number;
  if (hasPreScaledTimings) {
    // Use the last act's endTime as total
    totalActsDuration = acts[acts.length - 1].endTime || totalDuration;
  } else {
    // Legacy: sum up durations
    totalActsDuration = acts.reduce((sum, act) => {
      return sum + (act.duration || 60);
    }, 0);
  }

  // Available time after loading phase (3s)
  const availableTime = totalDuration - 3;

  // ✅ CRITICAL FIX: Even if acts have pre-scaled timings, check if they match the actual audio duration
  // If the pre-scaled timings are from old pipeline (wrong duration), we need to RE-SCALE them
  const preScaledTotal = hasPreScaledTimings ? totalActsDuration : 0;
  const needsReScaling = hasPreScaledTimings && Math.abs(preScaledTotal - availableTime) > 5;

  // Scale factor: needed if acts DON'T have pre-scaled timings OR if pre-scaled timings are wrong
  const scaleFactor = (!hasPreScaledTimings || needsReScaling)
    ? (totalActsDuration > 0 ? availableTime / totalActsDuration : 1)
    : 1;

  console.log(`[transformActsToPhases] Pre-scaled timings: ${hasPreScaledTimings}`);
  console.log(`[transformActsToPhases] Pre-scaled total: ${preScaledTotal}s, Available time: ${availableTime}s`);
  console.log(`[transformActsToPhases] Needs re-scaling: ${needsReScaling}`);
  console.log(`[transformActsToPhases] Scale factor: ${scaleFactor.toFixed(2)} (${totalActsDuration}s acts → ${availableTime}s audio)`);

  // ✅ V7-v28: Loading phase is shown BEFORE audio starts (negative time range)
  // This ensures it doesn't conflict with actual content phases
  phases.push({
    id: 'loading',
    title: 'Carregando',
    startTime: -10, // Before audio starts
    endTime: 0,     // Ends when audio starts at 0
    type: 'loading',
    scenes: [],
    mood: 'neutral',
  });
  // ✅ V7-v28: currentTime starts at 0 since phases use DB timestamps directly
  currentTime = 0;

  acts.forEach((act, index) => {
    const phaseType = mapActTypeToPhaseType(act.type);

    // ✅ Calculate timings - ALWAYS apply scaleFactor if re-scaling is needed
    let startTime: number;
    let endTime: number;
    let duration: number;

    // Minimum duration per phase type to ensure content is visible
    const minDurations: Record<string, number> = {
      dramatic: 8,
      narrative: 8,
      interaction: 10,
      playground: 15,
      revelation: 8,
      gamification: 5,
    };
    const minDuration = minDurations[phaseType] || 5;

    if (hasPreScaledTimings && act.startTime !== undefined && act.endTime !== undefined) {
      // ✅ V7-v28 FIX: Use timestamps from DB directly, WITHOUT adding 3s offset here
      // The +3s offset is already added by usePhaseController when comparing to audio time
      // Adding it here causes DOUBLE offset!
      startTime = act.startTime;
      endTime = act.endTime;
      duration = endTime - startTime;
      
      console.log(`[transformActsToPhases] Act ${index + 1}: using DB timestamps ${startTime.toFixed(1)}s-${endTime.toFixed(1)}s (duration: ${duration.toFixed(1)}s)`);
    } else {
      // Legacy: scale manually
      const originalDuration = act.duration || 60;
      duration = Math.max(minDuration, originalDuration * scaleFactor);
      startTime = currentTime;
      endTime = currentTime + duration;
    }

    console.log(`[transformActsToPhases] Act ${index + 1}: "${act.type}" → phase "${phaseType}" (${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s) [duration: ${duration.toFixed(1)}s]`);

    currentTime = endTime; // Update for next iteration
    
    // ✅ V7-v2: Extract visual and audio from BOTH act level and act.content
    // V7-v2 format has visual/audio at act level
    // Legacy format has them nested in content
    const visualData = act.visual || act.content?.visual;
    const audioData = act.audio || act.content?.audio;
    const interactionData = act.interaction || act.content?.interaction;

    // ✅ V7-v2: Extract audioBehavior and timeout configs
    const audioBehavior = act.audioBehavior || act.content?.audioBehavior || interactionData?.audioBehavior;
    const timeout = act.timeout || act.content?.timeout || interactionData?.timeout;
    
    // ✅ CRITICAL: Extract anchorActions from act for pause/show/highlight functionality
    // Can be at act level OR in interaction.anchorActions
    let rawAnchorActions = act.anchorActions || 
                           interactionData?.anchorActions || 
                           act.content?.anchorActions ||
                           [];
    
    // 🔍 DIAGNOSTIC LOG: Show what's in the act object
    console.log(`[transformActsToPhases] 🔍 Act ${act.id}:`, {
      hasAnchorActions: !!act.anchorActions,
      rawAnchorActions: act.anchorActions,
      hasPauseKeyword: !!act.pauseKeyword,
      pauseKeyword: act.pauseKeyword,
      hasPauseKeywords: !!act.pauseKeywords,
      pauseKeywords: act.pauseKeywords,
      interactionPauseKeyword: interactionData?.pauseKeyword,
      contentPauseKeyword: act.content?.pauseKeyword,
    });
    
    // ✅ V7-v29 FIX: Also convert SINGLE pauseKeyword (string) to anchorAction
    // The DB often has pauseKeyword: "uso atual" instead of anchorActions array
    if (rawAnchorActions.length === 0) {
      const singlePauseKeyword = act.pauseKeyword || 
                                 interactionData?.pauseKeyword || 
                                 act.content?.pauseKeyword ||
                                 act.content?.interaction?.pauseKeyword;
      
      if (singlePauseKeyword && typeof singlePauseKeyword === 'string') {
        console.log(`[transformActsToPhases] ✅ FOUND pauseKeyword: "${singlePauseKeyword}" - converting to anchorAction`);
        rawAnchorActions = [{
          id: 'pause-from-keyword',
          keyword: singlePauseKeyword,
          type: 'pause',
          once: true
        }];
      }
    }
    
    // ✅ NORMALIZE anchorActions - support both "keyword" and "pauseKeyword" formats
    let anchorActions = rawAnchorActions.map((action: any, idx: number) => {
      const keyword = action.keyword || action.pauseKeyword || '';
      const type = action.type || (action.action?.includes('pause') ? 'pause' : 'trigger');
      const id = action.id || `anchor-${idx}`;
      const normalized = {
        id,
        keyword,
        type,
        targetId: action.targetId || action.targetPhase,
        payload: action.payload,
        once: action.once ?? true,
        delayMs: action.delayMs
      };
      console.log(`[transformActsToPhases] 🔄 Normalized anchorAction: ${JSON.stringify(normalized)}`);
      return normalized;
    });
    
    // ✅ Also support legacy pauseKeywords array for backward compatibility
    let pauseKeywords = act.pauseKeywords || 
                        interactionData?.pauseKeywords || 
                        act.content?.pauseKeywords ||
                        act.content?.interaction?.pauseKeywords ||
                        [];
    
    // ✅ V7-v2.4: Extract narration text for intelligent pauseKeyword detection
    const narrationText = act.narration ||
                          audioData?.narration ||
                          audioData?.narrationSegment?.text ||
                          act.content?.narration ||
                          '';

    // ✅ AUTO-GENERATE pauseKeywords for interactive phases if NONE defined (no anchorActions AND no pauseKeywords)
    // This ensures the audio pauses even without explicit anchorActions in DB
    // ✅ V7-v26 FIX: Added 'secret-reveal' to list of phases that need auto-generated pauseKeywords
    const isInteractivePhase = phaseType === 'interaction' || phaseType === 'playground' || phaseType === 'secret-reveal';
    if (isInteractivePhase && anchorActions.length === 0 && pauseKeywords.length === 0 && wordTimestamps.length > 0) {
      // Find keywords in the audio that occur within/near this phase
      // ✅ V7-v2.4: Pass narration text for intelligent sentence-based detection
      const generatedKeywords = findPauseKeywordsForPhase(
        wordTimestamps,
        startTime,
        endTime,
        phaseType,
        narrationText // Pass narration for intelligent analysis
      );
      if (generatedKeywords.length > 0) {
        pauseKeywords = generatedKeywords;
        console.log(`[transformActsToPhases] ✨ AUTO-GENERATED pauseKeywords for ${phaseType} phase: [${pauseKeywords.join(', ')}]`);
      }
    } else if (anchorActions.length > 0) {
      console.log(`[transformActsToPhases] ✅ Using EXPLICIT anchorActions for ${phaseType} phase: [${anchorActions.map((a: any) => a.keyword).join(', ')}]`);
    }
    
    console.log(`[transformActsToPhases] Act ${index + 1}: anchorActions=${anchorActions.length}, pauseKeywords=${pauseKeywords.length}`);
    
    // ✅ V7-v4: secret-reveal phase should NOT auto-advance (user clicks button to continue)
    const isInteractivePhaseType = phaseType === 'interaction' || phaseType === 'playground' || phaseType === 'secret-reveal';
    
    const phase: V7Phase = {
      id: act.id || `phase-${index + 1}`,
      title: act.title || `Fase ${index + 1}`,
      startTime,
      endTime,
      type: phaseType,
      mood: extractMood(visualData),
      autoAdvance: !isInteractivePhaseType,
      // ✅ Add anchorActions and pauseKeywords to phase
      anchorActions: anchorActions.length > 0 ? anchorActions : undefined,
      pauseKeywords: pauseKeywords.length > 0 ? pauseKeywords : undefined,
      // ✅ V7-v2: Add audioBehavior and timeout configs
      audioBehavior: audioBehavior || undefined,
      timeout: timeout || undefined,
      // ✅ V7-v4: Propagate interaction data to phase for secret-reveal access
      interaction: phaseType === 'secret-reveal' ? interactionData : undefined,
      scenes: generateScenesForPhase(
        {
          ...act,
          content: {
            visual: visualData,
            audio: audioData,
            interaction: interactionData,
            // Pass visual.instruction as screen direction metadata
            screenDirection: visualData?.instruction || '',
          }
        },
        phaseType,
        startTime, // Use calculated startTime
        duration,
        wordTimestamps, // ✅ V7-v2.3: Pass word timestamps for micro-scene generation
        true // enableMicroScenes
      ),
    };

    phases.push(phase);
  });

  // Add gamification phase at the end (using the last phase's endTime)
  const lastPhaseEndTime = phases.length > 1 ? phases[phases.length - 1].endTime : currentTime;
  phases.push({
    id: 'gamification',
    title: 'Gamificação',
    startTime: lastPhaseEndTime,
    endTime: lastPhaseEndTime + 10, // Short gamification phase
    type: 'gamification',
    mood: 'success',
    scenes: [{
      id: 'scene-achievements',
      type: 'result',
      startTime: lastPhaseEndTime,
      duration: 10,
      content: {
        mainText: '🎊 PARABÉNS!',
        subtitle: 'Aula completa!',
        items: [
          { emoji: '✅', text: 'Aula Completada' },
          { emoji: '✅', text: 'Conhecimento Adquirido' },
        ],
        metrics: [
          { label: 'XP Ganho', value: '+150' },
        ],
      },
      animation: 'fade',
    }],
  });

  return phases;
}

/**
 * ✅ V7-v2.4: INTELLIGENT pauseKeyword auto-generation
 *
 * Uses sentence analysis to find the CORRECT pause point:
 * 1. Reconstruct text from wordTimestamps in the intro window
 * 2. Find the end of the FIRST complete sentence (intro sentence)
 * 3. Use the LAST word of that sentence as the pause keyword
 *
 * Example: "Você sabia que 98% das pessoas..." → pause after "pessoas"
 *
 * This is much more accurate than searching for generic indicator words.
 */
function findPauseKeywordsForPhase(
  wordTimestamps: Array<{ word: string; start: number; end: number }>,
  phaseStartTime: number,
  phaseEndTime: number,
  phaseType: string,
  narrationText?: string
): string[] {
  // Normalize function for word comparison
  const normalize = (word: string) =>
    word.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:'"()[\]{}]/g, '')
      .trim();

  // ✅ STRATEGY 1: Use narration text if provided (most accurate)
  if (narrationText && narrationText.trim().length > 0) {
    const pauseWord = findPauseWordFromNarration(narrationText, wordTimestamps, phaseStartTime);
    if (pauseWord) {
      console.log(`[findPauseKeywords] ✨ NARRATION STRATEGY: Found pause word "${pauseWord}" from narration text`);
      return [pauseWord];
    }
  }

  // ✅ STRATEGY 2: Reconstruct text from wordTimestamps and find sentence boundaries
  // Search window: start at phase intro (before visual appears) to early phase
  const searchStartTime = Math.max(0, phaseStartTime - 8);
  const searchEndTime = phaseStartTime + (phaseEndTime - phaseStartTime) * 0.35;

  const wordsInWindow = wordTimestamps.filter(
    w => w.start >= searchStartTime && w.start <= searchEndTime
  );

  console.log(`[findPauseKeywords] Searching ${phaseType} phase (${phaseStartTime.toFixed(1)}s-${phaseEndTime.toFixed(1)}s), window: ${searchStartTime.toFixed(1)}s-${searchEndTime.toFixed(1)}s, found ${wordsInWindow.length} words`);

  if (wordsInWindow.length === 0) {
    console.log(`[findPauseKeywords] ⚠️ No words in search window`);
    return [];
  }

  // Reconstruct text and find sentence end (word ending with punctuation)
  const sentenceEndWord = wordsInWindow.find(w => {
    const hasEndPunctuation = /[.!?…]$/.test(w.word);
    return hasEndPunctuation;
  });

  if (sentenceEndWord) {
    // Clean the word (remove punctuation for matching)
    const cleanWord = sentenceEndWord.word.replace(/[.,!?;:'"()[\]{}…]+$/, '');
    console.log(`[findPauseKeywords] ✨ SENTENCE END STRATEGY: Found "${cleanWord}" at ${sentenceEndWord.start.toFixed(1)}s (with punctuation: "${sentenceEndWord.word}")`);
    return [cleanWord];
  }

  // ✅ STRATEGY 3: Look for natural pause indicators (context words)
  // ⚠️ REMOVED words like "honesto" that appear in the middle of narration (causes false positives)
  const pauseIndicators: Record<string, string[]> = {
    interaction: [
      // Words that often end intro sentences before a question/quiz
      'pessoas', 'população', 'usuários', 'profissionais', 'empresas',
      // Direct commands to pause/reflect - REMOVED "honesto" as it appears mid-sentence
      'reflita', 'pense', 'avalie', 'responda',
      // Quiz/test indicators
      'teste', 'autoavaliação', 'pergunta', 'escolha',
      // Transition words
      'agora', 'momento'
    ],
    playground: [
      // Words that indicate comparison is starting
      'diferença', 'comparação', 'resultado', 'amador', 'profissional',
      // Observation indicators
      'observe', 'veja', 'compare', 'analise', 'note', 'perceba',
      // Challenge indicators
      'desafio', 'prática', 'exercício'
    ]
  };

  const indicators = pauseIndicators[phaseType] || pauseIndicators['interaction'];

  for (const indicator of indicators) {
    const normalizedIndicator = normalize(indicator);

    for (const wordTs of wordsInWindow) {
      const normalizedWord = normalize(wordTs.word);

      if (normalizedWord === normalizedIndicator ||
          normalizedWord.includes(normalizedIndicator) ||
          normalizedIndicator.includes(normalizedWord)) {

        console.log(`[findPauseKeywords] ✓ INDICATOR STRATEGY: Found "${wordTs.word}" (matched "${indicator}") at ${wordTs.start.toFixed(1)}s`);
        return [wordTs.word.replace(/[.,!?;:'"()[\]{}…]+$/, '')];
      }
    }
  }

  // ✅ STRATEGY 4: Smart fallback - use a significant word at ~25% into phase
  // Prefer longer words (more likely to be meaningful nouns/verbs)
  const targetTime = phaseStartTime + (phaseEndTime - phaseStartTime) * 0.25;

  // Find significant words (length >= 4, not common words)
  const commonWords = new Set(['que', 'para', 'com', 'uma', 'são', 'não', 'por', 'mais', 'como', 'mas', 'dos', 'das', 'foi', 'ser', 'tem']);
  const significantWords = wordsInWindow.filter(w => {
    const clean = normalize(w.word);
    return clean.length >= 4 && !commonWords.has(clean);
  });

  if (significantWords.length > 0) {
    // Pick the significant word closest to target time
    const bestWord = significantWords.reduce((best, w) =>
      Math.abs(w.start - targetTime) < Math.abs(best.start - targetTime) ? w : best
    );
    console.log(`[findPauseKeywords] ⚠️ SMART FALLBACK: Using significant word "${bestWord.word}" at ${bestWord.start.toFixed(1)}s`);
    return [bestWord.word.replace(/[.,!?;:'"()[\]{}…]+$/, '')];
  }

  // Last resort: any word at target time
  const closestWord = wordsInWindow.reduce((closest, w) =>
    Math.abs(w.start - targetTime) < Math.abs(closest.start - targetTime) ? w : closest
  );
  console.log(`[findPauseKeywords] ⚠️ LAST RESORT: Using word "${closestWord.word}" at ${closestWord.start.toFixed(1)}s`);
  return [closestWord.word.replace(/[.,!?;:'"()[\]{}…]+$/, '')];
}

/**
 * Find pause word from narration text by analyzing sentence structure.
 * Looks for the end of the intro sentence and returns the last meaningful word.
 */
function findPauseWordFromNarration(
  narration: string,
  wordTimestamps: Array<{ word: string; start: number; end: number }>,
  phaseStartTime: number
): string | null {
  // Split narration into sentences
  const sentences = narration.split(/([.!?…]+)/).filter(s => s.trim().length > 0);

  if (sentences.length === 0) return null;

  // Get the first sentence (intro sentence)
  let introSentence = sentences[0].trim();
  // If first part is just punctuation, use second part
  if (/^[.!?…]+$/.test(introSentence) && sentences.length > 1) {
    introSentence = sentences[1].trim();
  }

  // Extract words from the intro sentence
  const introWords = introSentence
    .split(/\s+/)
    .map(w => w.replace(/[.,!?;:'"()[\]{}…]+/g, '').trim())
    .filter(w => w.length > 0);

  if (introWords.length === 0) return null;

  // Get the last meaningful word (length >= 3, not a common word)
  const commonWords = new Set(['que', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'os', 'as', 'ao', 'à', 'se', 'ou', 'e', 'a', 'o']);

  for (let i = introWords.length - 1; i >= 0; i--) {
    const word = introWords[i];
    const normalized = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (normalized.length >= 3 && !commonWords.has(normalized)) {
      // Verify this word exists in wordTimestamps near the phase start
      const matchingTs = wordTimestamps.find(ts => {
        const tsNormalized = ts.word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,!?;:'"()[\]{}…]+/g, '');
        return tsNormalized === normalized && ts.start <= phaseStartTime + 30;
      });

      if (matchingTs) {
        console.log(`[findPauseWordFromNarration] Found "${word}" in intro sentence, timestamp at ${matchingTs.start.toFixed(1)}s`);
        return word;
      }
    }
  }

  return null;
}

// Map database act type to V7 phase type
function mapActTypeToPhaseType(type: string): V7Phase['type'] {
  const typeMap: Record<string, V7Phase['type']> = {
    // Core types
    'dramatic': 'dramatic',
    'narrative': 'narrative',
    'interaction': 'interaction',
    'playground': 'playground',
    'revelation': 'revelation',
    'gamification': 'gamification',
    'secret-reveal': 'secret-reveal', // ✅ V7-v4: Secret reveal phase with ElevenLabs narration
    // Aliases from JSON
    'comparison': 'narrative',
    'quiz': 'interaction',
    'interactive': 'interaction', // ✅ FIX: Map 'interactive' to 'interaction' for quiz/playground acts
    'result': 'revelation',
    'reveal': 'revelation',
    'challenge': 'interaction',
    'celebration': 'revelation', // ✅ FIX: Map 'celebration' to revelation
    'cta': 'revelation', // CTA uses revelation phase (V7PhaseCTA)
  };
  console.log(`[mapActTypeToPhaseType] "${type}" → "${typeMap[type] || 'dramatic'}"`);
  return typeMap[type] || 'dramatic';
}

// Extract mood from visual content
function extractMood(visual: any): V7Phase['mood'] {
  if (!visual) return 'neutral';
  
  const mood = visual.mood?.toLowerCase();
  if (mood === 'success' || mood === 'positive') return 'success';
  if (mood === 'danger' || mood === 'negative' || mood === 'warning') return 'danger';
  if (mood === 'dramatic') return 'dramatic';
  return 'neutral';
}

// ============================================================================
// MICRO-SCENE GENERATION (V7-v2.3)
// Creates granular 2-5 second scenes aligned with narration for cinematic feel
// ============================================================================

interface MicroSceneSegment {
  text: string;
  startTime: number;
  endTime: number;
  type: 'hook' | 'statement' | 'question' | 'emphasis' | 'pause' | 'number' | 'reveal';
}

/**
 * Detect sentence boundaries and types from narration text
 * Returns segments with timing info when word timestamps available
 */
function segmentNarrationForMicroScenes(
  narration: string,
  wordTimestamps: Array<{ word: string; start: number; end: number }>,
  actStartTime: number,
  actEndTime: number
): MicroSceneSegment[] {
  if (!narration || narration.trim().length === 0) {
    return [];
  }

  const segments: MicroSceneSegment[] = [];

  // Get word timestamps within this act's time range
  const actWords = wordTimestamps.filter(
    w => w.start >= actStartTime && w.end <= actEndTime
  );

  // Split narration into sentences/phrases
  const sentences = narration
    .split(/([.!?]+)/)
    .reduce((acc: string[], curr, i, arr) => {
      // Combine sentence with its punctuation
      if (i % 2 === 0) {
        const punct = arr[i + 1] || '';
        const combined = (curr + punct).trim();
        if (combined) acc.push(combined);
      }
      return acc;
    }, [])
    .filter(s => s.length > 0);

  if (sentences.length === 0) {
    // Fallback: treat entire narration as one segment
    sentences.push(narration.trim());
  }

  // Create segments with timing from word timestamps
  let currentWordIndex = 0;

  sentences.forEach((sentence, sentenceIndex) => {
    // Estimate how many words in this sentence
    const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 0);
    const wordCount = sentenceWords.length;

    // Find matching words in timestamps
    const segmentStartWord = actWords[currentWordIndex];
    const segmentEndWordIndex = Math.min(currentWordIndex + wordCount - 1, actWords.length - 1);
    const segmentEndWord = actWords[segmentEndWordIndex];

    // Determine segment type
    let segmentType: MicroSceneSegment['type'] = 'statement';
    const lowerSentence = sentence.toLowerCase();

    if (lowerSentence.includes('você sabia') || lowerSentence.includes('voce sabia')) {
      segmentType = 'hook';
    } else if (sentence.includes('?')) {
      segmentType = 'question';
    } else if (/\d+%/.test(sentence) || /\b\d{2,}\b/.test(sentence)) {
      segmentType = 'number';
    } else if (lowerSentence.includes('importante') || lowerSentence.includes('crucial') ||
               lowerSentence.includes('atenção') || sentence.includes('!')) {
      segmentType = 'emphasis';
    }

    // Calculate timing
    const segmentStart = segmentStartWord?.start ?? (actStartTime + (sentenceIndex / sentences.length) * (actEndTime - actStartTime));
    const segmentEnd = segmentEndWord?.end ?? (actStartTime + ((sentenceIndex + 1) / sentences.length) * (actEndTime - actStartTime));

    segments.push({
      text: sentence,
      startTime: segmentStart,
      endTime: segmentEnd,
      type: segmentType,
    });

    currentWordIndex = segmentEndWordIndex + 1;
  });

  return segments;
}

/**
 * Generate micro-scenes from narration segments
 * Creates 2-5 second scenes for a cinematic feel
 */
function generateMicroScenesFromNarration(
  act: any,
  segments: MicroSceneSegment[],
  actStartTime: number,
  actDuration: number,
  phaseType: V7Phase['type']
): V7Scene[] {
  const scenes: V7Scene[] = [];
  const visual = act.content?.visual || {};
  const audio = act.content?.audio || {};

  const commonFields = {
    narration: audio.narration || act.narration || '',
    explanation: visual.explanation || '',
    tip: visual.tip || '',
  };

  // Animation types for variety
  const animations: Array<V7Scene['animation']> = ['fade', 'slide-up', 'scale-up', 'zoom-in', 'letter-by-letter'];
  const sceneTypes: Array<V7Scene['type']> = ['text-reveal', 'letterbox', 'number-reveal'];

  segments.forEach((segment, index) => {
    const duration = Math.max(2, segment.endTime - segment.startTime); // Min 2 seconds

    // Choose scene type based on segment type
    let sceneType: V7Scene['type'] = 'text-reveal';
    let animation: V7Scene['animation'] = animations[index % animations.length];
    let content: V7Scene['content'] = {};

    switch (segment.type) {
      case 'hook':
        sceneType = 'letterbox';
        animation = 'letterbox';
        content = {
          mainText: segment.text,
          hookQuestion: segment.text,
          aspectRatio: 'cinematic',
          backgroundColor: 'black',
          glowEffect: true,
        };
        break;

      case 'question':
        sceneType = 'text-reveal';
        animation = 'scale-up';
        content = {
          mainText: segment.text,
          glowEffect: true,
          pulseEffect: true,
          pulseColor: '#22D3EE',
        };
        break;

      case 'number':
        sceneType = 'number-reveal';
        animation = 'count-up';
        // Extract number from text
        const numberMatch = segment.text.match(/(\d+%?)/);
        content = {
          mainText: segment.text,
          number: numberMatch ? numberMatch[1] : '',
          countUpAnimation: true,
          glowEffect: true,
        };
        break;

      case 'emphasis':
        sceneType = 'text-reveal';
        animation = 'zoom-in';
        content = {
          mainText: segment.text,
          cameraShake: true,
          particleEffect: 'sparks',
        };
        break;

      case 'reveal':
        sceneType = 'text-reveal';
        animation = 'letter-by-letter';
        content = {
          mainText: segment.text,
          letterByLetter: true,
          typewriterSpeed: 50,
        };
        break;

      default:
        // Statement - default styling with alternating animations
        sceneType = 'text-reveal';
        content = {
          mainText: segment.text,
        };
    }

    scenes.push({
      id: `${act.id || 'act'}-micro-${index}`,
      type: sceneType,
      startTime: segment.startTime,
      duration,
      content: {
        ...content,
        ...commonFields,
      },
      animation,
    });
  });

  return scenes;
}

// Generate scenes for a phase based on act content
function generateScenesForPhase(
  act: any,
  phaseType: V7Phase['type'],
  startTime: number,
  duration: number,
  wordTimestamps: Array<{ word: string; start: number; end: number }> = [],
  enableMicroScenes: boolean = true
): V7Scene[] {
  const visual = act.content?.visual || {};
  const interaction = act.content?.interaction || {};
  const audio = act.content?.audio || {};
  const scenes: V7Scene[] = [];

  // Extract common fields that can appear in any act
  const commonFields = {
    narration: audio.narration || act.narration || '',
    explanation: visual.explanation || interaction.explanation || act.explanation || '',
    tip: visual.tip || interaction.tip || '',
    warning: visual.warning || '',
  };

  // ✅ V7-v2.3: MICRO-SCENE GENERATION
  // Generate fine-grained scenes aligned with narration for cinematic feel
  // Only for dramatic and narrative phases (interaction phases keep their structure)
  if (enableMicroScenes && wordTimestamps.length > 0 && (phaseType === 'dramatic' || phaseType === 'narrative')) {
    const narration = commonFields.narration;
    const endTime = startTime + duration;

    const segments = segmentNarrationForMicroScenes(
      narration,
      wordTimestamps,
      startTime,
      endTime
    );

    if (segments.length >= 2) {
      // Enough segments to create micro-scenes
      const microScenes = generateMicroScenesFromNarration(
        act,
        segments,
        startTime,
        duration,
        phaseType
      );

      if (microScenes.length > 0) {
        console.log(`[generateScenesForPhase] ✨ Generated ${microScenes.length} micro-scenes for ${phaseType} phase (was ${7} fixed scenes)`);
        return microScenes;
      }
    }

    console.log(`[generateScenesForPhase] ⚠️ Not enough segments for micro-scenes (${segments.length}), falling back to fixed scenes`);
  }

  switch (phaseType) {
    case 'dramatic':
      // 🎬 6 CINEMATIC SCENES (Netflix Bandersnatch-inspired)
      // ✅ SYNC FIX: Timings adjusted to match typical narration flow
      // Narration typically says "98%" in the first 2-3 seconds
      // Extract all dramatic content from visual
      const dramaticNumber = String(visual.mainValue || visual.number || '01');
      const dramaticSubtitle = visual.subtitle || act.title || '';
      const dramaticHighlight = visual.highlightWord || '';
      const dramaticImpact = visual.impactWord || visual.mainText || dramaticHighlight || 'IMPACTO';

      // ✅ Extract hookQuestion from visual, or detect from narration, or use default
      let dramaticHook = visual.hookQuestion || visual.hook || '';
      if (!dramaticHook && commonFields.narration) {
        // Check if narration starts with "Você sabia" pattern
        const narrationLower = commonFields.narration.toLowerCase();
        if (narrationLower.includes('você sabia') || narrationLower.includes('voce sabia')) {
          dramaticHook = 'VOCÊ SABIA?';
        }
      }

      // Scene 0: Letterbox with hook question "VOCÊ SABIA?" (15% - give more time)
      scenes.push({
        id: `${act.id}-hook`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.15,
        content: {
          mainText: dramaticHook,
          hookQuestion: dramaticHook,
          subtitle: '',
          backgroundColor: 'black',
          aspectRatio: 'cinematic',
          ...commonFields,
        },
        animation: 'letterbox',
      });

      // Scene 1: Hook question continues with glow effect (10% - more time for "VOCÊ SABIA?")
      scenes.push({
        id: `${act.id}-hook-glow`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.15,
        duration: duration * 0.10,
        content: {
          hookQuestion: dramaticHook,
          glowEffect: true,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // ✅ Extract secondary number (2%) from visual or use default
      const dramaticSecondaryNumber = visual.secondaryNumber || visual.contrastValue || '2%';

      // Scene 2: Number appears with glow effect (10% - 98% appears here)
      scenes.push({
        id: `${act.id}-number-appear`,
        type: 'number-reveal',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.10,
        content: {
          number: dramaticNumber,
          secondaryNumber: dramaticSecondaryNumber,
          subtitle: '', // No subtitle yet - builds suspense
          highlightWord: dramaticHighlight,
          glowEffect: true,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 3: Number count-up animation + subtitle reveal (15%)
      scenes.push({
        id: `${act.id}-count-up`,
        type: 'number-reveal',
        startTime: startTime + duration * 0.35,
        duration: duration * 0.15,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          highlightWord: dramaticHighlight,
          countUpAnimation: true,
          ...commonFields,
        },
        animation: 'count-up',
      });

      // Scene 4: Particle explosion transition (10%)
      scenes.push({
        id: `${act.id}-explosion`,
        type: 'particle-effect',
        startTime: startTime + duration * 0.50,
        duration: duration * 0.10,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          particleType: 'sparks',
          particleColor: visual.mood === 'danger' ? '#ff0040' : '#22D3EE',
          ...commonFields,
        },
        animation: 'particle-burst',
      });

      // Scene 5: Subtitle reveal letter-by-letter with highlight (20%)
      scenes.push({
        id: `${act.id}-subtitle`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.60,
        duration: duration * 0.20,
        content: {
          number: dramaticNumber,
          mainText: dramaticSubtitle,
          subtitle: dramaticHighlight,
          highlightWord: dramaticHighlight,
          letterByLetter: true,
          ...commonFields,
        },
        animation: 'letter-by-letter',
      });

      // Scene 6: Impact with 98% VS 2% (20% - show contrast)
      scenes.push({
        id: `${act.id}-impact`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.80,
        duration: duration * 0.20,
        content: {
          number: dramaticNumber,
          subtitle: dramaticSubtitle,
          mainText: dramaticImpact,
          highlightWord: dramaticHighlight,
          cameraZoom: true,
          cameraShake: true,
          particleEffect: 'confetti',
          ...commonFields,
        },
        animation: 'zoom-in',
      });
      break;

    case 'narrative':
      // 🎬 6 CINEMATIC SCENES (Split-screen comparisons)
      // Scene 0: Title fade in with letterboxing (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: visual.title || act.title,
          subtitle: visual.subtitle || '',
          aspectRatio: 'cinematic',
          ...commonFields,
        },
        animation: 'letterbox',
      });

      // Scene 1: Split-screen slide transition (15%)
      scenes.push({
        id: `${act.id}-split`,
        type: 'split-screen',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: visual.title || act.title,
          splitPosition: 0.5,
          dividerAnimation: true,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 2: Left card details animate in (20%)
      scenes.push({
        id: `${act.id}-left-card`,
        type: 'comparison',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.2,
        content: {
          mainText: visual.leftCard?.label || 'AMADOR',
          items: [
            {
              label: visual.leftCard?.label || 'Opção A',
              value: visual.leftCard?.value || '',
              details: visual.leftCard?.details || '',
              isNegative: !visual.leftCard?.isPositive,
            },
          ],
          amateurPrompt: visual.amateurPrompt || visual.leftCard?.prompt || '',
          amateurScore: visual.amateurScore || visual.leftCard?.score || 0,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 3: Right card details animate in (20%)
      scenes.push({
        id: `${act.id}-right-card`,
        type: 'comparison',
        startTime: startTime + duration * 0.45,
        duration: duration * 0.2,
        content: {
          mainText: visual.rightCard?.label || 'PROFISSIONAL',
          items: [
            {
              label: visual.rightCard?.label || 'Opção B',
              value: visual.rightCard?.value || '',
              details: visual.rightCard?.details || '',
              isPositive: visual.rightCard?.isPositive,
            },
          ],
          professionalPrompt: visual.professionalPrompt || visual.rightCard?.prompt || '',
          professionalScore: visual.professionalScore || visual.rightCard?.score || 100,
          ...commonFields,
        },
        animation: 'slide-right',
      });

      // Scene 4: Comparison highlight effects (20%)
      scenes.push({
        id: `${act.id}-highlight`,
        type: 'comparison',
        startTime: startTime + duration * 0.65,
        duration: duration * 0.2,
        content: {
          mainText: visual.subtitle || 'DIFERENÇA BRUTAL',
          items: [
            {
              label: 'Comparação',
              left: visual.leftCard?.details || '',
              right: visual.rightCard?.details || '',
            },
          ],
          pulseEffect: true,
          glowColor: '#22D3EE',
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 5: Warning/urgency with color shift (15%)
      scenes.push({
        id: `${act.id}-warning`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.85,
        duration: duration * 0.15,
        content: {
          mainText: visual.mainText || act.title,
          subtitle: visual.warning || '',
          warning: visual.warning || '',
          backgroundColor: 'from-black to-red-900/20',
          ...commonFields,
        },
        animation: 'slide-up',
      });
      break;

    case 'interaction':
      // 🎬 5 CINEMATIC SCENES (Interactive quiz with feedback)
      // Extract quiz-specific fields
      const quizOptions = (visual.options || interaction.options || []).map((opt: any) => ({
        id: opt.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
        label: opt.text || opt.label || '',
        text: opt.text || opt.label || '',
        isCorrect: opt.isCorrect ?? false,
        category: opt.category || (opt.isCorrect ? 'good' : 'bad'),
        feedback: opt.feedback || '',
      }));

      // Scene 0: Quiz title with icon bounce (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'quiz-intro',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: visual.title || interaction.title || 'AUTO-AVALIAÇÃO',
          subtitle: '',
          iconBounce: true,
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 1: Question reveal (15%)
      scenes.push({
        id: `${act.id}-question`,
        type: 'quiz-question',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          subtitle: visual.subtitle || '',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 2: Options slide in one by one (20%)
      scenes.push({
        id: `${act.id}-options`,
        type: 'quiz-options',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.2,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          title: visual.title || interaction.title || 'Avaliação',
          options: quizOptions,
          staggerChildren: 0.15,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 3: User interaction pause (40%)
      scenes.push({
        id: `${act.id}-interaction`,
        type: 'quiz',
        startTime: startTime + duration * 0.45,
        duration: duration * 0.4,
        content: {
          mainText: visual.question || interaction.question || 'Responda:',
          title: visual.title || interaction.title || 'Avaliação',
          options: quizOptions,
          correctFeedback: interaction.correctFeedback || visual.correctFeedback || 'Correto! 🎉',
          incorrectFeedback: interaction.incorrectFeedback || visual.incorrectFeedback || 'Tente novamente',
          revealGoodMessage: interaction.revealGoodMessage || visual.revealGoodMessage || '',
          revealBadMessage: interaction.revealBadMessage || visual.revealBadMessage || '',
          highlightOnHover: true,
          scaleOnHover: 1.02,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 4: Result reveal with feedback glow (15%)
      scenes.push({
        id: `${act.id}-result`,
        type: 'quiz-result',
        startTime: startTime + duration * 0.85,
        duration: duration * 0.15,
        content: {
          mainText: visual.correctFeedback || 'Excelente!',
          subtitle: visual.revealGoodMessage || '',
          particles: 'confetti',
          glowEffect: true,
          ...commonFields,
        },
        animation: 'explode',
      });
      break;

    case 'playground':
      // 🎬 6 CINEMATIC SCENES (Code typing + results comparison)
      // Extract playground-specific fields
      const playgroundVisual = visual.playground || visual;

      // Scene 0: Challenge title with code effect (10%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'playground-intro',
        startTime,
        duration: duration * 0.1,
        content: {
          mainText: playgroundVisual.title || 'DESAFIO PRÁTICO',
          subtitle: playgroundVisual.subtitle || act.title,
          challenge: playgroundVisual.challenge || '',
          glitchEffect: true,
          ...commonFields,
        },
        animation: 'glitch',
      });

      // Scene 1: Amateur prompt typewriter (15%)
      scenes.push({
        id: `${act.id}-amateur-prompt`,
        type: 'playground-code',
        startTime: startTime + duration * 0.1,
        duration: duration * 0.15,
        content: {
          mainText: 'PROMPT AMADOR',
          subtitle: '',
          amateurPrompt: playgroundVisual.amateurPrompt || playgroundVisual.amateur?.prompt || '',
          typewriterSpeed: 50,
          cursor: true,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 2: Amateur result with score animation (15%)
      scenes.push({
        id: `${act.id}-amateur-result`,
        type: 'playground-result',
        startTime: startTime + duration * 0.25,
        duration: duration * 0.15,
        content: {
          mainText: 'RESULTADO',
          amateurResult: playgroundVisual.amateurResult || playgroundVisual.amateur?.result || {
            title: 'Resultado Amador',
            content: '',
            score: 40,
            maxScore: 100,
            verdict: 'fraco',
          },
          countUpAnimation: true,
          scoreColor: 'red',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 3: Professional prompt typewriter (15%)
      scenes.push({
        id: `${act.id}-professional-prompt`,
        type: 'playground-code',
        startTime: startTime + duration * 0.4,
        duration: duration * 0.15,
        content: {
          mainText: 'PROMPT PROFISSIONAL',
          subtitle: '',
          professionalPrompt: playgroundVisual.professionalPrompt || playgroundVisual.professional?.prompt || '',
          typewriterSpeed: 30, // Faster = more professional
          cursor: true,
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 4: Professional result with score animation (15%)
      scenes.push({
        id: `${act.id}-professional-result`,
        type: 'playground-result',
        startTime: startTime + duration * 0.55,
        duration: duration * 0.15,
        content: {
          mainText: 'RESULTADO',
          professionalResult: playgroundVisual.professionalResult || playgroundVisual.professional?.result || {
            title: 'Resultado Profissional',
            content: '',
            score: 95,
            maxScore: 100,
            verdict: 'excelente',
          },
          countUpAnimation: true,
          scoreColor: 'green',
          particles: 'sparks',
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 5: Comparison bars with winner effect (30%)
      scenes.push({
        id: `${act.id}-comparison`,
        type: 'playground',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.3,
        content: {
          mainText: playgroundVisual.title || 'COMPARAÇÃO FINAL',
          subtitle: playgroundVisual.subtitle || act.title,
          challenge: playgroundVisual.challenge || '',
          amateurPrompt: playgroundVisual.amateurPrompt || playgroundVisual.amateur?.prompt || '',
          professionalPrompt: playgroundVisual.professionalPrompt || playgroundVisual.professional?.prompt || '',
          amateurResult: playgroundVisual.amateurResult || playgroundVisual.amateur?.result || {
            title: 'Resultado Amador',
            content: '',
            score: 40,
            maxScore: 100,
            verdict: 'fraco',
          },
          professionalResult: playgroundVisual.professionalResult || playgroundVisual.professional?.result || {
            title: 'Resultado Profissional',
            content: '',
            score: 95,
            maxScore: 100,
            verdict: 'excelente',
          },
          raceAnimation: true,
          winnerEffect: 'confetti',
          context: playgroundVisual.context || '',
          hints: playgroundVisual.hints || [],
          successCriteria: playgroundVisual.successCriteria || [],
          ...commonFields,
        },
        animation: 'fade',
      });
      break;

    case 'revelation':
      // 🎬 5 CINEMATIC SCENES (Method reveal + CTA)
      // Scene 0: Dramatic pause with black screen (5%)
      scenes.push({
        id: `${act.id}-pause`,
        type: 'letterbox',
        startTime,
        duration: duration * 0.05,
        content: {
          mainText: '',
          subtitle: '',
          backgroundColor: 'black',
          ...commonFields,
        },
        animation: 'fade',
      });

      // Scene 1: Method name reveal with glow (15%)
      scenes.push({
        id: `${act.id}-method-name`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.05,
        duration: duration * 0.15,
        content: {
          mainText: visual.title || visual.mainValue || '✨ REVELAÇÃO',
          subtitle: visual.subtitle || act.title,
          highlightWord: visual.highlightWord,
          glowEffect: true,
          ...commonFields,
        },
        animation: 'zoom-in',
      });

      // Scene 2: Items reveal sequentially (50%)
      scenes.push({
        id: `${act.id}-items`,
        type: 'text-reveal',
        startTime: startTime + duration * 0.2,
        duration: duration * 0.5,
        content: {
          mainText: visual.subtitle || act.title,
          subtitle: '',
          items: visual.items || visual.bullets || [],
          metrics: visual.metrics || [],
          staggerChildren: 0.25,
          iconBounce: true,
          ...commonFields,
        },
        animation: 'slide-left',
      });

      // Scene 3: CTA options slide in (20%)
      scenes.push({
        id: `${act.id}-cta-slide`,
        type: 'cta',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.2,
        content: {
          mainText: visual.ctaTitle || 'O QUE VOCÊ VAI FAZER AGORA?',
          subtitle: 'Escolha seu caminho',
          options: visual.options || visual.ctaOptions || [
            { label: 'Aplicar AGORA', emoji: '🎯', variant: 'primary' },
            { label: 'Revisar Tudo', emoji: '📚', variant: 'secondary' },
          ],
          staggerChildren: 0.15,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 4: Final CTA pulse effect (10%)
      scenes.push({
        id: `${act.id}-cta-pulse`,
        type: 'cta',
        startTime: startTime + duration * 0.9,
        duration: duration * 0.1,
        content: {
          mainText: visual.ctaTitle || 'Próximos Passos',
          options: visual.options || visual.ctaOptions || [
            { label: 'Revisar', emoji: '📚', variant: 'secondary' },
            { label: 'Continuar', emoji: '🚀', variant: 'primary' },
          ],
          pulseAnimation: true,
          ...commonFields,
        },
        animation: 'fade',
      });
      break;

    case 'gamification':
      // 🎬 3 CINEMATIC SCENES (Achievement celebration)
      // Scene 0: Title with celebration effect (20%)
      scenes.push({
        id: `${act.id}-title`,
        type: 'text-reveal',
        startTime,
        duration: duration * 0.2,
        content: {
          mainText: visual.mainText || '🏆 CONQUISTAS',
          subtitle: visual.subtitle || 'Parabéns!',
          glowEffect: true,
          particles: 'confetti',
          ...commonFields,
        },
        animation: 'scale-up',
      });

      // Scene 1: Achievements list (50%)
      scenes.push({
        id: `${act.id}-achievements`,
        type: 'result',
        startTime: startTime + duration * 0.2,
        duration: duration * 0.5,
        content: {
          mainText: visual.mainText || 'CONQUISTAS',
          subtitle: visual.subtitle || '',
          items: visual.items || [],
          staggerChildren: 0.2,
          iconBounce: true,
          ...commonFields,
        },
        animation: 'slide-up',
      });

      // Scene 2: XP and metrics (30%)
      scenes.push({
        id: `${act.id}-metrics`,
        type: 'result',
        startTime: startTime + duration * 0.7,
        duration: duration * 0.3,
        content: {
          mainText: 'RECOMPENSAS',
          subtitle: '',
          metrics: visual.metrics || [{ label: 'XP Ganho', value: '+100' }],
          particles: 'sparks',
          ...commonFields,
        },
        animation: 'explode',
      });
      break;

    default:
      scenes.push({
        id: `${act.id}-default`,
        type: 'text-reveal',
        startTime,
        duration,
        content: {
          mainText: act.title || 'Conteúdo',
          subtitle: visual.subtitle || '',
          ...commonFields,
        },
        animation: 'fade',
      });
  }

  return scenes;
}

// ❌ getDefaultPhases REMOVIDO - SEM FALLBACK
// Se não houver acts, o sistema DEVE falhar para forçar correção do banco de dados
