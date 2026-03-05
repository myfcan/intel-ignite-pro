import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExerciseErrorCard } from './ExerciseErrorCard';
import { useV7SoundEffects } from './v7/cinematic/useV7SoundEffects';
import confetti from 'canvas-confetti';

interface Statement {
  id: string;
  text: string;
  correct: boolean;
  explanation: string;
}

interface TrueFalseExerciseProps {
  title: string;
  instruction: string;
  statements: Statement[];
  feedback: {
    perfect: string;
    good: string;
    needsReview: string;
  };
  onComplete: (score: number) => void;
}

export function TrueFalseExercise({
  title,
  instruction,
  statements,
  feedback,
  onComplete
}: TrueFalseExerciseProps) {
  const statement = statements?.[0];
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const { playSound } = useV7SoundEffects(0.6, true);

  if (!statement) {
    return (
      <ExerciseErrorCard 
        title="⚠️ Exercício Sem Afirmações"
        message="Este exercício não possui afirmações configuradas."
        details="Campo 'statements' está ausente ou vazio."
      />
    );
  }

  const normalizedCorrect = typeof statement.correct === 'string' 
    ? statement.correct === 'true' 
    : Boolean(statement.correct);
  const isCorrect = userAnswer === normalizedCorrect;

  const handleAnswer = (answer: boolean) => {
    if (answered) return;
    setUserAnswer(answer);
    setAnswered(true);

    const correct = answer === normalizedCorrect;
    if (correct) {
      playSound('quiz-correct');
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
    } else {
      playSound('quiz-wrong');
    }
    // Report immediately — parent owns navigation buttons
    onComplete(correct ? 100 : 0);
  };

  return (
    <motion.div 
      className="space-y-4 max-w-3xl mx-auto p-4 sm:p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-foreground px-2">{title}</h2>
        <p className="text-sm text-muted-foreground px-2">{instruction}</p>
      </motion.div>

      <Card className={`p-4 sm:p-6 transition-all duration-300 ${
        answered
          ? isCorrect
            ? 'border-green-600/50 bg-green-50'
            : 'border-red-600/50 bg-red-50'
          : 'border-border'
      }`}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs">
              1
            </span>
            <p className="flex-1 text-sm sm:text-base leading-relaxed text-foreground pt-1">{statement.text}</p>
            {answered && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="flex-shrink-0"
              >
                {isCorrect ? (
                  <div className="rounded-full bg-green-100 p-1.5">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                ) : (
                  <div className="rounded-full bg-red-100 p-1.5">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {!answered && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => handleAnswer(true)}
                  variant="default"
                  className="w-full h-auto py-3 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white border-0"
                  size="lg"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Verdadeiro
                </Button>
              </motion.div>
              <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="default"
                  className="w-full h-auto py-3 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white border-0"
                  size="lg"
                >
                  <X className="mr-2 h-4 w-4" />
                  Falso
                </Button>
              </motion.div>
            </div>
          )}

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl border-2 ${
                  isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <p className="text-xs sm:text-sm leading-relaxed">
                  <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-blue-700'}`}>
                    {isCorrect ? '✓ Correto!' : 'ℹ️ Resposta:'}
                  </span>{' '}
                  <span className="text-foreground">{statement.explanation}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* NO internal buttons — parent V8InlineExercise owns navigation */}
        </div>
      </Card>
    </motion.div>
  );
}
