import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Sentence {
  id: string;
  text: string;
  correctAnswers: string[];
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
    setTimeout(() => onComplete(score), 2000);
  };

  const allAnswered = sentences.every(s => answers[s.id]?.trim());

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{instruction}</p>

      <div className="space-y-6">
        {sentences.map(sentence => {
          const parts = sentence.text.split('___________');
          return (
            <div key={sentence.id} className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-foreground">{parts[0]}</span>
                <Input
                  value={answers[sentence.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [sentence.id]: e.target.value }))}
                  disabled={submitted}
                  className={`max-w-xs ${
                    submitted 
                      ? results[sentence.id] 
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                        : 'border-red-500 bg-red-50 dark:bg-red-950/30'
                      : ''
                  }`}
                  placeholder="Digite aqui..."
                />
                <span className="text-foreground">{parts[1]}</span>
              </div>
              {submitted && !results[sentence.id] && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  ❌ Resposta esperada: {sentence.correctAnswers[0]}
                </p>
              )}
              {submitted && results[sentence.id] && (
                <p className="text-sm text-green-600 dark:text-green-400">
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
          className="w-full mt-8"
          size="lg"
        >
          {allAnswered ? '✅ Verificar Respostas' : '⏳ Complete todas as frases'}
        </Button>
      )}

      {submitted && (
        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/30 dark:to-purple-950/30 rounded-xl text-center">
          <p className="text-lg font-bold text-foreground">
            🎉 Você acertou {Object.values(results).filter(Boolean).length} de {sentences.length}!
          </p>
        </div>
      )}
    </Card>
  );
}
