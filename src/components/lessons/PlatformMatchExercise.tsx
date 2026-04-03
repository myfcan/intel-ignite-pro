import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ExerciseErrorCard } from './ExerciseErrorCard';
import { useV7SoundEffects } from './v7/cinematic/useV7SoundEffects';
import confetti from 'canvas-confetti';

interface Scenario {
  id: string;
  text: string;
  correctPlatform: string;
  emoji: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface PlatformMatchExerciseProps {
  title: string;
  instruction: string;
  scenarios: Scenario[];
  platforms: Platform[];
  onComplete: (score: number) => void;
}

const normalizePlatformToken = (value: string | null | undefined) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

export function PlatformMatchExercise({
  title,
  instruction,
  scenarios,
  platforms,
  onComplete
}: PlatformMatchExerciseProps) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { playSound } = useV7SoundEffects(0.6, true);
  const advanceTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const platformLookup = useMemo(() => {
    const lookup = new Map<string, Platform>();

    for (const platform of platforms) {
      for (const key of [platform.id, platform.name]) {
        const normalizedKey = normalizePlatformToken(key);
        if (normalizedKey) {
          lookup.set(normalizedKey, platform);
        }
      }
    }

    return lookup;
  }, [platforms]);

  const resolveScenarioPlatform = (scenario: Scenario) => {
    const normalizedKey = normalizePlatformToken(scenario.correctPlatform);
    return normalizedKey ? platformLookup.get(normalizedKey) : undefined;
  };

  const getScenarioCorrectPlatformId = (scenario: Scenario) =>
    resolveScenarioPlatform(scenario)?.id ?? scenario.correctPlatform;

  const getScenarioCorrectPlatformName = (scenario: Scenario) =>
    resolveScenarioPlatform(scenario)?.name ?? scenario.correctPlatform;

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  // Validação defensiva
  if (!scenarios || scenarios.length === 0) {
    return (
      <ExerciseErrorCard 
        title="⚠️ Exercício Sem Cenários"
        message="Este exercício não possui cenários configurados."
        details="Campo 'scenarios' está ausente ou vazio."
      />
    );
  }
  if (!platforms || platforms.length === 0) {
    return (
      <ExerciseErrorCard 
        title="⚠️ Exercício Sem Plataformas"
        message="Este exercício não possui plataformas configuradas."
        details="Campo 'platforms' está ausente ou vazio."
      />
    );
  }

  const currentScenario = scenarios[currentScenarioIndex];
  const currentCorrectPlatformId = getScenarioCorrectPlatformId(currentScenario);
  const currentCorrectPlatformName = getScenarioCorrectPlatformName(currentScenario);
  const isLastScenario = currentScenarioIndex === scenarios.length - 1;
  const allAnswered = Object.keys(answers).length === scenarios.length;

  const handlePlatformSelect = (platformId: string) => {
    if (showFeedback) return;

    const correct = platformId === currentCorrectPlatformId;
    const nextAnswers = {
      ...answers,
      [currentScenario.id]: platformId,
    };

    setIsCorrect(correct);
    setShowFeedback(true);
    setAnswers(nextAnswers);

    if (correct) {
      playSound('snap-success');
    } else {
      playSound('snap-error');
    }

    // Avançar após feedback
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }

    advanceTimerRef.current = window.setTimeout(() => {
      setShowFeedback(false);
      if (!isLastScenario) {
        setCurrentScenarioIndex(prev => prev + 1);
      } else {
        // Calcular score final
        const correctCount = scenarios.filter(
          (scenario) => nextAnswers[scenario.id] === getScenarioCorrectPlatformId(scenario)
        ).length;

        const score = Math.round((correctCount / scenarios.length) * 100);
        if (score === 100) {
          playSound('level-up');
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        } else if (score >= 50) {
          playSound('completion');
        }
        onComplete(score);
      }

      advanceTimerRef.current = null;
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 sm:mb-8 text-center"
      >
        <h3 className="text-lg sm:text-3xl font-bold mb-1 sm:mb-3 text-foreground px-2">{title}</h3>
        <p className="text-muted-foreground text-xs sm:text-base md:text-lg px-2">{instruction}</p>
        <div className="mt-2 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2">
          {scenarios.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-all ${
                idx < currentScenarioIndex
                  ? 'bg-green-500'
                  : idx === currentScenarioIndex
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentScenario.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card className="p-3 sm:p-6 md:p-8 mb-3 sm:mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <div className="text-center mb-3 sm:mb-8">
              <span className="text-2xl sm:text-5xl md:text-6xl mb-1 sm:mb-4 block">{currentScenario.emoji}</span>
              <p className="text-sm sm:text-lg md:text-xl font-medium text-foreground px-1 break-words">
                {currentScenario.text}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 max-w-2xl mx-auto">
              {platforms.map((platform) => (
                <motion.button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform.id)}
                  disabled={showFeedback}
                  whileHover={{ scale: showFeedback ? 1 : 1.03 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.97 }}
                  className={`
                    relative px-3 py-2.5 sm:p-6 rounded-xl border-2 transition-all
                    ${showFeedback && platform.id === currentCorrectPlatformId
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                      : showFeedback && answers[currentScenario.id] === platform.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                      : 'border-border hover:border-primary bg-card'
                    }
                    ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{
                    boxShadow: showFeedback && platform.id === currentCorrectPlatformId
                      ? `0 0 20px ${platform.color}40`
                      : 'none'
                  }}
                >
                  <div className="flex items-center gap-2.5 sm:flex-col sm:items-center sm:gap-3">
                    <span className="text-xl sm:text-4xl flex-shrink-0">{platform.icon}</span>
                    <span className="font-semibold text-xs sm:text-lg text-foreground break-words text-left sm:text-center leading-snug">{platform.name}</span>
                  </div>

                  {showFeedback && platform.id === currentCorrectPlatformId && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-green-500 text-white rounded-full p-1 sm:p-2 text-xs"
                    >
                      ✓
                    </motion.div>
                  )}

                  {showFeedback && answers[currentScenario.id] === platform.id && platform.id !== currentCorrectPlatformId && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-red-500 text-white rounded-full p-1 sm:p-2 text-xs"
                    >
                      ✗
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </Card>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-center p-3 sm:p-6 rounded-xl ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-500'
                    : 'bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-500'
                }`}
              >
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="text-base sm:text-2xl font-bold"
                >
                  {isCorrect ? '🎉 Correto!' : '💡 Não foi dessa vez!'}
                </motion.p>
                {!isCorrect && (
                  <p className="text-xs sm:text-sm mt-2 text-muted-foreground break-words">
                    A resposta correta era: {currentCorrectPlatformName}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {allAnswered && !showFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 sm:mt-8"
        >
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">Calculando seu resultado...</p>
        </motion.div>
      )}
    </div>
  );
}
