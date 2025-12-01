import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Sparkles, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { GuidedLessonProps } from '@/types/guidedLesson';
import { TransitionCard } from './TransitionCard';
import { ExercisesSection } from './ExercisesSection';
import { LessonCompletionSummary } from './LessonCompletionSummary';
import { PointsNotification } from '@/components/gamification/PointsNotification';
import { LessonResultCard } from '@/components/gamification/LessonResultCard';
import { LivAvatar } from '@/components/LivAvatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { registerGamificationEvent, GamificationResult } from '@/services/gamification';

// Experience Cards
import { IaBookExperienceCard, IaBookCardConfig } from './experience-cards';
import { ExperienceCard as ExperienceCardType } from '@/lib/lessonPipeline/types';

/**
 * 🚀 GUIDED LESSON V5 - EXPERIENCE CARDS ANIMADOS
 *
 * Modelo V5 = V4 (áudios separados) + Experience Cards Animados
 *
 * Features:
 * - Áudio por seção (igual V4)
 * - Experience Cards animados que aparecem durante a narração
 * - Animações Framer Motion para cada tipo de card
 * - Trigger por timestamp ou anchorText
 */

// ===========================================
// EXPERIENCE CARD RENDERER
// ===========================================

interface ExperienceCardRendererProps {
  card: ExperienceCardType;
  isVisible: boolean;
  onComplete?: () => void;
}

function ExperienceCardRenderer({ card, isVisible, onComplete }: ExperienceCardRendererProps) {
  switch (card.type) {
    case 'ia-book':
      return (
        <IaBookExperienceCard
          config={card.config as IaBookCardConfig}
          isVisible={isVisible}
          onAnimationComplete={onComplete}
        />
      );
    // Future card types
    case 'ia-chat':
    case 'comparison':
    case 'stats':
    case 'quote':
    default:
      // Placeholder for cards not yet implemented
      return isVisible ? (
        <motion.div
          className="w-full max-w-4xl mx-auto my-8 p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-300">Experience Card: {card.type}</span>
          </div>
        </motion.div>
      ) : null;
  }
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function GuidedLessonV5({
  lessonData,
  onComplete,
  onMarkComplete,
  audioUrl,
  wordTimestamps,
  nextLessonId,
  nextLessonType,
  trailId,
}: GuidedLessonProps) {
  const navigate = useNavigate();

  // ===========================================
  // STATE
  // ===========================================
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxAudioProgress, setMaxAudioProgress] = useState(0);
  const [sectionJustChanged, setSectionJustChanged] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Experience Cards visibility
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());

  // Phase management
  const [currentPhase, setCurrentPhase] = useState<
    'audio' | 'transition' | 'exercises' | 'completed'
  >('audio');

  // Gamification
  const [exerciseScores, setExerciseScores] = useState<Record<string, number>>({});
  const [showResultCard, setShowResultCard] = useState(false);
  const [gamificationResult, setGamificationResult] = useState<GamificationResult | null>(null);
  const [pointsNotification, setPointsNotification] = useState({ show: false, points: 0, reason: '' });

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSectionRef = useRef<number>(0);

  // ===========================================
  // EXPERIENCE CARDS LOGIC
  // ===========================================

  // Get all experience cards from all sections
  const allExperienceCards = lessonData.sections.flatMap((section, sectionIndex) => {
    const cards = (section as any).experienceCards || [];
    return cards.map((card: ExperienceCardType) => ({
      ...card,
      sectionIndex,
      sectionTimestamp: section.timestamp,
    }));
  });

  // Check if a card should be visible based on current time
  const checkCardVisibility = useCallback((card: ExperienceCardType & { sectionIndex: number; sectionTimestamp: number }) => {
    // If card has explicit trigger timestamp
    if (card.triggerTimestamp !== undefined) {
      return currentTime >= card.triggerTimestamp;
    }

    // Otherwise, show when section starts
    return currentTime >= card.sectionTimestamp;
  }, [currentTime]);

  // Update visible cards when time changes
  useEffect(() => {
    const newVisibleCards = new Set<string>();

    allExperienceCards.forEach((card: any) => {
      if (checkCardVisibility(card)) {
        newVisibleCards.add(card.id);
      }
    });

    setVisibleCards(newVisibleCards);
  }, [currentTime, allExperienceCards, checkCardVisibility]);

  // ===========================================
  // AUDIO LOGIC (V2/V4 style - audio per section)
  // ===========================================

  const currentSectionData = lessonData.sections[currentSection];
  const currentAudioUrl = (currentSectionData as any)?.audio_url;

  // Calculate active section from current time
  const calculateActiveSection = useCallback((time: number): number => {
    let left = 0;
    let right = lessonData.sections.length - 1;
    let result = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (lessonData.sections[mid].timestamp <= time) {
        result = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }, [lessonData.sections]);

  // Time update handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setMaxAudioProgress(Math.max(maxAudioProgress, audio.currentTime));

      // Calculate new section
      const newSection = calculateActiveSection(audio.currentTime);
      if (newSection !== lastSectionRef.current) {
        lastSectionRef.current = newSection;
        setCurrentSection(newSection);
        setSectionJustChanged(true);
        setTimeout(() => setSectionJustChanged(false), 600);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      // Move to next section if available
      if (currentSection < lessonData.sections.length - 1) {
        const nextSection = currentSection + 1;
        setCurrentSection(nextSection);
        const nextAudioUrl = (lessonData.sections[nextSection] as any)?.audio_url;
        if (nextAudioUrl) {
          audio.src = nextAudioUrl;
          audio.load();
          audio.play().catch(console.error);
        }
      } else {
        // All sections complete, go to exercises
        setCurrentPhase('transition');
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSection, lessonData.sections, calculateActiveSection, maxAudioProgress]);

  // Load audio when section changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    if (audio.src !== currentAudioUrl) {
      audio.src = currentAudioUrl;
      audio.load();
    }
  }, [currentAudioUrl]);

  // ===========================================
  // CONTROLS
  // ===========================================

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (currentSection < lessonData.sections.length - 1) {
      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);
      const nextAudioUrl = (lessonData.sections[nextSection] as any)?.audio_url;
      if (nextAudioUrl && audioRef.current) {
        audioRef.current.src = nextAudioUrl;
        audioRef.current.load();
        if (isPlaying) audioRef.current.play().catch(console.error);
      }
    }
  };

  const skipBackward = () => {
    if (currentSection > 0) {
      const prevSection = currentSection - 1;
      setCurrentSection(prevSection);
      const prevAudioUrl = (lessonData.sections[prevSection] as any)?.audio_url;
      if (prevAudioUrl && audioRef.current) {
        audioRef.current.src = prevAudioUrl;
        audioRef.current.load();
        if (isPlaying) audioRef.current.play().catch(console.error);
      }
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
    if (audioRef.current) {
      audioRef.current.playbackRate = speeds[nextIndex];
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (audioRef.current) {
      if (isAudioEnabled) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const skipToExercises = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentPhase('transition');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentSection / Math.max(1, lessonData.sections.length - 1)) * 100;

  // ===========================================
  // EXERCISE HANDLERS
  // ===========================================

  const handleExercisesComplete = async () => {
    setCurrentPhase('completed');
  };

  const handleGoToExercises = () => {
    setCurrentPhase('exercises');
  };

  // ===========================================
  // RENDER PHASES
  // ===========================================

  // Transition phase
  if (currentPhase === 'transition') {
    return (
      <TransitionCard
        title="🎉 Muito bem! Aula completa!"
        description="Agora vamos fixar o que você aprendeu com exercícios práticos."
        buttonText="🎯 Ir para Exercícios"
        onBack={() => {
          setCurrentSection(0);
          setCurrentPhase('audio');
        }}
        onContinue={handleGoToExercises}
      />
    );
  }

  // Completed phase
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
            if (onMarkComplete) onMarkComplete();
            navigate('/dashboard');
          }}
          onBackToTrail={() => {
            if (trailId) navigate(`/trail/${trailId}`);
            else navigate('/dashboard');
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
          const result = await registerGamificationEvent('lesson_completed', lessonData.id);
          if (result) {
            setGamificationResult(result);
            setShowResultCard(true);
          } else {
            if (onMarkComplete) onMarkComplete();
            navigate('/dashboard');
          }
        }}
      />
    );
  }

  // Exercises phase
  if (currentPhase === 'exercises' && lessonData.exercisesConfig) {
    return (
      <ExercisesSection
        exercises={lessonData.exercisesConfig}
        onComplete={handleExercisesComplete}
        onScoreUpdate={(scores) => setExerciseScores(scores)}
        exerciseMetadata={lessonData.exercisesConfig.map(ex => ({
          title: ex.title,
          type: ex.type,
        }))}
        onBack={() => {
          setCurrentSection(0);
          setCurrentPhase('audio');
        }}
      />
    );
  }

  // ===========================================
  // MAIN RENDER - Audio Phase
  // ===========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-md">
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 max-w-[1920px] mx-auto">
            <button
              onClick={() => navigate(`/trail/${trailId || lessonData.trackId}`)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lessonData.title}</h1>
              <p className="text-xs text-slate-600 truncate">{lessonData.trackName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)' }}
              >
                {Math.round(progress)}%
              </span>
              <div className="w-20 sm:w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)' }}
                />
              </div>
            </div>
            <button
              onClick={skipToExercises}
              disabled={!lessonData.exercisesConfig}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all"
              style={{ backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)' }}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              <span className="hidden sm:inline">Exercícios</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-6 pt-20 pb-32">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-12">
            {/* Sidebar - Liv Avatar + Sections */}
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
                      className={!isAudioEnabled ? 'grayscale opacity-50' : ''}
                    />
                  </div>
                  <button
                    onClick={toggleAudio}
                    className={`w-full px-2.5 py-1.5 rounded-full font-medium text-[10px] text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 ${
                      isAudioEnabled ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-green-500'
                    }`}
                  >
                    {isAudioEnabled ? '🔊 Silenciar' : '🔇 Ativar'}
                  </button>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-200/50 shadow-xl">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Seções da aula</h3>
                  <div className="space-y-1.5">
                    {lessonData.sections.map((section, index) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setCurrentSection(index);
                          const sectionAudioUrl = (lessonData.sections[index] as any)?.audio_url;
                          if (sectionAudioUrl && audioRef.current) {
                            audioRef.current.src = sectionAudioUrl;
                            audioRef.current.load();
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-all duration-300 ${
                          currentSection === index
                            ? 'text-white shadow-lg'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                        style={
                          currentSection === index
                            ? { backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)' }
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              currentSection === index ? 'bg-white/20' : 'bg-slate-200'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="truncate">{section.title || section.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="space-y-4 sm:space-y-6 min-w-0">
              {lessonData.sections.map((section, originalIndex) => {
                const sectionCards = (section as any).experienceCards || [];

                return (
                  <div key={section.id}>
                    {/* Section Content */}
                    <motion.div
                      id={`section-${originalIndex}`}
                      className={`transition-all duration-1000 ease-out ${
                        isAudioEnabled
                          ? currentSection >= originalIndex
                            ? 'opacity-100 translate-y-0 scale-100'
                            : 'opacity-30 translate-y-8 scale-95'
                          : 'opacity-100 translate-y-0 scale-100'
                      }`}
                      style={{
                        transitionDelay: currentSection === originalIndex ? '0ms' : `${Math.abs(originalIndex - currentSection) * 50}ms`,
                      }}
                    >
                      <div
                        className={`bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border shadow-xl transition-all duration-700 ease-out relative overflow-hidden ${
                          currentSection === originalIndex
                            ? 'border-cyan-300/60 ring-2 ring-cyan-400/30 shadow-2xl shadow-cyan-400/20 scale-[1.01]'
                            : 'border-slate-200/50 hover:border-slate-300/50 hover:shadow-2xl'
                        }`}
                      >
                        {/* Section Number */}
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200/50">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-md transition-all ${
                              currentSection === originalIndex ? 'text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                            style={
                              currentSection === originalIndex
                                ? { backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)' }
                                : undefined
                            }
                          >
                            {originalIndex + 1}
                          </div>
                          {currentSection === originalIndex && (
                            <span className="text-xs font-medium text-cyan-600 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                              Você está aqui
                            </span>
                          )}
                        </div>

                        {/* Markdown Content */}
                        <div className="prose prose-slate prose-sm max-w-none [&_h1]:!text-[25px] [&_h1]:!leading-tight [&_h1]:!mb-4 [&_h1]:!font-bold [&_h2]:!text-[21px] [&_h2]:!leading-snug [&_h2]:!mb-3 [&_h2]:!mt-6 [&_h2]:!font-bold [&_h3]:!text-[17px] [&_h3]:!mb-2 [&_h3]:!mt-4 [&_h3]:!font-bold [&_p]:!text-base [&_p]:!leading-relaxed [&_p]:!mb-3 [&_p]:text-slate-700 [&_li]:!text-base [&_li]:!leading-relaxed [&_li]:text-slate-700 [&_ul]:!my-3 [&_ul]:!space-y-2 [&_ol]:!my-3 [&_ol]:!space-y-2 [&_strong]:!font-semibold [&_strong]:!text-cyan-600 [&_strong]:bg-cyan-50/50 [&_strong]:px-0.5 [&_strong]:rounded [&_code]:!text-purple-600 [&_code]:!bg-purple-100 [&_code]:!px-1.5 [&_code]:!py-0.5 [&_code]:!rounded [&_code]:!text-sm [&_code]:!font-mono [&_blockquote]:!border-l-4 [&_blockquote]:!border-l-cyan-400 [&_blockquote]:!bg-gradient-to-r [&_blockquote]:!from-cyan-50/60 [&_blockquote]:!to-blue-50/40 [&_blockquote]:!py-3 [&_blockquote]:!px-4 [&_blockquote]:!rounded-r-lg [&_blockquote]:!my-4 [&_blockquote]:!text-base">
                          <ReactMarkdown>{section.visualContent || (section as any).content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>

                    {/* Experience Cards for this section */}
                    <AnimatePresence>
                      {sectionCards.map((card: ExperienceCardType) => (
                        <ExperienceCardRenderer
                          key={card.id}
                          card={card}
                          isVisible={visibleCards.has(card.id) && currentSection >= originalIndex}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })}
            </main>
          </div>
        </div>
      </div>

      {/* Liv Mobile */}
      <div className="lg:hidden fixed bottom-24 sm:bottom-28 left-3 right-3 z-40 flex justify-center">
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl p-2.5 border-2 border-primary/30 shadow-xl max-w-[290px] w-full">
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <LivAvatar
                size="small"
                isPlaying={isPlaying && isAudioEnabled}
                showHalo={false}
                state={isPlaying && isAudioEnabled ? 'speaking' : 'idle'}
                theme="fundamentos"
                className={!isAudioEnabled ? 'grayscale opacity-50' : ''}
                animate={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-700 leading-snug font-medium">
                {lessonData.sections[currentSection]?.speechBubbleText || 'Vamos aprender!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50 shadow-2xl transition-all duration-300 ${
          !isAudioEnabled ? 'grayscale opacity-60' : ''
        }`}
      >
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={skipBackward}
                  className="w-9 h-9 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white transition-all"
                >
                  <SkipBack size={16} />
                </button>
                <button
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all hover:scale-105"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)',
                    boxShadow: '0 10px 30px rgba(34, 211, 238, 0.3)',
                  }}
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                <button
                  onClick={skipForward}
                  className="w-9 h-9 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white transition-all"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-3 min-w-0">
                <Volume2 className="text-cyan-400 flex-shrink-0" size={18} />
                <span className="text-xs text-slate-300 font-medium">
                  Seção {currentSection + 1} de {lessonData.sections.length}
                </span>
                <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden group min-w-0">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
              </div>

              <button
                onClick={cycleSpeed}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-bold text-xs transition-all min-w-[55px]"
              >
                {playbackSpeed}x
              </button>
              <button
                onClick={() => onComplete({ audioProgress: maxAudioProgress })}
                className="px-5 py-2 rounded-xl text-white font-semibold text-sm shadow-lg transition-all whitespace-nowrap hover:scale-105"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)',
                  boxShadow: '0 10px 30px rgba(34, 211, 238, 0.3)',
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* Points Notification */}
      <PointsNotification
        points={pointsNotification.points}
        reason={pointsNotification.reason}
        show={pointsNotification.show}
        onHide={() => setPointsNotification((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}

export default GuidedLessonV5;
