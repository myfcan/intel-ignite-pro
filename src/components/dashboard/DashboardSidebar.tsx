import { motion } from 'framer-motion';
import { Flame, Trophy, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

interface DashboardSidebarProps {
  streakDays: number;
  userName: string;
  isLoading?: boolean;
}

const learningHoursData = [
  { name: 'S1', hours: 12 },
  { name: 'S2', hours: 28 },
  { name: 'S3', hours: 45 },
  { name: 'S4', hours: 62 },
];

const leaderboard = [
  { name: 'AlexR_21', streak: 15, score: 1520, position: 1 },
  { name: 'LearnWithMira', streak: 12, score: 1340, position: 2 },
  { name: 'CodeJunkie', streak: 10, score: 1120, position: 3 },
];

const POSITION_COLORS = ['#F59E0B', '#9CA3AF', '#CD7F32'];

export const DashboardSidebar = ({ streakDays, userName, isLoading = false }: DashboardSidebarProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Streak Motivation Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔥</span>
            <h3 className="font-bold text-amber-900 text-sm">
              {streakDays > 0 ? `Você está on fire, ${userName}!` : 'Comece sua sequência!'}
            </h3>
          </div>
          <p className="text-amber-700 text-xs leading-relaxed mb-3">
            {streakDays > 0
              ? `Você aprendeu por ${streakDays} dia${streakDays > 1 ? 's' : ''} seguido${streakDays > 1 ? 's' : ''}. Mantenha o ritmo!`
              : 'Complete uma aula hoje para iniciar sua sequência.'}
          </p>
          <button
            className="w-full py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: 'white',
              color: '#92400E',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            Continuar Aprendendo
          </button>
        </div>
        {/* Decorative flames */}
        <div className="absolute -bottom-2 -right-2 opacity-10">
          <Flame className="w-20 h-20 text-amber-600" />
        </div>
      </motion.div>

      {/* Learning Hours Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5"
        style={{
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        <h3 className="font-bold text-gray-900 text-sm mb-4">Horas de Aprendizado</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={learningHoursData}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
              />
              <Bar
                dataKey="hours"
                fill="#6366F1"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Mini Leaderboard */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-5"
        style={{
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm">Leaderboard</h3>
          <span className="text-xs text-indigo-500 font-medium cursor-pointer hover:underline">Ver Todos</span>
        </div>
        <div className="flex flex-col gap-3">
          {leaderboard.map((user, i) => (
            <div key={user.name} className="flex items-center gap-3">
              {/* Position badge */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: POSITION_COLORS[i] }}
              >
                {user.position}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-gray-900 text-xs block truncate">{user.name}</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  {user.streak} dias
                </span>
              </div>
              {/* Score */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Trophy className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-bold text-gray-700">{user.score.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
