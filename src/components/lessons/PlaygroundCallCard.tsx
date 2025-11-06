import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PlaygroundCallCardProps {
  title: string;
  description: string;
  onOpen: () => void;
  onSkip: () => void;
}

export function PlaygroundCallCard({ title, description, onOpen, onSkip }: PlaygroundCallCardProps) {
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-500">
      <Card className="max-w-lg w-full p-8 animate-in zoom-in-95 duration-500 shadow-2xl">
        <div className="flex justify-center mb-6">
          <img 
            src="/maia-avatar-v3.png" 
            alt="MAIA" 
            className="w-24 h-24 rounded-full shadow-xl ring-4 ring-primary/20 animate-in zoom-in-95 duration-700" 
          />
        </div>
        
        <h3 className="text-2xl font-bold text-center mb-3 text-foreground">
          🎮 {title}
        </h3>
        
        <p className="text-center text-muted-foreground mb-8 leading-relaxed text-base">
          {description}
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={onOpen} 
            className="w-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all" 
            size="lg"
          >
            🚀 Vamos lá!
          </Button>
          
          <Button 
            onClick={onSkip} 
            variant="ghost" 
            className="w-full text-sm hover:bg-muted/50" 
            size="sm"
          >
            ⏭️ Deixar pra depois (continuar aula)
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          💡 Leva só 2 minutos e é super interessante!
        </p>
      </Card>
    </div>
  );
}
