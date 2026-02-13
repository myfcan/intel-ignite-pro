import { motion } from 'framer-motion';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { MissoesDiarias } from '@/components/gamification/MissoesDiarias';

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

const BAR_COLORS = ['#A5B4FC', '#818CF8', '#6366F1', '#4F46E5'];

const cardStyle = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
};

export const DashboardSidebar = ({ streakDays, userName, isLoading = false }: DashboardSidebarProps) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Streak Card - Premium gradient */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25), 0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', top: '-40px', right: '-40px' }} />
        <div className="absolute w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', bottom: '-10px', left: '-10px' }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">Sequência</p>
                <p className="text-white text-2xl font-bold leading-none">{streakDays}</p>
              </div>
            </div>
            <span className="text-white/50 text-xs font-medium">dias</span>
          </div>

          <p className="text-white/70 text-xs leading-relaxed mb-4">
            {streakDays > 0
              ? `Continue assim, ${userName}! Sua consistência está construindo resultados reais.`
              : 'Complete uma aula hoje para iniciar sua sequência.'}
          </p>

          <button
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:shadow-lg active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.95)',
              color: '#4F46E5',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            Continuar Aprendendo
          </button>
        </div>
      </motion.div>

      {/* Learning Hours Chart - Premium */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6"
        style={cardStyle}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-sm">Horas de Aprendizado</h3>
          <div className="flex items-center gap-1 text-green-500">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">+38%</span>
          </div>
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={learningHoursData} barCategoryGap="25%">
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
              />
              <Bar
                dataKey="hours"
                radius={[8, 8, 4, 4]}
                barSize={36}
              >
                {learningHoursData.map((_, index) => (
                  <Cell key={index} fill={BAR_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] text-gray-500 font-medium">Total: 147h</span>
          </div>
          <span className="text-[11px] text-indigo-500 font-semibold cursor-pointer hover:underline">Ver detalhes</span>
        </div>
      </motion.div>

      {/* Missões Diárias - Premium */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-6"
        style={cardStyle}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm">Missões Diárias</h3>
          <span className="text-[10px] font-bold text-indigo-500 px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.08)' }}>
            HOJE
          </span>
        </div>
        <MissoesDiarias compact />
      </motion.div>
    </div>
  );
};
