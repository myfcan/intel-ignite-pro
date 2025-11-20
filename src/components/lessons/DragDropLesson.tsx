import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Validar se o conteúdo está no formato correto
  if (!content || !content.items || !Array.isArray(content.items) || !content.correctOrder) {
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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>🎯 Arraste e Solte na Ordem Correta</CardTitle>
          <p className="text-muted-foreground">{content.instruction}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={`${item}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  whileHover={!result ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!result ? { scale: 0.98 } : {}}
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
                  <AnimatePresence mode="wait">
                    {!result && (
                      <motion.div
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                      >
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    )}
                    
                    {result && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ 
                          scale: 1, 
                          rotate: 0,
                          ...(items[index] !== content.correctOrder[index] && {
                            x: [0, -5, 5, -5, 5, 0],
                            transition: { duration: 0.5 }
                          })
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        {items[index] === content.correctOrder[index] ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex-1">
                    <span className="font-medium">{index + 1}.</span>
                    <span className="ml-2">{item}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={submitting || !!result}
              className="w-full"
              size="lg"
            >
              {submitting ? 'Verificando...' : 'Verificar Ordem'}
            </Button>
          </motion.div>

          <AnimatePresence>
            {result && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
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
                        🎉 Aguarde a Liv com uma surpresa especial!
                      </p>
                    )}
                  </div>
                  
                  {!result.passed && (
                    <motion.div 
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Button
                          type="button"
                          onClick={handleTryAgain}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          🔄 Tentar Novamente
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Button
                          type="button"
                          onClick={() => window.history.back()}
                          variant="secondary"
                          className="w-full"
                          size="lg"
                        >
                          Voltar
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {!isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-base">✅ Ordem Correta:</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {content.correctOrder.map((item, index) => (
                          <motion.li 
                            key={index} 
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <span className="font-bold">{index + 1}.</span>
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
