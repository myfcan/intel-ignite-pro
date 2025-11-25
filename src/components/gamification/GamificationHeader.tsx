import React from 'react';
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

  return (
    <div 
      className="relative overflow-hidden border-b transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Lado esquerdo - Título */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-purple-100 font-medium uppercase tracking-wide">Seu Progresso</p>
            </div>
          </div>

          {/* Lado direito - Stats */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Power Score */}
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20 hover:bg-white/20 transition-colors">
              <Zap className="w-4 h-4 text-sky-200" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-purple-200 uppercase tracking-wider font-medium hidden sm:block">Power</span>
                <span className="text-lg font-bold text-white leading-none">{powerScore}</span>
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20 hover:bg-white/20 transition-colors">
              <Coins className="w-4 h-4 text-amber-200" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-purple-200 uppercase tracking-wider font-medium hidden sm:block">Créditos</span>
                <span className="text-lg font-bold text-white leading-none">{coins}</span>
              </div>
            </div>

            {/* Patente */}
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border ${patentColor} hover:scale-105 transition-transform`}>
              <Award className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-semibold whitespace-nowrap">
                {patentName}
              </span>
              <span className="md:hidden text-xs font-semibold">
                Nv{patentLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
