import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      className="space-y-6 p-6"
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
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{instruction}</p>
      </motion.div>

      <div className="space-y-4">
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
              <Card className={`p-6 ${
                isRevealed
                  ? isCorrect
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-red-500 bg-red-500/5'
                  : ''
              }`}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-lg pt-1">{statement.text}</p>
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
                      >
                        {isCorrect ? (
                          <Check className="h-6 w-6 text-green-500" />
                        ) : (
                          <X className="h-6 w-6 text-red-500" />
                        )}
                      </motion.div>
                    )}
                  </div>

                  {!isRevealed && (
                    <motion.div 
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => handleAnswer(statement.id, true)}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          ✅ Verdadeiro
                        </Button>
                      </motion.div>
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => handleAnswer(statement.id, false)}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          ❌ Falso
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
                        className={`p-4 rounded-lg ${
                          isCorrect
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-blue-500/10 border border-blue-500/20'
                        }`}
                      >
                        <p className="text-sm">
                          <strong>{isCorrect ? '✓ Correto!' : '✓ Resposta:'}</strong> {statement.explanation}
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
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="space-y-4"
          >
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-center space-y-2">
                <motion.div 
                  className="text-4xl mb-2"
                  initial={{ scale: 0, rotate: -360 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 20,
                    delay: 0.2 
                  }}
                >
                  {correctCount === statements.length ? '🏆' : correctCount >= statements.length / 2 ? '👍' : '💪'}
                </motion.div>
                <motion.h3 
                  className="text-xl font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {correctCount} de {statements.length} corretas
                </motion.h3>
                <motion.p 
                  className="text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {getFeedbackMessage()}
                </motion.p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
