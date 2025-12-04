import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExerciseErrorCard } from './ExerciseErrorCard';

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
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [revealedStatements, setRevealedStatements] = useState<Set<string>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  // Validação defensiva
  if (!statements || statements.length === 0) {
    return (
      <ExerciseErrorCard 
        title="⚠️ Exercício Sem Afirmações"
        message="Este exercício não possui afirmações configuradas."
        details="Campo 'statements' está ausente ou vazio."
      />
    );
  }

  const handleAnswer = (statementId: string, answer: boolean) => {
    if (revealedStatements.has(statementId)) return;

    setAnswers({ ...answers, [statementId]: answer });
    setRevealedStatements(new Set(revealedStatements).add(statementId));

    // Check if all answered
    if (revealedStatements.size + 1 === statements.length) {
      setTimeout(() => {
        setAllRevealed(true);
        const correctCount = statements.filter(
          s => answers[s.id] === s.correct || (revealedStatements.has(s.id) && answers[s.id] === s.correct)
        ).length + (answers[statementId] === statements.find(s => s.id === statementId)?.correct ? 1 : 0);
        
        const score = Math.round((correctCount / statements.length) * 100);
        setTimeout(() => onComplete(score), 3000);
      }, 500);
    }
  };

  const correctCount = statements.filter(s => answers[s.id] === s.correct).length;

  const getFeedbackMessage = () => {
    const percentage = (correctCount / statements.length) * 100;
    if (percentage === 100) return feedback.perfect;
    if (percentage >= 50) return feedback.good;
    return feedback.needsReview;
  };

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8 max-w-3xl mx-auto p-4 sm:p-6 md:p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center space-y-2 sm:space-y-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground px-2">{title}</h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">{instruction}</p>
      </motion.div>

      <div className="space-y-4 sm:space-y-5">
        {statements.map((statement, index) => {
          const isRevealed = revealedStatements.has(statement.id);
          const userAnswer = answers[statement.id];
          const isCorrect = userAnswer === statement.correct;

          return (
            <motion.div
              key={statement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 sm:p-6 md:p-8 transition-all duration-300 ${
                isRevealed
                  ? isCorrect
                    ? 'border-green-600/50 bg-green-50 dark:bg-green-950/20 shadow-sm'
                    : 'border-red-600/50 bg-red-50 dark:bg-red-950/20 shadow-sm'
                  : 'border-border hover:border-primary/30 hover:shadow-md'
              }`}>
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground font-bold text-xs sm:text-sm">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-sm sm:text-base md:text-lg leading-relaxed text-foreground pt-1 sm:pt-2">{statement.text}</p>
                    {isRevealed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ 
                          scale: 1, 
                          rotate: 0,
                          ...(isCorrect && {
                            y: [0, -8, 0],
                            transition: { duration: 0.6, repeat: 2 }
                          }),
                          ...(!isCorrect && {
                            x: [0, -8, 8, -8, 8, 0],
                            transition: { duration: 0.6 }
                          })
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="flex-shrink-0"
                      >
                        {isCorrect ? (
                          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1.5">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-1.5">
                            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {!isRevealed && (
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handleAnswer(statement.id, true)}
                          variant="default"
                          className="w-full h-auto py-3 sm:py-4 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white border-0"
                          size="lg"
                        >
                          <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Verdadeiro
                        </Button>
                      </motion.div>
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handleAnswer(statement.id, false)}
                          variant="default"
                          className="w-full h-auto py-3 sm:py-4 text-sm sm:text-base font-semibold bg-red-600 hover:bg-red-700 text-white border-0"
                          size="lg"
                        >
                          <X className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Falso
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 sm:p-5 rounded-xl border-2 ${
                          isCorrect
                            ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                            : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <p className="text-xs sm:text-sm md:text-base leading-relaxed">
                          <span className={`font-bold ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>
                            {isCorrect ? '✓ Correto!' : 'ℹ️ Resposta:'}
                          </span>{' '}
                          <span className="text-foreground">{statement.explanation}</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            className="text-center p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/30 shadow-lg max-w-sm mx-auto"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 2,
                ease: "easeInOut"
              }}
              className="space-y-2 sm:space-y-3"
            >
              <div className="text-4xl sm:text-5xl mb-2">
                {correctCount === statements.length ? '🎉' : correctCount >= statements.length / 2 ? '👏' : '💪'}
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground px-2">
                Você acertou {correctCount} de {statements.length}!
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-md mx-auto px-2">{getFeedbackMessage()}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
