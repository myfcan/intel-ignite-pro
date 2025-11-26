import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, Target } from "lucide-react";

interface LessonCompletionCardProps {
  lessonTitle: string;
  exerciseScores?: number[];
  onContinue: () => void;
}

export const LessonCompletionCard = ({
  lessonTitle,
  exerciseScores = [],
  onContinue,
}: LessonCompletionCardProps) => {
  // Calcular desempenho geral
  const avgScore = exerciseScores.length > 0 
    ? Math.round(exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length)
    : 100;

  // Função para obter emoji baseado na pontuação
  const getScoreEmoji = (score: number) => {
    if (score === 100) return '🏆';
    if (score >= 80) return '🌟';
    if (score >= 60) return '✅';
    return '📝';
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="p-8 text-center space-y-6 animate-fade-in border-primary/20 max-w-lg mx-auto">
        {/* Ícone de sucesso */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
        </div>

        {/* Título */}
        <div>
          <h2 className="text-3xl font-bold mb-2">
            🎉 Parabéns!
          </h2>
          <p className="text-muted-foreground text-lg">
            Você completou a aula
          </p>
          <p className="text-primary font-semibold text-xl mt-2 break-words">
            {lessonTitle}
          </p>
        </div>

        {/* Badge */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <h3 className="font-bold text-amber-700 dark:text-amber-400">
                Aula Dominada
              </h3>
              <p className="text-sm text-muted-foreground">
                Conteúdo concluído com sucesso
              </p>
            </div>
          </div>
        </div>

        {/* Desempenho nos Exercícios */}
        {exerciseScores.length > 0 && (
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">
                Desempenho nos Exercícios
              </h4>
            </div>
            
            {/* Lista de exercícios */}
            <div className="space-y-2">
              {exerciseScores.map((score, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getScoreEmoji(score)}</span>
                    <span className="text-sm font-medium text-foreground">
                      Exercício {index + 1}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    score === 100 ? 'text-success' : 
                    score >= 80 ? 'text-primary' : 
                    score >= 60 ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {score}%
                  </span>
                </div>
              ))}
            </div>

            {/* Média geral */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Média Geral
                </span>
                <span className="text-lg font-bold text-primary">
                  {avgScore}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botão */}
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-14"
        >
          Ver Recompensas
        </Button>
      </Card>
    </div>
  );
};
