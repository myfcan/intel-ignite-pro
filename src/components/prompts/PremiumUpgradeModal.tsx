import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, CheckCircle2 } from 'lucide-react';

interface PremiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumUpgradeModal({ open, onClose }: PremiumUpgradeModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/curso-exclusivo');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Hero Message */}
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Conteúdo <span className="text-purple-600">Premium</span>
            </p>
            <p className="text-sm text-gray-600">
              Desbloqueie <strong>todos os 30 prompts</strong> de Renda Extra
            </p>
          </div>

          {/* Benefits - Compact */}
          <div className="space-y-2">
            {[
              'Acesso a 300+ prompts profissionais',
              'Novos prompts toda semana',
              'Estratégias de monetização validadas'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm opacity-90">Plano Ultra</p>
                <p className="text-2xl font-bold">R$ 97<span className="text-sm font-normal">/mês</span></p>
              </div>
              <Crown className="w-8 h-8 text-amber-300" />
            </div>
            
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold"
              size="lg"
            >
              Fazer Upgrade
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xs underline"
            >
              Continuar com plano gratuito
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
