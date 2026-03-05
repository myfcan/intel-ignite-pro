import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
  const isLastScenario = currentScenarioIndex === scenarios.length - 1;
  const allAnswered = Object.keys(answers).length === scenarios.length;

  const handlePlatformSelect = (platformId: string) => {
    if (showFeedback) return;

    const correct = platformId === currentScenario.correctPlatform;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      playSound('snap-success');
    } else {
      playSound('snap-error');
    }

    // Salvar resposta
    setAnswers(prev => ({
      ...prev,
      [currentScenario.id]: platformId
    }));

    // Avançar após feedback
    setTimeout(() => {
      setShowFeedback(false);
      if (!isLastScenario) {
        setCurrentScenarioIndex(prev => prev + 1);
      } else {
        // Calcular score final
        const correctCount = Object.entries(answers).filter(
          ([scenarioId, platformId]) => {
            const scenario = scenarios.find(s => s.id === scenarioId);
            return scenario?.correctPlatform === platformId;
          }
        ).length + (correct ? 1 : 0);

        const score = (correctCount / scenarios.length) * 100;
        if (score === 100) {
          playSound('level-up');
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        } else if (score >= 50) {
          playSound('completion');
        }
        onComplete(score);
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8 text-center"
      >
        <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-foreground px-2">{title}</h3>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">{instruction}</p>
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2">
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
          <Card className="p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 block">{currentScenario.emoji}</span>
              <p className="text-base sm:text-lg md:text-xl font-medium text-foreground px-2 break-words">
                {currentScenario.text}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {platforms.map((platform) => (
                <motion.button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform.id)}
                  disabled={showFeedback}
                  whileHover={{ scale: showFeedback ? 1 : 1.05 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.95 }}
                  className={`
                    relative p-4 sm:p-6 rounded-2xl border-2 transition-all
                    ${showFeedback && platform.id === currentScenario.correctPlatform
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                      : showFeedback && answers[currentScenario.id] === platform.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                      : 'border-border hover:border-primary bg-card'
                    }
                    ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{
                    boxShadow: showFeedback && platform.id === currentScenario.correctPlatform
                      ? `0 0 20px ${platform.color}40`
                      : 'none'
                  }}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl">{platform.icon}</span>
                    <span className="font-bold text-base sm:text-lg text-foreground break-words text-center">{platform.name}</span>
                  </div>

                  {showFeedback && platform.id === currentScenario.correctPlatform && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2"
                    >
                      ✓
                    </motion.div>
                  )}

                  {showFeedback && answers[currentScenario.id] === platform.id && platform.id !== currentScenario.correctPlatform && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2"
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
                className={`text-center p-4 sm:p-6 rounded-xl ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-500'
                    : 'bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-500'
                }`}
              >
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="text-xl sm:text-2xl font-bold"
                >
                  {isCorrect ? '🎉 Correto!' : '💡 Não foi dessa vez!'}
                </motion.p>
                {!isCorrect && (
                  <p className="text-xs sm:text-sm mt-2 text-muted-foreground break-words">
                    A resposta correta era: {platforms.find(p => p.id === currentScenario.correctPlatform)?.name}
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
