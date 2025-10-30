import { Button } from '@/components/ui/button';

interface ReassuranceScreenProps {
  onContinue: () => void;
}

export const ReassuranceScreen = ({ onContinue }: ReassuranceScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">🤝</div>
        <h1 className="text-3xl font-bold mb-4">
          Você não está sozinho!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Muitas pessoas têm medo de serem substituídas pela IA, mas a verdade é:
        </p>
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 text-left space-y-4">
          <p className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <span>Quem domina IA <strong>não será substituído</strong></span>
          </p>
          <p className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <span>IA é uma <strong>ferramenta</strong>, não um substituto</span>
          </p>
          <p className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <span>Profissionais que usam IA são <strong>10x mais produtivos</strong></span>
          </p>
        </div>
        <p className="text-gray-600 mb-8">
          Nossa missão é te preparar para usar IA com confiança e se destacar no mercado! 🚀
        </p>
        <Button onClick={onContinue} size="lg" className="w-full">
          Continuar Minha Jornada →
        </Button>
      </div>
    </div>
  );
};
