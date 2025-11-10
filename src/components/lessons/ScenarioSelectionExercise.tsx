import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Suporta dois formatos: multi-option e simple-choice
interface Scenario {
  id: string;
  situation?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  // Formato alternativo (simple-choice)
  title?: string;
  description?: string;
  emoji?: string;
  isCorrect?: boolean;
  feedback?: string;
}

interface ScenarioData {
  scenarios: Scenario[];
  correctExplanation?: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
}

interface ScenarioSelectionExerciseProps {
  title: string;
  instruction: string;
  scenarios?: Scenario[];
  data?: ScenarioData;
  onComplete: (score: number) => void;
}

export function ScenarioSelectionExercise({ 
  title, 
  instruction, 
  scenarios,
  data,
  onComplete 
}: ScenarioSelectionExerciseProps) {
  // Suporta ambos os formatos
  const scenarioList = scenarios || data?.scenarios || [];
  const isSimpleChoice = scenarioList.length > 0 && 'isCorrect' in scenarioList[0];
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  
  // Reset estado quando o exercício muda
  useEffect(() => {
    setSelectedAnswer('');
    setShowExplanation(false);
    setHasAnswered(false);
  }, [title, instruction]);
  
  if (scenarioList.length === 0) {
    return (
      <Card className="p-8 max-w-4xl mx-auto">
        <p className="text-destructive">❌ Nenhum cenário disponível</p>
      </Card>
    );
  }

  const isCorrect = isSimpleChoice 
    ? scenarioList.find(s => s.id === selectedAnswer)?.isCorrect || false
    : selectedAnswer === scenarioList[0]?.correctAnswer;

  const handleSubmit = () => {
    setShowExplanation(true);
    setHasAnswered(true);
    const score = isCorrect ? 100 : 0;
    
    // Para simple-choice, completa imediatamente
    if (isSimpleChoice) {
      setTimeout(() => onComplete(score), 2000);
    }
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{instruction}</p>
      </div>

      {isSimpleChoice ? (
        // Formato simple-choice: mostra cards para escolher
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {scenarioList.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                if (!hasAnswered) {
                  setSelectedAnswer(scenario.id);
                  // Submit automaticamente após selecionar
                  setTimeout(() => {
                    setShowExplanation(true);
                    setHasAnswered(true);
                    const score = scenario.isCorrect ? 100 : 0;
                    setTimeout(() => onComplete(score), 2000);
                  }, 100);
                }
              }}
              disabled={hasAnswered}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedAnswer === scenario.id
                  ? showExplanation && scenario.isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : showExplanation && !scenario.isCorrect
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary hover:bg-muted'
              } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{scenario.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">{scenario.title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {scenario.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        // Formato multi-option original
        <>
          <div className="mb-6 p-6 bg-muted rounded-xl">
            <p className="text-lg font-medium text-foreground leading-relaxed">
              {scenarioList[0]?.situation}
            </p>
          </div>

          <RadioGroup 
            value={selectedAnswer} 
            onValueChange={setSelectedAnswer}
            disabled={showExplanation}
            className="space-y-3 mb-6"
          >
            {scenarioList[0]?.options?.map((option) => (
              <div 
                key={option}
                className={`flex items-center space-x-3 border-2 rounded-lg p-4 transition-all ${
                  showExplanation && option === scenarioList[0]?.correctAnswer
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
        </>
      )}

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
            {isSimpleChoice 
              ? scenarioList.find(s => s.id === selectedAnswer)?.feedback 
              : scenarioList[0]?.explanation}
          </p>
          {isSimpleChoice && data?.correctExplanation && (
            <p className="mt-4 text-foreground font-medium">
              💡 {data.correctExplanation}
            </p>
          )}
        </div>
      )}

      {!showExplanation && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full"
          size="lg"
        >
          {selectedAnswer ? '✅ Verificar Resposta' : '⏳ Escolha uma opção'}
        </Button>
      )}
    </Card>
  );
}
