import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Sparkles, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { GuidedLessonProps } from '@/types/guidedLesson';
import { PlaygroundMidLesson } from './PlaygroundMidLesson';
import { TransitionCard } from './TransitionCard';
import { ExercisesSection } from './ExercisesSection';
import { GuidedPlayground } from './GuidedPlayground';
import InteractiveSimulationPlayground from './InteractiveSimulationPlayground';
import { PlaygroundCallCard } from './PlaygroundCallCard';
import { ConclusionScreen } from './ConclusionScreen';
import { AchievementBadge } from './AchievementBadge';
import { PointsNotification } from '@/components/gamification/PointsNotification';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { awardPoints, updateStreak, checkAndAwardAchievement, POINTS } from '@/lib/gamification';

export function GuidedLesson({ lessonData, onComplete, audioUrl, wordTimestamps, nextLessonId, nextLessonType }: GuidedLessonProps) {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lessonData.duration || 0);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  
  // 🆕 V2: Detectar se é aula modelo V2 (áudios separados por seção)
  const isV2 = lessonData.sections[0]?.audio_url !== undefined;
  const hasPlaygroundSupport = lessonData.contentVersion !== 2; // V2 não tem playground
  const [sectionJustChanged, setSectionJustChanged] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [sectionWhenMuted, setSectionWhenMuted] = useState(0);
  const [showEndCard, setShowEndCard] = useState(false);
  const [showPlaygroundCall, setShowPlaygroundCall] = useState(false);
  const [showPlaygroundMid, setShowPlaygroundMid] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<
    'audio' | 'playground-mid' | 'transition' | 'exercises' | 'playground-final' | 'completed'
  >('audio');
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasScrolledRef = useRef<{ [key: number]: boolean }>({});
  const lastSectionRef = useRef<number>(0);
  const prevSectionRef = useRef<number>(-1);
  
  // 🎮 Estado do playground (sem persistência - sempre reseta)
  const [playgroundTriggered, setPlaygroundTriggered] = useState(false);
  const [playgroundCompleted, setPlaygroundCompleted] = useState(false);
  
  // 📍 Estado para controlar se usuário pulou para exercícios
  const [jumpedToExercises, setJumpedToExercises] = useState(false);
  
  // 🔄 Estado para controlar reset de áudio pendente
  const [pendingAudioReset, setPendingAudioReset] = useState<number | null>(null);
  
  // 🔒 Flag para prevenir race condition no syncLoop durante reset
  const [isResetting, setIsResetting] = useState(false);
  
  // 🎯 Estado para animação pulse no botão play
  const [shouldShowPlayPulse, setShouldShowPlayPulse] = useState(false);
  
  // 🔍 DEBUG: Ver dados carregados
  useEffect(() => {
    console.log('📦 [LESSON DATA]', {
      id: lessonData.id,
      title: lessonData.title,
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
    // Verificar se tem exercícios ou playground final
    const hasExercises = lessonData.exercisesConfig || lessonData.finalPlaygroundConfig;
    
    if (!hasExercises) {
      console.log('⚠️ [SKIP] Aula não tem exercícios, chamando onComplete');
      onComplete();
      return;
    }
    
    console.log('⏭️ [SKIP] Pulando direto para exercícios');
    
    // 🆕 Marcar que usuário pulou (não completou a aula)
    setJumpedToExercises(true);
    
    // Pausar áudio
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    // Ir direto para transição
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
    
    // 🔥 ATIVAR FLAG PARA BLOQUEAR SYNCLOOP
    setIsResetting(true);
    
    // 1. Atualizar ref ANTES de mudar currentTime (previne race condition no loop)
    lastSectionRef.current = sectionIndex;
    prevSectionRef.current = sectionIndex - 1;
    
    // 2. Para V2, trocar a fonte do áudio se necessário
    if (isV2 && targetSection.audio_url) {
      audio.pause();
      audio.src = targetSection.audio_url;
      audio.load();
    }
    
    // 3. Resetar tempo do áudio
    audio.currentTime = targetTime;
    
    // 4. Pausar áudio (usuário decide quando dar play)
    audio.pause();
    setIsPlaying(false);
    
    // 5. Forçar update dos states
    setCurrentSection(sectionIndex);
    setCurrentTime(targetTime);
    
    // 6. 🔥 AGUARDAR O ÁUDIO PROCESSAR O SEEK E ENTÃO LIBERAR O SYNCLOOP
    const handleSeeked = () => {
      console.log(`✅ [RESET-AUDIO] Seek concluído, liberando syncLoop`);
      setIsResetting(false);
      audio.removeEventListener('seeked', handleSeeked);
    };
    
    audio.addEventListener('seeked', handleSeeked);
    
    // Fallback: se 'seeked' não disparar em 300ms, liberar mesmo assim
    setTimeout(() => {
      console.log(`✅ [RESET-AUDIO] Fallback timeout, liberando syncLoop`);
      setIsResetting(false);
      audio.removeEventListener('seeked', handleSeeked);
    }, 300);
  };

  // 🔄 Helper: Resetar completamente a aula para o início
  const resetLessonToBeginning = (targetSection: number) => {
    console.log(`🔄 [RESET] Resetando aula para seção ${targetSection}`);
    
    // 1. Parar e resetar áudio
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    // 2. Resetar estados do playground
    setPlaygroundTriggered(false);
    setPlaygroundCompleted(false);
    setShowPlaygroundCall(false);
    setShowPlaygroundMid(false);
    
    // 3. Resetar estados de UI
    setShowEndCard(false);
    setSectionJustChanged(false);
    
    // 4. Limpar refs
    hasScrolledRef.current = {};
    lastSectionRef.current = targetSection;
    prevSectionRef.current = -1;
    
    // 5. Agendar reset do áudio
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
    
    // 🎯 Tentar autoplay ao retornar para a aula
    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        console.log('✅ [AUTOPLAY-RESUME] Áudio reiniciado automaticamente');
      } catch (error) {
        console.warn('⚠️ [AUTOPLAY-RESUME] Bloqueado pelo navegador, mostrando hint');
        
        // Mostrar toast
        toast({
          title: "▶️ Continue sua aula",
          description: "Clique em Play para retomar o áudio",
          duration: 5000,
        });
        
        // Ativar animação pulse no botão play
        setShouldShowPlayPulse(true);
        
        // Remover pulse após 8 segundos
        setTimeout(() => setShouldShowPlayPulse(false), 8000);
      }
    };
    
    // Executar após um pequeno delay para garantir que o áudio foi resetado
    setTimeout(tryAutoplay, 100);
  }, [currentPhase, pendingAudioReset]);

  // 🎮 Helper: Ativar playground
  const activatePlayground = () => {
    // 🛡️ V2 não tem playground - retornar imediatamente
    if (!hasPlaygroundSupport) {
      console.log('🚫 [activatePlayground] V2 não suporta playground');
      return;
    }
    
    const audio = audioRef.current;
    console.log(`🔍 [activatePlayground] chamada | audio=${!!audio} | triggered=${playgroundTriggered}`);
    
    // 🛡️ Verificar se realmente existe uma seção com playground configurado
    const hasPlaygroundSection = lessonData.sections.some(s => s.showPlaygroundCall && s.playgroundConfig);
    if (!hasPlaygroundSection) {
      console.log('🚫 [activatePlayground] Nenhum playground configurado nesta aula');
      return;
    }
    
    if (!audio || playgroundTriggered) {
      console.log(`🚫 [activatePlayground] BLOQUEADA | motivo=${!audio ? 'no-audio' : 'already-triggered'}`);
      return;
    }
    
    console.log('🎮 [PLAYGROUND] Ativando...');
    
    // Pausar áudio
    audio.pause();
    setIsPlaying(false);
    
    // Marcar como triggered
    setPlaygroundTriggered(true);
    
    // Mostrar card após 500ms
    setTimeout(() => {
      setShowPlaygroundCall(true);
      console.log('🎮 [PLAYGROUND] Card exibido');
    }, 500);
  };
  
  // 📊 Helper: Telemetria
  const logTelemetry = (event: string, data?: any) => {
    const timestamp = performance.now().toFixed(0);
    const audioTime = audioRef.current?.currentTime.toFixed(1) || '0.0';
    
    console.log(
      `[TELEMETRY] ${timestamp}ms | Audio: ${audioTime}s | ${event}`,
      data || ''
    );
  };

  // 📊 Função para enviar logs de diagnóstico ao Supabase
  const sendDiagnosticLog = async (
    eventType: 'SYNC_STATE' | 'DETECTION' | 'STATE_UPDATE' | 'SCROLL',
    data: {
      audioTime: number;
      currentSection: number;
      targetSection?: number;
      performanceTimestamp: number;
      latencyMs?: number;
      metadata?: any;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Usar o ID da aula diretamente
      const lessonId = lessonData.id;
      
      await supabase.from('diagnostic_logs').insert({
        user_id: user?.id,
        lesson_id: lessonId,
        event_type: eventType,
        audio_time: data.audioTime,
        current_section: data.currentSection,
        target_section: data.targetSection,
        performance_timestamp: data.performanceTimestamp,
        latency_ms: data.latencyMs,
        metadata: data.metadata
      });
    } catch (error) {
      // Silenciosamente falha para não quebrar a aula
      console.error('[TELEMETRY-ERROR]', error);
    }
  };
  
  // 🔧 INICIALIZAÇÃO DO ÁUDIO
  useEffect(() => {
    const audio = audioRef.current;
    
    // Inicializar o ref na primeira montagem
    lastSectionRef.current = 0;
    
    console.log('🔍 [DEBUG] isV2:', isV2);
    console.log('🔍 [DEBUG] audioUrl recebido:', audioUrl);
    console.log('🔍 [DEBUG] audioRef.current:', audio);
    
    if (!audio) {
      console.error('❌ [ÁUDIO] Elemento de áudio não encontrado');
      return;
    }
    
    // V2: usar audio_url da primeira seção
    // V1: usar audioUrl prop
    const initialAudioUrl = isV2 ? lessonData.sections[0]?.audio_url : audioUrl;
    
    if (!initialAudioUrl) {
      console.error('❌ [ÁUDIO] URL do áudio não fornecida');
      return;
    }
    
    console.log(`✅ [ÁUDIO] Inicializando áudio (${isV2 ? 'V2' : 'V1'}):`, initialAudioUrl);
    console.log('📋 [ÁUDIO] Seções:', lessonData.sections.map(s => `${s.id} (${s.timestamp}s)`));
    
    // ✅ CONFIGURAR VOLUME
    audio.volume = 1.0;
    console.log('🔊 [VOLUME] Configurado: 100%');
    
    const handleLoadedMetadata = () => {
      console.log(`✅ [ÁUDIO] Carregado! Duração: ${audio.duration}s`);
      
      // 🆕 V2: Não sobrescrever duration a cada seção, manter a duração inicial
      if (!isV2) {
        setDuration(audio.duration);
      }
      
      audio.volume = 1.0;
      
      // Tentar autoplay
      audio.play().then(() => {
        console.log('✅ [AUTOPLAY] Áudio iniciado automaticamente');
        setIsPlaying(true);
        setIsAudioInitialized(true);
      }).catch(err => {
        console.warn('⚠️ [AUTOPLAY] Bloqueado pelo navegador:', err);
        setIsAudioInitialized(true);
        // Usuário precisará clicar no play
      });
    };
    
    const handleError = (e: Event) => {
      console.error('❌ [ÁUDIO] Erro ao carregar:', e);
      console.error('❌ [ÁUDIO] URL problemática:', audioUrl);
    };
    
    const handleCanPlay = () => {
      console.log('🎵 [ÁUDIO] Pronto para reproduzir');
    };
    
    const handleSeeking = () => {
      console.log('🔄 [SEEKING] Áudio pulou para:', audio.currentTime);
      lastSectionRef.current = -1; // Forçar redetecção
    };
    
    // 🔍 DEBUG: Monitorar play/pause
    audio.onplay = () => {
      console.log('▶️ [AUDIO] Play iniciado');
      setIsPlaying(true);
    };

    audio.onpause = () => {
      console.log('⏸️ [AUDIO] Pausado');
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
      
      // V2: NÃO avançar seção aqui, deixar o evento 'ended' cuidar disso
      if (isV2) {
        // Apenas manter sincronização, sem auto-avanço de seção
        animationFrameId = requestAnimationFrame(syncLoop);
        return;
      }
      
      // V1: Calcular seção ativa baseado no tempo do áudio único
      const activeIndex = calculateActiveSection(currentTime);
      
      // 📊 LOG 1: Estado atual a cada segundo (diagnóstico)
      if (Math.floor(currentTime) !== Math.floor(lastLoggedTime)) {
        console.log(`[SYNC-STATE] Time: ${currentTime.toFixed(2)}s | Current: ${lastSectionRef.current} | Should be: ${activeIndex}`);
        sendDiagnosticLog('SYNC_STATE', {
          audioTime: currentTime,
          currentSection: lastSectionRef.current,
          targetSection: activeIndex,
          performanceTimestamp: performance.now()
        });
        lastLoggedTime = currentTime;
      }
      
      // 🔍 Verificar se precisa mudar de seção (mas NÃO durante reset)
      if (activeIndex !== lastSectionRef.current && !isResetting) {
        const detectionTime = performance.now();
        
        // 📊 LOG 2: Detecção de mudança
        console.log(`[DETECTION] ${currentTime.toFixed(2)}s | Transition: ${lastSectionRef.current}→${activeIndex} | Detection timestamp: ${detectionTime.toFixed(2)}`);
        sendDiagnosticLog('DETECTION', {
          audioTime: currentTime,
          currentSection: lastSectionRef.current,
          targetSection: activeIndex,
          performanceTimestamp: detectionTime
        });
        
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
    
    // 🛡️ Não trocar áudio na primeira montagem (seção 0 já foi carregada)
    if (currentSection === 0 && prevSectionRef.current === -1) {
      prevSectionRef.current = 0;
      return;
    }
    
    // 🛡️ Não trocar se já trocamos manualmente via jumpToSection
    if (prevSectionRef.current === currentSection) {
      console.log(`🛡️ [V2] Seção ${currentSection} já carregada, pulando troca`);
      return;
    }
    
    const section = lessonData.sections[currentSection];
    if (!section?.audio_url) return;
    
    const audio = audioRef.current;
    const wasPlaying = !audio.paused;
    
    console.log(`🔄 [V2] Mudando para áudio da seção ${currentSection}: ${section.audio_url}`);
    
    // Atualizar ref
    prevSectionRef.current = currentSection;
    
    // 🎯 IMPORTANTE: Pausar antes de trocar para evitar race conditions
    audio.pause();
    
    // Trocar fonte do áudio
    audio.src = section.audio_url;
    audio.currentTime = 0;
    audio.load();
    
    // Se estava tocando, continuar tocando após carregar
    if (wasPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`✅ [V2] Áudio da seção ${currentSection} reproduzindo`);
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('⚠️ [V2] Erro ao reproduzir áudio:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentSection, isV2, lessonData.sections]);
  
  // 📊 LOG 3: Medir latência do state update e scroll
  useEffect(() => {
    const updateTime = performance.now();
    const audioTime = audioRef.current?.currentTime || 0;
    
    console.log(`[STATE-UPDATE] Section changed to: ${currentSection} | Audio time: ${audioTime.toFixed(2)}s | Update timestamp: ${updateTime.toFixed(2)}`);
    sendDiagnosticLog('STATE_UPDATE', {
      audioTime: audioTime,
      currentSection: currentSection,
      performanceTimestamp: updateTime
    });
    
    // Scroll após state update - com offset para não cortar o título
    const section = lessonData.sections[currentSection];
    if (isSectionRenderable(section)) {
      const scrollStart = performance.now();
      
      setTimeout(() => {
        const sectionElement = document.getElementById(`section-${currentSection}`);
        if (sectionElement) {
          // Calcular posição com offset para compensar header fixo
          const headerHeight = 120; // altura aumentada para melhor visualização
          const elementTop = sectionElement.getBoundingClientRect().top;
          const offsetTop = elementTop + window.pageYOffset;
          const targetPosition = offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          const scrollEnd = performance.now();
          const latency = scrollEnd - scrollStart;
          console.log(`📜 [SCROLL] Animação suave completada em ${latency.toFixed(2)}ms para seção ${currentSection}`);
          
          sendDiagnosticLog('SCROLL', {
            audioTime: audioTime,
            currentSection: currentSection,
            performanceTimestamp: scrollEnd,
            latencyMs: latency
          });
        } else {
          console.warn(`[SCROLL] Element #section-${currentSection} not found`);
        }
      }, 50); // Pequeno delay para garantir que a animação de fade-in comece primeiro
    }
  }, [currentSection]);
  
  
  // 🎮 TRIGGER 1 (PRIMARY): Timestamp-based com janela ampliada (3s)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    
    let rafId: number;
    
    const checkPlaygroundTrigger = () => {
      if (playgroundTriggered) {
        rafId = requestAnimationFrame(checkPlaygroundTrigger);
        return;
      }
      
      const time = audio.currentTime;
      
      // Encontrar seção com showPlaygroundCall e playgroundConfig (apenas se V1)
      const playgroundSectionIndex = hasPlaygroundSupport 
        ? lessonData.sections.findIndex(s => s.showPlaygroundCall === true && s.playgroundConfig)
        : -1;
      
      if (playgroundSectionIndex !== -1) {
        const nextSection = lessonData.sections[playgroundSectionIndex + 1];
        
        if (nextSection) {
          const triggerTime = nextSection.timestamp - 0.5;
          
          // 🔍 DEBUG: Log contínuo para debug (125s-129s)
          if (time >= 125 && time <= 129) {
            console.log(`🔍 [DEBUG] t=${time.toFixed(2)}s | trigger=${triggerTime.toFixed(2)}s | playing=${isPlaying} | triggered=${playgroundTriggered}`);
          }
          
          if (time >= triggerTime && time < nextSection.timestamp && isPlaying) {
            console.log(`🎮 [TRIGGER-1] ✅ ATIVANDO aos ${time.toFixed(1)}s`);
            logTelemetry('PLAYGROUND_TRIGGER', { trigger: 'timestamp', time });
            activatePlayground();
            cancelAnimationFrame(rafId);
            return;
          }
        }
      }
      
      rafId = requestAnimationFrame(checkPlaygroundTrigger);
    };
    
    rafId = requestAnimationFrame(checkPlaygroundTrigger);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [lessonData.sections, audioUrl, isPlaying]);
  
  // 🎮 TRIGGER 2 (FALLBACK): Section-based (26.5s após entrar na seção 4 = ~127.5s)
  useEffect(() => {
    if (currentSection === 3 && !playgroundTriggered) {
      const fallbackTimer = setTimeout(() => {
        const audio = audioRef.current;
        if (audio && audio.currentTime >= 101 && audio.currentTime < 128) {
          console.log('🎮 [TRIGGER-2] Fallback ativado aos ~127.5s');
          logTelemetry('PLAYGROUND_TRIGGER', { trigger: 'section-fallback' });
          activatePlayground();
        }
      }, 26500); // 26.5 segundos após entrar na Seção 4
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [currentSection, playgroundTriggered]);
  
  // 🎮 TRIGGER 3 (SAFETY NET): Transition detection
  useEffect(() => {
    const prevSection = prevSectionRef.current;
    
    // 🛡️ Safety net apenas para V1 com playground
    if (hasPlaygroundSupport && currentSection === 4 && prevSection === 3 && !playgroundTriggered) {
      const hasPlaygroundSection = lessonData.sections.some(s => s.showPlaygroundCall && s.playgroundConfig);
      if (!hasPlaygroundSection) return;
      console.log('🎮 [TRIGGER-3] Safety net - usuário pulou seção 4');
      logTelemetry('PLAYGROUND_TRIGGER', { trigger: 'safety-net' });
      
      setTimeout(() => {
        const wantToTry = window.confirm(
          '🎮 Você passou pelo exercício interativo!\n\nQuer voltar e tentar?'
        );
        
        if (wantToTry) {
          const audio = audioRef.current;
          if (audio) {
            audio.currentTime = 101;
            setCurrentSection(3);
            activatePlayground();
          }
        }
      }, 1000);
    }
    
    prevSectionRef.current = currentSection;
  }, [currentSection, playgroundTriggered]);
  
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
  
  /**
   * 🎯 REGRA UNIVERSAL: Navegação com Botões do Player (|< e >|)
   * 
   * V1 (áudio único):
   * - skipBackward: retrocede 10s no audio.currentTime
   * - skipForward: avança 10s no audio.currentTime
   * - O useEffect que monitora currentTime atualiza a seção automaticamente
   * 
   * V2 (áudios separados):
   * - skipBackward: 
   *   - Se currentTime < 3s: volta para seção anterior (jumpToSection)
   *   - Caso contrário: retrocede 10s na seção atual
   * - skipForward:
   *   - Se faltam < 3s para acabar: avança para próxima seção (jumpToSection)
   *   - Caso contrário: avança 10s na seção atual
   * 
   * Usa jumpToSection() para garantir troca correta de áudio em V2
   */
  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log(`⏪ [SKIP-BACK] currentTime=${audio.currentTime.toFixed(1)}s, currentSection=${currentSection}`);
    
    if (isV2) {
      // 🆕 V2: Lógica de navegação entre seções
      
      // Se está nos primeiros 3 segundos da seção atual, voltar para seção anterior
      if (audio.currentTime < 3 && currentSection > 0) {
        const previousSection = currentSection - 1;
        console.log(`⏪ [V2-SKIP-BACK] Voltando para seção ${previousSection}`);
        
        // Usar jumpToSection para trocar seção e áudio
        jumpToSection(previousSection);
        
        // Após trocar, posicionar próximo ao final da seção anterior
        setTimeout(() => {
          const prevAudio = audioRef.current;
          if (prevAudio && prevAudio.duration > 10) {
            prevAudio.currentTime = prevAudio.duration - 5; // 5 segundos antes do fim
            console.log(`⏪ [V2-SKIP-BACK] Posicionado em ${prevAudio.currentTime.toFixed(1)}s`);
          }
        }, 300); // Aguardar áudio carregar
        
      } else {
        // Retroceder 10s dentro da mesma seção
        audio.currentTime = Math.max(0, audio.currentTime - 10);
        console.log(`⏪ [V2-SKIP-BACK] Retrocedeu 10s, agora em ${audio.currentTime.toFixed(1)}s`);
      }
      
    } else {
      // V1: Comportamento original (retroceder no áudio único)
      audio.currentTime = Math.max(0, audio.currentTime - 10);
      console.log(`⏪ [V1-SKIP-BACK] Retrocedeu 10s, agora em ${audio.currentTime.toFixed(1)}s`);
    }
  };
  
  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    
    console.log(`⏩ [SKIP-FWD] currentTime=${audio.currentTime.toFixed(1)}s, duration=${audio.duration.toFixed(1)}s, currentSection=${currentSection}`);
    
    if (isV2) {
      // 🆕 V2: Lógica de navegação entre seções
      
      // Se está nos últimos 3 segundos da seção, avançar para próxima seção
      const timeRemaining = audio.duration - audio.currentTime;
      
      if (timeRemaining < 3 && currentSection < lessonData.sections.length - 1) {
        const nextSection = currentSection + 1;
        console.log(`⏩ [V2-SKIP-FWD] Avançando para seção ${nextSection}`);
        
        // Usar jumpToSection para trocar seção e áudio
        jumpToSection(nextSection);
        
        // Começar do início da próxima seção (já é o comportamento padrão do jumpToSection)
        
      } else {
        // Avançar 10s dentro da mesma seção
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        console.log(`⏩ [V2-SKIP-FWD] Avançou 10s, agora em ${audio.currentTime.toFixed(1)}s`);
      }
      
    } else {
      // V1: Comportamento original (avançar no áudio único)
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
      console.log(`⏩ [V1-SKIP-FWD] Avançou 10s, agora em ${audio.currentTime.toFixed(1)}s`);
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
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * (audio.duration || 0);
  };
  
  /**
   * 🎯 REGRA UNIVERSAL: Navegação entre Seções
   * 
   * Toda navegação manual entre seções (sidebar, botões, etc) deve:
   * 1. Verificar se é V1 (áudio único) ou V2 (áudios separados)
   * 2. V1: Mudar audio.currentTime para section.timestamp
   * 3. V2: Trocar audio.src para section.audio_url + resetar time
   * 4. Atualizar currentSection state
   * 5. Preservar estado de play/pause
   * 6. Fazer scroll para seção
   * 7. Prevenir race conditions com useEffects automáticos
   */
  const jumpToSection = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const section = lessonData.sections[index];
    if (!section) return;
    
    console.log(`🎯 [JUMP] Saltando para seção ${index}`);
    console.log(`  - Seção atual: ${currentSection}`);
    console.log(`  - Seção destino: ${index}`);
    console.log(`  - Modelo V2? ${isV2}`);
    console.log(`  - Áudio atual: ${audio.src}`);
    
    // Pausar áudio atual
    const wasPlaying = !audio.paused;
    audio.pause();
    setIsPlaying(false);
    
    if (isV2) {
      // 🆕 V2: Trocar arquivo de áudio
      if (section.audio_url) {
        console.log(`🔄 [V2-JUMP] Trocando para áudio: ${section.audio_url}`);
        
        // Atualizar currentSection ANTES de trocar o áudio
        // e atualizar prevSectionRef para que o useEffect não conflite
        prevSectionRef.current = index;
        setCurrentSection(index);
        
        // Trocar fonte do áudio
        audio.src = section.audio_url;
        audio.currentTime = 0;
        audio.load();
        
        // Se estava tocando, continuar tocando após carregar
        if (wasPlaying) {
          audio.play().then(() => {
            console.log(`✅ [V2-JUMP] Áudio da seção ${index} reproduzindo`);
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('⚠️ [V2-JUMP] Erro ao reproduzir:', err);
            
            // Toast para usuário clicar em play
            toast({
              title: "▶️ Clique em Play",
              description: "O navegador bloqueou o autoplay",
              duration: 3000,
            });
          });
        }
      }
    } else {
      // V1: Comportamento original (pular para timestamp)
      if (section.timestamp !== undefined) {
        audio.currentTime = section.timestamp;
        setCurrentSection(index);
        
        // Se estava tocando, retomar
        if (wasPlaying) {
          audio.play();
          setIsPlaying(true);
        }
      }
    }
    
    // Resetar flag de scroll para garantir que a seção seja exibida
    hasScrolledRef.current[index] = false;
    
    // Scroll suave para a seção
    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${index}`);
      if (sectionElement) {
        const headerHeight = 120;
        const elementTop = sectionElement.getBoundingClientRect().top;
        const offsetTop = elementTop + window.pageYOffset;
        const targetPosition = offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        console.log(`📜 [JUMP] Scroll para seção ${index} completo`);
      }
    }, 100);
  };
  
  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isAudioEnabled) {
      // Desligando o áudio - guardar seção atual
      audio.pause();
      setIsPlaying(false);
      setSectionWhenMuted(currentSection);
    } else {
      // Religando o áudio - voltar para seção onde estava
      audio.play();
      setIsPlaying(true);
      
      // Fazer scroll de volta para a seção onde o áudio estava
      const sectionElement = document.getElementById(`section-${sectionWhenMuted}`);
      if (sectionElement) {
        const yOffset = -80;
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


  // Detectar fim do áudio (end-audio ou quando áudio terminar)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnded = () => {
      console.log(`🎯 [AUDIO-ENDED] Áudio da seção ${currentSection} terminou naturalmente`);
      setIsPlaying(false);
      
      // 🆕 Marcar que usuário NÃO pulou (completou a aula)
      setJumpedToExercises(false);
      
      // V2: verificar se ainda há seções restantes
      if (isV2) {
        const isLastSection = currentSection >= lessonData.sections.length - 1;
        
        if (!isLastSection) {
          console.log(`🎯 [V2] Avançando para próxima seção (${currentSection} → ${currentSection + 1})`);
          setCurrentSection(prev => prev + 1);
          return;
        }
        
        console.log('🎯 [V2] Última seção completada');
      }
      
      // Última seção terminada: ir para transição ou end card
      if (lessonData.exercisesConfig || lessonData.finalPlaygroundConfig) {
        // 🎉 Disparar confetti (aula 100% completa!)
        console.log('🎉 [CONFETTI] Última seção completa! Disparando celebração...');
        
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
        
        setCurrentPhase('transition');
        console.log('🎯 [AUDIO-ENDED] Indo para transição (tem exercícios)');
      } else {
        setShowEndCard(true);
        console.log('🎯 [AUDIO-ENDED] Mostrando end card');
      }
    };

    audio.addEventListener('ended', handleAudioEnded);
    return () => audio.removeEventListener('ended', handleAudioEnded);
  }, [lessonData.exercisesConfig, lessonData.finalPlaygroundConfig, currentPhase, isV2, currentSection, lessonData.sections.length]);

  // Detectar seção end-audio
  useEffect(() => {
    const section = lessonData.sections[currentSection];
    
    // V2: end-audio deve tocar normalmente, não pausar imediatamente
    if (isV2 && section?.type === 'end-audio') {
      console.log('🎯 [V2] Seção end-audio detectada, deixando áudio tocar até o fim');
      return; // Não pausar, deixar o áudio.ended cuidar da transição
    }
    
    // V1: comportamento original (pausa imediatamente)
    if (!isV2 && section?.type === 'end-audio' && !showEndCard && currentPhase === 'audio') {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
      
      // 🆕 Marcar que usuário NÃO pulou (completou a aula)
      setJumpedToExercises(false);
      
      // Verificar se tem exercícios/playground final
      if (lessonData.exercisesConfig || lessonData.finalPlaygroundConfig) {
        setCurrentPhase('transition');
        console.log('🎯 [END-AUDIO] Indo para transição (tem exercícios)');
      } else {
        setShowEndCard(true);
        console.log('🎯 [END-AUDIO] Fim da mini-aula detectado');
      }
    }
  }, [currentSection, lessonData.sections, lessonData.exercisesConfig, lessonData.finalPlaygroundConfig, showEndCard, currentPhase, isV2]);

  // 🎮 Handlers do Playground
  const handleOpenPlayground = () => {
    console.log('🎮 [PLAYGROUND] Usuário clicou em "Abrir"');
    logTelemetry('PLAYGROUND_OPEN');
    setShowPlaygroundCall(false);
    setTimeout(() => {
      setShowPlaygroundMid(true);
    }, 300);
  };
  
  const handleSkipPlayground = () => {
    console.log('🎮 [PLAYGROUND] Usuário clicou em "Pular"');
    logTelemetry('PLAYGROUND_SKIP');
    setShowPlaygroundCall(false);
    
    setTimeout(() => {
      const audio = audioRef.current;
      // Encontrar próxima seção após playground
      const playgroundSectionIndex = lessonData.sections.findIndex(s => s.showPlaygroundCall === true);
      const nextSection = lessonData.sections[playgroundSectionIndex + 1];
      
      if (audio && nextSection) {
        audio.currentTime = nextSection.timestamp; // 180s (Seção 5)
        audio.play();
        setIsPlaying(true);
        console.log(`🎮 [PLAYGROUND] Retomando na Seção ${playgroundSectionIndex + 1} (${nextSection.timestamp}s)`);
        logTelemetry('AUDIO_RESUMED', { section: playgroundSectionIndex + 1, timestamp: nextSection.timestamp });
      }
    }, 300);
  };

  const handlePlaygroundComplete = (answer?: string | null) => {
    console.log('✅ [PLAYGROUND] Usuário completou:', answer);
    logTelemetry('PLAYGROUND_COMPLETE', { answer });
    setPlaygroundCompleted(true);
    setShowPlaygroundMid(false);
    
    setTimeout(() => {
      const audio = audioRef.current;
      // Encontrar próxima seção após playground
      const playgroundSectionIndex = lessonData.sections.findIndex(s => s.showPlaygroundCall === true);
      const nextSection = lessonData.sections[playgroundSectionIndex + 1];
      
      if (audio && nextSection) {
        audio.currentTime = nextSection.timestamp; // 180s (Seção 5)
        audio.play();
        setIsPlaying(true);
        console.log(`✅ [PLAYGROUND] Completado! Retomando na Seção ${playgroundSectionIndex + 1} (${nextSection.timestamp}s)`);
        logTelemetry('AUDIO_RESUMED', { section: playgroundSectionIndex + 1, timestamp: nextSection.timestamp });
      }
    }, 1500);
    
    // Mostrar feedback
    if (answer) {
      toast({
        title: "Ótimo trabalho! 🎉",
        description: "Você entendeu o conceito!",
        duration: 3000,
      });
    }
  };

  // Ir para exercícios após end-audio
  const handleGoToExercises = () => {
    console.log('🎯 [TRANSITION] Indo para exercícios');
    
    setShowEndCard(false);
    if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
      setCurrentPhase('exercises');
    } else if (lessonData.finalPlaygroundConfig) {
      setCurrentPhase('playground-final');
    } else {
      onComplete();
    }
  };

  const [exercisesCompleted, setExercisesCompleted] = useState(false);
  const [exerciseScores, setExerciseScores] = useState<number[]>([]);
  const [lessonStartTime] = useState(Date.now());
  const [achievementMilestone, setAchievementMilestone] = useState<number | null>(null);
  
  // 🎮 Gamification states
  const [pointsNotification, setPointsNotification] = useState<{
    show: boolean;
    points: number;
    reason: string;
  }>({ show: false, points: 0, reason: '' });

  const handleExercisesComplete = async () => {
    if (exercisesCompleted) {
      console.warn('⚠️ [EXERCISES] Já foi completado, ignorando chamada duplicada');
      return;
    }
    
    // ✅ VALIDAÇÃO CRÍTICA: Verificar se todos os exercícios foram aprovados
    const allExercisesPassed = exerciseScores.every((score, index) => {
      const exercise = lessonData.exercisesConfig?.[index];
      const passingScore = exercise?.passingScore || 70;
      return score >= passingScore;
    });
    
    const hasAllScores = exerciseScores.length === lessonData.exercisesConfig?.length;
    
    if (!hasAllScores || !allExercisesPassed) {
      console.error('❌ [EXERCISES] VALIDAÇÃO FALHOU!');
      console.error('Scores:', exerciseScores);
      console.error('Todos os scores?', hasAllScores);
      console.error('Todos passaram?', allExercisesPassed);
      
      toast({
        title: "⚠️ Exercícios incompletos",
        description: "Você precisa passar em todos os exercícios para completar a aula.",
        variant: "destructive",
        duration: 5000,
      });
      
      // Voltar para exercícios
      setCurrentPhase('exercises');
      return;
    }
    
    setExercisesCompleted(true);
    console.log('✅ [EXERCISES] Completados com sucesso e validados');
    console.log('📊 [EXERCISES] Scores finais:', exerciseScores);
    
    // 🎮 Gamification logic
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Calcular pontos da aula
        const timeSpent = (Date.now() - lessonStartTime) / 1000 / 60; // minutos
        const avgScore = exerciseScores.length > 0 
          ? exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length 
          : 0;
        
        let totalPoints = POINTS.LESSON_COMPLETE;
        let bonusReasons: string[] = [];
        
        // Bônus de perfeição (100% nos exercícios)
        if (avgScore >= 100) {
          totalPoints += POINTS.PERFECT_SCORE;
          bonusReasons.push('+50 perfeição');
        }
        
        // Bônus de velocidade (<15 min)
        if (timeSpent < 15) {
          totalPoints += POINTS.FAST_COMPLETION;
          bonusReasons.push('+30 velocidade');
        }
        
        // Atualizar streak
        const newStreak = await updateStreak(user.id);
        
        // Aplicar bônus de streak (7+ dias = x1.5)
        if (newStreak >= 7) {
          totalPoints = Math.round(totalPoints * POINTS.STREAK_BONUS_MULTIPLIER);
          bonusReasons.push('x1.5 streak');
        }
        
        // Dar pontos
        await awardPoints(user.id, totalPoints, 'Aula completada');
        
        // Mostrar notificação
        const bonusText = bonusReasons.length > 0 ? ` (${bonusReasons.join(', ')})` : '';
        setPointsNotification({
          show: true,
          points: totalPoints,
          reason: `Aula completada${bonusText}`,
        });
        
        // Buscar quantas aulas o usuário já completou
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('status', 'completed');
        
        if (!progressError && progressData) {
          const totalCompleted = progressData.length + 1; // +1 para a aula atual
          console.log(`🎯 [ACHIEVEMENT] Total de aulas completadas: ${totalCompleted}`);
          
          // Verificar e dar conquistas usando o novo sistema
          if (totalCompleted === 1) await checkAndAwardAchievement(user.id, '1_lesson');
          if (totalCompleted === 5) await checkAndAwardAchievement(user.id, '5_lessons');
          if (totalCompleted === 10) await checkAndAwardAchievement(user.id, '10_lessons');
          if (totalCompleted === 25) await checkAndAwardAchievement(user.id, '25_lessons');
          if (totalCompleted === 50) await checkAndAwardAchievement(user.id, '50_lessons');
          
          // Verificar marcos para o badge visual
          const milestones = [1, 5, 10, 25, 50];
          const achievedMilestone = milestones.find(m => m === totalCompleted);
          
          if (achievedMilestone) {
            console.log(`🏆 [ACHIEVEMENT] Marco atingido: ${achievedMilestone} aulas!`);
            setAchievementMilestone(achievedMilestone);
          }
        }
      }
    } catch (error) {
      console.error('❌ [GAMIFICATION] Erro:', error);
    }
    
    // Ir para tela de conclusão
    setCurrentPhase('completed');
  };
  
  // Resetar estado ao entrar na fase de exercícios
  useEffect(() => {
    if (currentPhase === 'exercises') {
      console.log('🎯 [EXERCISES] Entrando na fase de exercícios');
      setExercisesCompleted(false);
    }
  }, [currentPhase]);

  const handleFinalPlaygroundComplete = () => {
    setCurrentPhase('completed');
    onComplete();
  };
  
  // 📊 Calcular progresso correto (V1 vs V2)
  const progress = isV2
    ? // V2: Progresso baseado em seções completadas
      ((currentSection / Math.max(1, lessonData.sections.length - 1)) * 100)
    : // V1: Progresso baseado no tempo do áudio único
      (duration > 0 ? (currentTime / duration) * 100 : 0);
  
  // Renderizar fase de transição
    if (currentPhase === 'transition') {
      return (
        <TransitionCard
          title={jumpedToExercises ? "🎯 Vamos praticar?" : "🎉 Muito bem! Aula completa!"}
          description={jumpedToExercises 
            ? "Você pode fazer os exercícios agora e continuar a aula depois."
            : "Agora vamos fixar o que você aprendeu com exercícios práticos."
          }
          buttonText="🎯 Ir para Exercícios"
          onBack={() => {
            console.log('⬅️ [TRANSITION] Voltando para aula');
            setJumpedToExercises(false);
            setCurrentSection(0);
            setPendingAudioReset(0);  // ← Agendar reset
            setCurrentPhase('audio');  // ← Mudar fase por último
          }}
          onContinue={handleGoToExercises}
        />
      );
    }
  
  // Renderizar tela de conclusão
  if (currentPhase === 'completed') {
    const timeSpent = Date.now() - lessonStartTime;
    
    // Coletar metadata dos exercícios
    const exerciseMetadata = lessonData.exercisesConfig?.map(ex => ({
      title: ex.title,
      type: ex.type,
    })) || [];
    
    return (
      <ConclusionScreen
        scores={exerciseScores.length > 0 ? exerciseScores : [80, 85, 90]}
        timeSpent={timeSpent}
        lessonTitle={lessonData.title}
        nextLessonId={nextLessonId}
        nextLessonType={nextLessonType}
        exerciseMetadata={exerciseMetadata}
      />
    );
  }

  // Renderizar fase de exercícios
  if (currentPhase === 'exercises' && lessonData.exercisesConfig) {
    // Coletar metadata dos exercícios
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
          console.log('⬅️ [EXERCISES] Voltando para aula');
          
          const targetSection = jumpedToExercises 
            ? 0
            : Math.max(0, lessonData.sections.filter(s => !s.type || s.type === 'text').length - 1);
          
          resetLessonToBeginning(targetSection);
          setJumpedToExercises(false);
          setCurrentPhase('audio');
        }}
      />
    );
  }

  // Renderizar playground final
  if (currentPhase === 'playground-final' && lessonData.finalPlaygroundConfig) {
    return (
      <GuidedPlayground
        config={lessonData.finalPlaygroundConfig}
        onComplete={handleFinalPlaygroundComplete}
      />
    );
  }
  
  return (
    <div 
      data-testid="guided-lesson"
      data-current-phase={currentPhase}
      data-current-section={currentSection}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 animate-fade-in"
    >
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-md">
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 max-w-[1920px] mx-auto">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-all flex-shrink-0">
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lessonData.title}</h1>
              <p className="text-xs text-slate-600 truncate">{lessonData.trackName}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
              <div className="w-20 sm:w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button 
              onClick={skipToExercises}
              disabled={!lessonData.exercisesConfig && !lessonData.finalPlaygroundConfig}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all flex-shrink-0 ${
                lessonData.exercisesConfig || lessonData.finalPlaygroundConfig
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed opacity-50'
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              <span className="hidden sm:inline">Exercícios</span>
            </button>
          </div>
        </div>
      </header>

      <div className="w-full px-3 sm:px-6 pt-20 pb-32">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-12">
            
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 shadow-xl">
                  <div className="flex justify-center mb-3">
                    <div className="relative group cursor-pointer">
                      {/* MAIA com animações otimizadas (sem piscamento) */}
                      <img 
                        src="/maia-avatar-v3.png" 
                        alt="MAIA" 
                        className={`
                          w-44 h-44 object-contain
                          animate-fly-in-rasante
                          transition-all duration-300 ease-in-out
                          lg:group-hover:scale-105 cursor-pointer
                          ${isPlaying && isAudioEnabled ? 'animate-float animate-pulse-glow brightness-110' : ''}
                        `}
                        style={{
                          filter: !isAudioEnabled 
                            ? 'grayscale(100%) opacity(0.5) drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))'
                            : 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
                          // 🔥 FORÇA PARAR ANIMAÇÃO quando não está tocando
                          animation: (isPlaying && isAudioEnabled) ? undefined : 'none',
                          animationPlayState: (isPlaying && isAudioEnabled) ? 'running' : 'paused'
                        }}
                      />
                      {/* Indicadores de áudio melhorados */}
                      {isPlaying && isAudioEnabled && (
                        <div className="absolute -bottom-1 -right-1 flex gap-1">
                          <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-audio-bounce shadow-cyan-glow" style={{ animationDelay: '0ms' }} />
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-audio-bounce shadow-lg" style={{ animationDelay: '150ms' }} />
                          <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-audio-bounce shadow-pink-glow" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                      
                      {/* Balão fixo ao lado da cabeça */}
                      <div className="absolute -top-2 -right-12 hidden lg:block">
                        <div className="relative bg-white rounded-xl px-4 py-2.5 border-2 border-cyan-200 shadow-lg">
                          <p className="text-xs font-medium text-slate-700 text-center">
                            Olá, Eu<br />sou a MAIA!
                          </p>
                          {/* Rabinho do balão apontando para a MAIA */}
                          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l-2 border-b-2 border-cyan-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão Silenciar MAIA - dentro do card */}
                  <button
                    onClick={toggleAudio}
                    className={`w-full px-3 py-2 rounded-full font-medium text-xs text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      isAudioEnabled 
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-500' 
                        : 'bg-green-500'
                    }`}
                  >
                    {isAudioEnabled ? '🔊 Silenciar MAIA' : '🔇 Ativar Áudio'}
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
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-400/30 scale-[1.02]'
                        : isSpecial
                        ? 'bg-amber-50 text-amber-600 cursor-default'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:shadow-md'
                    } ${!isRenderable ? 'opacity-50' : ''}`}
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
                .map(({ section, originalIndex }) => (
                  <div
                    key={section.id}
                    id={`section-${originalIndex}`}
                    data-testid="lesson-section"
                    data-section-index={originalIndex}
                    data-is-active={currentSection === originalIndex}
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
                    <div className={`bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border shadow-xl transition-all duration-700 ease-out relative overflow-hidden ${
                      currentSection === originalIndex
                        ? 'border-cyan-300/60 ring-2 ring-cyan-400/30 shadow-2xl shadow-cyan-400/20 scale-[1.01]'
                        : 'border-slate-200/50 hover:border-slate-300/50 hover:shadow-2xl'
                    } ${currentSection === originalIndex && sectionJustChanged ? 'animate-[scale-in_0.5s_ease-out]' : ''}`}>
                      {currentSection === originalIndex && sectionJustChanged && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-transparent animate-[slide-in-right_1s_ease-out]" />
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/5 to-purple-300/5 animate-pulse" />
                        </>
                      )}
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200/50 relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 shadow-md transition-all ${
                          currentSection === originalIndex
                            ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white'
                            : 'bg-slate-100 text-slate-500'
                        } ${currentSection === originalIndex && sectionJustChanged ? 'duration-300 scale-125 shadow-2xl shadow-cyan-400/60 rotate-[360deg]' : 'duration-500 scale-100 rotate-0'}`}>
                          {originalIndex + 1}
                        </div>
                        {currentSection === originalIndex && (
                          <span className={`text-xs font-medium text-cyan-600 flex items-center gap-1.5 transition-all ${
                            sectionJustChanged ? 'scale-110 font-bold' : 'scale-100'
                          }`}>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                            Você está aqui
                          </span>
                        )}
                      </div>
                      <div className={`prose prose-slate prose-sm max-w-none transition-all duration-500
  [&_h1]:!text-[25px] [&_h1]:!leading-tight [&_h1]:!mb-4 [&_h1]:!font-bold
  [&_h2]:!text-[21px] [&_h2]:!leading-snug [&_h2]:!mb-3 [&_h2]:!mt-6 [&_h2]:!font-bold
  [&_h3]:!text-[17px] [&_h3]:!mb-2 [&_h3]:!mt-4 [&_h3]:!font-bold
  [&_p]:!text-base [&_p]:!leading-relaxed [&_p]:!mb-3 [&_p]:text-slate-700
  [&_li]:!text-base [&_li]:!leading-relaxed [&_li]:text-slate-700
  [&_ul]:!my-3 [&_ul]:!space-y-2
  [&_ol]:!my-3 [&_ol]:!space-y-2
  [&_strong]:!font-semibold [&_strong]:!text-cyan-600 [&_strong]:bg-cyan-50/50 [&_strong]:px-0.5 [&_strong]:rounded
  [&_em]:!text-slate-600 [&_em]:!not-italic [&_em]:!font-medium
  [&_code]:!text-purple-600 [&_code]:!bg-purple-100 [&_code]:!px-1.5 [&_code]:!py-0.5 [&_code]:!rounded [&_code]:!text-sm [&_code]:!font-mono
  [&_blockquote]:!border-l-4 [&_blockquote]:!border-l-cyan-400 [&_blockquote]:!bg-gradient-to-r [&_blockquote]:!from-cyan-50/60 [&_blockquote]:!to-blue-50/40
  [&_blockquote]:!py-3 [&_blockquote]:!px-4 [&_blockquote]:!rounded-r-lg [&_blockquote]:!my-4 [&_blockquote]:!text-base
  [&_pre]:!bg-slate-900 [&_pre]:!text-slate-100 [&_pre]:!p-4 [&_pre]:!rounded-lg [&_pre]:!my-4 [&_pre]:!text-sm
  [&_a]:!text-cyan-600 [&_a]:!no-underline [&_a]:!font-medium hover:[&_a]:!underline
  [&_img]:!rounded-lg [&_img]:!shadow-md [&_img]:!my-6 ${
    currentSection === originalIndex && sectionJustChanged ? 'animate-scale-in' : ''
  }`}>
                        <ReactMarkdown>{section.visualContent || section.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
            </main>
            
          </div>
        </div>
      </div>

      {/* MAIA Mobile - versão premium responsiva */}
      <div className="lg:hidden fixed bottom-24 sm:bottom-28 left-3 right-3 z-40 flex justify-center">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border-2 border-cyan-300/60 shadow-2xl max-w-[340px] w-full">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img 
                src="/maia-avatar-v3.png" 
                alt="MAIA" 
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 object-contain
                  animate-fly-in-rasante
                  ${isPlaying && isAudioEnabled ? 'animate-float animate-pulse-glow brightness-110' : ''}
                `}
                style={{
                  filter: !isAudioEnabled 
                    ? 'grayscale(100%) opacity(0.5) drop-shadow(0 10px 15px rgb(0 0 0 / 0.15))'
                    : 'drop-shadow(0 10px 15px rgb(0 0 0 / 0.15))',
                  // 🔥 FORÇA PARAR ANIMAÇÃO quando não está tocando
                  animation: (isPlaying && isAudioEnabled) ? undefined : 'none',
                  animationPlayState: (isPlaying && isAudioEnabled) ? 'running' : 'paused'
                }}
              />
              {/* Indicadores de áudio para mobile */}
              {isPlaying && isAudioEnabled && (
                <div className="absolute -bottom-0.5 -right-0.5 flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-audio-bounce shadow-sm shadow-cyan-400" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-audio-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-audio-bounce shadow-sm shadow-purple-400" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-700 leading-snug font-medium">
                {lessonData.sections[currentSection]?.speechBubbleText || "Vamos aprender!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50 shadow-2xl transition-all duration-300 ${
        !isAudioEnabled ? 'grayscale opacity-60' : ''
      }`}>
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="max-w-[1800px] mx-auto">
            
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
                  className={`w-11 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    shouldShowPlayPulse && !isPlaying ? 'animate-pulse ring-4 ring-cyan-400/50' : ''
                  }`}
                  onClick={() => {
                    togglePlayPause();
                    // Remover pulse ao clicar
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
              <button onClick={onComplete} className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl text-white font-semibold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all whitespace-nowrap hover:scale-105 flex-shrink-0">
                Continuar
              </button>
            </div>
            
            <div className="flex md:hidden flex-col gap-2.5">
              <div className="flex items-center gap-2">
                {!isV2 && (
                  <>
                    <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden" onClick={handleProgressBarClick}>
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(duration)}</span>
                  </>
                )}
                
                {isV2 && (
                  <>
                    <span className="text-xs text-slate-300 font-medium flex-shrink-0">
                      {currentSection + 1}/{lessonData.sections.length}
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={skipBackward} className="w-9 h-9 bg-slate-700/50 rounded-lg flex items-center justify-center text-white">
                    <SkipBack size={16} />
                  </button>
                  <button 
                    className={`w-11 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 ${
                      shouldShowPlayPulse && !isPlaying ? 'animate-pulse ring-4 ring-cyan-400/50' : ''
                    }`}
                    onClick={() => {
                      togglePlayPause();
                      if (shouldShowPlayPulse) setShouldShowPlayPulse(false);
                    }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <button onClick={skipForward} className="w-9 h-9 bg-slate-700/50 rounded-lg flex items-center justify-center text-white">
                    <SkipForward size={16} />
                  </button>
                  <button onClick={cycleSpeed} className="px-3 py-2 bg-slate-700/50 rounded-lg text-white font-bold text-xs min-w-[50px]">
                    {playbackSpeed}x
                  </button>
                </div>
                <button onClick={onComplete} className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg text-white font-semibold text-sm">
                  Continuar
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Card de Convite do Playground (apenas V1) */}
      {hasPlaygroundSupport && showPlaygroundCall && (() => {
        const section4 = lessonData.sections.find(s => s.showPlaygroundCall && s.playgroundConfig);
        return section4 ? (
          <PlaygroundCallCard
            title="Hora da Prática!"
            description="Que tal ver a IA aprendendo em tempo real? É rápido e você vai ter aquele momento 'aha!' de verdade!"
            onOpen={handleOpenPlayground}
            onSkip={handleSkipPlayground}
          />
        ) : null;
      })()}

      {/* Overlay do Playground Mid-Lesson (apenas V1) */}
      {hasPlaygroundSupport && showPlaygroundMid && (() => {
        const section4 = lessonData.sections.find(s => s.showPlaygroundCall && s.playgroundConfig);
        const playgroundSection = section4 || lessonData.sections[currentSection];
        return playgroundSection?.playgroundConfig ? (
          playgroundSection.playgroundConfig.type === 'interactive-simulation' && 
           playgroundSection.playgroundConfig.simulationConfig ? (
            <InteractiveSimulationPlayground
              config={playgroundSection.playgroundConfig.simulationConfig}
              onComplete={() => handlePlaygroundComplete(null)}
            />
          ) : (
            <PlaygroundMidLesson
              config={playgroundSection.playgroundConfig}
              onComplete={handlePlaygroundComplete}
            />
          )
        ) : null;
      })()}

      {/* Card de Fim da Aula (End-Audio) */}
      {showEndCard && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
          <Card className="max-w-lg w-full p-8 text-center bg-white/95 backdrop-blur-xl border-2 border-cyan-300/50 shadow-2xl">
            <div className="flex justify-center mb-6">
              <Avatar className="w-32 h-32 border-4 border-cyan-400/30 shadow-xl animate-float">
                <AvatarImage src="/maia-avatar-v3.png" alt="MAIA" />
              </Avatar>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              ✅ Aula completa! Parabéns! 🎉
            </h2>
            
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Você aprendeu sobre as três principais ferramentas de IA gratuitas!
              <br />
              Agora vamos fixar esse conhecimento com exercícios práticos.
            </p>
            
            <Button 
              onClick={handleGoToExercises} 
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all text-lg py-6"
            >
              🎯 Ir para Exercícios
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
    </div>
  );
}
