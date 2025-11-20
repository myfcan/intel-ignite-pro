import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle } from 'lucide-react';

interface FillTextLessonProps {
  content: {
    introduction?: string;
    exercises: Array<{
      promptTemplate: string;
      blanks: Array<{
        placeholder: string;
        keywords: string[];
        hint?: string;
      }>;
    }>;
  };
  onSubmit: (answers: any) => Promise<any>;
  submitting: boolean;
  previousAnswers?: any;
}

interface BlankInput {
  before: string;
  after: string;
  index: number;
}

export const FillTextLesson = ({ content, onSubmit, submitting, previousAnswers }: FillTextLessonProps) => {
  const [answers, setAnswers] = useState<Record<number, string[]>>(previousAnswers || {});
  const [result, setResult] = useState<any>(null);
  const [feedback, setFeedback] = useState<Record<number, Array<boolean>>>({});

  // Validar se o conteúdo está no formato correto
  if (!content || !content.exercises || !Array.isArray(content.exercises)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Conteúdo da aula não está no formato correto para este tipo de exercício.
          </p>
        </div>
      </div>
    );
  }

  const parsePromptTemplate = (template: string): BlankInput[] => {
    const parts = template.split('[___]');
    const blanks: BlankInput[] = [];
    
    for (let i = 0; i < parts.length - 1; i++) {
      blanks.push({
        index: i,
        before: parts[i],
        after: i === parts.length - 2 ? parts[parts.length - 1] : ''
      });
    }
    
    return blanks;
  };

  const handleInputChange = (exerciseIndex: number, blankIndex: number, value: string) => {
    setAnswers(prev => {
      const currentAnswers = prev[exerciseIndex] || [];
      const newAnswers = [...currentAnswers];
      newAnswers[blankIndex] = value;
      return {
        ...prev,
        [exerciseIndex]: newAnswers
      };
    });
    
    // Clear feedback for this exercise
    setFeedback(prev => ({
      ...prev,
      [exerciseIndex]: []
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = await onSubmit(answers);
    setResult(result);
    
    // Generate feedback for each answer
    const newFeedback: Record<number, Array<boolean>> = {};
    content.exercises.forEach((exercise, exerciseIdx) => {
      const userAnswers = answers[exerciseIdx] || [];
      const blankFeedback: boolean[] = [];
      
      exercise.blanks.forEach((blank, blankIdx) => {
        const userAnswer = (userAnswers[blankIdx] || '').toLowerCase().trim();
        const hasKeyword = blank.keywords.some(keyword => 
          userAnswer.includes(keyword.toLowerCase())
        );
        blankFeedback.push(hasKeyword);
      });
      
      newFeedback[exerciseIdx] = blankFeedback;
    });
    
    setFeedback(newFeedback);
  };

  const handleTryAgain = () => {
    setAnswers({});
    setResult(null);
    setFeedback({});
  };

  // Check if all inputs are filled
  const allAnswered = content.exercises.every((exercise, idx) => {
    const userAnswers = answers[idx] || [];
    return userAnswers.length === exercise.blanks.length && 
           userAnswers.every(a => a && a.trim().length > 0);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>✍️ Complete o Texto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.introduction && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-base leading-relaxed">{content.introduction}</p>
            </div>
          )}

          {content.exercises.map((exercise, exerciseIndex) => {
            const blanks = parsePromptTemplate(exercise.promptTemplate);
            const parts = exercise.promptTemplate.split('[___]');
            const userAnswers = answers[exerciseIndex] || [];
            const exerciseFeedback = feedback[exerciseIndex] || [];
            
            return (
              <div key={exerciseIndex} className="space-y-4 p-4 rounded-lg border bg-card">
                <div className="space-y-3">
                  {blanks.map((blank, blankIndex) => (
                    <div key={blankIndex} className="space-y-2">
                      {blankIndex === 0 && parts[0] && (
                        <p className="text-base leading-relaxed font-mono bg-muted/30 p-3 rounded">
                          {parts[0]}
                        </p>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <Input
                            type="text"
                            value={userAnswers[blankIndex] || ''}
                            onChange={(e) => handleInputChange(exerciseIndex, blankIndex, e.target.value)}
                            placeholder={exercise.blanks[blankIndex].placeholder}
                            disabled={!!result}
                            className="font-mono"
                          />
                          {exercise.blanks[blankIndex].hint && !result && (
                            <p className="text-xs text-muted-foreground">
                              💡 {exercise.blanks[blankIndex].hint}
                            </p>
                          )}
                        </div>

                        {result && userAnswers[blankIndex] && (
                          <div className="mt-2">
                            {exerciseFeedback[blankIndex] ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600" />
                            )}
                          </div>
                        )}
                      </div>

                      {parts[blankIndex + 1] && (
                        <p className="text-base leading-relaxed font-mono bg-muted/30 p-3 rounded">
                          {parts[blankIndex + 1]}
                        </p>
                      )}

                      {result && !exerciseFeedback[blankIndex] && userAnswers[blankIndex] && (
                        <p className="text-sm text-muted-foreground">
                          💡 Sugestões: {exercise.blanks[blankIndex].keywords.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {!result && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? 'Verificando...' : 'Verificar Respostas'}
            </Button>
          )}

          {result && (
            <Card className={result.passed ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Resultado: {result.score}%</h3>
                  <p className="text-lg">{result.feedback}</p>
                  {result.passed && !result.isLastLesson && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ⏳ Redirecionando para a próxima aula em instantes...
                    </p>
                  )}
                  {result.passed && result.isLastLesson && (
                    <p className="text-sm text-green-600 font-semibold mt-2">
                      🎉 Aguarde a Liv com uma surpresa especial!
                    </p>
                  )}
                </div>
                
                {!result.passed && (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleTryAgain}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      🔄 Tentar Novamente
                    </Button>
                    <Button
                      type="button"
                      onClick={() => window.history.back()}
                      variant="secondary"
                      className="flex-1"
                      size="lg"
                    >
                      Voltar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};