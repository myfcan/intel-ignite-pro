import React from 'react';
import { Zap, Coins, Award } from 'lucide-react';

type GamificationHeaderProps = {
  powerScore: number;
  coins: number;
  patentLevel: number;
  patentName: string;
};

const PATENT_COLORS: Record<number, string> = {
  0: 'bg-slate-800/80 border-slate-700 text-slate-400',
  1: 'bg-blue-900/40 border-blue-700 text-blue-300',
  2: 'bg-purple-900/40 border-purple-700 text-purple-300',
  3: 'bg-amber-900/40 border-amber-700 text-amber-300',
};

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({
  powerScore,
  coins,
  patentLevel,
  patentName,
}) => {
  const patentColor = PATENT_COLORS[patentLevel] || PATENT_COLORS[0];

  return (
    <div className="flex items-center justify-end gap-3 sm:gap-4 text-xs sm:text-sm px-4 py-2.5 bg-slate-900/60 border-b border-slate-800">
      <div className="flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-sky-400" />
        <span className="hidden sm:inline text-slate-300">Power Score</span>
        <span className="font-semibold text-sky-300">{powerScore}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Coins className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-amber-300">{coins}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Award className="w-4 h-4 text-slate-400" />
        <span className={`hidden md:inline px-2 py-0.5 rounded-full text-[11px] border ${patentColor}`}>
          {patentName}
        </span>
        <span className={`md:hidden px-1.5 py-0.5 rounded-full text-[10px] border ${patentColor}`}>
          Nv{patentLevel}
        </span>
      </div>
    </div>
  );
};
