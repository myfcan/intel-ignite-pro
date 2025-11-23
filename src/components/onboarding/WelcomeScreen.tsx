import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md text-center relative">
        {/* Textura overlay - efeito de camada */}
        <div 
          className="absolute inset-0 opacity-20 rounded-2xl pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,.05) 10px,
                rgba(255,255,255,.05) 20px
              )
            `
          }}
        />
        <h1 className="text-4xl font-bold mb-4">
          Domine a IA e Transforme Sua Vida em 28 Dias
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Vamos personalizar sua jornada com algumas perguntas rápidas
        </p>
        <p className="text-sm text-gray-500 mb-8">⏱️ Leva apenas 2 minutos</p>
        <Button onClick={onStart} size="lg" className="w-full">
          Começar Agora →
        </Button>
        <p className="text-xs text-gray-400 mt-4">🔒 Seus dados estão seguros</p>
      </div>
    </div>
  );
};
