import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Scenario {
  id: string;
  situation: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface ScenarioSelectionExerciseProps {
  title: string;
  instruction: string;
  scenarios: Scenario[];
  onComplete: (score: number) => void;
}

export function ScenarioSelectionExercise({ 
  title, 
  instruction, 
  scenarios,
  onComplete 
}: ScenarioSelectionExerciseProps) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentScenario = scenarios[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === scenarios.length - 1;
  const isCorrect = selectedAnswer === currentScenario.correctAnswer;

  const handleSubmit = () => {
    setShowExplanation(true);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastScenario) {
      const score = (correctCount / scenarios.length) * 100;
      onComplete(score);
    } else {
      setCurrentScenarioIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
    }
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{instruction}</p>
        <div className="flex gap-2">
          {scenarios.map((_, index) => (
            <div 
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index < currentScenarioIndex 
                  ? 'bg-green-500' 
                  : index === currentScenarioIndex 
                  ? 'bg-cyan-500' 
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mb-6 p-6 bg-muted rounded-xl">
        <p className="text-lg font-medium text-foreground leading-relaxed">
          {currentScenario.situation}
        </p>
      </div>

      <RadioGroup 
        value={selectedAnswer} 
        onValueChange={setSelectedAnswer}
        disabled={showExplanation}
        className="space-y-3 mb-6"
      >
        {currentScenario.options.map((option) => (
          <div 
            key={option}
            className={`flex items-center space-x-3 border-2 rounded-lg p-4 transition-all ${
              showExplanation && option === currentScenario.correctAnswer
                ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                : showExplanation && option === selectedAnswer
                ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                : 'border-border hover:border-primary'
            }`}
          >
            <RadioGroupItem value={option} id={option} />
            <Label htmlFor={option} className="flex-1 cursor-pointer font-medium">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {showExplanation && (
        <div className={`p-6 rounded-xl mb-6 ${
          isCorrect 
            ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-800'
            : 'bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800'
        }`}>
          <p className={`font-bold mb-2 ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'}`}>
            {isCorrect ? '✅ Correto!' : '💡 Veja a explicação:'}
          </p>
          <p className={isCorrect ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}>
            {currentScenario.explanation}
          </p>
        </div>
      )}

      {!showExplanation ? (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full"
          size="lg"
        >
          {selectedAnswer ? '✅ Verificar' : '⏳ Escolha uma opção'}
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          className="w-full"
          size="lg"
        >
          {isLastScenario ? '🎉 Finalizar Exercícios' : '➡️ Próxima Situação'}
        </Button>
      )}
    </Card>
  );
}
