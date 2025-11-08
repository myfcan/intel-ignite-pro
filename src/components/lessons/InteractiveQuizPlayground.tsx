import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
}

interface InteractiveQuizPlaygroundProps {
  title: string;
  maiaIntro: string;
  questions: QuizQuestion[];
  onComplete: () => void;
}

export function InteractiveQuizPlayground({
  title,
  maiaIntro,
  questions,
  onComplete,
}: InteractiveQuizPlaygroundProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setIsSubmitted(false);
      setIsCorrect(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 shadow-xl border-2">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">{title}</span>
            </div>
            <p className="text-muted-foreground">{maiaIntro}</p>
            <div className="mt-4 flex justify-center gap-2">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    idx < currentQuestionIndex
                      ? 'bg-green-500'
                      : idx === currentQuestionIndex
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  {currentQuestion.question}
                </h3>

                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={setSelectedAnswer}
                  disabled={isSubmitted}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrectOption = option.id === currentQuestion.correctAnswer;
                    const showFeedback = isSubmitted;

                    return (
                      <motion.div
                        key={option.id}
                        whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                        className={`relative flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                          showFeedback && isCorrectOption
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : showFeedback && isSelected && !isCorrectOption
                            ? 'border-red-500 bg-red-50 dark:bg-red-950'
                            : isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label
                          htmlFor={option.id}
                          className="flex-1 cursor-pointer font-medium"
                        >
                          {option.text}
                        </Label>
                        {showFeedback && isCorrectOption && (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        )}
                        {showFeedback && isSelected && !isCorrectOption && (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </motion.div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-6 rounded-lg ${
                      isCorrect
                        ? 'bg-green-50 dark:bg-green-950 border-2 border-green-500'
                        : 'bg-blue-50 dark:bg-blue-950 border-2 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      )}
                      <div>
                        <h4 className="font-semibold text-lg mb-2">
                          {isCorrect ? '🎉 Correto!' : '💡 Vamos aprender!'}
                        </h4>
                        <p className="text-foreground/80">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  Questão {currentQuestionIndex + 1} de {questions.length} • Acertos:{' '}
                  {score}
                </div>
                {!isSubmitted ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                    size="lg"
                    className="min-w-[120px]"
                  >
                    Confirmar
                  </Button>
                ) : (
                  <Button onClick={handleNext} size="lg" className="min-w-[120px]">
                    {isLastQuestion ? 'Finalizar' : 'Próxima'}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
