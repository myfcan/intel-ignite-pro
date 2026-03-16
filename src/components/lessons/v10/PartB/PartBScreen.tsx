import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { V10LessonStep } from '../../../../types/v10.types';
import type { LivChatMessage } from './LIVSheet';
import { supabase } from '@/integrations/supabase/client';
import PlayerHeader from './PlayerHeader';
import StepContent from './StepContent';
import PlayerBar from './PlayerBar';
import Sidebar from './Sidebar';
import LIVFab from './LIVFab';
import LIVSheet from './LIVSheet';

interface PartBScreenProps {
  steps: V10LessonStep[];
  lessonTitle: string;
  onComplete: () => void;
  onBack: () => void;
  initialStep?: number;
  initialFrame?: number;
  onProgressUpdate?: (step: number, frame: number) => void;
}

const SPEED_CYCLE: Array<1 | 1.5 | 2> = [1, 1.5, 2];

/** Extract unique phase numbers and their labels from steps */
function getPhases(steps: V10LessonStep[]): { phases: string[]; phaseNumbers: number[] } {
  const seen = new Map<number, string>();
  const PHASE_LABELS: Record<number, string> = {
    1: 'Preparação',
    2: 'Configuração',
    3: 'Execução',
    4: 'Validação',
    5: 'Conclusão',
  };
  for (const step of steps) {
    if (!seen.has(step.phase)) {
      seen.set(step.phase, PHASE_LABELS[step.phase] || `Fase ${step.phase}`);
    }
  }
  const phaseNumbers = Array.from(seen.keys());
  const phases = Array.from(seen.values());
  return { phases, phaseNumbers };
}

const PartBScreen: React.FC<PartBScreenProps> = ({
  steps,
  lessonTitle,
  onComplete,
  onBack,
  initialStep = 0,
  initialFrame = 0,
  onProgressUpdate,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(initialFrame);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [livOpen, setLivOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<LivChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLimitReached, setChatLimitReached] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const preloadRef = useRef<HTMLAudioElement>(null);

  const currentStep = steps[currentStepIndex];
  const currentFrame = currentStep?.frames?.[currentFrameIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isLastFrame = currentStep
    ? currentFrameIndex === (currentStep.frames?.length ?? 1) - 1
    : true;

  const { phases, phaseNumbers } = useMemo(() => getPhases(steps), [steps]);
  const currentPhaseIndex = currentStep
    ? phaseNumbers.indexOf(currentStep.phase)
    : 0;

  // Progress percent across all steps
  const progressPercent = steps.length > 0
    ? ((currentStepIndex + 1) / steps.length) * 100
    : 0;

  // Notify parent of progress changes
  useEffect(() => {
    onProgressUpdate?.(currentStepIndex, currentFrameIndex);
  }, [currentStepIndex, currentFrameIndex, onProgressUpdate]);

  // Load audio when step changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentStep?.audio_url) {
      audio.src = currentStep.audio_url;
      audio.playbackRate = playbackSpeed;
      audio.load();
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
      audio.removeAttribute('src');
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentStepIndex, currentStep?.audio_url]);

  // Preload next step audio & discard N-2
  useEffect(() => {
    const nextStep = steps[currentStepIndex + 1];
    const preload = preloadRef.current;
    if (preload) {
      if (nextStep?.audio_url) {
        preload.src = nextStep.audio_url;
        preload.load();
      } else {
        preload.removeAttribute('src');
        preload.load();
      }
    }
  }, [currentStepIndex, steps]);

  // Sync playback speed
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Audio time update handler
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Play/Pause toggle
  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Silently handle autoplay restrictions
      });
    }
  }, [isPlaying]);

  // Speed cycle
  const handleSpeedChange = useCallback(() => {
    setPlaybackSpeed((prev) => {
      const idx = SPEED_CYCLE.indexOf(prev);
      return SPEED_CYCLE[(idx + 1) % SPEED_CYCLE.length];
    });
  }, []);

  // Continue: advance frame -> step -> complete
  const handleContinue = useCallback(() => {
    if (!currentStep) return;

    if (currentFrameIndex < (currentStep.frames?.length ?? 1) - 1) {
      // Next frame
      setCurrentFrameIndex((prev) => prev + 1);
    } else if (currentStepIndex < steps.length - 1) {
      // Next step, reset frame
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentFrameIndex(0);
      setCurrentTime(0);
    } else {
      // Last step, last frame
      onComplete();
    }
  }, [currentStep, currentFrameIndex, currentStepIndex, steps.length, onComplete]);

  // Back: previous frame -> step -> onBack
  const handleBack = useCallback(() => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex((prev) => prev - 1);
    } else if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      setCurrentStepIndex((prev) => prev - 1);
      setCurrentFrameIndex(prevStep?.frames ? prevStep.frames.length - 1 : 0);
      setCurrentTime(0);
    } else {
      onBack();
    }
  }, [currentFrameIndex, currentStepIndex, steps, onBack]);

  // Frame change from StepContent dots
  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrameIndex(frame);
  }, []);

  // Sidebar step click
  const handleStepClick = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setCurrentFrameIndex(0);
    setCurrentTime(0);
  }, []);

  // Reset chat when step changes
  useEffect(() => {
    setChatMessages([]);
  }, [currentStepIndex]);

  // LIV ask handler — calls claude-interact edge function
  const handleAskLiv = useCallback(async (question: string) => {
    setChatMessages((prev) => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);

    try {
      const step = steps[currentStepIndex];
      const contextMessage = `[Contexto: Aula "${lessonTitle}", Passo ${step?.step_number}: "${step?.title}". App: ${step?.app_name || 'N/A'}]\n\nPergunta do aluno: ${question}`;

      const { data, error } = await supabase.functions.invoke('claude-interact', {
        body: {
          message: contextMessage,
          context_type: 'lesson',
        },
      });

      if (error) throw error;

      // Handle daily usage limit
      if (data?.limit_reached) {
        const limit = data.limit ?? 0;
        setChatLimitReached(true);
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Você usou suas ${limit} interações de hoje. Amanhã o contador reseta! Quer desbloquear mais? Veja os planos disponíveis.`,
          },
        ]);
        return;
      }

      const aiResponse = data?.response || 'Desculpe, não consegui processar sua pergunta.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ops, houve um erro. Tente novamente em instantes.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [currentStepIndex, steps, lessonTitle]);

  if (!currentStep || !currentFrame) {
    return null;
  }

  const audioDuration = audioRef.current?.duration || currentStep.duration_seconds || 0;

  return (
    <div
      className="flex w-full h-full"
      style={{ backgroundColor: '#FAFBFC' }}
    >
      {/* Main player column */}
      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        {/* Header */}
        <PlayerHeader
          lessonTitle={lessonTitle}
          progressPercent={progressPercent}
          phases={phases}
          currentPhase={currentPhaseIndex}
          onBack={handleBack}
        />

        {/* Scrollable content */}
        <StepContent
          step={currentStep}
          currentFrame={currentFrameIndex}
          totalSteps={steps.length}
          onFrameChange={handleFrameChange}
          accentColor={currentStep.accent_color}
        />

        {/* LIV Fab */}
        <LIVFab
          hasWarnings={!!currentStep.warnings?.warn}
          onClick={() => {
            audioRef.current?.pause();
            setIsPlaying(false);
            setLivOpen(true);
          }}
        />

        {/* Bottom bar */}
        <PlayerBar
          stepNumber={currentStep.step_number}
          totalSteps={steps.length}
          isPlaying={isPlaying}
          speed={playbackSpeed}
          currentTime={currentTime}
          duration={isFinite(audioDuration) ? audioDuration : 0}
          onPlayPause={handlePlayPause}
          onSpeedChange={handleSpeedChange}
          onContinue={handleContinue}
          isLastStep={isLastStep}
          isLastFrame={isLastFrame}
        />
      </div>

      {/* Desktop sidebar — hidden on mobile, shown on 800px+ */}
      <div
        data-partb-sidebar
        className="h-full"
        style={{ display: 'none' }}
      >
        <Sidebar
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepClick={handleStepClick}
          lessonTitle={lessonTitle}
        />
      </div>
      <style>{`
        @media (min-width: 1280px) {
          [data-partb-sidebar] { display: flex !important; }
        }
      `}</style>

      {/* LIV Sheet */}
      <LIVSheet
        isOpen={livOpen}
        onClose={() => setLivOpen(false)}
        liv={currentStep.liv ?? { tip: '', analogy: '', sos: '' }}
        warnings={currentStep.warnings ?? null}
        frameTip={currentFrame?.tip || null}
        frameAction={currentFrame?.action || null}
        frameCheck={currentFrame?.check || null}
        onAskLiv={handleAskLiv}
        chatMessages={chatMessages}
        chatLoading={chatLoading}
        chatLimitReached={chatLimitReached}
      />

      {/* Audio elements */}
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
      />
      <audio ref={preloadRef} preload="auto" />
    </div>
  );
};

export default PartBScreen;
