import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, HelpCircle } from 'lucide-react';
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
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [hintsUsed, setHintsUsed] = useState<Set<string>>(new Set());

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

  const toggleHint = (sentenceId: string) => {
    const newShowHints = { ...showHints, [sentenceId]: !showHints[sentenceId] };
    setShowHints(newShowHints);
    
    // Marcar que o hint foi usado
    if (newShowHints[sentenceId]) {
      setHintsUsed(prev => new Set([...prev, sentenceId]));
    }
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
    const isPerfect = correctCount === sentences.length && hintsUsed.size === 0;
    
    // Confetti especial para pontuação perfeita sem dicas
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
  const isPerfect = submitted && correctCount === sentences.length && hintsUsed.size === 0;

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
                    {(sentence.hints || sentence.hint) && (
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
                    )}
                  </div>

                  <AnimatePresence>
                    {showHints[sentence.id] && (sentence.hints || sentence.hint) && (
                      <motion.div 
                        className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        💡 Dica: {sentence.hints ? sentence.hints.join(' • ') : sentence.hint}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-lg leading-relaxed">
                    <div className="flex flex-wrap items-center gap-2">
                      {parts[0] && <span>{parts[0]}</span>}
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
                      {parts.length > 1 && parts[1] && <span>{parts[1]}</span>}
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
                          className="text-sm text-muted-foreground"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: 0.2 }}
                        >
                          ✓ Respostas corretas: {sentence.correctAnswers.join(', ')}
                        </motion.div>
                        {sentence.explanation && (
                          <motion.div 
                            className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: 0.3 }}
                          >
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">📚 Entenda:</p>
                            <p className="text-blue-800 dark:text-blue-200">{sentence.explanation}</p>
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
                      Você acertou tudo de primeira sem usar dicas!
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
