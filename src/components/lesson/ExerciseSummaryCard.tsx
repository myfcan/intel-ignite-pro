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

      {/* Pontuação compacta */}
      <div className="bg-secondary/50 rounded-lg p-3">
        <div className="flex items-center justify-center gap-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {percentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de acerto
            </p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {correctAnswers}/{totalQuestions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              questões corretas
            </p>
          </div>
        </div>
      </div>

      {/* Botão com efeito visual */}
      <Button
        onClick={onContinue}
        className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
        disabled={!isGoodScore}
      >
        Ver Recompensas 🎁
      </Button>

      {!isGoodScore && (
        <p className="text-xs text-muted-foreground">
          Mínimo de 70% para continuar
        </p>
      )}
    </Card>
  );
};
