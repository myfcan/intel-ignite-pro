import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PointsCardProps {
  powerScore: number;
  patentName: string;
  isLoading?: boolean;
}

export const PointsCard = ({ powerScore, patentName, isLoading = false }: PointsCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 overflow-hidden flex flex-col justify-between cursor-pointer"
      onClick={() => navigate('/leaderboard')}
      style={{
        background: 'linear-gradient(145deg, #6C63FF 0%, #22D3EE 100%)',
        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)',
        minHeight: '100%',
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />
      <div
        className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/80 text-xs sm:text-sm font-medium">Power Score</span>
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>

        <div className="mb-4">
          {isLoading ? (
            <div className="w-20 h-10 rounded bg-white/20 animate-pulse" />
          ) : (
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="text-4xl sm:text-5xl font-bold text-white block"
            >
              {powerScore}
            </motion.span>
          )}
          <span className="text-white/70 text-xs sm:text-sm">{patentName}</span>
        </div>
      </div>

      <button
        className="relative z-10 w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all"
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          backdropFilter: 'blur(8px)',
        }}
      >
        Ver Ranking →
      </button>
    </motion.div>
  );
};
