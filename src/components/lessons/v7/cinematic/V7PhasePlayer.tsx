// V7PhasePlayer - Main player component orchestrating all cinematic phases
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { V7MinimalTimeline } from './V7MinimalTimeline';
import { V7AudioIndicator } from './V7AudioIndicator';
import { V7AudioControls } from './V7AudioControls';
import { V7DiscreteNavigation } from './V7DiscreteNavigation';
import { V7CinematicCanvas } from './V7CinematicCanvas';
import { useV7CinematicAudio } from './useV7CinematicAudio';
import { useV7SoundEffects } from './useV7SoundEffects';
import { V7SynchronizedCaptions } from '../V7SynchronizedCaptions';
import { V7DebugPanel } from '../V7DebugPanel';

import V7PhaseLoading from './phases/V7PhaseLoading';
import V7PhaseDramatic from './phases/V7PhaseDramatic';
import V7PhaseNarrative from './phases/V7PhaseNarrative';
import V7PhaseQuiz from './phases/V7PhaseQuiz';
import V7PhasePlayground from './phases/V7PhasePlayground';
import V7PhaseGamification from './phases/V7PhaseGamification';
import V7PhaseCTA from './phases/V7PhaseCTA';
import { V7LessonScript, V7Phase, usePhaseController } from './phases/V7PhaseController';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface V7PhasePlayerProps {
  script: V7LessonScript;
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];
  onComplete?: () => void;
}

export const V7PhasePlayer = ({
  script,
  audioUrl,
  wordTimestamps = [],
  onComplete
}: V7PhasePlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Sound effects
  const { playSound, unlockAudio } = useV7SoundEffects();

  // Audio hook
  const audio = useV7CinematicAudio({
    onEnded: () => {
      playSound('completion');
      onComplete?.();
    }
  });

  // Phase controller
  const {
    currentPhase,
    currentPhaseIndex,
    currentSceneIndex,
    phaseProgress,
    goToPhase
  } = usePhaseController({
    script,
    currentTime: audio.currentTime,
    isPlaying: audio.isPlaying
  });

  // Load audio
  useEffect(() => {
    if (audioUrl) {
      audio.loadAudio(audioUrl);
    }
  }, [audioUrl]);

  // Unlock audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, [unlockAudio]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 3000);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Play sound on phase change
  useEffect(() => {
    if (currentPhaseIndex > 0 && !isLoading) {
      playSound('transition-whoosh');
    }
  }, [currentPhaseIndex, isLoading, playSound]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPhase();
      if (e.key === 'ArrowLeft') goToPreviousPhase();
      if (e.key === ' ') {
        e.preventDefault();
        audio.togglePlayPause();
      }
      if (e.key === 'm' || e.key === 'M') audio.toggleMute();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [audio, currentPhaseIndex]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    audio.togglePlayPause();
  }, [audio]);

  const goToNextPhase = useCallback(() => {
    if (currentPhaseIndex < script.phases.length - 1) {
      playSound('transition-whoosh');
      goToPhase(currentPhaseIndex + 1);
    } else {
      onComplete?.();
    }
  }, [currentPhaseIndex, script.phases.length, playSound, goToPhase, onComplete]);

  const goToPreviousPhase = useCallback(() => {
    if (currentPhaseIndex > 0) {
      playSound('click-soft');
      goToPhase(currentPhaseIndex - 1);
    }
  }, [currentPhaseIndex, playSound, goToPhase]);

  const handleQuizComplete = (selectedIds: string[]) => {
    playSound('success');
    setTimeout(goToNextPhase, 2000);
  };

  const handlePlaygroundComplete = () => {
    playSound('success');
    setTimeout(goToNextPhase, 2000);
  };

  const handleCTAChoice = (choice: 'negative' | 'positive') => {
    if (choice === 'positive') {
      playSound('success');
    }
    goToNextPhase();
  };

  // Get canvas mood based on phase type
  const getCanvasMood = (type?: V7Phase['type']): 'dramatic' | 'calm' | 'energetic' | 'mysterious' => {
    switch (type) {
      case 'dramatic': return 'dramatic';
      case 'narrative': return 'mysterious';
      case 'interaction': return 'energetic';
      case 'playground': return 'calm';
      case 'revelation': return 'energetic';
      case 'gamification': return 'energetic';
      default: return 'dramatic';
    }
  };

  // Calculate duration string
  const minutes = Math.floor(script.totalDuration / 60);
  const seconds = script.totalDuration % 60;
  const totalDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Show loading screen
  if (isLoading) {
    return <V7PhaseLoading onComplete={handleLoadingComplete} duration={3000} />;
  }

  // Extract scene content with fallbacks (cast to any for flexible DB data)
  const getSceneContent = (sceneIndex: number = 0): any => {
    const scene = currentPhase?.scenes?.[sceneIndex];
    return scene?.content || {};
  };

  // Render current phase content using DYNAMIC data from database
  const renderPhaseContent = () => {
    if (!currentPhase) return null;

    const content = getSceneContent(currentSceneIndex);
    const firstSceneContent = getSceneContent(0);

    switch (currentPhase.type) {
      case 'dramatic':
        return (
          <V7PhaseDramatic
            mainNumber={String(content.number || firstSceneContent.number || '01')}
            subtitle={content.subtitle || firstSceneContent.subtitle || currentPhase.title}
            highlightWord={content.highlightWord || firstSceneContent.highlightWord}
            impactWord={content.mainText || firstSceneContent.mainText || ''}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            mood={currentPhase.mood === 'danger' ? 'danger' : currentPhase.mood === 'success' ? 'success' : 'neutral'}
          />
        );

      case 'narrative':
        const items = content.items || firstSceneContent.items || [];
        const leftItem = items[0] || {};
        const rightItem = items[1] || {};
        
        return (
          <V7PhaseNarrative
            leftTitle={leftItem.label || 'Opção A'}
            rightTitle={rightItem.label || 'Opção B'}
            leftEmoji={leftItem.isNegative ? '❌' : '✅'}
            rightEmoji={rightItem.isPositive ? '✅' : '❌'}
            comparisons={[
              { 
                label: 'Característica', 
                leftValue: leftItem.value || '', 
                rightValue: rightItem.value || '', 
                leftColor: leftItem.isNegative ? '#ff6b6b' : '#4ecdc4', 
                rightColor: rightItem.isPositive ? '#4ecdc4' : '#ff6b6b' 
              }
            ]}
            warningTitle={content.mainText || firstSceneContent.mainText || currentPhase.title}
            warningSubtitle={content.subtitle || firstSceneContent.subtitle || ''}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
          />
        );

      case 'interaction':
        const quizOptions = (content.options || firstSceneContent.options || []).map((opt: any) => ({
          id: opt.id || String(Math.random()),
          text: opt.label || opt.text || '',
          category: (opt.isCorrect ? 'good' : 'bad') as 'good' | 'bad'
        }));
        
        return (
          <V7PhaseQuiz
            title={content.mainText || firstSceneContent.mainText || 'Responda:'}
            subtitle={content.subtitle || ''}
            options={quizOptions}
            revealTitle="RESULTADO"
            revealMessage={content.explanation || ''}
            revealValue=""
            sceneIndex={currentSceneIndex}
            onComplete={handleQuizComplete}
            audioControl={audio}
          />
        );

      case 'playground':
        // Extract playground scores from content with proper fallbacks
        const amateurScore = typeof content.amateurScore === 'number'
          ? content.amateurScore
          : (firstSceneContent.amateurScore || 10);
        const professionalScore = typeof content.professionalScore === 'number'
          ? content.professionalScore
          : (firstSceneContent.professionalScore || 95);
        const maxScore = 100;

        // Determine verdict based on score
        const getVerdict = (score: number): 'bad' | 'good' | 'excellent' => {
          if (score < 30) return 'bad';
          if (score < 70) return 'good';
          return 'excellent';
        };

        // Parse result content (handle both string and object formats)
        const getResultContent = (result: any): string => {
          if (typeof result === 'string') return result;
          if (typeof result === 'object' && result?.content) return result.content;
          return '';
        };

        return (
          <V7PhasePlayground
            challengeTitle={content.mainText || firstSceneContent.mainText || 'DESAFIO PRÁTICO'}
            challengeSubtitle={content.subtitle || firstSceneContent.subtitle || currentPhase.title}
            amateurPrompt={content.amateurPrompt || firstSceneContent.amateurPrompt || 'prompt simples'}
            amateurResult={{
              title: 'Resultado Amador',
              content: getResultContent(content.amateurResult || firstSceneContent.amateurResult) || 'Resultado genérico...',
              score: amateurScore,
              maxScore,
              verdict: getVerdict(amateurScore)
            }}
            professionalPrompt={content.professionalPrompt || firstSceneContent.professionalPrompt || 'prompt profissional estruturado'}
            professionalResult={{
              title: 'Resultado Profissional',
              content: getResultContent(content.professionalResult || firstSceneContent.professionalResult) || 'Resultado otimizado...',
              score: professionalScore,
              maxScore,
              verdict: getVerdict(professionalScore)
            }}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            onComplete={handlePlaygroundComplete}
            audioControl={audio}
          />
        );

      case 'revelation':
        const ctaOptions = (content.options || []).map((opt: any) => ({
          label: opt.label || '',
          emoji: opt.emoji || '🎯',
          variant: opt.variant || 'primary'
        }));
        
        return (
          <V7PhaseCTA
            title={content.mainText || firstSceneContent.mainText || currentPhase.title}
            subtitle={content.subtitle || firstSceneContent.subtitle || ''}
            options={ctaOptions.length > 0 ? ctaOptions : [
              { label: 'Revisar', emoji: '📚', variant: 'secondary' },
              { label: 'Continuar', emoji: '🚀', variant: 'positive' }
            ]}
            duration={currentPhase.endTime - currentPhase.startTime}
            onChoice={handleCTAChoice}
          />
        );

      case 'gamification':
        const metrics = content.metrics || firstSceneContent.metrics || [];
        const xp = metrics.find((m: any) => m.label?.includes('XP'))?.value || '+100';
        
        return (
          <V7PhaseGamification
            achievements={(content.items || firstSceneContent.items || []).map((item: any, idx: number) => ({
              id: String(idx),
              icon: item.emoji || '✅',
              title: item.text || 'Conquista',
              unlocked: true
            }))}
            xpEarned={parseInt(xp.replace(/\D/g, '')) || 100}
            levelName={content.mainText || 'COMPLETO'}
            nextLessonTitle={content.subtitle || 'Próxima Aula'}
            nextLessonCountdown=""
            sceneIndex={currentSceneIndex}
            onContinue={() => onComplete?.()}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`w-full h-screen relative overflow-hidden ${showControls ? 'cursor-default' : 'cursor-none'}`}
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Canvas Background */}
      <V7CinematicCanvas 
        mood={getCanvasMood(currentPhase?.type)}
        intensity={audio.isPlaying ? 'high' : 'medium'}
      />

      {/* Timeline */}
      <V7MinimalTimeline
        currentAct={currentPhaseIndex + 1}
        totalActs={script.phases.length}
        currentTime={audio.formattedCurrentTime}
        totalTime={totalDuration}
        isVisible={showControls}
      />

      {/* Audio Indicator */}
      <V7AudioIndicator isPlaying={audio.isPlaying} />

      {/* Audio Controls */}
      {audioUrl && (
        <V7AudioControls
          isPlaying={audio.isPlaying}
          isMuted={audio.isMuted}
          volume={audio.volume}
          currentTime={audio.formattedCurrentTime}
          duration={audio.formattedDuration}
          onTogglePlay={audio.togglePlayPause}
          onToggleMute={audio.toggleMute}
          onVolumeChange={audio.setVolume}
          isVisible={showControls}
        />
      )}

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase?.id || 'empty'}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderPhaseContent()}
        </motion.div>
      </AnimatePresence>

      {/* Captions */}
      {wordTimestamps.length > 0 && (
        <V7SynchronizedCaptions
          wordTimestamps={wordTimestamps}
          currentTime={audio.currentTime}
          isVisible={audio.isPlaying || audio.currentTime > 0}
          maxWords={15}
        />
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <V7DiscreteNavigation
          onPrevious={goToPreviousPhase}
          onNext={goToNextPhase}
          onSkip={() => goToPhase(script.phases.length - 1)}
          canGoPrevious={currentPhaseIndex > 0}
          canGoNext={currentPhaseIndex < script.phases.length - 1}
          showSkip={currentPhaseIndex < script.phases.length - 2}
        />
      </motion.div>

      {/* Debug Panel */}
      <V7DebugPanel
        currentPhase={currentPhase}
        currentPhaseIndex={currentPhaseIndex}
        currentScene={currentPhase?.scenes?.[currentSceneIndex] || null}
        currentSceneIndex={currentSceneIndex}
        currentTime={audio.currentTime}
        isPlaying={audio.isPlaying}
        audioUrl={audioUrl || null}
        wordTimestamps={wordTimestamps}
      />
    </div>
  );
};
