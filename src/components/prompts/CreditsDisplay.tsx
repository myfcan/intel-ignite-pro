import { Coins } from 'lucide-react';
import { useUserGamification } from '@/hooks/useUserGamification';
import { Badge } from '@/components/ui/badge';

export function CreditsDisplay() {
  const { stats, isLoading } = useUserGamification();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl border-2 border-amber-200">
        <Coins className="w-5 h-5 text-amber-600 animate-pulse" />
        <div className="animate-pulse bg-amber-200 h-5 w-16 rounded"></div>
      </div>
    );
  }

  const coins = stats?.coins || 0;
  const canUnlockPrompt = coins >= 1000;

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-colors">
      <Coins className="w-5 h-5 text-amber-600" />
      <div className="flex flex-col">
        <span className="text-xs text-gray-600 leading-none">Seus créditos</span>
        <span className={`text-lg font-bold leading-none ${canUnlockPrompt ? 'text-green-600' : 'text-amber-600'}`}>
          {coins.toLocaleString('pt-BR')}
        </span>
      </div>
      {canUnlockPrompt && (
        <Badge className="bg-green-500 text-white text-xs ml-2">
          Pode desbloquear!
        </Badge>
      )}
    </div>
  );
}
