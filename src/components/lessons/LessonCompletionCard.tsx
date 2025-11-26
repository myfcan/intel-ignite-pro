import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2 } from "lucide-react";

interface LessonCompletionCardProps {
  lessonTitle: string;
  onContinue: () => void;
}

export const LessonCompletionCard = ({
  lessonTitle,
  onContinue,
}: LessonCompletionCardProps) => {
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
