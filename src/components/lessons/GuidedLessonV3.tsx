import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { V3LessonProps, PlaygroundConfig } from '@/types/guidedLesson';
import { ExercisesSection } from './ExercisesSection';
import { PlaygroundMidLesson } from './PlaygroundMidLesson';
import { LessonCompletionSummary } from './LessonCompletionSummary';
import { AchievementBadge } from './AchievementBadge';
import { PointsNotification } from '@/components/gamification/PointsNotification';
import { LessonResultCard } from '@/components/gamification/LessonResultCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { awardPoints, updateStreak, checkAndAwardAchievement, POINTS } from '@/lib/gamification';
import { updateMissionProgress } from '@/lib/updateMissionProgress';
import { registerGamificationEvent, GamificationResult } from '@/services/gamification';

/**
 * 🎬 GUIDED LESSON V3 - APRESENTAÇÃO PEDAGÓGICA COM SLIDES
 *
 * Modelo V3: Experiência contínua com slides visuais sincronizados
 * - 1 áudio único (narração contínua)
 * - Slides com imagens geradas por IA
 * - Transição automática baseada em timestamps
 * - Exercícios finais
 * - Playground final (opcional)
 */
export function GuidedLessonV3({
  lessonData,
  onComplete,
  onMarkComplete,
  nextLessonId,
  nextLessonType,
  trailId
}: V3LessonProps) {
  const navigate = useNavigate();

  // 🎯 Estado do player de áudio
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [maxAudioProgress, setMaxAudioProgress] = useState(0);

  // 🎮 Estado das fases da lição
  const [currentPhase, setCurrentPhase] = useState<
    'slides' | 'exercises' | 'playground-final' | 'completed'
  >('slides');

  // 📊 Estado de progresso
  const [allExercisesCompleted, setAllExercisesCompleted] = useState(false);
  const [playgroundCompleted, setPlaygroundCompleted] = useState(false);

  // 🎊 Estado de notificações
  const [showPointsNotification, setShowPointsNotification] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievement, setAchievement] = useState<any>(null);

  // 🎮 Estado de gamificação
  const [gamificationResult, setGamificationResult] = useState<GamificationResult | null>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [exerciseScores, setExerciseScores] = useState<number[]>([]);

  // 🔊 Referência do elemento de áudio
  const audioRef = useRef<HTMLAudioElement>(null);
  const syncIntervalRef = useRef<number | null>(null);

  // 🔍 DEBUG: Ver dados carregados
  useEffect(() => {
    console.log('🎬 [V3 LESSON DATA]', {
      id: lessonData.id,
      title: lessonData.title,
      numSlides: lessonData.slides.length,
      audioUrl: lessonData.audioUrl,
      hasExercises: !!lessonData.exercisesConfig?.length,
      hasPlayground: !!lessonData.finalPlaygroundConfig,
      slides: lessonData.slides.map((s) => ({
        slideNumber: s.slideNumber,
        timestamp: s.timestamp,
        hasImage: !!s.imageUrl
      }))
    });
  }, [lessonData]);

  // 🎵 Inicializar áudio
  useEffect(() => {
    if (!audioRef.current || !lessonData.audioUrl) return;

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsAudioInitialized(true);
      console.log('✅ Áudio inicializado:', audio.duration.toFixed(1), 's');
      
      // Autoplay: tentar reproduzir automaticamente
      audio.play().then(() => {
        setIsPlaying(true);
        console.log('🎵 Autoplay iniciado');
      }).catch(err => {
        console.log('⚠️ Autoplay bloqueado pelo navegador:', err);
      });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setMaxAudioProgress(Math.max(maxAudioProgress, audio.currentTime));
    };

    const handleEnded = () => {
      console.log('🎵 Áudio finalizado');
      setIsPlaying(false);

      // ✅ ORDEM CORRETA: playground ANTES de exercises
      if (lessonData.finalPlaygroundConfig) {
        setCurrentPhase('playground-final');
      } else if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
        setCurrentPhase('exercises');
      } else {
        handleLessonComplete();
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [lessonData.audioUrl, maxAudioProgress]);

  // 🎬 Sincronizar slide atual com timestamp do áudio
  useEffect(() => {
    if (!isPlaying || !lessonData.slides.length) return;

    const slides = lessonData.slides;
    let newSlideIndex = 0;

    // Binary search para encontrar slide ativo
    for (let i = slides.length - 1; i >= 0; i--) {
      if (slides[i].timestamp !== undefined && currentTime >= slides[i].timestamp!) {
        newSlideIndex = i;
        break;
      }
    }

    if (newSlideIndex !== currentSlideIndex) {
      console.log(`🎬 Mudando para slide ${newSlideIndex + 1}/${slides.length}`);
      setCurrentSlideIndex(newSlideIndex);
    }
  }, [currentTime, isPlaying, lessonData.slides, currentSlideIndex]);

  // 🎮 Controles de reprodução
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Erro ao reproduzir áudio:', err);
        toast({
          title: 'Erro ao reproduzir',
          description: 'Não foi possível iniciar o áudio. Tente novamente.',
          variant: 'destructive'
        });
      });
    }

    setIsPlaying(!isPlaying);
  };

  const skipToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      const prevSlide = lessonData.slides[currentSlideIndex - 1];
      if (audioRef.current && prevSlide.timestamp !== undefined) {
        audioRef.current.currentTime = prevSlide.timestamp;
        setCurrentSlideIndex(currentSlideIndex - 1);
      }
    }
  };

  const skipToNextSlide = () => {
    if (currentSlideIndex < lessonData.slides.length - 1) {
      const nextSlide = lessonData.slides[currentSlideIndex + 1];
      if (audioRef.current && nextSlide.timestamp !== undefined) {
        audioRef.current.currentTime = nextSlide.timestamp;
        setCurrentSlideIndex(currentSlideIndex + 1);
      }
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // 🎊 Completar lição
  const handleLessonComplete = async () => {
    console.log('🎊 Lição V3 completada!');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Atualizar progresso da trilha
      await updateMissionProgress('aulas', 1);

      // Premiar pontos
      const points = POINTS.LESSON_COMPLETE;
      await awardPoints(user.id, points, 'lesson_complete');
      setPointsEarned(points);
      setShowPointsNotification(true);

      // Atualizar streak
      await updateStreak(user.id);

      // Verificar conquistas
      const newAchievement = await checkAndAwardAchievement(user.id, 'lesson_complete');
      if (newAchievement) {
        setAchievement(newAchievement);
        setShowAchievement(true);
      }

      // Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Marcar como completa
      if (onMarkComplete) {
        await onMarkComplete();
      }

      setCurrentPhase('completed');

    } catch (error) {
      console.error('Erro ao completar lição:', error);
      toast({
        title: 'Erro ao salvar progresso',
        description: 'Sua lição foi completada, mas houve um erro ao salvar o progresso.',
        variant: 'destructive'
      });
    }
  };

  // 📝 Callbacks de exercícios
  const handleExercisesComplete = () => {
    console.log('✅ Todos os exercícios completados');
    setAllExercisesCompleted(true);

    // Exercícios sempre são a última etapa - completa a lição
    handleLessonComplete();
  };

  const handleSkipExercises = () => {
    console.log('⏭️ Exercícios pulados');

    if (lessonData.finalPlaygroundConfig) {
      setCurrentPhase('playground-final');
    } else {
      handleLessonComplete();
    }
  };

  // 🎮 Callback do playground final
  const handlePlaygroundComplete = () => {
    console.log('✅ Playground final completado');
    setPlaygroundCompleted(true);
    
    // Após playground, vai para exercises (se houver) ou completa
    if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
      setCurrentPhase('exercises');
    } else {
      handleLessonComplete();
    }
  };

  // 🔙 Voltar - sempre tem uma rota válida
  const handleBack = () => {
    if (trailId) {
      navigate(`/trail/${trailId}`);
    } else {
      // Fallback robusto: volta para o dashboard
      navigate('/dashboard');
    }
  };

  // 🎯 Renderizar slide atual
  const currentSlide = lessonData.slides[currentSlideIndex];
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 🎬 FASE: Apresentação de Slides
  if (currentPhase === 'slides') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Header - ELEGANTE E DISCRETO */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm">
          <div className="px-4 py-3 md:py-4 flex items-center justify-between max-w-7xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1.5 text-white/90 hover:text-white hover:bg-white/10 transition-all h-9 px-3 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-medium">Voltar</span>
            </Button>

            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <p className="text-xs md:text-sm text-white/50 font-medium mb-0.5">
                Slide {currentSlideIndex + 1} de {lessonData.slides.length}
              </p>
              <h1 className="text-sm md:text-base font-semibold text-white/90 max-w-md line-clamp-1">
                {lessonData.title}
              </h1>
            </div>

            {/* Botão continuar (quando disponível) */}
            {maxAudioProgress > duration * 0.8 && (
              <Button
                onClick={() => {
                  // ✅ ORDEM CORRETA: playground ANTES de exercises
                  if (lessonData.finalPlaygroundConfig) {
                    setCurrentPhase('playground-final');
                  } else if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
                    setCurrentPhase('exercises');
                  } else {
                    handleLessonComplete();
                  }
                }}
                size="sm"
                className="gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9 px-4 rounded-lg transition-all"
              >
                <span className="hidden md:inline">Continuar</span>
                <span className="md:hidden">→</span>
              </Button>
            )}
            {!maxAudioProgress && <div className="w-20" />}
          </div>
        </div>

        {/* Container do Slide - ESPAÇO CALCULADO */}
        <div className="absolute inset-0 top-14 md:top-16 bottom-20 md:bottom-24 flex items-center justify-center px-4 md:px-8">
          {currentSlide?.imageUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.contentIdea}
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {/* Número do slide - ELEGANTE */}
              <div className="absolute -top-12 md:top-2 right-0 md:right-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <span className="text-white text-sm font-semibold tabular-nums">
                  {currentSlide.slideNumber}
                </span>
              </div>
            </div>
          )}

          {!currentSlide?.imageUrl && (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center">
              <div className="text-center text-white px-8">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-60" />
                <p className="text-xl font-medium opacity-90">
                  {currentSlide?.contentIdea || 'Carregando slide...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Player PREMIUM - REFINADO E ELEGANTE */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto">
            {/* Barra de progresso - PREMIUM */}
            <div className="mb-3 md:mb-4">
              <div
                className="relative h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  seekTo(percentage * duration);
                }}
              >
                {/* Progress bar com glow effect */}
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-full transition-all shadow-lg shadow-purple-500/50"
                  style={{ width: `${progressPercentage}%` }}
                />
                
                {/* Hover indicator */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              </div>
              
              {/* Timestamps */}
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-xs text-white/60 font-medium tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-white/60 font-medium tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Controles - LAYOUT PROFISSIONAL */}
            <div className="flex items-center justify-between gap-4">
              {/* Avatar LIV - ESQUERDA */}
              <div className="flex items-center gap-2.5 min-w-[80px]">
                <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-white/10">
                  <AvatarImage src="/liv-avatar.png" />
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-xs text-white/90 font-medium leading-tight">LIV</p>
                  <p className="text-[10px] text-white/50 leading-tight">Narrando</p>
                </div>
              </div>

              {/* Botões de controle - CENTRO */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipToPreviousSlide}
                  disabled={currentSlideIndex === 0}
                  className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all rounded-lg"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  onClick={togglePlayPause}
                  className="relative h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
                  disabled={!isAudioInitialized}
                >
                  {isPlaying ? (
                    <Pause className="h-4.5 w-4.5 text-white" />
                  ) : (
                    <Play className="h-4.5 w-4.5 text-white ml-0.5" />
                  )}
                  
                  {/* Pulse effect when playing */}
                  {isPlaying && (
                    <span className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipToNextSlide}
                  disabled={currentSlideIndex === lessonData.slides.length - 1}
                  className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all rounded-lg"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume/Info - DIREITA */}
              <div className="flex items-center gap-2 min-w-[80px] justify-end">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <Volume2 className="h-3.5 w-3.5 text-white/60" />
                  <span className="text-xs text-white/60 font-medium">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elemento de áudio (hidden) */}
        <audio
          ref={audioRef}
          src={lessonData.audioUrl}
          preload="auto"
          autoPlay
        />
      </div>
    );
  }

  // 📝 FASE: Exercícios
  if (currentPhase === 'exercises' && lessonData.exercisesConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          <ExercisesSection
            exercises={lessonData.exercisesConfig}
            onComplete={handleExercisesComplete}
            onScoreUpdate={(scores) => setExerciseScores(scores)}
          />
        </div>
      </div>
    );
  }

  // 🎮 FASE: Playground Final
  if (currentPhase === 'playground-final' && lessonData.finalPlaygroundConfig) {
    const config = lessonData.finalPlaygroundConfig as PlaygroundConfig;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          <PlaygroundMidLesson
            config={config}
            onComplete={handlePlaygroundComplete}
            lessonId={lessonData.id}
          />
        </div>
      </div>
    );
  }

  // 🎊 FASE: Conclusão
  if (currentPhase === 'completed') {
    // Se deve mostrar o card de resultado da gamificação
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
            // Navegar direto sem voltar ao completion card
            if (onMarkComplete) {
              onMarkComplete();
            }
            navigate('/dashboard');
          }}
          onBackToTrail={() => {
            // Navegar direto sem voltar ao completion card
            if (trailId) {
              navigate(`/trail/${trailId}`);
            } else {
              navigate('/dashboard');
            }
          }}
        />
      );
    }

    // Mostrar card de conclusão primeiro (desempenho)
    return (
      <LessonCompletionSummary
        lessonTitle={lessonData.title}
        exerciseScores={exerciseScores}
        totalExercises={lessonData.exercisesConfig?.length || 0}
        onContinue={async () => {
          console.log('🎁 [V3-RECOMPENSAS] Registrando evento de gamificação');
          // Registrar evento de gamificação
          const result = await registerGamificationEvent('lesson_completed', lessonData.id);
          
          if (result) {
            console.log('✅ [V3-RECOMPENSAS] Resultado recebido:', result);
            setGamificationResult(result);
            setShowResultCard(true);
          } else {
            console.error('❌ [V3-RECOMPENSAS] Falha ao obter resultado');
            // Se falhar, continuar mesmo assim
            if (onMarkComplete) {
              onMarkComplete();
            }
            navigate('/dashboard');
          }
        }}
      />
    );
  }

  return null;
}

// 🕐 Formatar tempo em mm:ss
function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
