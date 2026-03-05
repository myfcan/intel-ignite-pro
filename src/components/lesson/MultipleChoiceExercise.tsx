import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Info, ArrowRight } from "lucide-react";
import { useV7SoundEffects } from "@/components/lessons/v7/cinematic/useV7SoundEffects";
import { ensureElementVisible } from "@/components/lessons/v8/v8ScrollUtils";

interface MultipleChoiceExerciseProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  onComplete: (isCorrect: boolean) => void;
}

export const MultipleChoiceExercise = ({
  question,
  options,
  correctAnswer,
  explanation,
  onComplete,
}: MultipleChoiceExerciseProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { playSound } = useV7SoundEffects(0.6, true);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Scroll to feedback area after submit
  useEffect(() => {
    if (isSubmitted && feedbackRef.current) {
      const timer = setTimeout(() => {
        ensureElementVisible(feedbackRef.current);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      playSound('quiz-correct');
      // Auto-advance after showing feedback
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete(true);
        }, 300);
      }, 1500);
    } else {
      playSound('quiz-wrong');
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer("");
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  const handleContinue = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete(false);
    }, 300);
  };

  // Limit to 3 options for cleaner UI
  const displayOptions = options.slice(0, 3);
  // Ensure correctAnswer is in displayOptions
  if (!displayOptions.includes(correctAnswer) && options.includes(correctAnswer)) {
    displayOptions[displayOptions.length - 1] = correctAnswer;
  }

  return (
    <Card className={`p-4 sm:p-6 space-y-3 sm:space-y-4 border-2 border-primary/10 transition-all duration-300 ${
      isFadingOut ? 'animate-fade-out' : 'animate-fade-in'
    }`}>
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-lg sm:text-xl">🎯</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Exercício</h3>
          <p className="text-sm sm:text-base text-foreground leading-relaxed break-words">{question}</p>
        </div>
      </div>

      <RadioGroup
        value={selectedAnswer}
        onValueChange={setSelectedAnswer}
        disabled={isSubmitted}
        className="space-y-2 sm:space-y-3"
      >
        {displayOptions.map((option, index) => {
          const optionId = `option-${index}`;
          const isThisCorrect = option === correctAnswer;
          const isSelected = selectedAnswer === option;
          
          let borderColor = "border-border";
          let bgColor = "bg-background";
          
          if (isSubmitted) {
            if (isThisCorrect) {
              borderColor = "border-success";
              bgColor = "bg-success/5";
            } else if (isSelected && !isCorrect) {
              borderColor = "border-destructive";
              bgColor = "bg-destructive/5";
            }
          } else if (isSelected) {
            borderColor = "border-primary";
            bgColor = "bg-primary/5";
          }

          return (
            <div
              key={optionId}
              className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${borderColor} ${bgColor} ${
                !isSubmitted ? "hover:border-primary/50 cursor-pointer" : ""
              }`}
            >
              <RadioGroupItem value={option} id={optionId} />
              <Label
                htmlFor={optionId}
                className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed break-words"
              >
                {option}
              </Label>
              {isSubmitted && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-success animate-scale-in" />
              )}
              {isSubmitted && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-destructive animate-scale-in" />
              )}
            </div>
          );
        })}
      </RadioGroup>

      <div ref={feedbackRef}>
        {!isSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="w-full h-10 sm:h-12 text-sm sm:text-base"
            size="lg"
          >
            Confirmar Resposta
          </Button>
        ) : isCorrect ? (
          <div
            className="p-3 sm:p-4 rounded-lg border-2 animate-fade-in bg-success/5 border-success/20"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold mb-1 text-sm sm:text-base">Correto! 🎉</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <div
              className="p-3 sm:p-4 rounded-lg border-2 animate-fade-in bg-destructive/5 border-destructive/20"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1 text-sm sm:text-base">Não foi dessa vez</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                    {explanation}
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="w-full h-10 sm:h-12 text-sm sm:text-base"
              size="lg"
            >
              Tentar Novamente
            </Button>
            <button
              onClick={handleContinue}
              className="w-full text-center text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Pular e continuar →
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};