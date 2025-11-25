import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Lock, Star, Zap, Crown, CheckCircle2 } from 'lucide-react';

interface PremiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumUpgradeModal({ open, onClose }: PremiumUpgradeModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // Navegar para página de upgrade/pricing
    navigate('/curso-exclusivo');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-amber-500" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Conteúdo Premium
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Hero Message */}
          <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
            <Lock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Este prompt faz parte do conteúdo <strong>Premium</strong>
            </p>
            <p className="text-gray-600">
              Faça upgrade para desbloquear <strong>todos os 30 prompts</strong> de Renda Extra
              e muito mais!
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              O que você ganha com o Premium:
            </h4>
            
            <div className="space-y-2">
              {[
                'Acesso total a 300+ prompts profissionais',
                'Novos prompts adicionados toda semana',
                'Modelos de negócios validados',
                'Estratégias comprovadas de monetização',
                'Suporte prioritário e comunidade exclusiva'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge className="bg-amber-500 text-white mb-2">
                  <Zap className="w-3 h-3 mr-1" />
                  Oferta Especial
                </Badge>
                <h3 className="text-2xl font-bold">Plano Ultra</h3>
                <p className="text-purple-100 text-sm">Acesso completo à plataforma</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">R$ 97</div>
                <div className="text-sm text-purple-200">por mês</div>
              </div>
            </div>
            
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg py-6"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Fazer Upgrade Agora
            </Button>
            
            <p className="text-center text-purple-100 text-xs mt-3">
              ✨ Comece hoje e tenha acesso imediato a todo conteúdo
            </p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Continuar com plano gratuito
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
