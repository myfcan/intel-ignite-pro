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
          <DialogTitle className="text-xl font-bold text-center">
            Desbloquear Prompt Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Opção: Usar Créditos */}
          {promptId && categoryId && (
            <div className="border-2 border-amber-300 rounded-lg p-4 bg-amber-50/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-amber-900">Usar Créditos</h3>
                  <p className="text-xs text-amber-700 mt-1">
                    Use seus créditos ganhos para desbloquear este prompt
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-amber-900">{stats?.coins || 0}</span>
                    <span className="text-xs text-amber-600">créditos disponíveis</span>
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    Necessário: <span className="font-semibold">{requiredCoins}</span> créditos
                  </div>
                </div>
              </div>
              <button
                onClick={handleUnlockWithCredits}
                disabled={!hasEnoughCoins || isUnlocking}
                className="w-full mt-4 py-2.5 px-4 rounded-lg font-medium text-amber-700 border-2 border-amber-400 bg-white hover:bg-amber-50 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUnlocking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
                    Desbloqueando...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    Usar {requiredCoins.toLocaleString('pt-BR')} Créditos
                  </>
                )}
              </button>
              {!hasEnoughCoins && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  Você precisa de mais {(requiredCoins - (stats?.coins || 0)).toLocaleString('pt-BR')} créditos
                </p>
              )}
            </div>
          )}

          {/* Divider */}
          {promptId && categoryId && (
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400 font-medium">ou</span>
              </div>
            </div>
          )}

          {/* Opção: Upgrade Premium */}
          <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-purple-900">Plano Premium</h3>
                <ul className="mt-2 space-y-1.5">
                  <li className="text-xs text-purple-700 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                    Todos os prompts desbloqueados
                  </li>
                  <li className="text-xs text-purple-700 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                    Acesso ilimitado
                  </li>
                  <li className="text-xs text-purple-700 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                    Novos prompts toda semana
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              className="w-full mt-4 py-2.5 px-4 rounded-lg font-medium text-purple-700 border-2 border-purple-400 bg-white hover:bg-purple-50 text-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Fazer Upgrade
            </button>
          </div>

          {/* Botão Continuar Grátis */}
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Continuar com plano grátis
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
