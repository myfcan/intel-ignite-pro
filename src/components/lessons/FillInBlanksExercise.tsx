import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, X, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{instruction}</p>
      </div>

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHint(sentence.id)}
                      className="ml-auto"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  {showHints[sentence.id] && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                      💡 Dica: {sentence.hint}
                    </div>
                  )}

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
                    {submitted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2"
                      >
                        {isCorrect ? (
                          <Check className="h-6 w-6 text-green-500" />
                        ) : (
                          <X className="h-6 w-6 text-red-500" />
                        )}
                      </motion.div>
                    )}
                  </div>

                  {submitted && !isCorrect && (
                    <div className="text-sm text-muted-foreground">
                      ✓ Respostas corretas: {sentence.correctAnswers.join(', ')}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full"
          size="lg"
        >
          Verificar Respostas
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">
                {correctCount === sentences.length ? '🎉' : correctCount > 0 ? '👍' : '💪'}
              </div>
              <h3 className="text-xl font-bold">
                {correctCount} de {sentences.length} corretas
              </h3>
              <p className="text-muted-foreground">{getFeedbackMessage()}</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
