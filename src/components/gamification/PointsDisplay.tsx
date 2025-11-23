import React from 'react';
import { Coins, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface PointsDisplayProps {
  points: number;
  streak?: number;
  showStreak?: boolean;
  compact?: boolean;
}

export function PointsDisplay({ points, streak = 0, showStreak = true, compact = false }: PointsDisplayProps) {
  // Calcular nível baseado em pontos
  const level = Math.floor(points / 1000) + 1;
  const pointsToNextLevel = 1000 - (points % 1000);
  const progressPercent = ((points % 1000) / 1000) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-400/20 to-rose-300/20 px-3 py-1.5 rounded-full border border-pink-400/30">
          <Coins className="w-4 h-4 text-pink-600" />
          <span className="text-sm font-bold text-pink-900">{points.toLocaleString()}</span>
        </div>
        
        {showStreak && streak > 0 && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-400/20 to-rose-400/20 px-3 py-1.5 rounded-full border border-pink-400/30">
            <Flame className="w-4 h-4 text-pink-600" />
            <span className="text-sm font-bold text-pink-900">{streak}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs text-slate-600 font-medium">Pontos Totais</div>
            <div className="text-xl font-bold text-slate-900">{points.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-slate-600 font-medium">Nível</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            {level}
          </div>
        </div>
      </div>

      {/* Progress to next level */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">{pointsToNextLevel} pts para nível {level + 1}</span>
          <span className="font-bold text-purple-600">{Math.round(progressPercent)}%</span>
        </div>
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
          />
        </div>
      </div>

      {/* Streak indicator */}
      {showStreak && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-5 h-5 ${streak > 0 ? 'text-pink-500' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs text-slate-600">Sequência</div>
                <div className="text-lg font-bold text-pink-600">{streak} {streak === 1 ? 'dia' : 'dias'}</div>
              </div>
            </div>
            
            {streak >= 7 && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                +50% bônus!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
