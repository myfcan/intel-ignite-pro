import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InteractiveSimulationConfig } from '@/types/guidedLesson';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveSimulationPlaygroundProps {
  config: InteractiveSimulationConfig;
  onComplete: () => void;
}

export function InteractiveSimulationPlayground({ 
  config, 
  onComplete 
}: InteractiveSimulationPlaygroundProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentStepData = config.steps[currentStep];
  const isDynamic = currentStepData?.options === 'dynamic';

  // Generate dynamic options based on previous selections
  const getOptions = () => {
    if (!isDynamic) return currentStepData?.options as Array<{ id: string; title: string; genre: string; emoji: string }>;
    
    // For dynamic steps, generate options based on previous selection
    const previousGenre = currentStep > 0 ? selections[currentStep - 1] : '';
    
    // Mock data for demonstration - in real app, this would be more sophisticated
    const allOptions = [
      { id: 'acao', title: 'Velozes e Furiosos', genre: 'Ação', emoji: '🚗' },
      { id: 'acao2', title: 'John Wick', genre: 'Ação', emoji: '🔫' },
      { id: 'romance', title: 'Diário de uma Paixão', genre: 'Romance', emoji: '💕' },
      { id: 'romance2', title: 'La La Land', genre: 'Romance', emoji: '🎭' },
      { id: 'comedia', title: 'Se Beber Não Case', genre: 'Comédia', emoji: '😂' },
      { id: 'comedia2', title: 'Superbad', genre: 'Comédia', emoji: '🎉' },
    ];

    if (currentStep === 1) {
      // Show 2 same genre + 1 different
      const sameGenre = allOptions.filter(opt => opt.id.startsWith(previousGenre)).slice(0, 2);
      const different = allOptions.find(opt => !opt.id.startsWith(previousGenre));
      return [...sameGenre, different].filter(Boolean) as Array<{ id: string; title: string; genre: string; emoji: string }>;
    } else if (currentStep === 2) {
      // Show 3 same genre
      return allOptions.filter(opt => opt.id.startsWith(previousGenre)).slice(0, 3);
    }

    return allOptions.slice(0, 3);
  };

  const handleOptionSelect = (optionId: string) => {
    const newSelections = [...selections];
    newSelections[currentStep] = optionId;
    setSelections(newSelections);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentStep < config.steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsComplete(true);
      }
    }, 2000);
  };

  const handleComplete = () => {
    onComplete();
  };

  const options = getOptions();

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background to-muted rounded-lg">
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {currentStep === 0 && (
              <Card className="p-6 bg-primary/10 border-primary/20">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{config.scenario.icon}</span>
                  <p className="text-lg">{config.scenario.text}</p>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{currentStepData?.prompt}</h3>
                <span className="text-sm text-muted-foreground">
                  Passo {currentStep + 1} de {config.steps.length}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {options?.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className="p-6 cursor-pointer hover:bg-primary/5 transition-colors border-2 hover:border-primary/50"
                      onClick={() => !showFeedback && handleOptionSelect(option.id)}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-4xl">{option.emoji}</div>
                        <h4 className="font-semibold">{option.title}</h4>
                        <p className="text-sm text-muted-foreground">{option.genre}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <p className="text-center text-green-700 dark:text-green-300 font-medium">
                    {currentStepData?.feedback.replace('{genre}', options?.find(o => o.id === selections[currentStep])?.genre || '')}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center py-8"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold">{config.completion.badge.title}</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {config.completion.message}
            </p>
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-4">{config.completion.visual}</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {selections.map((sel, idx) => {
                  const option = getOptions().find(o => o.id === sel);
                  return (
                    <div key={idx} className="px-4 py-2 bg-primary/10 rounded-full text-sm">
                      {option?.emoji} {option?.genre}
                    </div>
                  );
                })}
              </div>
            </div>
            <Button onClick={handleComplete} size="lg" className="mt-6">
              Continuar para Próxima Seção
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
