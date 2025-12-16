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

  // Render current phase content
  const renderPhaseContent = () => {
    if (!currentPhase) return null;

    switch (currentPhase.type) {
      case 'dramatic':
        return (
          <V7PhaseDramatic
            mainNumber="98%"
            subtitle="das pessoas usam IA como"
            highlightWord="IA"
            impactWord="BRINQUEDO"
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            mood="danger"
          />
        );

      case 'narrative':
        return (
          <V7PhaseNarrative
            leftTitle="98% BRINCANDO"
            rightTitle="2% DOMINANDO"
            leftEmoji="😂"
            rightEmoji="💰"
            comparisons={[
              { label: 'Renda mensal', leftValue: 'R$ 0', rightValue: 'R$ 30.000', leftColor: '#ff6b6b', rightColor: '#4ecdc4' },
              { label: 'Horas trabalhadas', leftValue: '8h', rightValue: '2h', leftColor: '#ff6b6b', rightColor: '#4ecdc4' },
              { label: 'Produtividade', leftValue: '1x', rightValue: '10x', leftColor: '#ff6b6b', rightColor: '#4ecdc4' }
            ]}
            warningTitle="EM 7 ANOS"
            warningSubtitle="Quem não dominar IA será dominado por ela"
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
          />
        );

      case 'interaction':
        return (
          <V7PhaseQuiz
            title="Suas últimas 5 interações com IA foram para quê?"
            subtitle="Seja honesto na sua avaliação"
            options={[
              { id: 'problem', text: 'Resolver problema real de trabalho', category: 'good' },
              { id: 'automate', text: 'Automatizar uma tarefa repetitiva', category: 'good' },
              { id: 'money', text: 'Criar conteúdo para ganhar dinheiro', category: 'good' },
              { id: 'time', text: 'Economizar tempo significativo', category: 'good' },
              { id: 'curiosity', text: 'Curiosidade / Teste / Brincadeira', category: 'bad' }
            ]}
            revealTitle="ALERTA"
            revealMessage="Perdendo R$ 2.000/mês"
            revealValue="R$ 24.000/ano"
            sceneIndex={currentSceneIndex}
            onComplete={handleQuizComplete}
          />
        );

      case 'playground':
        return (
          <V7PhasePlayground
            challengeTitle="DESAFIO DOS R$ 500"
            challengeSubtitle="Vou provar que em 30 segundos você pode cobrar R$ 500"
            amateurPrompt="me ajuda com posts para loja"
            amateurResult={{
              title: 'Resultado Amador',
              content: '"Compre agora!"\n"Promoção imperdível!"\n"Novidades chegaram!"\n"Não perca!"\n"Aproveite!"',
              score: 0,
              maxScore: 500,
              verdict: 'bad'
            }}
            professionalPrompt={`P - PAPEL: Especialista em moda feminina
E - ESPECIFICIDADE: 5 posts Instagram
R - REFERÊNCIA: Mulheres 25-40 anos
F - FORMATO: Emoji + título + CTA sutil
E - EXEMPLO: Tom Vogue Brasil
I - INTENÇÃO: Despertar desejo
T - TOM: Sofisticado, íntimo
O - OBSTÁCULOS: Evitar "compre agora"`}
            professionalResult={{
              title: 'Resultado Profissional',
              content: '🌙 O Pretinho Que Não É Básico\nAquele vestido que transita do board meeting para o happy hour sem pedir licença.\nQuantos pretinhos cabem em uma vida?',
              score: 500,
              maxScore: 500,
              verdict: 'excellent'
            }}
            sceneIndex={currentSceneIndex}
            phaseProgress={phaseProgress}
            onComplete={handlePlaygroundComplete}
          />
        );

      case 'revelation':
        return (
          <V7PhaseCTA
            title="ESCOLHA SEU DESTINO:"
            subtitle="A escolha é agora"
            options={[
              { label: 'CONTINUAR 98%', emoji: '😴', variant: 'negative' },
              { label: 'ENTRAR NOS 2%', emoji: '🚀', variant: 'positive' }
            ]}
            duration={currentPhase.endTime - currentPhase.startTime}
            onChoice={handleCTAChoice}
          />
        );

      case 'gamification':
        return (
          <V7PhaseGamification
            achievements={[
              { id: '1', icon: '✅', title: 'Saiu da Matrix', unlocked: true },
              { id: '2', icon: '✅', title: 'Primeiro R$ 500', unlocked: true },
              { id: '3', icon: '✅', title: 'Método PERFEITO', unlocked: true }
            ]}
            xpEarned={250}
            levelName="DESPERTO"
            nextLessonTitle="ChatGPT: O Camaleão Digital"
            nextLessonCountdown="03:59:58"
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
      className="w-full h-screen relative overflow-hidden cursor-none"
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
    </div>
  );
};
