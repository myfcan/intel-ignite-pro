import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ExerciseErrorCard } from './ExerciseErrorCard';

interface Sentence {
  id: string;
  text: string;
  correctAnswers: string[];
  hints?: string[];  // Plural array (padrão correto)
  hint?: string;     // Singular fallback (compatibilidade)
  explanation?: string;
  options?: string[];
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

  // Validação defensiva
  if (!sentences || sentences.length === 0) {
    return (
      <ExerciseErrorCard 
        title="⚠️ Exercício Sem Sentenças"
        message="Este exercício não possui sentenças configuradas."
        details="Campo 'sentences' está ausente ou vazio."
      />
    );
  }

  const handleAnswerChange = (sentenceId: string, value: string) => {
    setAnswers({ ...answers, [sentenceId]: value });
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
    const isPerfect = correctCount === sentences.length;

    // Confetti especial para pontuação perfeita
    if (isPerfect) {
      console.log('🏆 [PERFECT] Acertou tudo de primeira!');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#FFFF00', '#FFD700']
      });
    }

    // Chamar onComplete IMEDIATAMENTE
    onComplete(score);
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const allAnswered = sentences.every(s => answers[s.id]?.trim());
  const isPerfect = submitted && correctCount === sentences.length;

  const getFeedbackMessage = () => {
    if (correctCount === sentences.length) return feedback.allCorrect;
    if (correctCount > 0) return feedback.someCorrect.replace('{count}', String(correctCount));
    return feedback.needsReview;
  };

  return (
    <motion.div 
      className="space-y-8 max-w-3xl mx-auto p-6 md:p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center space-y-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{instruction}</p>
      </motion.div>

      <div className="space-y-5">
        {sentences.map((sentence, index) => {
          const parts = sentence.text.split('_______');
          const isCorrect = results[sentence.id];
          
          // Debug: verificar se o split está funcionando corretamente
          console.log('📝 [DEBUG] Sentence parts:', {
            full: sentence.text,
            parts,
            partsCount: parts.length
          });
          
          return (
            <motion.div
              key={sentence.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 md:p-8 transition-all duration-300 ${
                submitted 
                  ? isCorrect 
                    ? 'border-green-600/50 bg-green-50 dark:bg-green-950/20 shadow-sm' 
                    : 'border-red-600/50 bg-red-50 dark:bg-red-950/20 shadow-sm'
                  : 'border-border hover:border-primary/30 hover:shadow-md'
              }`}>
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold text-primary">Questão {index + 1}</span>
                  </div>

                  {/* Hint sempre visível antes da submissão */}
                  {!submitted && sentence.hint && (
                    <motion.div
                      className="p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <p className="text-sm md:text-base text-blue-900 dark:text-blue-100">
                        💡 <span className="font-semibold">Dica:</span> {sentence.hint}
                      </p>
                    </motion.div>
                  )}

                  <div className="text-base md:text-lg leading-relaxed">
                    <div className="flex flex-wrap items-center gap-3">
                      {parts[0] && <span className="text-foreground">{parts[0]}</span>}
                      <Input
                        value={answers[sentence.id] || ''}
                        onChange={(e) => handleAnswerChange(sentence.id, e.target.value)}
                        disabled={submitted}
                        className={`w-52 h-12 text-base font-medium transition-all ${
                          submitted
                            ? isCorrect
                              ? 'border-2 border-green-600 bg-green-50 dark:bg-green-950/20'
                              : 'border-2 border-red-600 bg-red-50 dark:bg-red-950/20'
                            : 'border-2 border-primary/30 focus:border-primary'
                        }`}
                        placeholder="Digite aqui..."
                      />
                      {parts.length > 1 && parts[1] && <span className="text-foreground">{parts[1]}</span>}
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
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Opções de múltipla escolha */}
                  {!submitted && sentence.options && sentence.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {sentence.options.map((option, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswerChange(sentence.id, option)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            answers[sentence.id] === option
                              ? 'bg-primary text-primary-foreground shadow-md scale-105'
                              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  <AnimatePresence>
                    {submitted && !isCorrect && (
                      <>
                        <motion.div 
                          className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: 0.2 }}
                        >
                          <p className="text-sm md:text-base font-semibold text-red-700 dark:text-red-400">
                            ✓ Resposta correta: <span className="font-bold">{sentence.correctAnswers.join(', ')}</span>
                          </p>
                        </motion.div>
                        {sentence.explanation && (
                          <motion.div 
                            className="p-5 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: 0.3 }}
                          >
                            <p className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-sm md:text-base">📚 Entenda:</p>
                            <p className="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">{sentence.explanation}</p>
                          </motion.div>
                        )}
                      </>
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
              className="w-full h-auto py-4 text-lg font-semibold"
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
            {isPerfect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 20
                  }
                }}
                className="relative overflow-hidden"
              >
                <Card className="p-6 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 border-yellow-500/40 shadow-lg">
                  <div className="text-center space-y-3">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 0.8,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                      className="text-5xl mb-2"
                    >
                      🏆
                    </motion.div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Perfeito!
                    </h3>
                    <p className="text-sm font-medium text-foreground/80">
                      Você acertou todas as questões!
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="px-4 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs font-bold text-yellow-700 dark:text-yellow-300">
                        +50 XP Bônus
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
            
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 shadow-lg rounded-2xl">
              <div className="text-center space-y-3">
                <motion.div 
                  className="text-5xl mb-2"
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
                  className="text-2xl md:text-3xl font-bold text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {correctCount} de {sentences.length} corretas
                </motion.h3>
                <motion.p 
                  className="text-base md:text-lg text-muted-foreground max-w-md mx-auto"
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
