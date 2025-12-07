import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Sparkles, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { GuidedLessonProps, FinalPlaygroundConfig } from '@/types/guidedLesson';
import { PlaygroundMidLesson } from './PlaygroundMidLesson';
import { TransitionCard } from './TransitionCard';
import { ExercisesSection } from './ExercisesSection';
import { PlaygroundRealChat } from './PlaygroundRealChat';
import { GuidedPlayground } from './GuidedPlayground';
import InteractiveSimulationPlayground from './InteractiveSimulationPlayground';
import { PlaygroundCallCard } from './PlaygroundCallCard';
import { LessonCompletionSummary } from './LessonCompletionSummary';
import { AchievementBadge } from './AchievementBadge';
import { PointsNotification } from '@/components/gamification/PointsNotification';
import { LessonResultCard } from '@/components/gamification/LessonResultCard';
import { LivAvatar } from '@/components/LivAvatar';
import { IaBookExperienceCard } from './IaBookExperienceCard';
import { DynamicExperienceCard } from './DynamicExperienceCard';
import { DynamicCardEffect, isValidCardEffectType } from './card-effects';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { awardPoints, updateStreak, checkAndAwardAchievement, POINTS } from '@/lib/gamification';
import { updateMissionProgress } from '@/lib/updateMissionProgress';
import { registerGamificationEvent, GamificationResult } from '@/services/gamification';

/**
 * 🎬 SISTEMA DE SEGMENTOS V5
 *
 * Cada seção pode ter múltiplos segmentos:
 * - type: 'text' → bloco de texto da seção
 * - type: 'card' → experience card cinematográfico
 *
 * O scroll é controlado pelo segmento ativo, não apenas pela seção.
 * Isso permite que os cards apareçam no momento certo durante a narração.
 */
type SegmentType = 'text' | 'card';

interface Segment {
  id: string;
  type: SegmentType;
  sectionIndex: number;
  /** Timestamp em segundos (relativo ao áudio da seção para V2) */
  at: number;
  /** Para cards: índice do card dentro da seção */
  cardIndex?: number;
  /** Para cards: configuração do card */
  cardConfig?: any;
}

/**
 * 🚀 GUIDED LESSON V5 - EXPERIENCE CARDS ANIMADOS
 *
 * Modelo V5 = Estrutura V4 (áudios separados por seção)
 * + Experience Cards interativos inline (IaBookExperienceCard, etc.)
 * + Suporte a múltiplos tipos de cards personalizados
 * + Configuração via JSON para posicionamento de cards
 *
 * 🆕 DIFERENÇAS DO V4:
 * - Renderiza experience cards em seções específicas via lógica condicional
 * - Mantém toda funcionalidade do V4 (playground, exercícios, gamificação)
 * - Cards são definidos manualmente no JSON da lição (não via pipeline automático)
 *
 * CREATED: 2025-12-01 - V5 Model implementation
 */
export function GuidedLessonV5({ lessonData, onComplete, onMarkComplete, audioUrl, wordTimestamps, nextLessonId, nextLessonType, trailId }: GuidedLessonProps) {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lessonData.duration || 0);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [maxAudioProgress, setMaxAudioProgress] = useState(0);

  // 🆕 V5: Usa estrutura de V2 (áudios separados) + experience cards
  const isV2 = true;
  const hasPlaygroundSupport = true; // V5 agora suporta playground mid-lesson
  const [sectionJustChanged, setSectionJustChanged] = useState(false);
  const [forceAutoplayNext, setForceAutoplayNext] = useState(false); // 🔧 FIX: Flag para forçar autoplay na transição
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [sectionWhenMuted, setSectionWhenMuted] = useState(0);
  const [showEndCard, setShowEndCard] = useState(false);
  const [showPlaygroundCall, setShowPlaygroundCall] = useState(false);
  const [showPlaygroundMid, setShowPlaygroundMid] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<
    'audio' | 'playground-real' | 'playground-mid' | 'transition' | 'exercises' | 'playground-final' | 'completed'
  >('audio');
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasScrolledRef = useRef<{ [key: number]: boolean }>({});
  const lastSectionRef = useRef<number>(0);
  const prevSectionRef = useRef<number>(-1);

  // 🎬 V5 SEGMENTOS: Estado do segmento ativo
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const lastSegmentIdRef = useRef<string | null>(null);
  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 🎵 V5: Duração do áudio da seção atual (para cálculo automático de timestamps)
  const [sectionAudioDuration, setSectionAudioDuration] = useState<number>(60); // Default 60s

  /**
   * 🎬 Construir lista de segmentos para a seção atual
   * Combina o texto da seção com os experience cards, ordenados por timestamp
   *
   * 🆕 CÁLCULO AUTOMÁTICO VIA ANCHORTEXT:
   * - Se o card tem anchorText, calcula o timestamp automaticamente
   * - Fórmula: (posição_do_anchorText / tamanho_total_do_texto) × duração_do_áudio = at
   * - Isso elimina a necessidade de configurar segundos manualmente
   */
  const buildSegmentsForSection = (sectionIndex: number): Segment[] => {
    const section = lessonData.sections[sectionIndex] as any;
    if (!section) return [];

    const segments: Segment[] = [];

    // Pegar o texto da seção para cálculo de anchorText
    const sectionText = section.visualContent || section.content || '';
    const textLength = sectionText.length;

    // Segmento de texto (sempre começa em 0)
    segments.push({
      id: `section-${sectionIndex}-text`,
      type: 'text',
      sectionIndex,
      at: 0,
    });

    // Buscar cards da seção
    let cards: any[] = [];

    // Prioridade 1: Cards dentro da seção (formato pipeline)
    if (section.experienceCards && section.experienceCards.length > 0) {
      cards = section.experienceCards;
    }
    // Prioridade 2: Cards no root level (formato AdminV5CardConfig)
    else if (lessonData.experienceCards) {
      cards = lessonData.experienceCards.filter(
        (card: any) => card.sectionIndex === sectionIndex + 1 // AdminV5CardConfig usa 1-based
      );
    }

    // Adicionar segmentos para cada card
    cards.forEach((cardConfig: any, cardIdx: number) => {
      let cardTimestamp: number;

      // 🎯 PRIORIDADE 1: Timestamp manual (se configurado explicitamente)
      if (cardConfig.at !== undefined && cardConfig.at !== null) {
        cardTimestamp = cardConfig.at;
        console.log(`🎬 [V5-SEGMENTS] Card ${cardIdx}: usando at manual = ${cardTimestamp}s`);
      }
      // 🎯 PRIORIDADE 2: Calcular automaticamente via anchorText
      else if (cardConfig.anchorText && textLength > 0) {
        const anchorPosition = sectionText.indexOf(cardConfig.anchorText);
        if (anchorPosition !== -1) {
          const ratio = anchorPosition / textLength;
          cardTimestamp = Math.round(ratio * sectionAudioDuration);
          console.log(`🎬 [V5-SEGMENTS] Card ${cardIdx}: anchorText "${cardConfig.anchorText.substring(0, 30)}..." encontrado em ${anchorPosition}/${textLength} (${(ratio * 100).toFixed(1)}%) → at=${cardTimestamp}s de ${sectionAudioDuration}s`);
        } else {
          // anchorText não encontrado, usar fallback
          cardTimestamp = 5 + cardIdx * 15;
          console.warn(`⚠️ [V5-SEGMENTS] Card ${cardIdx}: anchorText "${cardConfig.anchorText.substring(0, 30)}..." NÃO encontrado no texto. Usando fallback ${cardTimestamp}s`);
        }
      }
      // 🎯 PRIORIDADE 3: Outros campos legacy
      else if (cardConfig.timestamp !== undefined) {
        cardTimestamp = cardConfig.timestamp;
      }
      else if (cardConfig.showAtTime !== undefined) {
        cardTimestamp = cardConfig.showAtTime;
      }
      // 🎯 FALLBACK: Distribuição uniforme
      else {
        cardTimestamp = 5 + cardIdx * 15;
        console.log(`🎬 [V5-SEGMENTS] Card ${cardIdx}: usando fallback ${cardTimestamp}s`);
      }

      segments.push({
        id: `section-${sectionIndex}-card-${cardIdx}`,
        type: 'card',
        sectionIndex,
        at: cardTimestamp,
        cardIndex: cardIdx,
        cardConfig,
      });
    });

    // Ordenar por timestamp
    segments.sort((a, b) => a.at - b.at);

    console.log(`🎬 [V5-SEGMENTS] Seção ${sectionIndex}: ${segments.length} segmentos (duração áudio: ${sectionAudioDuration}s)`,
      segments.map(s => `${s.type}@${s.at}s`));

    return segments;
  };

  // Memoizar segmentos da seção atual
  // 🆕 Inclui sectionAudioDuration para recalcular quando a duração do áudio mudar
  const currentSectionSegments = useMemo(() => {
    return buildSegmentsForSection(currentSection);
  }, [currentSection, lessonData.sections, lessonData.experienceCards, sectionAudioDuration]);

  /**
   * 🎬 Calcular segmento ativo baseado no tempo atual do áudio
   */
  const getActiveSegment = (time: number): Segment | null => {
    if (currentSectionSegments.length === 0) return null;

    // Encontrar o último segmento cujo timestamp é <= tempo atual
    let activeSegment = currentSectionSegments[0];
    for (const segment of currentSectionSegments) {
      if (segment.at <= time) {
        activeSegment = segment;
      } else {
        break; // Como está ordenado, podemos parar aqui
      }
    }

    return activeSegment;
  };
  
  const [playgroundTriggered, setPlaygroundTriggered] = useState(false);
  const [playgroundCompleted, setPlaygroundCompleted] = useState(false);
  const [jumpedToExercises, setJumpedToExercises] = useState(false);
  const [pendingAudioReset, setPendingAudioReset] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [shouldShowPlayPulse, setShouldShowPlayPulse] = useState(false);
  
  // 🔍 DEBUG: Ver dados carregados
  useEffect(() => {
    console.log('📦 [V5 LESSON DATA]', {
      id: lessonData.id,
      title: lessonData.title,
      model: 'v5',
      numSections: lessonData.sections.length,
      sections: lessonData.sections.map((s, i) => ({
        index: i,
        id: s.id,
        timestamp: s.timestamp,
        showPlaygroundCall: s.showPlaygroundCall,
        hasContent: !!(s.visualContent || s.content)
      }))
    });
  }, [lessonData]);
  
  /**
   * 🎨 HELPER: Renderizar Experience Cards
   *
   * Esta função determina se deve renderizar um experience card
   * em uma seção específica baseando-se na configuração do JSON.
   *
   * LÓGICA:
   * 1. Busca cards DENTRO da seção (formato pipeline: sections[i].experienceCards)
   * 2. Busca cards no ROOT level (formato AdminV5CardConfig: lessonData.experienceCards com sectionIndex)
   * 3. Fallback para regras hardcoded (compatibilidade)
   *
   * ✨ NOVO: DynamicExperienceCard com Framer Motion!
   * - Animações de entrada com blur + scale + spring
   * - Ícone pulsante com glow
   * - Partículas flutuantes
   * - Gradientes animados
   * - Capítulos com stagger
   */
  const renderExperienceCard = (lessonId: string, sectionIndex: number) => {
    /**
     * 🎬 CARD EFFECTS CINEMATOGRÁFICOS (V5)
     *
     * Renderiza animações temáticas baseadas no tipo do card:
     * - app-builder: Celular com código sendo gerado
     * - digital-employee: Robô trabalhando
     * - business-design: Linha de progresso com etapas
     * - content-machine: Esteira de conteúdo
     * - automation: Nós conectados
     * - data-analysis: Gráficos animados
     * - creativity: Lâmpada com ideias
     *
     * Se o tipo não for cinematográfico, usa DynamicExperienceCard (texto)
     */

    // Helper para renderizar um card baseado na config
    const renderCard = (cardConfig: any, key: string, isActive: boolean = true) => {
      const cardType = cardConfig.type || cardConfig.effectType || '';

      // 🎬 PRIORIDADE 1: Card Effect Cinematográfico
      if (isValidCardEffectType(cardType)) {
        console.log(`🎬 [V5] Renderizando card cinematográfico: ${cardType} (isActive: ${isActive})`);
        return (
          <div key={key} className="my-6">
            <DynamicCardEffect type={cardType} isActive={isActive} />
          </div>
        );
      }

      // 📚 PRIORIDADE 2: IaBookExperienceCard específico
      if (cardType === 'ia-book') {
        return <IaBookExperienceCard key={key} />;
      }

      // 📝 PRIORIDADE 3: DynamicExperienceCard com texto (fallback)
      if (cardConfig.props) {
        const { title, subtitle, icon, colorScheme, chapters, effectDescription } = cardConfig.props;
        return (
          <div key={key} className="my-6">
            <DynamicExperienceCard
              type={cardType}
              title={title || 'Experience Card'}
              subtitle={subtitle}
              icon={icon || 'sparkles'}
              colorScheme={colorScheme || 'purple'}
              chapters={chapters || []}
              effectDescription={effectDescription}
            />
          </div>
        );
      }

      // 🎯 FALLBACK: DynamicExperienceCard simples
      return (
        <div key={key} className="my-6">
          <DynamicExperienceCard
            type={cardType}
            title={cardType}
            icon="sparkles"
            colorScheme="purple"
          />
        </div>
      );
    };

    // 🔍 PRIORIDADE 1: Buscar DENTRO da seção (formato pipeline)
    const currentSection = lessonData.sections[sectionIndex] as any;
    if (currentSection?.experienceCards && currentSection.experienceCards.length > 0) {
      console.log(`🎨 [V5] Encontrados ${currentSection.experienceCards.length} cards na seção ${sectionIndex + 1}`);

      return (
        <>
          {currentSection.experienceCards.map((cardConfig: any, cardIdx: number) =>
            renderCard(cardConfig, `experience-card-${sectionIndex}-${cardIdx}`)
          )}
        </>
      );
    }

    // 🔍 PRIORIDADE 2: Buscar no ROOT level (formato AdminV5CardConfig)
    if (lessonData.experienceCards) {
      const cardsForSection = lessonData.experienceCards.filter(
        (card) => card.sectionIndex === sectionIndex + 1 // AdminV5CardConfig usa 1-based
      );

      if (cardsForSection.length > 0) {
        console.log(`🎨 [V5] Encontrados ${cardsForSection.length} cards (root level) para seção ${sectionIndex + 1}`);

        return (
          <>
            {cardsForSection.map((cardConfig: any, cardIdx: number) =>
              renderCard(cardConfig, `experience-card-root-${sectionIndex}-${cardIdx}`)
            )}
          </>
        );
      }
    }

    // 🔮 PRIORIDADE 3: Fallback para regras hardcoded (compatibilidade)
    if (lessonId === 'fundamentos-01' && sectionIndex === 3) {
      console.log('🎨 [V5] Renderizando IaBookExperienceCard (fallback hardcoded)');
      return <IaBookExperienceCard key={`experience-card-${sectionIndex}`} />;
    }

    return null;
  };
  
  // 🔧 Helper: Verificar se seção é renderizável no DOM
  const isSectionRenderable = (section: any) => {
    return !section.type || section.type === 'text' || section.type === 'end-audio';
  };
  
  // 📊 Helper: Calcular seção ativa com binary search O(log n)
  const calculateActiveSection = (currentTime: number): number => {
    let left = 0;
    let right = lessonData.sections.length - 1;
    let result = 0;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      if (lessonData.sections[mid].timestamp <= currentTime) {
        result = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return result;
  };
  
  // 🎯 Helper: Pular direto para exercícios
  const skipToExercises = () => {
    const hasExercises = lessonData.exercisesConfig || lessonData.finalPlaygroundConfig;
    
    if (!hasExercises) {
      console.log('⚠️ [SKIP] Aula não tem exercícios, chamando onComplete');
      onComplete({ audioProgress: maxAudioProgress });
      return;
    }
    
    console.log('⏭️ [SKIP] Pulando direto para exercícios');
    setJumpedToExercises(true);
    
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    setCurrentPhase('transition');
  };

  // 🔄 Helper: Resetar áudio para uma seção específica
  const resetAudioToSection = (sectionIndex: number) => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn('⚠️ [RESET-AUDIO] Áudio não disponível, ignorando reset');
      return;
    }
    
    const targetSection = lessonData.sections[sectionIndex];
    if (!targetSection) {
      console.warn('⚠️ [RESET-AUDIO] Seção não encontrada, ignorando reset');
      return;
    }
    
    const targetTime = targetSection.timestamp;
    
    console.log(`🔄 [RESET-AUDIO] Resetando para seção ${sectionIndex} (${targetTime}s)`);
    
    setIsResetting(true);
    
    lastSectionRef.current = sectionIndex;
    prevSectionRef.current = sectionIndex - 1;
    
    if (isV2 && targetSection.audio_url) {
      audio.pause();
      audio.src = targetSection.audio_url;
      audio.load();
    }
    
    audio.currentTime = targetTime;
    audio.pause();
    setIsPlaying(false);
    
    setCurrentSection(sectionIndex);
    setCurrentTime(targetTime);
    
    const handleSeeked = () => {
      console.log(`✅ [RESET-AUDIO] Seek concluído, liberando syncLoop`);
      setIsResetting(false);
      audio.removeEventListener('seeked', handleSeeked);
    };
    
    audio.addEventListener('seeked', handleSeeked);
    
    setTimeout(() => {
      console.log(`✅ [RESET-AUDIO] Fallback timeout, liberando syncLoop`);
      setIsResetting(false);
      audio.removeEventListener('seeked', handleSeeked);
    }, 300);
  };

  // 🔄 Helper: Resetar completamente a aula para o início
  const resetLessonToBeginning = (targetSection: number) => {
    console.log(`🔄 [RESET] Resetando aula para seção ${targetSection}`);
    
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    setPlaygroundTriggered(false);
    setPlaygroundCompleted(false);
    setShowPlaygroundCall(false);
    setShowPlaygroundMid(false);
    setShowEndCard(false);
    setSectionJustChanged(false);
    
    hasScrolledRef.current = {};
    lastSectionRef.current = targetSection;
    prevSectionRef.current = -1;
    
    setPendingAudioReset(targetSection);
    
    console.log('✅ [RESET] Estados resetados, áudio será resetado quando fase mudar para audio');
  };

  // 🔄 useEffect: Resetar áudio quando voltar para fase 'audio'
  useEffect(() => {
    if (currentPhase !== 'audio' || pendingAudioReset === null) return;
    
    const audio = audioRef.current;
    if (!audio) {
      console.warn('⚠️ [RESET-PENDING] Áudio ainda não disponível, aguardando...');
      return;
    }
    
    console.log(`🔄 [RESET-PENDING] Executando reset pendente para seção ${pendingAudioReset}`);
    resetAudioToSection(pendingAudioReset);
    setPendingAudioReset(null);
    
    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        console.log('✅ [AUTOPLAY-RESUME] Áudio reiniciado automaticamente');
      } catch (error) {
        console.warn('⚠️ [AUTOPLAY-RESUME] Bloqueado pelo navegador, mostrando hint');
        
        toast({
          title: "▶️ Continue sua aula",
          description: "Clique em Play para retomar o áudio",
          duration: 5000,
        });
        
        setShouldShowPlayPulse(true);
        setTimeout(() => setShouldShowPlayPulse(false), 8000);
      }
    };
    
    setTimeout(tryAutoplay, 100);
  }, [currentPhase, pendingAudioReset]);

  // 🎮 Helper: Handlers para Playground Mid-Lesson (V5)
  const handleOpenPlayground = () => {
    console.log('🎮 [V5] Abrindo playground mid-lesson...');
    setShowPlaygroundCall(false);
    setShowPlaygroundMid(true);
  };

  const handleSkipPlayground = () => {
    console.log('🎮 [V5] Pulando playground mid-lesson...');
    setShowPlaygroundCall(false);
    // Avançar para próxima seção
    const isLastSection = currentSection >= lessonData.sections.length - 1;
    if (!isLastSection) {
      setCurrentSection(prev => prev + 1);
    } else {
      // Se era a última seção, ir para exercícios
      setCurrentPhase('playground-real');
    }
  };

  const handlePlaygroundComplete = () => {
    console.log('🎮 [V5] Playground mid-lesson completo!');
    setShowPlaygroundMid(false);
    // Avançar para próxima seção
    const isLastSection = currentSection >= lessonData.sections.length - 1;
    if (!isLastSection) {
      setCurrentSection(prev => prev + 1);
    } else {
      // Se era a última seção, ir para exercícios
      setCurrentPhase('playground-real');
    }
  };

  // Alias para compatibilidade
  const activatePlayground = handleOpenPlayground;
  
  // 📊 Helper: Telemetria
  const logTelemetry = (event: string, data?: any) => {
    const timestamp = performance.now().toFixed(0);
    const audioTime = audioRef.current?.currentTime.toFixed(1) || '0.0';
    
    console.log(
      `[V5-TELEMETRY] ${timestamp}ms | Audio: ${audioTime}s | ${event}`,
      data || ''
    );
  };

  const sendDiagnosticLog = async () => {
    // Diagnostic logs desabilitados
    return;
  };
  
  // 🔧 INICIALIZAÇÃO DO ÁUDIO
  useEffect(() => {
    const audio = audioRef.current;
    
    lastSectionRef.current = 0;
    
    console.log('🔍 [V5-DEBUG] isV2:', isV2);
    console.log('🔍 [V5-DEBUG] audioUrl recebido:', audioUrl);
    console.log('🔍 [V5-DEBUG] audioRef.current:', audio);
    
    if (!audio) {
      console.error('❌ [V5-ÁUDIO] Elemento de áudio não encontrado');
      return;
    }
    
    const initialAudioUrl = isV2 ? lessonData.sections[0]?.audio_url : audioUrl;
    
    if (!initialAudioUrl) {
      console.error('❌ [V5-ÁUDIO] URL do áudio não fornecida');
      return;
    }
    
    console.log(`✅ [V5-ÁUDIO] Inicializando áudio (V2):`, initialAudioUrl);
    console.log('📋 [V5-ÁUDIO] Seções:', lessonData.sections.map(s => `${s.id} (${s.timestamp}s)`));
    
    audio.volume = 1.0;
    console.log('🔊 [V5-VOLUME] Configurado: 100%');
    
    const handleLoadedMetadata = () => {
      console.log(`✅ [V5-ÁUDIO] Carregado! Duração: ${audio.duration}s`);

      // 🎵 V5: Atualizar duração da seção para cálculo automático de timestamps
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setSectionAudioDuration(audio.duration);
        console.log(`📊 [V5-SEGMENTS] Duração da seção atualizada: ${audio.duration}s (para cálculo de anchorText)`);
      }

      audio.volume = 1.0;

      audio.play().then(() => {
        console.log('✅ [V5-AUTOPLAY] Áudio iniciado automaticamente');
        setIsPlaying(true);
        setIsAudioInitialized(true);
      }).catch(err => {
        console.warn('⚠️ [V5-AUTOPLAY] Bloqueado pelo navegador:', err);
        setIsAudioInitialized(true);
      });
    };
    
    const handleError = (e: Event) => {
      console.error('❌ [V5-ÁUDIO] Erro ao carregar:', e);
      console.error('❌ [V5-ÁUDIO] URL problemática:', audioUrl);
    };
    
    const handleCanPlay = () => {
      console.log('🎵 [V5-ÁUDIO] Pronto para reproduzir');
    };
    
    const handleSeeking = () => {
      console.log('🔄 [V5-SEEKING] Áudio pulou para:', audio.currentTime);
      lastSectionRef.current = -1;
    };
    
    audio.onplay = () => {
      console.log('▶️ [V5-AUDIO] Play iniciado');
      setIsPlaying(true);
    };

    audio.onpause = () => {
      console.log('⏸️ [V5-AUDIO] Pausado');
      setIsPlaying(false);
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('seeking', handleSeeking);
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('seeking', handleSeeking);
    };
  }, [lessonData.sections, audioUrl, isV2]);

  // 🔥 SINCRONIZAÇÃO COM requestAnimationFrame (60fps, <100ms latência)
  useEffect(() => {
    const audio = audioRef.current;
    const hasAudio = isV2 ? lessonData.sections[0]?.audio_url : audioUrl;
    if (!audio || !hasAudio) return;
    
    let animationFrameId: number;
    let lastLoggedTime = -1;
    
    const syncLoop = () => {
      const currentTime = audio.currentTime;
      setCurrentTime(currentTime);
      
      if (duration > 0) {
        const progress = Math.round((currentTime / duration) * 100);
        setMaxAudioProgress(prev => Math.max(prev, progress));
      }
      
      if (isV2) {
        animationFrameId = requestAnimationFrame(syncLoop);
        return;
      }
      
      const activeIndex = calculateActiveSection(currentTime);
      
      if (Math.floor(currentTime) !== Math.floor(lastLoggedTime)) {
        console.log(`[V5-SYNC-STATE] Time: ${currentTime.toFixed(2)}s | Current: ${lastSectionRef.current} | Should be: ${activeIndex}`);
        lastLoggedTime = currentTime;
      }
      
      if (activeIndex !== lastSectionRef.current && !isResetting) {
        const detectionTime = performance.now();
        
        console.log(`[V5-DETECTION] ${currentTime.toFixed(2)}s | Transition: ${lastSectionRef.current}→${activeIndex} | Detection timestamp: ${detectionTime.toFixed(2)}`);
        
        logTelemetry('SECTION_CHANGED', { from: lastSectionRef.current, to: activeIndex });
        
        lastSectionRef.current = activeIndex;
        setCurrentSection(activeIndex);
        setSectionJustChanged(true);
        setTimeout(() => setSectionJustChanged(false), 1000);
      }
      
      animationFrameId = requestAnimationFrame(syncLoop);
    };
    
    animationFrameId = requestAnimationFrame(syncLoop);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [lessonData.sections, audioUrl, isV2, currentSection]);
  
  // 🆕 V2: Trocar áudio ao mudar de seção
  useEffect(() => {
    if (!isV2 || !audioRef.current) return;
    
    if (currentSection === 0 && prevSectionRef.current === -1) {
      prevSectionRef.current = 0;
      return;
    }
    
    if (prevSectionRef.current === currentSection) {
      console.log(`🛡️ [V5-V2] Seção ${currentSection} já carregada, pulando troca`);
      return;
    }
    
    const section = lessonData.sections[currentSection];
    if (!section?.audio_url) return;
    
    const audio = audioRef.current;
    const wasPlaying = !audio.paused;
    
    console.log(`🔄 [V5-V2] Mudando para áudio da seção ${currentSection}: ${section.audio_url}`);
    
    prevSectionRef.current = currentSection;
    
    audio.pause();

    audio.src = section.audio_url;
    audio.currentTime = 0;

    // 🎵 V5: Atualizar duração quando o áudio da nova seção carregar
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setSectionAudioDuration(audio.duration);
        console.log(`📊 [V5-SEGMENTS] Duração da seção ${currentSection} atualizada: ${audio.duration}s`);
      }
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
    audio.addEventListener('loadedmetadata', updateDuration);

    audio.load();

    // 🔧 FIX: Autoplay se estava tocando OU se forceAutoplayNext está ativo
    if (wasPlaying || forceAutoplayNext) {
      setForceAutoplayNext(false); // Reset flag
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`✅ [V5-V2] Áudio da seção ${currentSection} reproduzindo (forceAutoplay: ${forceAutoplayNext})`);
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('⚠️ [V5-V2] Erro ao reproduzir áudio:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentSection, isV2, lessonData.sections, forceAutoplayNext]);
  
  // 📊 LOG 3: Medir latência do state update e scroll
  useEffect(() => {
    const updateTime = performance.now();
    const audioTime = audioRef.current?.currentTime || 0;

    console.log(`[V5-STATE-UPDATE] Section changed to: ${currentSection} | Audio time: ${audioTime.toFixed(2)}s | Update timestamp: ${updateTime.toFixed(2)}`);

    // Resetar segmento ativo quando mudar de seção
    setActiveSegmentId(null);
    lastSegmentIdRef.current = null;

    const section = lessonData.sections[currentSection];
    if (isSectionRenderable(section)) {
      // O scroll agora é controlado pelo sistema de segmentos
      // Apenas fazer scroll inicial para a seção se não houver segmentos
      if (currentSectionSegments.length === 0) {
        const scrollStart = performance.now();

        setTimeout(() => {
          const sectionElement = document.getElementById(`section-${currentSection}`);
          if (sectionElement) {
            const headerHeight = 60; // Reduzido para cards ficarem mais para cima na tela
            const elementTop = sectionElement.getBoundingClientRect().top;
            const offsetTop = elementTop + window.pageYOffset;
            const targetPosition = offsetTop - headerHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });

            const scrollEnd = performance.now();
            const latency = scrollEnd - scrollStart;
            console.log(`📜 [V5-SCROLL] Animação suave completada em ${latency.toFixed(2)}ms para seção ${currentSection}`);
          }
        }, 50);
      }
    }
  }, [currentSection]);

  // 🎬 V5 SEGMENTOS: Sincronizar segmento ativo com tempo do áudio
  useEffect(() => {
    if (!isV2 || currentSectionSegments.length === 0) return;

    const activeSegment = getActiveSegment(currentTime);
    if (!activeSegment) return;

    // Só fazer scroll se o segmento mudou
    if (activeSegment.id !== lastSegmentIdRef.current) {
      console.log(`🎬 [V5-SEGMENT-CHANGE] ${lastSegmentIdRef.current} → ${activeSegment.id} (at ${currentTime.toFixed(1)}s)`);

      lastSegmentIdRef.current = activeSegment.id;
      setActiveSegmentId(activeSegment.id);

      // Fazer scroll para o elemento do segmento
      setTimeout(() => {
        const targetElement = segmentRefs.current[activeSegment.id];
        if (targetElement) {
          const headerHeight = 60; // Reduzido para cards ficarem mais para cima na tela
          const elementTop = targetElement.getBoundingClientRect().top;
          const offsetTop = elementTop + window.pageYOffset;
          const targetPosition = offsetTop - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          console.log(`📜 [V5-SEGMENT-SCROLL] Scroll para ${activeSegment.type === 'card' ? 'CARD' : 'TEXT'} ${activeSegment.id}`);
        } else {
          console.warn(`📜 [V5-SEGMENT-SCROLL] Elemento não encontrado: ${activeSegment.id}`);
        }
      }, 50);
    }
  }, [currentTime, currentSectionSegments]);
  
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().then(() => {
        setIsAudioInitialized(true);
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log(`⏪ [V5-SKIP-BACK] currentTime=${audio.currentTime.toFixed(1)}s, currentSection=${currentSection}`);
    
    if (isV2) {
      if (audio.currentTime < 3 && currentSection > 0) {
        const previousSection = currentSection - 1;
        console.log(`⏪ [V5-V2-SKIP-BACK] Voltando para seção ${previousSection}`);
        
        jumpToSection(previousSection);
        
        setTimeout(() => {
          const prevAudio = audioRef.current;
          if (prevAudio && prevAudio.duration > 10) {
            prevAudio.currentTime = prevAudio.duration - 5;
            console.log(`⏪ [V5-V2-SKIP-BACK] Posicionado em ${prevAudio.currentTime.toFixed(1)}s`);
          }
        }, 300);
        
      } else {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
        console.log(`⏪ [V5-V2-SKIP-BACK] Retrocedeu 10s, agora em ${audio.currentTime.toFixed(1)}s`);
      }
      
    } else {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
      console.log(`⏪ [V5-V1-SKIP-BACK] Retrocedeu 10s, agora em ${audio.currentTime.toFixed(1)}s`);
    }
  };
  
  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    
    console.log(`⏩ [V5-SKIP-FWD] currentTime=${audio.currentTime.toFixed(1)}s, duration=${audio.duration.toFixed(1)}s, currentSection=${currentSection}`);
    
    if (isV2) {
      const timeRemaining = audio.duration - audio.currentTime;
      
      if (timeRemaining < 3 && currentSection < lessonData.sections.length - 1) {
        const nextSection = currentSection + 1;
        console.log(`⏩ [V5-V2-SKIP-FWD] Avançando para seção ${nextSection}`);
        
        jumpToSection(nextSection);
        
      } else {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        console.log(`⏩ [V5-V2-SKIP-FWD] Avançou 10s, agora em ${audio.currentTime.toFixed(1)}s`);
      }
      
    } else {
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
      console.log(`⏩ [V5-V1-SKIP-FWD] Avançou 10s, agora em ${audio.currentTime.toFixed(1)}s`);
    }
  };
  
  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };
  
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isV2) {
      console.log('⚠️ [V5-V2] Progress bar não implementado para V2 (áudios separados)');
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * (duration || 0);
    
    audio.currentTime = newTime;
    console.log(`🎯 [V5-PROGRESS-BAR] Pulou para ${newTime.toFixed(1)}s (${Math.round(percentage * 100)}%)`);
  };

  const jumpToSection = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const section = lessonData.sections[index];
    if (!section) return;
    
    console.log(`🎯 [V5-JUMP] Pulando para seção ${index}: ${section.id}`);
    
    const wasPlaying = !audio.paused;
    
    if (isV2) {
      if (section.audio_url) {
        console.log(`🔄 [V5-V2-JUMP] Trocando para áudio da seção ${index}: ${section.audio_url}`);
        
        audio.pause();
        
        prevSectionRef.current = index;
        lastSectionRef.current = index;
        
        audio.src = section.audio_url;
        audio.currentTime = 0;
        audio.load();
        
        setCurrentSection(index);
        
        if (wasPlaying) {
          audio.play().then(() => {
            setIsPlaying(true);
            console.log(`✅ [V5-V2-JUMP] Áudio da seção ${index} reproduzindo`);
          }).catch((err) => {
            console.warn('⚠️ [V5-V2-JUMP] Erro ao reproduzir áudio:', err);
            setIsPlaying(false);
          });
        }
      }
    } else {
      if (section.timestamp !== undefined) {
        audio.currentTime = section.timestamp;
        setCurrentSection(index);
        
        if (wasPlaying) {
          audio.play();
          setIsPlaying(true);
        }
      }
    }
    
    hasScrolledRef.current[index] = false;
    
    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${index}`);
      if (sectionElement) {
        const headerHeight = 60; // Reduzido para cards ficarem mais para cima na tela
        const elementTop = sectionElement.getBoundingClientRect().top;
        const offsetTop = elementTop + window.pageYOffset;
        const targetPosition = offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        console.log(`📜 [V5-JUMP] Scroll para seção ${index} completo`);
      }
    }, 100);
  };
  
  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isAudioEnabled) {
      audio.pause();
      setIsPlaying(false);
      setSectionWhenMuted(currentSection);
    } else {
      audio.play();
      setIsPlaying(true);
      
      const sectionElement = document.getElementById(`section-${sectionWhenMuted}`);
      if (sectionElement) {
        const yOffset = -60; // Reduzido para cards ficarem mais para cima na tela
        const y = sectionElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    
    setIsAudioEnabled(!isAudioEnabled);
  };
  
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Detectar fim do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnded = () => {
      console.log(`🎯 [V5-AUDIO-ENDED] Áudio da seção ${currentSection} terminou naturalmente`);
      setIsPlaying(false);

      setJumpedToExercises(false);

      if (isV2) {
        const isLastSection = currentSection >= lessonData.sections.length - 1;
        const currentSectionData = lessonData.sections[currentSection] as any;

        // 🎮 V5: Verificar se a seção atual tem playground mid-lesson
        if (currentSectionData?.showPlaygroundCall && currentSectionData?.playgroundConfig) {
          console.log('🎮 [V5-AUDIO-ENDED] Seção com playground detectada!');
          console.log('   📝 Config:', currentSectionData.playgroundConfig);
          setShowPlaygroundCall(true);
          return;
        }

        if (!isLastSection) {
          console.log(`🎯 [V5-V2] Avançando para próxima seção (${currentSection} → ${currentSection + 1})`);
          setForceAutoplayNext(true); // 🔧 FIX: Forçar autoplay na próxima seção
          setCurrentSection(prev => prev + 1);
          return;
        }

        console.log('🎯 [V5-V2] Última seção completada');
      }
      
      if (lessonData.exercisesConfig || lessonData.finalPlaygroundConfig) {
        console.log('🎉 [V5-CONFETTI] Última seção completa! Disparando celebração...');
        
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        
        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            clearInterval(interval);
            return;
          }
          
          const particleCount = 50 * (timeLeft / duration);
          
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#06b6d4', '#8b5cf6', '#fbbf24', '#f472b6']
          });
          
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#06b6d4', '#8b5cf6', '#fbbf24', '#f472b6']
          });
        }, 250);
        
        toast({
          title: "🎉 Aula completa!",
          description: "Você dominou o conteúdo! Agora vamos praticar!",
          duration: 4000,
        });

        console.log('🎯 [V5-AUDIO-ENDED] Verificando condições:', {
          hasExercisesConfig: !!lessonData.exercisesConfig,
          exercisesCount: lessonData.exercisesConfig?.length || 0,
          hasFinalPlayground: !!lessonData.finalPlaygroundConfig,
          currentPhaseBeforeChange: currentPhase
        });
        // 🎯 V5 FIX: Mostrar card de parabéns ANTES do playground
        setShowEndCard(true);
        console.log('🎯 [V5-AUDIO-ENDED] Mostrando card de parabéns');
      } else {
        setShowEndCard(true);
        console.log('🎯 [V5-AUDIO-ENDED] Mostrando end card');
      }
    };

    audio.addEventListener('ended', handleAudioEnded);
    return () => audio.removeEventListener('ended', handleAudioEnded);
  }, [lessonData.exercisesConfig, lessonData.finalPlaygroundConfig, currentPhase, isV2, currentSection, lessonData.sections.length]);

  // Detectar seção end-audio
  useEffect(() => {
    const section = lessonData.sections[currentSection];
    
    if (isV2 && section?.type === 'end-audio') {
      console.log('🎯 [V5-V2] Seção end-audio detectada, deixando áudio tocar até o fim');
      return;
    }
    
    if (!isV2 && section?.type === 'end-audio' && !showEndCard && currentPhase === 'audio') {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
      
      setJumpedToExercises(false);
      
      if (lessonData.exercisesConfig || lessonData.finalPlaygroundConfig) {
        setCurrentPhase('transition');
        console.log('🎯 [V5-END-AUDIO] Indo para transição (tem exercícios)');
      } else {
        setShowEndCard(true);
        console.log('🎯 [V5-END-AUDIO] Fim da mini-aula detectado');
      }
    }
  }, [currentSection, lessonData.sections, lessonData.exercisesConfig, lessonData.finalPlaygroundConfig, showEndCard, currentPhase, isV2]);

  // Ir para exercícios após end-audio
  const handleGoToExercises = () => {
    console.log('🎯 [V5-DEBUG HANDLER] handleGoToExercises chamado');
    console.log('🎯 [V5-DEBUG HANDLER] Estado atual:', {
      hasExercisesConfig: !!lessonData.exercisesConfig,
      exercisesConfigLength: lessonData.exercisesConfig?.length,
      exercisesConfig: lessonData.exercisesConfig,
      hasFinalPlaygroundConfig: !!lessonData.finalPlaygroundConfig,
      showEndCard,
      currentPhase
    });

    setShowEndCard(false);
    // 🎯 V5 FIX: Fluxo correto - Card Parabéns → Playground Real → Exercícios
    // Sempre ir para playground-real primeiro (chat com IA)
    console.log('🎯 [V5-DEBUG HANDLER] Indo para playground-real (chat com IA)');
    setCurrentPhase('playground-real');
  };

  const [exercisesCompleted, setExercisesCompleted] = useState(false);
  const [exerciseScores, setExerciseScores] = useState<number[]>([]);
  const [lessonStartTime] = useState(Date.now());
  const [achievementMilestone, setAchievementMilestone] = useState<number | null>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [gamificationResult, setGamificationResult] = useState<GamificationResult | null>(null);
  
  const [pointsNotification, setPointsNotification] = useState<{
    show: boolean;
    points: number;
    reason: string;
  }>({ show: false, points: 0, reason: '' });

  const handleExercisesComplete = async (data?: { allExercisesCompleted?: boolean }) => {
    if (exercisesCompleted) {
      console.warn('⚠️ [V5-EXERCISES] Já foi completado, ignorando chamada duplicada');
      return;
    }
    
    setExercisesCompleted(true);
    console.log('✅ [V5-EXERCISES] Completados');
    console.log('📊 [V5-EXERCISES] Scores finais:', exerciseScores);
    console.log('📊 [V5-EXERCISES] All exercises completed:', data?.allExercisesCompleted);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const timeSpent = (Date.now() - lessonStartTime) / 1000 / 60;
        const avgScore = exerciseScores.length > 0 
          ? exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length 
          : 0;
        
        let totalPoints = POINTS.LESSON_COMPLETE;
        let bonusReasons: string[] = [];
        
        if (avgScore >= 100) {
          totalPoints += POINTS.PERFECT_SCORE;
          bonusReasons.push('+50 perfeição');
        }
        
        if (timeSpent < 15) {
          totalPoints += POINTS.FAST_COMPLETION;
          bonusReasons.push('+30 velocidade');
        }
        
        const newStreak = await updateStreak(user.id);
        
        if (newStreak >= 7) {
          totalPoints = Math.round(totalPoints * POINTS.STREAK_BONUS_MULTIPLIER);
          bonusReasons.push('x1.5 streak');
        }
        
        await awardPoints(user.id, totalPoints, 'Aula completada');
        
        await updateMissionProgress('aulas', 1);
        
        const bonusText = bonusReasons.length > 0 ? ` (${bonusReasons.join(', ')})` : '';
        setPointsNotification({
          show: true,
          points: totalPoints,
          reason: `Aula completada${bonusText}`,
        });
        
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('status', 'completed');
        
        if (!progressError && progressData) {
          const totalCompleted = progressData.length + 1;
          console.log(`🎯 [V5-ACHIEVEMENT] Total de aulas completadas: ${totalCompleted}`);
          
          if (totalCompleted === 1) await checkAndAwardAchievement(user.id, '1_lesson');
          if (totalCompleted === 5) await checkAndAwardAchievement(user.id, '5_lessons');
          if (totalCompleted === 10) await checkAndAwardAchievement(user.id, '10_lessons');
          if (totalCompleted === 25) await checkAndAwardAchievement(user.id, '25_lessons');
          if (totalCompleted === 50) await checkAndAwardAchievement(user.id, '50_lessons');
          
          const milestones = [1, 5, 10, 25, 50];
          const achievedMilestone = milestones.find(m => m === totalCompleted);
          
          if (achievedMilestone) {
            console.log(`🏆 [V5-ACHIEVEMENT] Marco atingido: ${achievedMilestone} aulas!`);
            setAchievementMilestone(achievedMilestone);
          }
        }
      }
    } catch (error) {
      console.error('❌ [V5-GAMIFICATION] Erro:', error);
    }

    setCurrentPhase('completed');
  };
  
  useEffect(() => {
    if (currentPhase === 'exercises') {
      console.log('🎯 [V5-EXERCISES] Entrando na fase de exercícios');
      setExercisesCompleted(false);
    }
  }, [currentPhase]);

  const handleFinalPlaygroundComplete = () => {
    // 🔄 Após playground final: ir para exercises se existirem, senão ir para completed
    if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
      console.log('🎯 [V5-FINAL-PLAYGROUND] Indo para fase de exercícios');
      setCurrentPhase('exercises');
    } else {
      console.log('🎯 [V5-FINAL-PLAYGROUND] Indo para tela de conclusão');
      setCurrentPhase('completed');
    }
  };
  
  const progress = isV2
    ? ((currentSection / Math.max(1, lessonData.sections.length - 1)) * 100)
    : (duration > 0 ? (currentTime / duration) * 100 : 0);
  
  const handleContinueClick = () => {
    onComplete({ audioProgress: maxAudioProgress });
  };

  console.log('🔍 [V5-RENDER] Fase atual:', currentPhase, {
    hasExercises: !!lessonData.exercisesConfig,
    exercisesCount: lessonData.exercisesConfig?.length || 0,
    showEndCard,
    currentSection,
    totalSections: lessonData.sections.length
  });

  // 🚀 Renderizar playground real interativo
  if (currentPhase === 'playground-real') {
    console.log('🎮 [V5-RENDER] Renderizando fase playground-real');
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {lessonData.sections.map((section, idx) => {
            const sectionContent = section.visualContent || section.content;
            if (!sectionContent) return null;

            return (
              <Card key={idx} className="p-6">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {sectionContent}
                  </ReactMarkdown>
                </div>
              </Card>
            );
          })}

          <PlaygroundRealChat
            lessonId={lessonData.id}
            onComplete={() => {
              console.log('✅ [V5-PLAYGROUND-REAL] Usuário completou interação');
              // 🎯 V5 FIX: Após playground-real, ir para exercícios (ou completed se não tiver)
              if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
                console.log('🎯 [V5-PLAYGROUND-REAL] Indo para exercícios');
                setCurrentPhase('exercises');
              } else {
                console.log('🎯 [V5-PLAYGROUND-REAL] Sem exercícios, indo para completed');
                setCurrentPhase('completed');
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Renderizar transição para exercícios
  if (currentPhase === 'transition') {
    return (
      <TransitionCard 
        title="Hora dos Exercícios! 🎯"
        onContinue={() => {
          if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
            setCurrentPhase('exercises');
          } else if (lessonData.finalPlaygroundConfig) {
            setCurrentPhase('playground-final');
          } else {
            onComplete({ audioProgress: maxAudioProgress });
          }
        }}
      />
    );
  }

  // Renderizar conclusão (gamificação)
  if (currentPhase === 'completed') {
    if (showResultCard && gamificationResult) {
      return (
        <LessonResultCard
          xpDelta={gamificationResult.xp_delta}
          coinsDelta={gamificationResult.coins_delta}
          newPowerScore={gamificationResult.new_power_score}
          newCoins={gamificationResult.new_coins}
          patentName={gamificationResult.patent_name}
          isNewPatent={gamificationResult.is_new_patent}
          exerciseScores={exerciseScores}
          onContinue={() => {
            if (onMarkComplete) {
              onMarkComplete();
            }
            navigate('/dashboard');
          }}
          onBackToTrail={() => {
            if (trailId) {
              navigate(`/trail/${trailId}`);
            } else {
              navigate('/dashboard');
            }
          }}
        />
      );
    }

    return (
      <LessonCompletionSummary
        lessonTitle={lessonData.title}
        exerciseScores={exerciseScores}
        totalExercises={lessonData.exercisesConfig?.length || 0}
        onContinue={async () => {
          console.log('🎁 [V5-RECOMPENSAS] Registrando evento de gamificação');
          const result = await registerGamificationEvent('lesson_completed', lessonData.id);
          
          if (result) {
            console.log('✅ [V5-RECOMPENSAS] Resultado recebido:', result);
            setGamificationResult(result);
            setShowResultCard(true);
          } else {
            console.error('❌ [V5-RECOMPENSAS] Falha ao obter resultado');
            if (onMarkComplete) {
              onMarkComplete();
            }
            navigate('/dashboard');
          }
        }}
      />
    );
  }

  // Renderizar fase de exercícios
  if (currentPhase === 'exercises' && lessonData.exercisesConfig) {
    console.log('📝 [V5-RENDER] Renderizando fase exercises');
    const exerciseMetadata = lessonData.exercisesConfig.map(ex => ({
      title: ex.title,
      type: ex.type,
    }));
    
    return (
      <ExercisesSection
        key="exercises-phase"
        exercises={lessonData.exercisesConfig}
        onComplete={handleExercisesComplete}
        onScoreUpdate={(scores) => setExerciseScores(scores)}
        exerciseMetadata={exerciseMetadata}
        onBack={() => {
          console.log('⬅️ [V5-EXERCISES] Voltando para trilha');
          if (trailId) {
            navigate(`/trail/${trailId}`);
          } else {
            navigate('/dashboard');
          }
        }}
      />
    );
  }

  // Renderizar playground final
  if (currentPhase === 'playground-final' && lessonData.finalPlaygroundConfig) {
    const isFinalPlaygroundConfig = 'steps' in lessonData.finalPlaygroundConfig;
    
    if (!isFinalPlaygroundConfig) {
      console.warn('⚠️ [V5] finalPlaygroundConfig não é FinalPlaygroundConfig, pulando playground final');
      handleFinalPlaygroundComplete();
      return null;
    }
    
    return (
      <GuidedPlayground
        config={lessonData.finalPlaygroundConfig as FinalPlaygroundConfig}
        onComplete={handleFinalPlaygroundComplete}
      />
    );
  }
  
  return (
    <div 
      data-testid="guided-lesson-v5"
      data-current-phase={currentPhase}
      data-current-section={currentSection}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 animate-fade-in"
    >
      {/* Header - Mais compacto no mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-md safe-area-top">
        <div className="w-full px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3 max-w-[1920px] mx-auto">
            <button 
              onClick={() => navigate(`/trail/${trailId || lessonData.trackId}`)} 
              className="p-1.5 sm:p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-all flex-shrink-0 touch-manipulation"
              aria-label="Voltar para trilha"
            >
              <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5 text-slate-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xs sm:text-base font-semibold text-slate-900 truncate leading-tight">{lessonData.title}</h1>
              <p className="text-[10px] sm:text-xs text-slate-600 truncate hidden sm:block">{lessonData.trackName}</p>
            </div>
            {/* Progresso - Mais compacto no mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <span className="text-[10px] sm:text-xs font-bold bg-clip-text text-transparent"
                    style={{backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)'}}>
                {Math.round(progress)}%
              </span>
              <div className="w-12 sm:w-24 h-1.5 sm:h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full transition-all" style={{width: `${progress}%`, backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)'}} />
              </div>
            </div>
            <button 
              onClick={skipToExercises}
              disabled={!lessonData.exercisesConfig && !lessonData.finalPlaygroundConfig}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg active:scale-95 transition-all flex-shrink-0 touch-manipulation ${
                lessonData.exercisesConfig || lessonData.finalPlaygroundConfig
                  ? 'cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed opacity-50'
              }`}
              style={lessonData.exercisesConfig || lessonData.finalPlaygroundConfig 
                ? {backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)'}
                : undefined}
            >
              <Sparkles className="w-4 h-4 sm:w-3 sm:h-3 sm:inline sm:mr-1" />
              <span className="hidden sm:inline">Exercícios</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal - Padding ajustado para mobile */}
      <div className="w-full px-3 sm:px-6 pt-14 sm:pt-20 pb-44 sm:pb-32">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-12">
            
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                
                <div className="bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-xl rounded-2xl px-4 py-7 border border-primary/20 shadow-xl">
                  <div className="flex justify-center mb-4">
                    <LivAvatar 
                      size="medium"
                      isPlaying={isPlaying && isAudioEnabled}
                      showHalo={false}
                      state={isPlaying && isAudioEnabled ? 'speaking' : 'idle'}
                      theme="fundamentos"
                      className={`${!isAudioEnabled ? 'grayscale opacity-50' : ''}`}
                    />
                  </div>
                  
                  <button
                    onClick={toggleAudio}
                    className={`w-full px-2.5 py-1.5 rounded-full font-medium text-[10px] text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 ${
                      isAudioEnabled 
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-500' 
                        : 'bg-green-500'
                    }`}
                  >
                    {isAudioEnabled ? '🔊 Silenciar' : '🔇 Ativar'}
                  </button>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-200/50 shadow-xl">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Seções da aula</h3>
                  <div className="space-y-1.5">
              {lessonData.sections.map((section, index) => {
                const isRenderable = !section.type || section.type === 'text';
                const isSpecial = section.type === 'playground' || section.type === 'end-audio';
                
                return (
                  <button
                    key={section.id}
                    onClick={() => isRenderable ? jumpToSection(index) : null}
                    disabled={!isRenderable}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-all duration-300 hover:scale-[1.02] ${
                      currentSection === index
                        ? 'text-white shadow-lg scale-[1.02]'
                        : isSpecial
                        ? 'bg-amber-50 text-amber-600 cursor-default'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:shadow-md'
                    } ${!isRenderable ? 'opacity-50' : ''}`}
                    style={currentSection === index 
                      ? {backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)', boxShadow: '0 10px 30px rgba(34, 211, 238, 0.3)'}
                      : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        currentSection === index ? 'bg-white/20' : 'bg-slate-200'
                      }`}>
                        {isSpecial ? '🎮' : index + 1}
                      </span>
                      <span className="truncate">{section.title || section.id}</span>
                    </div>
                  </button>
                );
              })}
                  </div>
                </div>
                
              </div>
            </aside>
            
            <main className={`space-y-4 sm:space-y-6 min-w-0 transition-opacity duration-500`}>
              {lessonData.sections
                .map((section, originalIndex) => ({ section, originalIndex }))
                .map(({ section, originalIndex }) => {
                  // 🎬 V5 SEGMENTOS: Construir segmentos para esta seção
                  const sectionSegments = buildSegmentsForSection(originalIndex);
                  const textSegmentId = `section-${originalIndex}-text`;
                  const isTextActive = currentSection === originalIndex && activeSegmentId === textSegmentId;
                  const isCardActive = (cardIdx: number) =>
                    currentSection === originalIndex && activeSegmentId === `section-${originalIndex}-card-${cardIdx}`;

                  // Buscar cards da seção
                  const sectionCards = sectionSegments.filter(s => s.type === 'card');

                  return (
                  <React.Fragment key={section.id}>
                    {/* 🎬 V5 SEGMENTOS: Renderizar texto da seção como segmento */}
                    <div
                      ref={(el) => { segmentRefs.current[textSegmentId] = el; }}
                      id={`section-${originalIndex}`}
                      data-testid="lesson-section"
                      data-section-index={originalIndex}
                      data-segment-id={textSegmentId}
                      data-is-active={currentSection === originalIndex}
                      data-segment-active={isTextActive}
                      data-section-updated={currentSection === originalIndex && sectionJustChanged ? 'true' : 'false'}
                      className={`transition-all duration-1000 ease-out ${
                        isAudioEnabled
                          ? (currentSection >= originalIndex ? 'opacity-100 translate-y-0 scale-100' : 'opacity-30 translate-y-8 scale-95')
                          : 'opacity-100 translate-y-0 scale-100'
                      } ${currentSection === originalIndex && sectionJustChanged ? 'animate-[fade-in_0.6s_ease-out]' : ''}`}
                      style={{
                        transitionDelay: currentSection === originalIndex ? '0ms' : `${Math.abs(originalIndex - currentSection) * 50}ms`
                      }}
                    >
                      <div className={`bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 border shadow-xl transition-all duration-700 ease-out relative overflow-hidden ${
                        isTextActive
                          ? 'border-cyan-300/60 ring-2 ring-cyan-400/30 shadow-2xl shadow-cyan-400/20 scale-[1.01]'
                          : currentSection === originalIndex
                          ? 'border-cyan-200/40 shadow-lg'
                          : 'border-slate-200/50 hover:border-slate-300/50 hover:shadow-2xl'
                      } ${currentSection === originalIndex && sectionJustChanged ? 'animate-[scale-in_0.5s_ease-out]' : ''}`}>
                        {isTextActive && sectionJustChanged && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-transparent animate-[slide-in-right_1s_ease-out]" />
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/5 to-purple-300/5 animate-pulse" />
                          </>
                        )}
                        {/* Header da seção - Mais compacto no mobile */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5 pb-3 sm:pb-4 border-b border-slate-200/50 relative z-10">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 shadow-md transition-all ${
                            currentSection === originalIndex
                              ? 'text-white'
                              : 'bg-slate-100 text-slate-500'
                          } ${isTextActive && sectionJustChanged ? 'duration-300 scale-125 shadow-2xl rotate-[360deg]' : 'duration-500 scale-100 rotate-0'}`}
                          style={currentSection === originalIndex
                            ? {backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)', boxShadow: '0 10px 30px rgba(34, 211, 238, 0.6)'}
                            : undefined}>
                            {originalIndex + 1}
                          </div>
                          {isTextActive && (
                            <span className={`text-[10px] sm:text-xs font-medium text-cyan-600 flex items-center gap-1 sm:gap-1.5 transition-all ${
                              sectionJustChanged ? 'scale-110 font-bold' : 'scale-100'
                            }`}>
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                              Você está aqui
                            </span>
                          )}
                        </div>
                        {/* Conteúdo markdown - Tipografia responsiva */}
                        <div className={`prose prose-slate prose-sm max-w-none transition-all duration-500
  [&_h1]:!text-lg [&_h1]:sm:!text-[25px] [&_h1]:!leading-tight [&_h1]:!mb-3 [&_h1]:sm:!mb-4 [&_h1]:!font-bold
  [&_h2]:!text-base [&_h2]:sm:!text-[21px] [&_h2]:!leading-snug [&_h2]:!mb-2 [&_h2]:sm:!mb-3 [&_h2]:!mt-4 [&_h2]:sm:!mt-6 [&_h2]:!font-bold
  [&_h3]:!text-sm [&_h3]:sm:!text-[17px] [&_h3]:!mb-2 [&_h3]:!mt-3 [&_h3]:sm:!mt-4 [&_h3]:!font-bold
  [&_p]:!text-sm [&_p]:sm:!text-base [&_p]:!leading-relaxed [&_p]:!mb-2.5 [&_p]:sm:!mb-3 [&_p]:text-slate-700
  [&_li]:!text-sm [&_li]:sm:!text-base [&_li]:!leading-relaxed [&_li]:text-slate-700
  [&_ul]:!my-2 [&_ul]:sm:!my-3 [&_ul]:!space-y-1.5 [&_ul]:sm:!space-y-2
  [&_ol]:!my-2 [&_ol]:sm:!my-3 [&_ol]:!space-y-1.5 [&_ol]:sm:!space-y-2
  [&_strong]:!font-semibold [&_strong]:!text-cyan-600 [&_strong]:bg-cyan-50/50 [&_strong]:px-0.5 [&_strong]:rounded
  [&_em]:!text-slate-600 [&_em]:!not-italic [&_em]:!font-medium
  [&_code]:!text-purple-600 [&_code]:!bg-purple-100 [&_code]:!px-1 [&_code]:sm:!px-1.5 [&_code]:!py-0.5 [&_code]:!rounded [&_code]:!text-xs [&_code]:sm:!text-sm [&_code]:!font-mono
  [&_blockquote]:!border-l-4 [&_blockquote]:!border-l-cyan-400 [&_blockquote]:!bg-gradient-to-r [&_blockquote]:!from-cyan-50/60 [&_blockquote]:!to-blue-50/40
  [&_blockquote]:!py-2 [&_blockquote]:sm:!py-3 [&_blockquote]:!px-3 [&_blockquote]:sm:!px-4 [&_blockquote]:!rounded-r-lg [&_blockquote]:!my-3 [&_blockquote]:sm:!my-4 [&_blockquote]:!text-sm [&_blockquote]:sm:!text-base
  [&_pre]:!bg-slate-900 [&_pre]:!text-slate-100 [&_pre]:!p-3 [&_pre]:sm:!p-4 [&_pre]:!rounded-lg [&_pre]:!my-3 [&_pre]:sm:!my-4 [&_pre]:!text-xs [&_pre]:sm:!text-sm [&_pre]:!overflow-x-auto
  [&_a]:!text-cyan-600 [&_a]:!no-underline [&_a]:!font-medium hover:[&_a]:!underline
  [&_img]:!rounded-lg [&_img]:!shadow-md [&_img]:!my-4 [&_img]:sm:!my-6 [&_img]:!max-w-full ${
    isTextActive && sectionJustChanged ? 'animate-scale-in' : ''
  }`}>
                          <ReactMarkdown>{(section.visualContent || section.content || '').replace(/<!--[\s\S]*?-->/g, '')}</ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* 🎬 V5 SEGMENTOS: Renderizar Experience Cards como segmentos separados */}
                    {sectionCards.map((cardSegment, cardIdx) => {
                      const cardId = cardSegment.id;
                      const cardConfig = cardSegment.cardConfig;
                      const cardType = cardConfig?.type || cardConfig?.effectType || '';
                      const isThisCardActive = isCardActive(cardIdx);

                      return (
                        <div
                          key={cardId}
                          ref={(el) => { segmentRefs.current[cardId] = el; }}
                          data-segment-id={cardId}
                          data-segment-type="card"
                          data-segment-active={isThisCardActive}
                          className={`transition-all duration-700 ease-out ${
                            isAudioEnabled
                              ? (currentSection >= originalIndex ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-8')
                              : 'opacity-100 translate-y-0'
                          } ${isThisCardActive ? 'scale-[1.02] z-10' : 'scale-100'}`}
                        >
                          <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                            isThisCardActive
                              ? 'ring-4 ring-purple-400/50 shadow-2xl shadow-purple-500/30'
                              : 'shadow-lg hover:shadow-xl'
                          }`}>
                            {/* Renderizar o card effect */}
                            {isValidCardEffectType(cardType) ? (
                              <DynamicCardEffect type={cardType} isActive={isThisCardActive} />
                            ) : cardType === 'ia-book' ? (
                              <IaBookExperienceCard />
                            ) : cardConfig?.props ? (
                              <DynamicExperienceCard
                                type={cardType}
                                title={cardConfig.props.title || 'Experience Card'}
                                subtitle={cardConfig.props.subtitle}
                                icon={cardConfig.props.icon || 'sparkles'}
                                colorScheme={cardConfig.props.colorScheme || 'purple'}
                                chapters={cardConfig.props.chapters || []}
                                effectDescription={cardConfig.props.effectDescription}
                              />
                            ) : (
                              <DynamicExperienceCard
                                type={cardType}
                                title={cardType}
                                icon="sparkles"
                                colorScheme="purple"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
                })}
            </main>
            
          </div>
        </div>
      </div>

      {/* Liv Mobile/Tablet - Flutuando acima do player */}
      <div className="lg:hidden fixed bottom-[108px] left-[55px] z-[51] pointer-events-auto">
        <button
          onClick={toggleAudio}
          className="relative group touch-manipulation"
          aria-label={isAudioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
        >
          {/* Avatar circular com efeitos combinados: moldura branca, breathing, glow */}
          <div 
            className={`w-[54px] h-[54px] md:w-[65px] md:h-[65px] rounded-full overflow-hidden transition-all duration-500 ${
              !isAudioEnabled ? 'grayscale opacity-60' : ''
            } ${isPlaying && isAudioEnabled ? 'liv-speaking-combined' : 'liv-breathing-idle'}`}
          >
            <img 
              src="/liv-avatar-mobile.png" 
              alt="Liv" 
              className="w-full h-full object-cover object-top scale-[1.8] translate-y-[15%]"
            />
          </div>
        </button>
      </div>

      {/* Player fixo no rodapé */}
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50 shadow-2xl transition-all duration-300 safe-area-bottom ${
        !isAudioEnabled ? 'grayscale opacity-60' : ''
      }`}>
        <div className="w-full px-3 sm:px-6 py-2 sm:py-3">
          <div className="max-w-[1800px] mx-auto">
            
            {/* Desktop Player */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <button 
                  onClick={skipBackward} 
                  disabled={showPlaygroundMid || showEndCard}
                  className="w-9 h-9 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SkipBack size={16} />
                </button>
                <button 
                  disabled={showPlaygroundMid || showEndCard}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    shouldShowPlayPulse && !isPlaying ? 'animate-pulse ring-4 ring-primary/50' : ''
                  }`}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)',
                    boxShadow: '0 10px 30px rgba(34, 211, 238, 0.3)'
                  }}
                  onClick={() => {
                    togglePlayPause();
                    if (shouldShowPlayPulse) setShouldShowPlayPulse(false);
                  }}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                <button 
                  onClick={skipForward} 
                  disabled={showPlaygroundMid || showEndCard}
                  className="w-9 h-9 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SkipForward size={16} />
                </button>
              </div>
              
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <Volume2 className="text-cyan-400 flex-shrink-0" size={18} />
                
                {!isV2 && (
                  <>
                    <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all group min-w-0" onClick={handleProgressBarClick}>
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all relative" style={{ width: `${progress}%` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(duration)}</span>
                  </>
                )}
                
                {isV2 && (
                  <>
                    <span className="text-xs text-slate-300 font-medium">
                      Seção {currentSection + 1} de {lessonData.sections.length}
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden group min-w-0">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all relative" style={{ width: `${progress}%` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
                  </>
                )}
              </div>
              
              <button onClick={cycleSpeed} className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-bold text-xs transition-all min-w-[55px] flex-shrink-0">
                {playbackSpeed}x
              </button>
              <button 
                onClick={handleContinueClick} 
                className="px-5 py-2 rounded-xl text-white font-semibold text-sm shadow-lg transition-all whitespace-nowrap hover:scale-105 flex-shrink-0"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)',
                  boxShadow: '0 10px 30px rgba(34, 211, 238, 0.3)'
                }}
              >
                Continuar
              </button>
            </div>
            
            {/* Mobile Player - Redesenhado para melhor UX */}
            <div className="flex md:hidden flex-col gap-2">
              {/* Barra de progresso */}
              <div className="flex items-center gap-2">
                {isV2 ? (
                  <>
                    <span className="text-[10px] text-slate-400 font-bold tabular-nums w-8 text-center">
                      {currentSection + 1}/{lessonData.sections.length}
                    </span>
                    <div className="flex-1 h-2 bg-slate-700/40 rounded-full overflow-hidden touch-manipulation" onClick={handleProgressBarClick}>
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-400 font-medium tabular-nums w-10">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-2 bg-slate-700/40 rounded-full overflow-hidden touch-manipulation" onClick={handleProgressBarClick}>
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium tabular-nums w-10 text-right">{formatTime(duration)}</span>
                  </>
                )}
              </div>
              
              {/* Controles - Touch targets maiores */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={skipBackward} 
                    className="w-10 h-10 bg-slate-700/50 active:bg-slate-600 rounded-xl flex items-center justify-center text-white touch-manipulation"
                  >
                    <SkipBack size={18} />
                  </button>
                  <button 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg touch-manipulation active:scale-95 transition-transform ${
                      shouldShowPlayPulse && !isPlaying ? 'animate-pulse ring-4 ring-primary/50' : ''
                    }`}
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)',
                      boxShadow: '0 8px 24px rgba(34, 211, 238, 0.3)'
                    }}
                    onClick={() => {
                      togglePlayPause();
                      if (shouldShowPlayPulse) setShouldShowPlayPulse(false);
                    }}
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                  </button>
                  <button 
                    onClick={skipForward} 
                    className="w-10 h-10 bg-slate-700/50 active:bg-slate-600 rounded-xl flex items-center justify-center text-white touch-manipulation"
                  >
                    <SkipForward size={18} />
                  </button>
                  <button 
                    onClick={cycleSpeed} 
                    className="w-10 h-10 bg-slate-700/50 active:bg-slate-600 rounded-xl flex items-center justify-center text-white font-bold text-xs touch-manipulation"
                  >
                    {playbackSpeed}x
                  </button>
                </div>
                <button 
                  onClick={handleContinueClick} 
                  className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg touch-manipulation active:scale-95 transition-transform"
                  style={{backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)'}}
                >
                  Continuar
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Card de Fim da Aula */}
      {showEndCard && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
          <Card className="max-w-lg w-full p-8 text-center bg-white/95 backdrop-blur-xl border-2 border-primary/50 shadow-2xl">
            <div className="flex justify-center mb-6">
              <LivAvatar 
                size="xl"
                showHalo={true}
                state="idle"
                theme="fundamentos"
              />
            </div>
            
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              ✅ Aula completa! Parabéns! 🎉
            </h2>
            
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Você concluiu todo o conteúdo!
              <br />
              Agora vamos praticar com a IA e fixar o conhecimento.
            </p>
            
            <Button
              onClick={() => {
                console.log('🎯 [V5-BUTTON] Botão "Continuar" clicado!');
                handleGoToExercises();
              }}
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all text-lg py-6"
            >
              🚀 Continuar
            </Button>
          </Card>
        </div>
      )}

      {(audioUrl || isV2) && (
        <audio
          ref={audioRef}
          src={isV2 ? lessonData.sections[0]?.audio_url : audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="auto"
        />
      )}
      
      {/* Achievement Badge */}
      {achievementMilestone && (
        <AchievementBadge
          milestone={achievementMilestone}
          onClose={() => setAchievementMilestone(null)}
        />
      )}
      
      {/* Points Notification */}
      <PointsNotification
        points={pointsNotification.points}
        reason={pointsNotification.reason}
        show={pointsNotification.show}
        onHide={() => setPointsNotification(prev => ({ ...prev, show: false }))}
      />

      {/* 🎮 V5: Card de Convite do Playground Mid-Lesson */}
      {showPlaygroundCall && (() => {
        const playgroundSection = lessonData.sections.find(
          (s: any) => s.showPlaygroundCall && s.playgroundConfig
        );
        return playgroundSection ? (
          <PlaygroundCallCard
            title="Hora da Prática!"
            description={
              (playgroundSection as any).playgroundConfig?.instruction ||
              "Que tal praticar o que você aprendeu? É rápido e vai fixar o conhecimento!"
            }
            onOpen={handleOpenPlayground}
            onSkip={handleSkipPlayground}
          />
        ) : null;
      })()}

      {/* 🎮 V5: Overlay do Playground Mid-Lesson */}
      {showPlaygroundMid && (() => {
        const playgroundSection = lessonData.sections.find(
          (s: any) => s.showPlaygroundCall && s.playgroundConfig
        ) as any;

        if (!playgroundSection?.playgroundConfig) {
          console.warn('🎮 [V5] Playground config não encontrado!');
          return null;
        }

        const config = playgroundSection.playgroundConfig;
        console.log('🎮 [V5] Renderizando PlaygroundMidLesson:', config);

        return (
          <PlaygroundMidLesson
            config={{
              type: config.type || 'real-playground',
              instruction: config.instruction,
              realConfig: config.realConfig || {
                type: 'real-playground',
                title: 'Pratique Agora',
                maiaMessage: config.instruction || 'Pratique o que você aprendeu!',
                scenario: { title: 'Prática', description: '' },
                prefilledText: '',
                userPlaceholder: 'Digite sua resposta...',
                validation: {
                  minLength: 10,
                  feedback: {
                    tooShort: 'Escreva um pouco mais...',
                    good: 'Boa resposta!',
                    excellent: 'Excelente!'
                  }
                }
              }
            }}
            onComplete={handlePlaygroundComplete}
            lessonId={lessonData.id}
          />
        );
      })()}
    </div>
  );
}
