import { Button } from '@/components/ui/button';
import { LivAvatar } from '@/components/LivAvatar';

interface TransitionCardProps {
  title: string;
  description?: string;
  buttonText?: string;
  onContinue: () => void;
  onBack?: () => void;
}

export function TransitionCard({ 
  title, 
  description = 'Agora vamos fixar o que você aprendeu com exercícios práticos.',
  buttonText = '🎯 Ir para Exercícios',
  onContinue,
  onBack
}: TransitionCardProps) {
  return (
    <div 
      data-testid="transition-card"
      className="flex flex-col items-center justify-center min-h-screen p-8"
    >
      <LivAvatar 
        size="large"
        useVideo={false}
        className="mb-6 animate-bounce"
      />
      <h3 className="text-3xl font-bold mb-4 text-center">{title}</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        {description}
      </p>
      <div className="space-y-3">
        <Button 
          onClick={onContinue}
          size="lg"
          className="w-full px-8 py-6 text-lg font-bold"
          data-testid="transition-continue"
        >
          {buttonText}
        </Button>
        {onBack && (
          <Button 
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="w-full"
            data-testid="transition-back"
          >
            ⬅️ Voltar para a aula
          </Button>
        )}
      </div>
    </div>
  );
}
