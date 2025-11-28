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
          <DialogTitle className="text-lg font-bold text-center text-gray-900">
            Desbloquear Prompt Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Opção: Usar Créditos */}
          {promptId && categoryId && (
            <button
              onClick={handleUnlockWithCredits}
              disabled={!hasEnoughCoins || isUnlocking}
              className="group relative w-full p-3.5 rounded-xl overflow-hidden transition-all hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)',
                boxShadow: '0 2px 8px rgba(251, 191, 36, 0.25)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                      <Coins className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-amber-900 text-sm">Usar Créditos</h3>
                      <p className="text-[10px] text-amber-800 font-medium">Apenas este prompt</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-900">1.000</div>
                    <div className="text-[9px] text-amber-800 uppercase tracking-wide font-semibold">Créditos</div>
                  </div>
                </div>

                {/* Saldo */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-amber-300/50 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-900 font-semibold">Seu saldo</span>
                    <span className={`text-xs font-bold ${hasEnoughCoins ? 'text-green-700' : 'text-red-700'}`}>
                      {stats?.coins || 0} créditos
                    </span>
                  </div>
                </div>

                {!hasEnoughCoins && (
                  <p className="text-[10px] text-amber-900 mt-1.5 text-center font-semibold">
                    Faltam {(requiredCoins - (stats?.coins || 0)).toLocaleString('pt-BR')} créditos
                  </p>
                )}

                {isUnlocking && (
                  <div className="absolute inset-0 bg-amber-200/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
                      <span className="text-amber-900 text-sm font-semibold">Desbloqueando...</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          )}

          {/* Divider */}
          {promptId && categoryId && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[9px] text-gray-500 font-semibold uppercase tracking-wider">ou</span>
              </div>
            </div>
          )}

          {/* Opção: Upgrade Premium */}
          <button
            onClick={handleUpgrade}
            className="group relative w-full p-3.5 rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #E9D5FF 0%, #DDD6FE 100%)',
              boxShadow: '0 2px 8px rgba(168, 85, 247, 0.25)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-purple-900 text-sm">Plano Premium</h3>
                  <p className="text-[10px] text-purple-800 font-medium">Acesso ilimitado</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-purple-300/50 shadow-sm space-y-1">
                {['Todos os prompts', 'Novos toda semana', 'Suporte prioritário'].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-purple-900 font-medium">
                    <div className="w-1 h-1 rounded-full bg-purple-600" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>

          {/* Footer */}
          <button
            onClick={onClose}
            className="w-full py-1.5 text-[10px] text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            Continuar com plano grátis
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
