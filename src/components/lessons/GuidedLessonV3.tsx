import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { V3LessonProps, PlaygroundConfig } from '@/types/guidedLesson';
import { ExercisesSection } from './ExercisesSection';
import { PlaygroundMidLesson } from './PlaygroundMidLesson';
import { LessonCompletionCard } from './LessonCompletionCard';
import { AchievementBadge } from './AchievementBadge';
import { PointsNotification } from '@/components/gamification/PointsNotification';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { awardPoints, updateStreak, checkAndAwardAchievement, POINTS } from '@/lib/gamification';
import { updateMissionProgress } from '@/lib/updateMissionProgress';

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

      // Se completou o áudio, avança para exercícios (se houver) ou playground
      if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
        setCurrentPhase('exercises');
      } else if (lessonData.finalPlaygroundConfig) {
        setCurrentPhase('playground-final');
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

    // Se tem playground, avança para ele
    if (lessonData.finalPlaygroundConfig) {
      setCurrentPhase('playground-final');
    } else {
      handleLessonComplete();
    }
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
    handleLessonComplete();
  };

  // 🔙 Voltar para trilha
  const handleBack = () => {
    if (trailId) {
      navigate(`/trail/${trailId}`);
    } else {
      navigate('/trails');
    }
  };

  // 🎯 Renderizar slide atual
  const currentSlide = lessonData.slides[currentSlideIndex];
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 🎬 FASE: Apresentação de Slides
  if (currentPhase === 'slides') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Header - OVERLAY */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent pt-safe">
          <div className="px-4 py-2 md:py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1 text-white hover:bg-white/10 h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden md:inline">Voltar</span>
            </Button>

            <div className="text-center flex-1">
              <h1 className="text-xs md:text-sm font-semibold text-white line-clamp-1">
                {lessonData.title}
              </h1>
              <p className="text-[10px] md:text-xs text-white/60">
                Slide {currentSlideIndex + 1}/{lessonData.slides.length}
              </p>
            </div>

            <div className="w-16 md:w-20" />
          </div>
        </div>

        {/* Slide FULLSCREEN - Ocupa espaço entre header e player */}
        <div className="flex-1 relative w-full bg-black flex items-center justify-center pt-14 pb-20 md:pb-24">
          {currentSlide?.imageUrl && (
            <>
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.contentIdea}
                className="w-full h-full object-contain"
              />

              {/* Número do slide */}
              <div className="absolute top-16 right-2 md:right-4 bg-black/70 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                <span className="text-white text-xs md:text-sm font-medium">
                  {currentSlide.slideNumber}
                </span>
              </div>
            </>
          )}

          {!currentSlide?.imageUrl && (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white px-8">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-80" />
                <p className="text-xl font-medium">
                  {currentSlide?.contentIdea || 'Carregando slide...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Player COMPACTO - FIXO NO BOTTOM */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 pb-safe">
          <div className="px-3 md:px-4 py-1.5 md:py-2">
            {/* Barra de progresso + Tempo */}
            <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
              <span className="text-[10px] md:text-xs text-white/70 w-10 md:w-12 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  seekTo(percentage * duration);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-[10px] md:text-xs text-white/70 w-10 md:w-12 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controles + Avatar */}
            <div className="flex items-center justify-between">
              {/* Avatar LIV */}
              <div className="flex items-center gap-1.5 md:gap-2 min-w-[60px] md:min-w-[80px]">
                <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-white/20">
                  <AvatarImage src="/liv-avatar.png" />
                </Avatar>
                <span className="text-[10px] md:text-xs text-white/70 hidden sm:inline">LIV</span>
              </div>

              {/* Botões de controle */}
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipToPreviousSlide}
                  disabled={currentSlideIndex === 0}
                  className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <SkipBack className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>

                <Button
                  size="icon"
                  onClick={togglePlayPause}
                  className="rounded-full h-9 w-9 md:h-10 md:w-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  disabled={!isAudioInitialized}
                >
                  {isPlaying ? (
                    <Pause className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  ) : (
                    <Play className="h-3.5 w-3.5 md:h-4 md:w-4 ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipToNextSlide}
                  disabled={currentSlideIndex === lessonData.slides.length - 1}
                  className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <SkipForward className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>

              {/* Spacer para equilibrar */}
              <div className="min-w-[60px] md:min-w-[80px]" />
            </div>
          </div>
        </div>

        {/* Botão para continuar (se já ouviu o áudio) */}
        {maxAudioProgress > duration * 0.8 && (
          <div className="absolute top-20 right-4 z-20">
            <Button
              onClick={() => {
                if (lessonData.exercisesConfig && lessonData.exercisesConfig.length > 0) {
                  setCurrentPhase('exercises');
                } else if (lessonData.finalPlaygroundConfig) {
                  setCurrentPhase('playground-final');
                } else {
                  handleLessonComplete();
                }
              }}
              size="sm"
              className="gap-2 shadow-lg bg-white/90 text-gray-900 hover:bg-white"
            >
              Continuar →
            </Button>
          </div>
        )}

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
    return (
      <LessonCompletionCard
        lessonTitle={lessonData.title}
        onContinue={() => {
          // Chamar o onMarkComplete para registrar gamificação
          if (onMarkComplete) {
            onMarkComplete();
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
