import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface FlashcardsLessonProps {
  content: {
    cards: Array<{
      question: string;
      answer: string;
      example?: string;
    }>;
  };
  onSubmit: (answers: any) => Promise<any>;
  submitting: boolean;
}

export const FlashcardsLesson = ({ content, onSubmit, submitting }: FlashcardsLessonProps) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const card = content.cards[currentCard];
  const progress = ((currentCard + 1) / content.cards.length) * 100;
  const isLastCard = currentCard === content.cards.length - 1;

  const handleAnswer = (knowledge: string) => {
    const newAnswers = [...answers];
    newAnswers[currentCard] = knowledge;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentCard < content.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setFlipped(false);
    }
  };

  const handleSubmit = async () => {
    const result = await onSubmit(answers);
    setResult(result);
  };

  const allAnswered = answers.filter(a => a).length === content.cards.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🃏 Cartões de Memória</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Cartão {currentCard + 1} de {content.cards.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onClick={() => setFlipped(!flipped)}
            className="relative min-h-[300px] cursor-pointer perspective-1000"
          >
            <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="flashcard-face flashcard-front">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <p className="text-2xl font-bold mb-4">{card.question}</p>
                  <p className="text-muted-foreground">👆 Clique para ver a resposta</p>
                </div>
              </div>

              {/* Back */}
              <div className="flashcard-face flashcard-back">
                <div className="flex flex-col justify-center h-full p-8">
                  <p className="text-lg mb-4 font-medium">{card.answer}</p>
                  {card.example && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-semibold mb-2">Exemplo:</p>
                      <p className="text-sm">{card.example}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {flipped && (
            <div className="space-y-3">
              <p className="font-semibold">Você já sabia disso?</p>
              <RadioGroup
                value={answers[currentCard]}
                onValueChange={handleAnswer}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">✅ Sim, eu sabia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maybe" id="maybe" />
                  <Label htmlFor="maybe">🤔 Mais ou menos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">❌ Não, aprendi agora</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handlePrevious}
              disabled={currentCard === 0}
              variant="outline"
              className="flex-1"
            >
              ← Anterior
            </Button>
            
            {!isLastCard ? (
              <Button
                onClick={handleNext}
                disabled={!answers[currentCard]}
                className="flex-1"
              >
                Próximo →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting || !!result}
                className="flex-1"
              >
                {submitting ? 'Enviando...' : 'Concluir'}
              </Button>
            )}
          </div>

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

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .flashcard {
          position: relative;
          width: 100%;
          height: 300px;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          background: white;
          border: 2px solid hsl(var(--border));
        }

        .flashcard-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};
