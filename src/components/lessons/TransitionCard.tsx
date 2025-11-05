import { Button } from '@/components/ui/button';

interface TransitionCardProps {
  title: string;
  description?: string;
  buttonText?: string;
  onContinue: () => void;
}

export function TransitionCard({ 
  title, 
  description = 'Agora vamos fixar o que você aprendeu com exercícios práticos.',
  buttonText = '🎯 Ir para Exercícios',
  onContinue 
}: TransitionCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <img 
        src="/maia-avatar-v3.png" 
        alt="MAIA" 
        className="w-32 h-32 mb-6 animate-bounce" 
      />
      <h3 className="text-3xl font-bold mb-4 text-center">{title}</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        {description}
      </p>
      <Button 
        onClick={onContinue}
        size="lg"
        className="px-8 py-6 text-lg font-bold"
      >
        {buttonText}
      </Button>
    </div>
  );
}
