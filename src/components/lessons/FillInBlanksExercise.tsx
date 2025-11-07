import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sentence {
  id: string;
  text: string;
  correctAnswers: string[];
  hint: string;
}

interface FillInBlanksExerciseProps {
  title: string;
  instruction: string;
  sentences: Sentence[];
  feedback: {
    allCorrect: string;
    someCorrect: string;
    needsReview: string;
  };
  onComplete: (score: number) => void;
}

export function FillInBlanksExercise({
  title,
  instruction,
  sentences,
  feedback,
  onComplete
}: FillInBlanksExerciseProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  const handleAnswerChange = (sentenceId: string, value: string) => {
    setAnswers({ ...answers, [sentenceId]: value });
  };

  const toggleHint = (sentenceId: string) => {
    setShowHints({ ...showHints, [sentenceId]: !showHints[sentenceId] });
  };

  const handleSubmit = () => {
    const newResults: Record<string, boolean> = {};
    
    sentences.forEach(sentence => {
      const userAnswer = answers[sentence.id]?.toLowerCase().trim() || '';
      const isCorrect = sentence.correctAnswers.some(
        correct => correct.toLowerCase() === userAnswer
      );
      newResults[sentence.id] = isCorrect;
    });

    setResults(newResults);
    setSubmitted(true);

    const correctCount = Object.values(newResults).filter(Boolean).length;
    const score = Math.round((correctCount / sentences.length) * 100);
    
    setTimeout(() => {
      onComplete(score);
    }, 3000);
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const allAnswered = sentences.every(s => answers[s.id]?.trim());

  const getFeedbackMessage = () => {
    if (correctCount === sentences.length) return feedback.allCorrect;
    if (correctCount > 0) return feedback.someCorrect.replace('{count}', String(correctCount));
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

      <div className="space-y-6">
        {sentences.map((sentence, index) => {
          const parts = sentence.text.split('_______');
          const isCorrect = results[sentence.id];
          
          return (
            <motion.div
              key={sentence.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 ${
                submitted 
                  ? isCorrect 
                    ? 'border-green-500 bg-green-500/5' 
                    : 'border-red-500 bg-red-500/5'
                  : ''
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Questão {index + 1}</span>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHint(sentence.id)}
                        className="ml-auto"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {showHints[sentence.id] && (
                      <motion.div 
                        className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        💡 Dica: {sentence.hint}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-wrap items-center gap-2 text-lg">
                    <span>{parts[0]}</span>
                    <Input
                      value={answers[sentence.id] || ''}
                      onChange={(e) => handleAnswerChange(sentence.id, e.target.value)}
                      disabled={submitted}
                      className={`w-48 ${
                        submitted
                          ? isCorrect
                            ? 'border-green-500'
                            : 'border-red-500'
                          : ''
                      }`}
                      placeholder="..."
                    />
                    <span>{parts[1]}</span>
                    <AnimatePresence>
                      {submitted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ 
                            scale: 1, 
                            rotate: 0,
                            ...(isCorrect && {
                              y: [0, -5, 0],
                              transition: { duration: 0.5, repeat: 1 }
                            }),
                            ...(!isCorrect && {
                              x: [0, -5, 5, -5, 5, 0],
                              transition: { duration: 0.5 }
                            })
                          }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="ml-2"
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          {isCorrect ? (
                            <Check className="h-6 w-6 text-green-500" />
                          ) : (
                            <X className="h-6 w-6 text-red-500" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {submitted && !isCorrect && (
                      <motion.div 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: 0.2 }}
                      >
                        ✓ Respostas corretas: {sentence.correctAnswers.join(', ')}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="submit-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full"
              size="lg"
            >
              Verificar Respostas
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="result-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="space-y-4"
          >
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-center space-y-2">
                <motion.div 
                  className="text-4xl mb-2"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15,
                    delay: 0.2 
                  }}
                >
                  {correctCount === sentences.length ? '🎉' : correctCount > 0 ? '👍' : '💪'}
                </motion.div>
                <motion.h3 
                  className="text-xl font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {correctCount} de {sentences.length} corretas
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
