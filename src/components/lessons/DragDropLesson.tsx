import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, CheckCircle, XCircle } from 'lucide-react';

interface DragDropLessonProps {
  content: {
    items: string[];
    correctOrder: string[];
    instruction: string;
  };
  onSubmit: (answers: any) => Promise<any>;
  submitting: boolean;
}

export const DragDropLesson = ({ content, onSubmit, submitting }: DragDropLessonProps) => {
  const [items, setItems] = useState<string[]>([...content.items]);
  const [result, setResult] = useState<any>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(null);
  };

  const handleSubmit = async () => {
    const result = await onSubmit(items);
    setResult(result);
  };

  const handleTryAgain = () => {
    setItems([...content.items]);
    setResult(null);
  };

  const isCorrect = result?.passed;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎯 Arraste e Solte na Ordem Correta</CardTitle>
          <p className="text-muted-foreground">{content.instruction}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item}-${index}`}
                draggable={!result}
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 
                  ${!result ? 'cursor-move hover:border-primary hover:bg-accent' : ''}
                  ${result && items[index] === content.correctOrder[index] ? 'border-green-500 bg-green-50' : ''}
                  ${result && items[index] !== content.correctOrder[index] ? 'border-red-500 bg-red-50' : ''}
                  transition-all
                `}
              >
                {!result && <GripVertical className="w-5 h-5 text-muted-foreground" />}
                
                {result && (
                  <div>
                    {items[index] === content.correctOrder[index] ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <span className="font-medium">{index + 1}.</span>
                  <span className="ml-2">{item}</span>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !!result}
            className="w-full"
            size="lg"
          >
            {submitting ? 'Verificando...' : 'Verificar Ordem'}
          </Button>

          {result && (
            <div className="space-y-4">
              <Card className={isCorrect ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}>
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

              {!isCorrect && (
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-base">✅ Ordem Correta:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {content.correctOrder.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="font-bold">{index + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
