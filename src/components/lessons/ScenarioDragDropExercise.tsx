import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Scenario {
  id: string;
  text: string;
  correctCategory: string;
}

interface Category {
  id: string;
  title: string;
  emoji: string;
}

interface ScenarioDragDropExerciseProps {
  title: string;
  instruction: string;
  categories: Category[];
  scenarios: Scenario[];
  onComplete: (score: number) => void;
}

export function ScenarioDragDropExercise({
  title,
  instruction,
  categories,
  scenarios,
  onComplete,
}: ScenarioDragDropExerciseProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [draggedScenario, setDraggedScenario] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleDragStart = (scenarioId: string) => {
    setDraggedScenario(scenarioId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (categoryId: string) => {
    if (!draggedScenario) return;

    setAssignments({
      ...assignments,
      [draggedScenario]: categoryId,
    });
    setDraggedScenario(null);
  };

  const handleSubmit = () => {
    const newResults: Record<string, boolean> = {};
    let correctCount = 0;

    scenarios.forEach((scenario) => {
      const isCorrect = assignments[scenario.id] === scenario.correctCategory;
      newResults[scenario.id] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setIsSubmitted(true);

    const score = Math.round((correctCount / scenarios.length) * 100);
    setTimeout(() => onComplete(score), 2000);
  };

  const unassignedScenarios = scenarios.filter((s) => !assignments[s.id]);
  const allAssigned = scenarios.every((s) => assignments[s.id]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{instruction}</p>
        </div>

        {/* Unassigned Scenarios */}
        {unassignedScenarios.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              📋 Cenários para classificar:
            </h3>
            <div className="grid gap-3">
              {unassignedScenarios.map((scenario) => (
                <motion.div
                  key={scenario.id}
                  draggable={!isSubmitted}
                  onDragStart={() => handleDragStart(scenario.id)}
                  whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                  className={`p-4 rounded-lg border-2 border-border bg-card cursor-move ${
                    draggedScenario === scenario.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <p className="flex-1">{scenario.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Categories with Assigned Scenarios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryScenarios = scenarios.filter(
              (s) => assignments[s.id] === category.id
            );

            return (
              <div
                key={category.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(category.id)}
                className={`p-6 rounded-lg border-2 transition-all min-h-[200px] ${
                  draggedScenario
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{category.emoji}</div>
                  <h3 className="font-bold text-lg">{category.title}</h3>
                </div>

                <div className="space-y-2">
                  {categoryScenarios.map((scenario) => {
                    const isCorrect = results[scenario.id];

                    return (
                      <motion.div
                        key={scenario.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-3 rounded-lg text-sm border-2 ${
                          isSubmitted && isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : isSubmitted && isCorrect === false
                            ? 'border-red-500 bg-red-50 dark:bg-red-950'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <p className="flex-1">{scenario.text}</p>
                          {isSubmitted && isCorrect !== undefined && (
                            <span>
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {categoryScenarios.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Arraste cenários aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8"
            >
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {Object.values(results).filter(Boolean).length} de{' '}
                    {scenarios.length} corretas! 🎉
                  </h3>
                  <p className="text-muted-foreground">
                    {Object.values(results).filter(Boolean).length === scenarios.length
                      ? 'Perfeito! Você entendeu as diferenças entre as ferramentas!'
                      : 'Bom trabalho! Continue praticando para dominar o conteúdo.'}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSubmit} disabled={!allAssigned || isSubmitted} size="lg">
            {isSubmitted ? 'Exercício Concluído' : 'Verificar Respostas'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
