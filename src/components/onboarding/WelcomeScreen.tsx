import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md text-center relative">
        <h1 className="text-4xl font-bold mb-4">
          Domine a IA e Transforme Sua Vida em 28 Dias
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Vamos personalizar sua jornada com algumas perguntas rápidas
        </p>
        <p className="text-sm text-gray-500 mb-8">Leva apenas 2 minutos</p>
        <Button onClick={onStart} size="lg" className="w-full">
          Começar Agora
        </Button>
        <p className="text-xs text-gray-400 mt-4">Seus dados estão seguros</p>
      </div>
    </div>
  );
};
