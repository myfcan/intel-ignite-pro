import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ExerciseErrorCard } from './ExerciseErrorCard';
import { useV7SoundEffects } from './v7/cinematic/useV7SoundEffects';
import { ensureElementVisible } from './v8/v8ScrollUtils';

interface Scenario {
  id: string;
  situation?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
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
  const scenarioList = scenarios || data?.scenarios || [];
  const isSimpleChoice = scenarioList.length > 0 && 'isCorrect' in scenarioList[0];
  
  // Multi-scenario state
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { playSound } = useV7SoundEffects(0.6, true);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const totalScenarios = scenarioList.length;
  const currentScenario = scenarioList[currentScenarioIdx];

  const handleNextScenario = useCallback(() => {
    const nextIdx = currentScenarioIdx + 1;
    if (nextIdx >= totalScenarios) {
      const finalCorrect = correctCount;
      const score = Math.round((finalCorrect / totalScenarios) * 100);
      setCompleted(true);
      onComplete(score);
    } else {
      setCurrentScenarioIdx(nextIdx);
      setSelectedAnswer('');
      setShowExplanation(false);
    }
  }, [currentScenarioIdx, totalScenarios, correctCount, onComplete]);

  useEffect(() => {
    if (showExplanation && feedbackRef.current) {
      const timer = setTimeout(() => {
        ensureElementVisible(feedbackRef.current, { safeBottom: 160 });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showExplanation]);

  if (scenarioList.length === 0) {
    return (
      <ExerciseErrorCard 
        title="⚠️ Exercício Sem Cenários"
        message="Este exercício de seleção de cenários não possui opções configuradas."
        details="Campo 'scenarios' ou 'data.scenarios' está vazio."
      />
    );
  }

  const isCorrect = isSimpleChoice 
    ? scenarioList.find(s => s.id === selectedAnswer)?.isCorrect || false
    : selectedAnswer === currentScenario?.correctAnswer;

  const handleSubmit = () => {
    setShowExplanation(true);
    const correct = isSimpleChoice
      ? scenarioList.find(s => s.id === selectedAnswer)?.isCorrect || false
      : selectedAnswer === currentScenario?.correctAnswer;

    if (correct) {
      playSound('quiz-correct');
      setCorrectCount(prev => prev + 1);
    } else {
      playSound('quiz-wrong');
    }

    if (isSimpleChoice) {
      const score = correct ? 100 : 0;
      setTimeout(() => {
        setCompleted(true);
        onComplete(score);
      }, 2000);
    }
  };

  if (completed) return null;

  return (
    <Card className="p-4 sm:p-6 space-y-4 border-2 border-primary/10">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🎯</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
            {!isSimpleChoice && totalScenarios > 1 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                {currentScenarioIdx + 1}/{totalScenarios}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{instruction}</p>
        </div>
      </div>

      {/* Progress bar for multi-scenario */}
      {!isSimpleChoice && totalScenarios > 1 && (
        <div className="flex gap-1">
          {Array.from({ length: totalScenarios }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < currentScenarioIdx ? 'bg-primary' :
                i === currentScenarioIdx ? 'bg-primary/50' :
                'bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      {isSimpleChoice ? (
        /* Simple-choice cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenarioList.map((scenario) => {
            const isSelected = selectedAnswer === scenario.id;
            let borderStyle = 'border-border hover:border-primary/50';
            if (showExplanation && isSelected && scenario.isCorrect) {
              borderStyle = 'border-success bg-success/5';
            } else if (showExplanation && isSelected && !scenario.isCorrect) {
              borderStyle = 'border-destructive bg-destructive/5';
            } else if (isSelected) {
              borderStyle = 'border-primary bg-primary/5';
            }

            return (
              <button
                key={scenario.id}
                onClick={() => {
                  if (!showExplanation) {
                    setSelectedAnswer(scenario.id);
                    setTimeout(() => {
                      setShowExplanation(true);
                      const correct = scenario.isCorrect || false;
                      if (correct) {
                        playSound('quiz-correct');
                        setCorrectCount(prev => prev + 1);
                      } else {
                        playSound('quiz-wrong');
                      }
                      setTimeout(() => {
                        setCompleted(true);
                        onComplete(correct ? 100 : 0);
                      }, 2000);
                    }, 100);
                  }
                }}
                disabled={showExplanation}
                className={`p-4 rounded-xl border-2 transition-all text-left ${borderStyle} ${
                  showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl flex-shrink-0">{scenario.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base mb-1 break-words">{scenario.title}</h4>
                    <p className="text-xs text-muted-foreground break-words">{scenario.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Multi-option scenario format */
        <>
          {/* Situation card */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed break-words">
              {currentScenario?.situation}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentScenario?.options?.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isThisCorrect = option === currentScenario?.correctAnswer;

              let borderColor = 'border-border';
              let bgColor = 'bg-background';

              if (showExplanation) {
                if (isThisCorrect) {
                  borderColor = 'border-success';
                  bgColor = 'bg-success/5';
                } else if (isSelected) {
                  borderColor = 'border-destructive';
                  bgColor = 'bg-destructive/5';
                }
              } else if (isSelected) {
                borderColor = 'border-primary';
                bgColor = 'bg-primary/5';
              }

              return (
                <button
                  key={`${currentScenarioIdx}-${index}`}
                  onClick={() => !showExplanation && setSelectedAnswer(option)}
                  disabled={showExplanation}
                  className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${borderColor} ${bgColor} ${
                    !showExplanation ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>
                  <span className="flex-1 text-sm sm:text-base leading-relaxed break-words">
                    {option}
                  </span>
                  {showExplanation && isThisCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-success animate-scale-in flex-shrink-0" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-destructive animate-scale-in flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Feedback + Actions */}
      <div ref={feedbackRef}>
        {!showExplanation && !isSimpleChoice ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="w-full h-10 sm:h-12 text-sm sm:text-base"
            size="lg"
          >
            Confirmar Resposta
          </Button>
        ) : showExplanation && !isSimpleChoice ? (
          <div className="space-y-3">
            <div className={`p-3 sm:p-4 rounded-lg border-2 animate-fade-in ${
              isCorrect
                ? 'bg-success/5 border-success/20'
                : 'bg-destructive/5 border-destructive/20'
            }`}>
              <div className="flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1 text-sm">
                    {isCorrect ? 'Correto! 🎉' : 'Não foi dessa vez'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                    {currentScenario?.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Next scenario or finish */}
            <Button
              onClick={handleNextScenario}
              className="w-full h-10 sm:h-12 text-sm sm:text-base gap-2"
              size="lg"
            >
              {currentScenarioIdx + 1 < totalScenarios ? (
                <>
                  Próximo Cenário
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
