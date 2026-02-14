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

  // Detectar mudanças e ativar brilho
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
      className="relative overflow-hidden border-b transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 40%, #A855F7 70%, #D946A8 100%)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
      }}
    >
      {/* Textura de pontos sutil */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-2 xs:py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 xs:gap-3 sm:gap-4">
          {/* Lado esquerdo - Título */}
          <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Zap className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white drop-shadow-lg" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-white font-semibold uppercase tracking-wide drop-shadow-md">Seu Progresso</p>
            </div>
          </div>

          {/* Lado direito - Stats */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-6 overflow-x-auto flex-shrink">
            {/* Power Score */}
            <div className={`flex items-center gap-1.5 xs:gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 border border-white/20 hover:bg-white/20 transition-all flex-shrink-0 ${powerGlow ? 'animate-pulse shadow-lg shadow-sky-400/50' : ''}`}>
              <Zap className={`w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white drop-shadow-lg transition-all flex-shrink-0 ${powerGlow ? 'scale-125 drop-shadow-2xl' : ''}`} />
              <div className="flex flex-col items-start">
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-white/90 uppercase tracking-wider font-semibold hidden sm:block drop-shadow">Power</span>
                <span className={`text-sm xs:text-base sm:text-lg font-bold text-white leading-none drop-shadow-lg transition-all ${powerGlow ? 'scale-110' : ''}`}>{powerScore}</span>
              </div>
            </div>

            {/* Coins */}
            <div className={`flex items-center gap-1.5 xs:gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 border border-white/20 hover:bg-white/20 transition-all flex-shrink-0 ${coinsGlow ? 'animate-pulse shadow-lg shadow-amber-400/50' : ''}`}>
              <Coins className={`w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white drop-shadow-lg transition-all flex-shrink-0 ${coinsGlow ? 'scale-125 drop-shadow-2xl' : ''}`} />
              <div className="flex flex-col items-start">
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-white/90 uppercase tracking-wider font-semibold hidden sm:block drop-shadow">Créditos</span>
                <span className={`text-sm xs:text-base sm:text-lg font-bold text-white leading-none drop-shadow-lg transition-all ${coinsGlow ? 'scale-110' : ''}`}>{coins}</span>
              </div>
            </div>

            {/* Patente */}
            <div className={`flex items-center gap-1.5 xs:gap-2 rounded-lg px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 border ${patentColor} hover:scale-105 transition-transform flex-shrink-0`}>
              <Award className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden lg:inline text-[10px] xs:text-xs font-semibold whitespace-nowrap">
                {patentName}
              </span>
              <span className="lg:hidden text-[10px] xs:text-xs font-semibold whitespace-nowrap">
                Nv{patentLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
