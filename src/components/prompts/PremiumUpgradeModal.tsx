import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Coins, Sparkles } from 'lucide-react';
import { useState } from 'react';
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
          <DialogTitle className="text-xl font-bold text-center mb-2">
            Desbloquear Prompt Premium
          </DialogTitle>
          <p className="text-sm text-gray-500 text-center">Escolha como você quer acessar este conteúdo</p>
        </DialogHeader>

        <div className="space-y-5 py-6">
          {/* Opção: Usar Créditos */}
          {promptId && categoryId && (
            <button
              onClick={handleUnlockWithCredits}
              disabled={!hasEnoughCoins || isUnlocking}
              className="group relative w-full p-5 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                boxShadow: '0 4px 16px rgba(251, 191, 36, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-amber-900 text-base">Usar Créditos</h3>
                      <p className="text-xs text-amber-700 mt-0.5">Apenas este prompt</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-900">1.000</div>
                    <div className="text-[10px] text-amber-700 uppercase tracking-wide">Créditos</div>
                  </div>
                </div>

                {/* Saldo */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-amber-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-800 font-medium">Seu saldo atual</span>
                    <span className={`text-sm font-bold ${hasEnoughCoins ? 'text-green-700' : 'text-red-700'}`}>
                      {stats?.coins || 0} créditos
                    </span>
                  </div>
                </div>

                {!hasEnoughCoins && (
                  <p className="text-xs text-amber-700 mt-2 text-center font-medium">
                    Você precisa de mais {(requiredCoins - (stats?.coins || 0)).toLocaleString('pt-BR')} créditos
                  </p>
                )}

                {isUnlocking && (
                  <div className="absolute inset-0 bg-amber-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-3 border-amber-700 border-t-transparent rounded-full animate-spin" />
                      <span className="text-amber-900 font-semibold">Desbloqueando...</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          )}

          {/* Divider */}
          {promptId && categoryId && (
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider">ou</span>
              </div>
            </div>
          )}

          {/* Opção: Upgrade Premium */}
          <button
            onClick={handleUpgrade}
            className="group relative w-full p-5 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FAE8FF 0%, #F3E8FF 100%)',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.2)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-purple-900 text-base">Plano Premium</h3>
                  <p className="text-xs text-purple-700 mt-0.5">Acesso ilimitado</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-purple-200/50 space-y-1.5">
                {['Todos os prompts desbloqueados', 'Novos prompts toda semana', 'Suporte prioritário'].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-purple-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>

          {/* Footer */}
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Continuar com plano grátis
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
