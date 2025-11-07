import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

  const currentScenario = scenarios[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === scenarios.length - 1;
  const allAnswered = Object.keys(answers).length === scenarios.length;

  const handlePlatformSelect = (platformId: string) => {
    if (showFeedback) return;

    const correct = platformId === currentScenario.correctPlatform;
    setIsCorrect(correct);
    setShowFeedback(true);

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
        setTimeout(() => onComplete(score), 1000);
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h3 className="text-3xl font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-lg">{instruction}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          {scenarios.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-8 rounded-full transition-all ${
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
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">{currentScenario.emoji}</span>
              <p className="text-xl font-medium text-foreground">
                {currentScenario.text}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {platforms.map((platform) => (
                <motion.button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform.id)}
                  disabled={showFeedback}
                  whileHover={{ scale: showFeedback ? 1 : 1.05 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.95 }}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all
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
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl">{platform.icon}</span>
                    <span className="font-bold text-lg text-foreground">{platform.name}</span>
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
                className={`text-center p-6 rounded-xl ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-500'
                    : 'bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-500'
                }`}
              >
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="text-2xl font-bold"
                >
                  {isCorrect ? '🎉 Correto!' : '💡 Não foi dessa vez!'}
                </motion.p>
                {!isCorrect && (
                  <p className="text-sm mt-2 text-muted-foreground">
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
          className="text-center mt-8"
        >
          <p className="text-lg text-muted-foreground">Calculando seu resultado...</p>
        </motion.div>
      )}
    </div>
  );
}
