import React, { useEffect, useState } from 'react';
import { Trophy, Zap, Coins, TrendingUp, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { RewardCelebration } from './RewardCelebration';
import { Button } from '@/components/ui/button';

type LessonResultCardProps = {
  xpDelta: number;
  coinsDelta: number;
  newPowerScore: number;
  newCoins: number;
  patentName: string;
  isNewPatent?: boolean;
  nextPatentThreshold?: number;
  onContinue: () => void;
  onBackToTrail: () => void;
};

// Hook personalizado para animar contadores
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function para suavizar a animação
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      setCount(Math.floor(end * easeOut));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

export const LessonResultCard: React.FC<LessonResultCardProps> = ({
  xpDelta,
  coinsDelta,
  newPowerScore,
  newCoins,
  patentName,
  isNewPatent = false,
  nextPatentThreshold,
  onContinue,
  onBackToTrail,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  
  // Animar os contadores
  const animatedXP = useCountUp(xpDelta, 1200);
  const animatedCoins = useCountUp(coinsDelta, 1200);
  const animatedPowerScore = useCountUp(newPowerScore, 1500);
  const animatedTotalCoins = useCountUp(newCoins, 1500);

  useEffect(() => {
    // Trigger confetti após um pequeno delay
    const confettiTimer = setTimeout(() => {
      setShowConfetti(true);
    }, 300);
    
    // Trigger moedas caindo após delay
    const coinsTimer = setTimeout(() => {
      setShowCoins(true);
    }, 500);
    
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(coinsTimer);
    };
  }, []);

  const progressData = nextPatentThreshold ? {
    progress: Math.min((newPowerScore / nextPatentThreshold) * 100, 100),
    remaining: nextPatentThreshold - newPowerScore
  } : null;

  return (
    <>
      <RewardCelebration 
        type={isNewPatent ? 'patent' : 'lesson'} 
        trigger={showConfetti} 
      />
      
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Moedas caindo animadas */}
        {showCoins && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-coin-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
            ))}
          </div>
        )}
        
        <div className="relative max-w-lg w-full rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-6 py-6 shadow-2xl animate-in fade-in zoom-in duration-300">
          <button onClick={onBackToTrail} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center animate-pulse">
              <Trophy className="w-8 h-8 text-sky-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-50 mb-2">
            {isNewPatent ? '🎉 Nova Patente Desbloqueada!' : '✨ Aula Concluída'}
          </h2>

          {isNewPatent && (
            <p className="text-center text-sky-300 text-sm mb-4 font-medium">
              Você subiu para <span className="font-bold">{patentName}</span>. Poucos alunos chegam aqui!
            </p>
          )}

          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/50">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center animate-pulse">
                  <Zap className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-sky-300 tabular-nums">+{animatedXP}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">Power Score</p>
                </div>
              </div>

              <div className="w-px h-12 bg-slate-700" />

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-pulse">
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-300 tabular-nums">+{animatedCoins}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">Créditos IA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Power Score total</span>
              <span className="font-semibold text-sky-300 tabular-nums">{animatedPowerScore}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Créditos de IA</span>
              <span className="font-semibold text-amber-300 tabular-nums">{animatedTotalCoins}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Patente atual</span>
              <span className="font-semibold text-slate-200">{patentName}</span>
            </div>

            {progressData && progressData.remaining > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Próxima patente
                  </span>
                  <span>{progressData.remaining} XP restantes</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-purple-500 transition-all duration-700 ease-out" style={{ width: `${progressData.progress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={onBackToTrail}
              variant="outline"
              className="flex-1 h-12 border-slate-700 hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={onContinue}
              className="flex-1 h-12 bg-sky-600 hover:bg-sky-500"
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
