import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Sparkles, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { GuidedLessonProps } from '@/types/guidedLesson';
import { PlaygroundMidLesson } from './PlaygroundMidLesson';
import { TransitionCard } from './TransitionCard';
import { ExercisesSection } from './ExercisesSection';
import { GuidedPlayground } from './GuidedPlayground';
import InteractiveSimulationPlayground from './InteractiveSimulationPlayground';
import { PlaygroundCallCard } from './PlaygroundCallCard';
import { ConclusionScreen } from './ConclusionScreen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function GuidedLesson({ lessonData, onComplete, audioUrl, wordTimestamps }: GuidedLessonProps) {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lessonData.duration || 0);
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
    return !section.type || section.type === 'text';
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
    if (!targetSection) return;
    
    const targetTime = targetSection.timestamp;
    
    console.log(`🔄 [RESET-AUDIO] Resetando para seção ${sectionIndex} (${targetTime}s)`);
    
    // 🔥 ATIVAR FLAG PARA BLOQUEAR SYNCLOOP
    setIsResetting(true);
    
    // 1. Atualizar ref ANTES de mudar currentTime (previne race condition no loop)
    lastSectionRef.current = sectionIndex;
    
    // 2. Resetar tempo do áudio
    audio.currentTime = targetTime;
    
    // 3. Pausar áudio (usuário decide quando dar play)
    audio.pause();
    setIsPlaying(false);
    
    // 4. Forçar update dos states
    setCurrentSection(sectionIndex);
    setCurrentTime(targetTime);
    
    // 5. 🔥 AGUARDAR O ÁUDIO PROCESSAR O SEEK E ENTÃO LIBERAR O SYNCLOOP
    const handleSeeked = () => {
      console.log(`✅ [RESET-AUDIO] Seek concluído, liberando syncLoop`);
      setIsResetting(false);
      audio.removeEventListener('seeked', handleSeeked);
    };
    
    audio.addEventListener('seeked', handleSeeked);
    
    // Fallback: se 'seeked' não disparar em 200ms, liberar mesmo assim
    setTimeout(() => {
      console.log(`✅ [RESET-AUDIO] Fallback timeout, liberando syncLoop`);
      setIsResetting(false);
      audio.removeEventListener('seeked', handleSeeked);
    }, 200);
  };

  // 🔄 useEffect: Resetar áudio quando voltar para fase 'audio'
  useEffect(() => {
    if (currentPhase !== 'audio' || pendingAudioReset === null) return;
    
    const audio = audioRef.current;
    if (!audio) {
      console.warn('⚠️ [RESET-PENDING] Áudio ainda não disponível');
      return;
    }
    
    console.log(`🔄 [RESET-PENDING] Executando reset pendente para seção ${pendingAudioReset}`);
    resetAudioToSection(pendingAudioReset);
    setPendingAudioReset(null);
  }, [currentPhase, pendingAudioReset]);

  // 🎮 Helper: Ativar playground
  const activatePlayground = () => {
    const audio = audioRef.current;
    console.log(`🔍 [activatePlayground] chamada | audio=${!!audio} | triggered=${playgroundTriggered}`);
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
    
    console.log('🔍 [DEBUG] audioUrl recebido:', audioUrl);
    console.log('🔍 [DEBUG] audioRef.current:', audio);
    
    if (!audio) {
      console.error('❌ [ÁUDIO] Elemento de áudio não encontrado');
      return;
    }
    
    if (!audioUrl) {
      console.error('❌ [ÁUDIO] URL do áudio não fornecida');
      return;
    }
    
    console.log('✅ [ÁUDIO] Inicializando áudio:', audioUrl);
    console.log('📋 [ÁUDIO] Seções:', lessonData.sections.map(s => `${s.id} (${s.timestamp}s)`));
    
    // ✅ CONFIGURAR VOLUME
    audio.volume = 1.0;
    console.log('🔊 [VOLUME] Configurado: 100%');
    
    const handleLoadedMetadata = () => {
      console.log(`✅ [ÁUDIO] Carregado! Duração: ${audio.duration}s`);
      setDuration(audio.duration);
      audio.volume = 1.0;
      
      // Tentar autoplay
      audio.play().then(() => {
        console.log('🎵 [AUTOPLAY] Iniciado automaticamente');
        setIsPlaying(true);
      }).catch(err => {
        console.warn('⚠️ [AUTOPLAY] Bloqueado pelo navegador:', err);
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
  }, [lessonData.sections, audioUrl]);

  // 🔥 SINCRONIZAÇÃO COM requestAnimationFrame (60fps, <100ms latência)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    
    let animationFrameId: number;
    let lastLoggedTime = -1;
    
    const syncLoop = () => {
      const currentTime = audio.currentTime;
      setCurrentTime(currentTime);
      
      // Calcular seção ativa
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
  }, [lessonData.sections, audioUrl]);
  
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
    
    // Scroll após state update
    const section = lessonData.sections[currentSection];
    if (isSectionRenderable(section)) {
      const scrollStart = performance.now();
      
      setTimeout(() => {
        const sectionElement = document.getElementById(`section-${currentSection}`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ 
            behavior: 'instant', // Mudado para instant para diagnóstico
            block: 'center'
          });
          
          const scrollEnd = performance.now();
          const latency = scrollEnd - scrollStart;
          console.log(`[SCROLL] Completed in ${latency.toFixed(2)}ms`);
          sendDiagnosticLog('SCROLL', {
            audioTime: audioTime,
            currentSection: currentSection,
            performanceTimestamp: scrollEnd,
            latencyMs: latency
          });
        } else {
          console.warn(`[SCROLL] Element #section-${currentSection} not found`);
        }
      }, 50); // Reduzido de 100ms
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
      
      // Encontrar seção com showPlaygroundCall
      const playgroundSectionIndex = lessonData.sections.findIndex(s => s.showPlaygroundCall === true);
      
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
    
    if (currentSection === 4 && prevSection === 3 && !playgroundTriggered) {
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
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };
  
  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
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
  
  const jumpToSection = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const section = lessonData.sections[index];
    if (section && section.timestamp !== undefined) {
      audio.currentTime = section.timestamp;
      hasScrolledRef.current[index] = false;
    }
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
      console.log('🎯 [AUDIO-ENDED] Áudio terminou naturalmente');
      setIsPlaying(false);
      
      // 🆕 Marcar que usuário NÃO pulou (completou a aula)
      setJumpedToExercises(false);
      
      // Se tem exercícios, ir para transição
      if (lessonData.exercisesConfig || lessonData.finalPlaygroundConfig) {
        setCurrentPhase('transition');
        console.log('🎯 [AUDIO-ENDED] Indo para transição (tem exercícios)');
      } else {
        setShowEndCard(true);
        console.log('🎯 [AUDIO-ENDED] Mostrando end card');
      }
    };

    audio.addEventListener('ended', handleAudioEnded);
    return () => audio.removeEventListener('ended', handleAudioEnded);
  }, [lessonData.exercisesConfig, lessonData.finalPlaygroundConfig, currentPhase]);

  // Detectar seção end-audio
  useEffect(() => {
    const section = lessonData.sections[currentSection];
    if (section?.type === 'end-audio' && !showEndCard && currentPhase === 'audio') {
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
  }, [currentSection, lessonData.sections, lessonData.exercisesConfig, lessonData.finalPlaygroundConfig, showEndCard, currentPhase]);

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

  const handleExercisesComplete = () => {
    if (exercisesCompleted) {
      console.warn('⚠️ [EXERCISES] Já foi completado, ignorando chamada duplicada');
      return;
    }
    
    setExercisesCompleted(true);
    console.log('✅ [EXERCISES] Completados com sucesso');
    
    // Ir para tela de conclusão ao invés de onComplete direto
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
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
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
    return (
      <ConclusionScreen
        scores={exerciseScores.length > 0 ? exerciseScores : [80, 85, 90]} // Scores padrão se vazio
        timeSpent={timeSpent}
        lessonTitle={lessonData.title}
        nextLessonId="fundamentos-03"
      />
    );
  }

  // Renderizar fase de exercícios
  if (currentPhase === 'exercises' && lessonData.exercisesConfig) {
    return (
      <ExercisesSection
        key="exercises-phase" // Força remount ao entrar na fase
        exercises={lessonData.exercisesConfig}
        onComplete={handleExercisesComplete}
        onScoreUpdate={(scores) => setExerciseScores(scores)}
        onBack={() => {
          console.log('⬅️ [EXERCISES] Voltando para aula');
          
          // 🆕 REGRA DE NEGÓCIO COM RESET DE ÁUDIO
          if (jumpedToExercises) {
            // Usuário pulou → voltar para início (seção 0)
            console.log('🔄 [BACK] Usuário pulou para exercícios, voltando para seção 0');
            setCurrentSection(0);
            setPendingAudioReset(0);  // ← Agendar reset para seção 0
          } else {
            // Usuário completou → voltar para última seção
            console.log('✅ [BACK] Usuário completou aula, voltando para última seção');
            const lastTextSection = lessonData.sections
              .filter(s => !s.type || s.type === 'text')
              .length - 1;
            setCurrentSection(Math.max(0, lastTextSection));
            setPendingAudioReset(Math.max(0, lastTextSection));  // ← Agendar reset para última seção
          }
          
          setCurrentPhase('audio');  // ← Mudar fase por último
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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
              <span className="text-xs font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">{Math.round(progress)}%</span>
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
                .filter(({ section }) => !section.type || section.type === 'text')
                .map(({ section, originalIndex }) => (
                  <div
                    key={section.id}
                    id={`section-${originalIndex}`}
                    className={`transition-all duration-700 ${
                      isAudioEnabled 
                        ? (currentSection >= originalIndex ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4')
                        : 'opacity-100 translate-y-0'
                    } ${currentSection === originalIndex && sectionJustChanged ? 'animate-fade-in' : ''}`}
                  >
                    <div className={`bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border shadow-xl transition-all duration-500 relative overflow-hidden ${
                      currentSection === originalIndex
                        ? 'border-cyan-300/50 ring-2 ring-cyan-400/20 shadow-2xl shadow-cyan-400/10'
                        : 'border-slate-200/50 hover:border-slate-300/50 hover:shadow-2xl'
                    } ${currentSection === originalIndex && sectionJustChanged ? 'animate-scale-in' : ''}`}>
                      {currentSection === originalIndex && sectionJustChanged && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-transparent animate-[slide-in-right_0.8s_ease-out]" />
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
                  onClick={togglePlayPause} 
                  disabled={showPlaygroundMid || showEndCard}
                  className="w-11 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
                <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all group min-w-0" onClick={handleProgressBarClick}>
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(duration)}</span>
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
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
                <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden" onClick={handleProgressBarClick}>
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(duration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={skipBackward} className="w-9 h-9 bg-slate-700/50 rounded-lg flex items-center justify-center text-white">
                    <SkipBack size={16} />
                  </button>
                  <button onClick={togglePlayPause} className="w-11 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
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

      {/* Card de Convite do Playground */}
      {showPlaygroundCall && (() => {
        const section4 = lessonData.sections.find(s => s.showPlaygroundCall);
        return section4 ? (
          <PlaygroundCallCard
            title="Hora da Prática!"
            description="Que tal ver a IA aprendendo em tempo real? É rápido e você vai ter aquele momento 'aha!' de verdade!"
            onOpen={handleOpenPlayground}
            onSkip={handleSkipPlayground}
          />
        ) : null;
      })()}

      {/* Overlay do Playground Mid-Lesson */}
      {showPlaygroundMid && (() => {
        const section4 = lessonData.sections.find(s => s.showPlaygroundCall);
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

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="auto"
        />
      )}
    </div>
  );
}
