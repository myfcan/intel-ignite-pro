import React, { useState, useEffect } from 'react';
import { Zap, Coins, Award } from 'lucide-react';

type GamificationHeaderProps = {
  powerScore: number;
  coins: number;
  patentLevel: number;
  patentName: string;
};

const PATENT_COLORS: Record<number, string> = {
  0: 'bg-slate-100 border-slate-300 text-slate-600',
  1: 'bg-blue-50 border-blue-300 text-blue-700',
  2: 'bg-purple-50 border-purple-300 text-purple-700',
  3: 'bg-amber-50 border-amber-400 text-amber-700',
};

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({
  powerScore,
  coins,
  patentLevel,
  patentName,
}) => {
  const patentColor = PATENT_COLORS[patentLevel] || PATENT_COLORS[0];
  const [prevPowerScore, setPrevPowerScore] = useState(powerScore);
  const [prevCoins, setPrevCoins] = useState(coins);
  const [powerGlow, setPowerGlow] = useState(false);
  const [coinsGlow, setCoinsGlow] = useState(false);

  useEffect(() => {
    if (powerScore > prevPowerScore) {
      setPowerGlow(true);
      setTimeout(() => setPowerGlow(false), 1500);
    }
    setPrevPowerScore(powerScore);
  }, [powerScore]);

  useEffect(() => {
    if (coins > prevCoins) {
      setCoinsGlow(true);
      setTimeout(() => setCoinsGlow(false), 1500);
    }
    setPrevCoins(coins);
  }, [coins]);

  return (
    <div
      className="relative overflow-hidden rounded-b-2xl transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #7C3AED 50%, #9333EA 100%)',
        boxShadow: '0 8px 24px -8px rgba(124, 58, 237, 0.3)',
      }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Lado esquerdo */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <p className="hidden sm:block text-xs text-white/90 font-semibold uppercase tracking-wide">
              Seu Progresso
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
            {/* Power Score */}
            <div className={`flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-2.5 sm:px-3 py-1.5 transition-all ${powerGlow ? 'animate-pulse shadow-lg shadow-sky-400/40' : ''}`}>
              <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90 transition-transform ${powerGlow ? 'scale-125' : ''}`} />
              <div className="flex flex-col">
                <span className="hidden sm:block text-[9px] text-white/70 uppercase tracking-wider font-medium leading-none mb-0.5">Power</span>
                <span className={`text-sm sm:text-base font-bold text-white leading-none transition-transform ${powerGlow ? 'scale-110' : ''}`}>{powerScore}</span>
              </div>
            </div>

            {/* Coins */}
            <div className={`flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-2.5 sm:px-3 py-1.5 transition-all ${coinsGlow ? 'animate-pulse shadow-lg shadow-amber-400/40' : ''}`}>
              <Coins className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90 transition-transform ${coinsGlow ? 'scale-125' : ''}`} />
              <div className="flex flex-col">
                <span className="hidden sm:block text-[9px] text-white/70 uppercase tracking-wider font-medium leading-none mb-0.5">Créditos</span>
                <span className={`text-sm sm:text-base font-bold text-white leading-none transition-transform ${coinsGlow ? 'scale-110' : ''}`}>{coins}</span>
              </div>
            </div>

            {/* Patente */}
            <div className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 border ${patentColor} transition-transform hover:scale-105`}>
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden lg:inline text-xs font-semibold whitespace-nowrap">{patentName}</span>
              <span className="lg:hidden text-xs font-semibold whitespace-nowrap">Nv{patentLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
