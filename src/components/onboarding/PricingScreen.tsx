import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  readiness_level: string;
}

interface PricingScreenProps {
  profile: UserProfile | null;
}

export const PricingScreen = ({ profile }: PricingScreenProps) => {
  const [timeLeft, setTimeLeft] = useState(600);
  const [currentPurchase, setCurrentPurchase] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const purchases = [
    'chris.al*** escolheu 4 semanas',
    'michael.ta*** escolheu 12 semanas',
    'emily.ba*** escolheu 1 semana'
  ];

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    const purchaseTimer = setInterval(() => {
      setCurrentPurchase(prev => (prev + 1) % purchases.length);
    }, 12000);

    return () => {
      clearInterval(timer);
      clearInterval(purchaseTimer);
    };
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSelectPlan = (planName: string) => {
    toast({
      title: "Plano selecionado!",
      description: `Você escolheu o plano ${planName}. Redirecionando para o dashboard...`,
    });
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  const plans = [
    { name: '1 Semana', oldPrice: 'R$ 27,80', newPrice: 'R$ 13,90', perDay: 'R$ 1,99/dia' },
    { 
      name: '4 Semanas', 
      badge: '👑 MAIS POPULAR!', 
      oldPrice: 'R$ 79,60', 
      newPrice: 'R$ 39,80', 
      perDay: 'R$ 1,43/dia', 
      savings: 'Economize R$ 15,80', 
      highlighted: true 
    },
    { name: '12 Semanas', oldPrice: 'R$ 159,20', newPrice: 'R$ 79,60', perDay: 'R$ 0,96/dia', savings: 'Economize R$ 46,90' }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Escolha Seu Plano</h1>

        {/* Urgency Timer */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 rounded-xl text-center mb-6">
          <p className="text-white font-semibold mb-2">⏰ Desconto termina em:</p>
          <div className="flex justify-center gap-2 text-white">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <div className="text-3xl font-bold">{String(minutes).padStart(2, '0')}</div>
              <div className="text-xs">min</div>
            </div>
            <div className="text-3xl font-bold">:</div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <div className="text-3xl font-bold">{String(seconds).padStart(2, '0')}</div>
              <div className="text-xs">seg</div>
            </div>
          </div>
        </div>

        {/* Coupon */}
        <div className="bg-green-100 border-2 border-green-400 p-4 rounded-xl text-center mb-8">
          ✅ Seu cupom FOI APLICADO! <span className="font-bold">-50%</span>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`bg-white p-6 rounded-xl shadow-lg transition-transform ${
                plan.highlighted ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.badge && (
                <div className="bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded-full mb-4 inline-block">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="mb-4">
                <div className="text-gray-400 line-through">{plan.oldPrice}</div>
                <div className="text-4xl font-bold text-blue-600">{plan.newPrice}</div>
                <div className="text-gray-600">{plan.perDay}</div>
              </div>
              {plan.savings && <p className="text-green-600 font-semibold mb-4">💰 {plan.savings}</p>}
              <Button 
                className="w-full" 
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.name)}
              >
                Escolher Plano
              </Button>
            </div>
          ))}
        </div>

        {/* Live Purchases */}
        <div className="fixed bottom-8 left-8 bg-white p-4 rounded-lg shadow-xl animate-pulse z-50">
          💬 {purchases[currentPurchase]}
        </div>

        {/* Guarantees */}
        <div className="bg-white p-6 rounded-xl text-center space-y-2 mb-8">
          <p>✅ Garantia de 7 dias</p>
          <p>✅ Acesso vitalício ao conteúdo</p>
          <p>✅ Atualizações gratuitas</p>
        </div>

        <p className="text-center text-gray-500">🔒 Pagamento 100% seguro</p>
      </div>
    </div>
  );
};
