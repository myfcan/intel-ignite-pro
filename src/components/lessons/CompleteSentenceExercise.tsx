import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ExerciseErrorCard } from './ExerciseErrorCard';
import { splitByPlaceholder, EXERCISE_PLACEHOLDER } from '@/lib/exerciseConstants';
import { useV7SoundEffects } from './v7/cinematic/useV7SoundEffects';

interface Sentence {
  id: string;
  text: string;
  correctAnswers: string[];
  options?: string[];
  hints?: string[];
}

interface CompleteSentenceExerciseProps {
  title: string;
  instruction: string;
  sentences: Sentence[];
  onComplete: (score: number) => void;
}

export function CompleteSentenceExercise({ 
  title, 
  instruction, 
  sentences,
  onComplete 
}: CompleteSentenceExerciseProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const { playSound } = useV7SoundEffects(0.6, true);

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

  // Validação de options (quando presente)
  // Pelo menos UMA correctAnswer deve estar em options (outras são sinônimos para texto livre)
  sentences.forEach(sentence => {
    if (sentence.options) {
      if (sentence.options.length === 0) {
        console.warn(`⚠️ Sentença "${sentence.id}" tem options vazio. Remova o campo para usar texto livre.`);
      }
      const hasAtLeastOneCorrectInOptions = sentence.correctAnswers.some(
        correct => sentence.options!.includes(correct)
      );
      if (!hasAtLeastOneCorrectInOptions) {
        console.error(`❌ Sentença "${sentence.id}": pelo menos uma correctAnswer deve estar em options!`, {
          correctAnswers: sentence.correctAnswers,
          options: sentence.options
        });
      }
    }
  });

  const handleSubmit = () => {
    const newResults: Record<string, boolean> = {};
    let correctCount = 0;

    sentences.forEach(sentence => {
      const userAnswer = answers[sentence.id]?.trim().toLowerCase() || '';
      const isCorrect = sentence.correctAnswers.some(
        correct => correct.toLowerCase() === userAnswer
      );
      newResults[sentence.id] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setSubmitted(true);

    const score = (correctCount / sentences.length) * 100;
    if (score === 100) {
      playSound('completion');
    } else if (score >= 50) {
      playSound('success');
    } else {
      playSound('error');
    }
    setTimeout(() => onComplete(score), 2000);
  };

  const allAnswered = sentences.every(s => answers[s.id]?.trim());

  return (
    <Card className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{instruction}</p>

      <div className="space-y-5 sm:space-y-6">
        {sentences.map(sentence => {
          const parts = splitByPlaceholder(sentence.text);
          const hasOptions = sentence.options && sentence.options.length > 0;
          
          return (
            <div key={sentence.id} className="space-y-3 sm:space-y-4">
              {/* Texto da frase */}
              <p className="text-base sm:text-lg text-foreground font-medium leading-relaxed">
                {parts[0]}<span className="text-primary font-bold">_______</span>{parts[1]}
              </p>

              {/* 💡 Hints (se existirem) */}
              {sentence.hints && sentence.hints.length > 0 && !submitted && (
                <div className="flex items-start gap-2 text-xs sm:text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 p-2.5 sm:p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="font-semibold shrink-0">💡 Dicas:</span>
                  <span className="break-words">{sentence.hints.join(' • ')}</span>
                </div>
              )}

              {/* Input: Múltipla Escolha ou Texto Livre */}
              {hasOptions ? (
                // MÚLTIPLA ESCOLHA (RadioGroup)
                <RadioGroup
                  value={answers[sentence.id] || ''}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, [sentence.id]: value }))}
                  disabled={submitted}
                  className="space-y-2 sm:space-y-3"
                >
                  {sentence.options!.map(option => {
                    const optionId = `${sentence.id}-${option}`;
                    const isSelected = answers[sentence.id] === option;
                    const isCorrect = sentence.correctAnswers.includes(option);
                    
                    return (
                      <div
                        key={optionId}
                        className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          submitted
                            ? isSelected && isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                              : isSelected && !isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : 'border-border bg-background'
                            : isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-accent/50 cursor-pointer'
                        }`}
                      >
                        <RadioGroupItem value={option} id={optionId} />
                        <Label 
                          htmlFor={optionId} 
                          className="flex-1 cursor-pointer text-sm sm:text-base font-medium break-words"
                        >
                          {option}
                        </Label>
                        {submitted && isSelected && isCorrect && (
                          <span className="text-green-600 dark:text-green-400 font-bold">✅</span>
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <span className="text-red-600 dark:text-red-400 font-bold">❌</span>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : (
                // TEXTO LIVRE (Input)
                <div className="flex items-center gap-2">
                  <Input
                    value={answers[sentence.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [sentence.id]: e.target.value }))}
                    disabled={submitted}
                    className={`w-full sm:max-w-xs ${
                      submitted 
                        ? results[sentence.id] 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                          : 'border-red-500 bg-red-50 dark:bg-red-950/30'
                        : ''
                    }`}
                    placeholder="Digite aqui..."
                  />
                </div>
              )}

              {/* Feedback */}
              {submitted && !results[sentence.id] && (
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium break-words">
                  ❌ Resposta esperada: {sentence.correctAnswers[0]}
                </p>
              )}
              {submitted && results[sentence.id] && (
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                  ✅ Correto!
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full mt-6 sm:mt-8 text-sm sm:text-base"
          size="lg"
        >
          {allAnswered ? '✅ Verificar Respostas' : '⏳ Complete todas as frases'}
        </Button>
      )}

      {submitted && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/30 dark:to-purple-950/30 rounded-xl text-center">
          <p className="text-base sm:text-lg font-bold text-foreground">
            🎉 Você acertou {Object.values(results).filter(Boolean).length} de {sentences.length}!
          </p>
        </div>
      )}
    </Card>
  );
}
