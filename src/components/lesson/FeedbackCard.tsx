import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Lightbulb } from "lucide-react";

interface FeedbackCardProps {
  feedbackText: string;
  suggestions?: string[];
  onApplySuggestion?: () => void;
}

export const FeedbackCard = ({
  feedbackText,
  suggestions,
  onApplySuggestion,
}: FeedbackCardProps) => {
  return (
    <Card className="p-6 space-y-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">🤖 Feedback da Liv</h3>
          <p className="text-base text-foreground leading-relaxed">{feedbackText}</p>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Lightbulb className="w-4 h-4" />
            <span>Sugestões de Melhoria</span>
          </div>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm bg-background/50 p-3 rounded-lg"
              >
                <span className="text-accent font-semibold">•</span>
                <span className="flex-1">{suggestion}</span>
              </li>
            ))}
          </ul>
          {onApplySuggestion && (
            <Button
              onClick={onApplySuggestion}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Aplicar Sugestões
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};