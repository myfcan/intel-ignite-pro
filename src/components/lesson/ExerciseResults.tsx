import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, RefreshCw } from "lucide-react";

interface ExerciseResultsProps {
  totalQuestions: number;
  correctAnswers: number;
  onTryAgain: () => void;
  onContinue: () => void;
}

export const ExerciseResults = ({
  totalQuestions,
  correctAnswers,
  onTryAgain,
  onContinue,
}: ExerciseResultsProps) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const isGoodScore = percentage >= 70;

  return (
    <Card className="p-8 text-center space-y-6 animate-fade-in border-2 border-primary/20">
      {/* Ícone */}
      <div className="flex justify-center">
        {isGoodScore ? (
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-success" />
          </div>
        ) : (
          <div className="w-24 h-24 bg-warning/10 rounded-full flex items-center justify-center">
            <TrendingUp className="w-12 h-12 text-warning" />
          </div>
        )}
      </div>

      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold mb-2">
          {isGoodScore ? "Parabéns! 🎉" : "Continue Praticando! 💪"}
        </h2>
        <p className="text-muted-foreground text-lg">
          {isGoodScore
            ? "Você dominou o conteúdo desta aula!"
            : "Revise o conteúdo e tente novamente"}
        </p>
      </div>

      {/* Pontuação */}
      <div className="bg-secondary rounded-lg p-6">
        <div className="text-5xl font-bold text-primary mb-2">
          {percentage}%
        </div>
        <p className="text-muted-foreground">
          {correctAnswers} de {totalQuestions} questões corretas
        </p>
      </div>

      {/* Mensagem motivacional */}
      <div className="text-sm text-muted-foreground max-w-md mx-auto">
        {isGoodScore ? (
          <p>
            Excelente trabalho! Você está pronto para avançar. Continue assim e
            logo dominará todos os conceitos de IA! 🚀
          </p>
        ) : (
          <p>
            Não desanime! Revisar o conteúdo e tentar novamente é parte do
            processo de aprendizado. Cada tentativa te deixa mais perto do
            sucesso! 📚
          </p>
        )}
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button
          variant="outline"
          onClick={onTryAgain}
          className="gap-2 h-12 min-w-[200px]"
        >
          <RefreshCw className="w-5 h-5" />
          Tentar Novamente
        </Button>
        <Button
          onClick={onContinue}
          className="gap-2 h-12 min-w-[200px]"
          disabled={!isGoodScore}
        >
          Continuar
        </Button>
      </div>

      {!isGoodScore && (
        <p className="text-xs text-muted-foreground">
          Complete com pelo menos 70% para continuar
        </p>
      )}
    </Card>
  );
};
