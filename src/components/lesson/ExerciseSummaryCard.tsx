import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface ExerciseSummaryCardProps {
  totalQuestions: number;
  correctAnswers: number;
  onContinue: () => void;
}

export const ExerciseSummaryCard = ({
  totalQuestions,
  correctAnswers,
  onContinue,
}: ExerciseSummaryCardProps) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const isGoodScore = percentage >= 70;

  return (
    <Card className="p-6 text-center space-y-4 animate-fade-in border-primary/20 max-w-md mx-auto">
      {/* Ícone de resultado */}
      <div className="flex justify-center">
        {isGoodScore ? (
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-warning" />
          </div>
        )}
      </div>

      {/* Título */}
      <h3 className="text-xl font-bold">
        {isGoodScore ? "Exercícios Concluídos!" : "Continue Praticando!"}
      </h3>

      {/* Pontuação */}
      <div className="bg-secondary rounded-lg p-4">
        <div className="text-4xl font-bold text-primary mb-1">
          {percentage}%
        </div>
        <p className="text-sm text-muted-foreground">
          {correctAnswers} de {totalQuestions} corretas
        </p>
      </div>

      {/* Botão */}
      <Button
        onClick={onContinue}
        className="w-full h-12"
        disabled={!isGoodScore}
      >
        Avançar
      </Button>

      {!isGoodScore && (
        <p className="text-xs text-muted-foreground">
          Mínimo de 70% para continuar
        </p>
      )}
    </Card>
  );
};
