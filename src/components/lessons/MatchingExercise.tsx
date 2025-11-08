import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchPair {
  id: string;
  left: string;
  right: string;
}

interface MatchingExerciseProps {
  title: string;
  instruction: string;
  pairs: MatchPair[];
  onComplete: (score: number) => void;
}

export function MatchingExercise({
  title,
  instruction,
  pairs,
  onComplete,
}: MatchingExerciseProps) {
  const [leftItems] = useState(pairs.map((p) => ({ id: p.id, text: p.left })));
  const [rightItems] = useState(
    [...pairs.map((p) => ({ id: p.id, text: p.right }))].sort(() => Math.random() - 0.5)
  );
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleLeftClick = (id: string) => {
    if (isSubmitted) return;
    setSelectedLeft(id);
  };

  const handleRightClick = (id: string) => {
    if (isSubmitted || !selectedLeft) return;

    setMatches({
      ...matches,
      [selectedLeft]: id,
    });
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    const newResults: Record<string, boolean> = {};
    let correctCount = 0;

    leftItems.forEach((item) => {
      const isCorrect = matches[item.id] === item.id;
      newResults[item.id] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setIsSubmitted(true);

    const score = Math.round((correctCount / pairs.length) * 100);
    setTimeout(() => onComplete(score), 2000);
  };

  const handleReset = () => {
    setMatches({});
    setSelectedLeft(null);
    setIsSubmitted(false);
    setResults({});
  };

  const allMatched = leftItems.every((item) => matches[item.id]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{instruction}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-3">
            {leftItems.map((item) => {
              const matchedRight = matches[item.id];
              const isCorrect = results[item.id];
              const isSelected = selectedLeft === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleLeftClick(item.id)}
                  disabled={isSubmitted}
                  whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                  className={`w-full p-4 rounded-lg text-left font-medium transition-all border-2 ${
                    isSubmitted && isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : isSubmitted && isCorrect === false
                      ? 'border-red-500 bg-red-50 dark:bg-red-950'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : matchedRight
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.text}</span>
                    {isSubmitted && isCorrect !== undefined && (
                      <span>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </span>
                    )}
                  </div>
                  {matchedRight && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      → {rightItems.find((r) => r.id === matchedRight)?.text}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {rightItems.map((item) => {
              const isMatched = Object.values(matches).includes(item.id);

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleRightClick(item.id)}
                  disabled={isSubmitted || isMatched}
                  whileHover={!isSubmitted && !isMatched ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitted && !isMatched ? { scale: 0.98 } : {}}
                  className={`w-full p-4 rounded-lg text-left font-medium transition-all border-2 ${
                    isMatched
                      ? 'border-primary/30 bg-muted/50 opacity-50'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {item.text}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6"
            >
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {Object.values(results).filter(Boolean).length} de {pairs.length}{' '}
                    corretas! 🎉
                  </h3>
                  <p className="text-muted-foreground">
                    {Object.values(results).filter(Boolean).length === pairs.length
                      ? 'Perfeito! Você dominou esse conceito!'
                      : 'Bom trabalho! Continue praticando.'}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={!allMatched || isSubmitted}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
          <Button onClick={handleSubmit} disabled={!allMatched || isSubmitted}>
            {isSubmitted ? 'Exercício Concluído' : 'Verificar Respostas'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
