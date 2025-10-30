import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Info } from "lucide-react";

interface MultipleChoiceExerciseProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  onComplete: () => void;
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

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      // Espera mostrar o feedback, depois faz fade out
      setTimeout(() => {
        setIsFadingOut(true);
        // Aguarda animação de fade out completar antes de chamar onComplete
        setTimeout(() => {
          onComplete();
        }, 300);
      }, 1500);
    }
  };

  return (
    <Card className={`p-6 space-y-4 border-2 border-primary/10 transition-all duration-300 ${
      isFadingOut ? 'animate-fade-out' : 'animate-fade-in'
    }`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🎯</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Exercício</h3>
          <p className="text-base text-foreground leading-relaxed">{question}</p>
        </div>
      </div>

      <RadioGroup
        value={selectedAnswer}
        onValueChange={setSelectedAnswer}
        disabled={isSubmitted}
        className="space-y-3"
      >
        {options.map((option, index) => {
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
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${borderColor} ${bgColor} ${
                !isSubmitted ? "hover:border-primary/50 cursor-pointer" : ""
              }`}
            >
              <RadioGroupItem value={option} id={optionId} />
              <Label
                htmlFor={optionId}
                className="flex-1 cursor-pointer text-base leading-relaxed"
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

      {!isSubmitted ? (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full h-12 text-base"
          size="lg"
        >
          Confirmar Resposta
        </Button>
      ) : (
        <div
          className={`p-4 rounded-lg border-2 animate-fade-in ${
            isCorrect
              ? "bg-success/5 border-success/20"
              : "bg-destructive/5 border-destructive/20"
          }`}
        >
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold mb-1">
                {isCorrect ? "Correto! 🎉" : "Não foi dessa vez"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};