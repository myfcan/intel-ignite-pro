import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { PlaygroundConfig } from '@/types/guidedLesson';

interface PlaygroundMidLessonProps {
  config: PlaygroundConfig;
  onComplete: (answer: string | null) => void;
}

export function PlaygroundMidLesson({ config, onComplete }: PlaygroundMidLessonProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');

  const handleContinue = () => {
    if (selectedOption) {
      onComplete(selectedOption);
    }
  };

  const handleSkip = () => {
    onComplete(null);
  };

  return (
    <Card className="max-w-xl w-full mx-4 p-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Avatar da MAIA */}
      <div className="flex justify-center mb-6">
        <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-lg">
          <AvatarImage src="/maia-avatar-v3.png" alt="MAIA" />
        </Avatar>
      </div>

      {/* Mensagem da MAIA */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">🎮 Hora de praticar!</h3>
        <p className="text-muted-foreground">{config.instruction}</p>
      </div>

      {/* Opções de múltipla escolha */}
      <div className="space-y-4 mb-6">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          {config.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                selectedOption === option
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
              onClick={() => setSelectedOption(option)}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer font-medium"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Campo opcional "Por quê?" */}
      {selectedOption && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <Label htmlFor="reasoning" className="text-sm text-muted-foreground mb-2 block">
            Por quê você escolheu essa opção? (opcional)
          </Label>
          <Textarea
            id="reasoning"
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explique seu raciocínio..."
            className="min-h-[80px] resize-none"
          />
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="flex-1"
        >
          ⏭️ Pular
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedOption}
          className="flex-1"
        >
          ✅ Continuar Aula
        </Button>
      </div>

      {/* Mensagem informativa */}
      <p className="text-xs text-center text-muted-foreground mt-4">
        💡 Este exercício não afeta sua nota, é apenas para fixar o aprendizado!
      </p>
    </Card>
  );
}
