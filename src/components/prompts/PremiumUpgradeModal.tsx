import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, CheckCircle2, Coins, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUserGamification } from '@/hooks/useUserGamification';
import { unlockPromptWithCredits } from '@/services/promptUnlock';
import { toast } from 'sonner';

interface PremiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  promptId?: string;
  categoryId?: string;
  onUnlockSuccess?: () => void;
}

export function PremiumUpgradeModal({ 
  open, 
  onClose, 
  promptId, 
  categoryId,
  onUnlockSuccess 
}: PremiumUpgradeModalProps) {
  const navigate = useNavigate();
  const { stats, refresh: refreshGamification } = useUserGamification();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const requiredCoins = 1000;
  const hasEnoughCoins = (stats?.coins || 0) >= requiredCoins;

  const handleUpgrade = () => {
    navigate('/curso-exclusivo');
    onClose();
  };

  const handleUnlockWithCredits = async () => {
    if (!promptId || !categoryId) {
      toast.error('Erro ao identificar prompt');
      return;
    }

    if (!hasEnoughCoins) {
      toast.error(`Você precisa de ${requiredCoins} créditos para desbloquear este prompt`);
      return;
    }

    setIsUnlocking(true);

    const result = await unlockPromptWithCredits(promptId, categoryId);

    if (result.success) {
      toast.success('🎉 Prompt desbloqueado com sucesso!');
      await refreshGamification();
      onUnlockSuccess?.();
      onClose();
    } else {
      toast.error(result.error || 'Erro ao desbloquear prompt');
    }

    setIsUnlocking(false);
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

          {/* Opção de Créditos - Minimalista */}
          {promptId && categoryId && (
            <div className="border-2 border-amber-200 bg-amber-50/30 rounded-2xl p-5 hover:border-amber-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Desbloquear com Créditos</p>
                    <p className="text-sm text-gray-600 mt-0.5">Apenas este prompt</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">1.000</p>
                  <p className="text-xs text-gray-500">créditos</p>
                </div>
              </div>

              {/* Saldo atual */}
              <div className="bg-white/70 rounded-xl p-3 mb-4 border border-amber-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Seu saldo:</span>
                  <span className={`font-bold ${hasEnoughCoins ? 'text-green-600' : 'text-red-600'}`}>
                    {stats?.coins || 0} créditos
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleUnlockWithCredits}
                disabled={!hasEnoughCoins || isUnlocking}
                className="w-full h-12 rounded-xl font-semibold text-base disabled:opacity-50 border-2 border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200 hover:border-amber-400"
                variant="outline"
              >
                {isUnlocking ? (
                  'Desbloqueando...'
                ) : !hasEnoughCoins ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Créditos Insuficientes
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Usar 1.000 Créditos
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>

          {/* CTA Premium */}
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
            <p className="text-xs text-center mt-2 opacity-80">
              Acesso ilimitado a todos os prompts
            </p>
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
