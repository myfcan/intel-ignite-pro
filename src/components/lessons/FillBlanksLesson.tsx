import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle } from 'lucide-react';

interface FillBlanksLessonProps {
  content: {
    introduction?: string;
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

interface BlankPosition {
  index: number;
  before: string;
  after: string;
}

export const FillBlanksLesson = ({ content, onSubmit, submitting, previousAnswers }: FillBlanksLessonProps) => {
  const [answers, setAnswers] = useState<Record<number, string[]>>(previousAnswers || {});
  const [result, setResult] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  // Detectar quantas lacunas [___] tem em cada frase
  const getBlanksInSentence = (text: string): BlankPosition[] => {
    const parts = text.split('[___]');
    const blanks: BlankPosition[] = [];
    
    for (let i = 0; i < parts.length - 1; i++) {
      blanks.push({
        index: i,
        before: i === 0 ? parts[0] : '',
        after: i === parts.length - 2 ? parts[parts.length - 1] : parts[i + 1]
      });
    }
    
    return blanks;
  };

  const handleAnswer = (sentenceIndex: number, blankIndex: number, value: string) => {
    setAnswers(prev => {
      const currentAnswers = prev[sentenceIndex] || [];
      const newAnswers = [...currentAnswers];
      newAnswers[blankIndex] = value;
      return {
        ...prev,
        [sentenceIndex]: newAnswers
      };
    });
    setShowFeedback(prev => ({ ...prev, [sentenceIndex]: false }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

  const handleTryAgain = () => {
    setAnswers({});
    setResult(null);
    setShowFeedback({});
  };

  // Verificar se todas as perguntas foram respondidas
  const allAnswered = content.sentences.every((sentence, idx) => {
    const blanksCount = (sentence.text.match(/\[___\]/g) || []).length;
    const userAnswers = answers[idx] || [];
    return userAnswers.length === blanksCount && userAnswers.every(a => a);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📝 Complete as Lacunas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.introduction && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-base leading-relaxed">{content.introduction}</p>
            </div>
          )}
          {content.sentences.map((sentence, sentenceIndex) => {
            const blanks = getBlanksInSentence(sentence.text);
            const parts = sentence.text.split('[___]');
            const userAnswers = answers[sentenceIndex] || [];
            const isCorrect = showFeedback[sentenceIndex];
            
            return (
              <div key={sentenceIndex} className="space-y-3 p-4 rounded-lg border bg-card">
                {/* Renderizar texto com dropdowns intercalados */}
                <div className="space-y-3">
                  {blanks.length > 0 ? (
                    <>
                      {blanks.map((blank, blankIndex) => (
                        <div key={blankIndex} className="space-y-2">
                          {blankIndex === 0 && parts[0] && (
                            <p className="text-lg font-medium">{parts[0]}</p>
                          )}
                          
                          <div className="flex items-center gap-3">
                            <Select
                              value={userAnswers[blankIndex] || ''}
                              onValueChange={(value) => handleAnswer(sentenceIndex, blankIndex, value)}
                              disabled={!!result}
                            >
                              <SelectTrigger className="w-full bg-background">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-50">
                                {sentence.options.map((opt) => (
                                  <SelectItem key={opt} value={opt} className="bg-background hover:bg-accent">
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {result && userAnswers[blankIndex] && (
                              <div>
                                {userAnswers[blankIndex] === sentence.correct[blankIndex] ? (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-600" />
                                )}
                              </div>
                            )}
                          </div>

                          {parts[blankIndex + 1] && (
                            <p className="text-lg font-medium">{parts[blankIndex + 1]}</p>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-lg font-medium">{sentence.text}</p>
                  )}
                </div>

                {result && !isCorrect && (
                  <p className="text-sm text-muted-foreground mt-3">
                    💡 Resposta correta: {sentence.correct.join(', ')}
                  </p>
                )}
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
                      🎉 Aguarde a Maia com uma surpresa especial!
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
