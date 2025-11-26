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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>

              <div className="flex-1 mx-4">
                <h1 className="text-lg font-semibold text-gray-900 text-center">
                  {lessonData.title}
                </h1>
                <p className="text-sm text-gray-500 text-center">
                  Slide {currentSlideIndex + 1} de {lessonData.slides.length}
                </p>
              </div>

              <div className="w-20" /> {/* Spacer para centralizar título */}
            </div>
          </div>
        </div>

        {/* Área principal com slide - FULLSCREEN */}
        <div className="w-full h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex items-center justify-center px-2 md:px-4">
          <Card className="w-full h-full max-w-7xl overflow-hidden shadow-2xl">
            {/* Imagem do slide */}
            {currentSlide?.imageUrl && (
              <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.contentIdea}
                  className="w-full h-full object-contain"
                />

                {/* Número do slide overlay */}
                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/70 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1 rounded-full">
                  <span className="text-white text-xs md:text-sm font-medium">
                    {currentSlide.slideNumber}
                  </span>
                </div>
              </div>
            )}

            {/* Fallback se não houver imagem */}
            {!currentSlide?.imageUrl && (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white px-4 md:px-8">
                  <Sparkles className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg md:text-xl font-medium">
                    {currentSlide?.contentIdea || 'Carregando slide...'}
                  </p>
                </div>
              </div>
            )}

          </Card>
        </div>

        {/* Controles de áudio - FIXO NO BOTTOM */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg z-20">
          <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
            {/* Barra de progresso */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                className="h-2 bg-gray-200 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  seekTo(percentage * duration);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Botões de controle */}
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipToPreviousSlide}
                disabled={currentSlideIndex === 0}
                className="h-10 w-10 md:h-12 md:w-12"
              >
                <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              <Button
                size="lg"
                onClick={togglePlayPause}
                className="rounded-full h-12 w-12 md:h-14 md:w-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                disabled={!isAudioInitialized}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipToNextSlide}
                disabled={currentSlideIndex === lessonData.slides.length - 1}
                className="h-10 w-10 md:h-12 md:w-12"
              >
                <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>

            {/* Avatar da LIV */}
            <div className="mt-3 flex items-center justify-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-purple-200">
                <AvatarImage src="/liv-avatar.png" />
              </Avatar>
              <p className="text-xs md:text-sm text-gray-600 italic">
                Narração com LIV
              </p>
            </div>
          </div>
        </div>

        {/* Botão para pular para exercícios (se já ouviu o áudio) */}
        {maxAudioProgress > duration * 0.8 && (
          <div className="fixed top-20 right-4 z-10">
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
              className="gap-2 shadow-lg"
            >
              Continuar para {lessonData.exercisesConfig?.length ? 'Exercícios' : 'Playground'} →
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
