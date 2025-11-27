import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2 } from "lucide-react";

interface LessonCompletionSummaryProps {
  lessonTitle: string;
  exerciseScores: number[];
  onContinue: () => void;
  totalExercises: number;
}

export const LessonCompletionSummary = ({
  lessonTitle,
  exerciseScores,
  onContinue,
  totalExercises,
}: LessonCompletionSummaryProps) => {
  // Calcular desempenho
  const correctExercises = exerciseScores.filter(score => score >= 70).length;
  const percentage = totalExercises > 0 
    ? Math.round((correctExercises / totalExercises) * 100) 
    : 100;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="p-8 text-center space-y-6 animate-fade-in border-primary/20 max-w-md mx-auto">
        {/* Ícone de sucesso grande */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center border-4 border-success/20">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">
            🎉 Parabéns!
          </h2>
          <p className="text-muted-foreground text-base">
            Você completou a aula
          </p>
          <p className="text-primary font-bold text-xl mt-3 break-words leading-tight">
            {lessonTitle}
          </p>
        </div>

        {/* Desempenho de Exercícios */}
        <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Desempenho de Exercícios
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {percentage}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de acerto
              </p>
            </div>
            
            <div className="w-px h-14 bg-border" />
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {correctExercises}/{totalExercises}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                corretas
              </p>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500" />
            <div>
              <h3 className="font-bold text-lg text-amber-700 dark:text-amber-400">
                Aula Dominada
              </h3>
              <p className="text-xs text-muted-foreground">
                Conteúdo concluído com sucesso
              </p>
            </div>
          </div>
        </div>

        {/* Botão */}
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-14 text-lg font-semibold"
        >
          Ver Recompensas
        </Button>
      </Card>
    </div>
  );
};
