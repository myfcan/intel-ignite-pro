import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
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

  // Multi-scenario state: track current scenario index and per-scenario answers
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { selected: string; correct: boolean }>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const { playSound } = useV7SoundEffects(0.6, true);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // For simple choice mode, all scenarios are shown at once (cards)
  // For situation mode, scenarios are shown sequentially
  const currentScenario = isSimpleChoice ? scenarioList[0] : scenarioList[currentScenarioIndex];
  const totalSituationScenarios = isSimpleChoice ? 1 : scenarioList.length;
  const isLastScenario = currentScenarioIndex >= totalSituationScenarios - 1;

  useEffect(() => {
    if (showExplanation && feedbackRef.current) {
      const timer = setTimeout(() => {
        ensureElementVisible(feedbackRef.current, { safeBottom: 160 });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showExplanation]);

  if (!scenarioList.length) {
    return (
      <ExerciseErrorCard 
        title="⚠️ Exercício Sem Cenários"
        message="Este exercício de seleção de cenários não possui opções configuradas."
        details="Campo 'scenarios' ou 'data.scenarios' está vazio."
      />
    );
  }

  const isCorrectCurrent = isSimpleChoice
    ? scenarioList.find(s => s.id === selectedAnswer)?.isCorrect || false
    : selectedAnswer === currentScenario?.correctAnswer;

  // Show ALL options — no slice truncation
  const displayOptions = currentScenario?.options || [];

  const handleSubmit = () => {
    setShowExplanation(true);
    const correct = isSimpleChoice
      ? scenarioList.find(s => s.id === selectedAnswer)?.isCorrect || false
      : selectedAnswer === currentScenario?.correctAnswer;

    if (correct) {
      playSound('quiz-correct');
    } else {
      playSound('quiz-wrong');
    }

    // Store answer for this scenario
    const newAnswers = { ...answers, [currentScenarioIndex]: { selected: selectedAnswer, correct } };
    setAnswers(newAnswers);

    // If simple choice or last scenario, report final score
    if (isSimpleChoice || isLastScenario) {
      const totalCorrect = Object.values(newAnswers).filter(a => a.correct).length + (correct && !newAnswers[currentScenarioIndex] ? 0 : 0);
      const correctCount = Object.values(newAnswers).filter(a => a.correct).length;
      const finalScore = Math.round((correctCount / totalSituationScenarios) * 100);
      onComplete(finalScore);
    }
  };

  const handleNextScenario = () => {
    setCurrentScenarioIndex(prev => prev + 1);
    setSelectedAnswer('');
    setShowExplanation(false);
  };

  return (
    <Card className="p-4 sm:p-6 space-y-3 border-2 border-primary/10">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🎯</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{instruction}</p>
        </div>
      </div>

      {/* Progress indicator for multi-scenario */}
      {!isSimpleChoice && totalSituationScenarios > 1 && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-muted-foreground font-medium">
            Cenário {currentScenarioIndex + 1} de {totalSituationScenarios}
          </span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentScenarioIndex + 1) / totalSituationScenarios) * 100}%` }}
            />
          </div>
        </div>
      )}

      {isSimpleChoice ? (
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {scenarioList.map((sc) => {
            const isSelected = selectedAnswer === sc.id;
            let borderStyle = 'border-border hover:border-primary/50';
            if (showExplanation && isSelected && sc.isCorrect) {
              borderStyle = 'border-success bg-success/5';
            } else if (showExplanation && isSelected && !sc.isCorrect) {
              borderStyle = 'border-destructive bg-destructive/5';
            } else if (showExplanation && sc.isCorrect) {
              borderStyle = 'border-success/40 bg-success/5';
            } else if (isSelected) {
              borderStyle = 'border-primary bg-primary/5';
            }

            return (
              <button
                key={sc.id}
                onClick={() => {
                  if (!showExplanation) {
                    setSelectedAnswer(sc.id);
                    setTimeout(() => {
                      setShowExplanation(true);
                      const correct = sc.isCorrect || false;
                      if (correct) playSound('quiz-correct');
                      else playSound('quiz-wrong');
                      onComplete(correct ? 100 : 0);
                    }, 100);
                  }
                }}
                disabled={showExplanation}
                className={`px-3 py-2.5 sm:p-4 rounded-xl border-2 transition-all text-left ${borderStyle} ${
                  showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg sm:text-2xl flex-shrink-0">{sc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-base leading-snug break-words">{sc.title}</h4>
                    {sc.description && (
                      <p className="text-[11px] sm:text-xs text-muted-foreground break-words line-clamp-1 mt-0.5">{sc.description}</p>
                    )}
                  </div>
                  {showExplanation && isSelected && sc.isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  )}
                  {showExplanation && isSelected && !sc.isCorrect && (
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="p-3 sm:p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed break-words">
              {currentScenario?.situation}
            </p>
          </div>

          <div className="space-y-2">
            {displayOptions.map((option, index) => {
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
                  key={index}
                  onClick={() => !showExplanation && setSelectedAnswer(option)}
                  disabled={showExplanation}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${borderColor} ${bgColor} ${
                    !showExplanation ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>
                  <span className="flex-1 text-sm leading-relaxed break-words line-clamp-3">
                    {option}
                  </span>
                  {showExplanation && isThisCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-success animate-scale-in flex-shrink-0" />
                  )}
                  {showExplanation && isSelected && !isThisCorrect && (
                    <XCircle className="w-5 h-5 text-destructive animate-scale-in flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Feedback + Navigation */}
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
            <div className={`p-3 rounded-lg border-2 animate-fade-in ${
              isCorrectCurrent
                ? 'bg-success/5 border-success/20'
                : 'bg-destructive/5 border-destructive/20'
            }`}>
              <div className="flex items-start gap-2">
                {isCorrectCurrent ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1 text-sm">
                    {isCorrectCurrent ? 'Correto! 🎉' : 'Não foi dessa vez'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                    {currentScenario?.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Next scenario button (only if not last) */}
            {!isLastScenario && (
              <Button
                onClick={handleNextScenario}
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
                size="lg"
              >
                Próximo Cenário <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
