import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle } from 'lucide-react';

interface FillBlanksLessonProps {
  content: {
    sentences: Array<{
      text: string;
      options: string[];
      correct: string[];
    }>;
  };
  onSubmit: (answers: any) => Promise<any>;
  submitting: boolean;
  previousAnswers?: any;
}

export const FillBlanksLesson = ({ content, onSubmit, submitting, previousAnswers }: FillBlanksLessonProps) => {
  const [answers, setAnswers] = useState<Record<number, string[]>>(previousAnswers || {});
  const [result, setResult] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  const handleAnswer = (sentenceIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [sentenceIndex]: [value]
    }));
    setShowFeedback(prev => ({ ...prev, [sentenceIndex]: false }));
  };

  const handleSubmit = async () => {
    const result = await onSubmit(answers);
    setResult(result);
    
    // Show feedback for each answer
    const feedback: Record<number, boolean> = {};
    content.sentences.forEach((s, i) => {
      const userAnswer = answers[i];
      const isCorrect = JSON.stringify(userAnswer?.sort?.()) === JSON.stringify(s.correct?.sort?.());
      feedback[i] = isCorrect;
    });
    setShowFeedback(feedback);
  };

  const allAnswered = Object.keys(answers).length === content.sentences.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📝 Complete as Lacunas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.sentences.map((sentence, index) => {
            const isAnswered = answers[index] !== undefined;
            const isCorrect = showFeedback[index];
            
            return (
              <div key={index} className="space-y-3 p-4 rounded-lg border bg-card">
                <p className="text-lg font-medium">{sentence.text}</p>
                
                <div className="flex items-center gap-3">
                  <Select
                    value={answers[index]?.[0] || ''}
                    onValueChange={(value) => handleAnswer(index, value)}
                    disabled={!!result}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma opção..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sentence.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {result && isAnswered && (
                    <div>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  )}
                </div>

                {result && !isCorrect && (
                  <p className="text-sm text-muted-foreground">
                    💡 Resposta correta: {sentence.correct.join(', ')}
                  </p>
                )}
              </div>
            );
          })}

          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting || !!result}
            className="w-full"
            size="lg"
          >
            {submitting ? 'Verificando...' : 'Verificar Respostas'}
          </Button>

          {result && (
            <Card className={result.passed ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Resultado: {result.score}%</h3>
                <p className="text-lg">{result.feedback}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
