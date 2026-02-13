import { motion } from 'framer-motion';
import { Flame, Clock, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { MissoesDiarias } from '@/components/gamification/MissoesDiarias';

interface DashboardSidebarProps {
  streakDays: number;
  userName: string;
  isLoading?: boolean;
}

const learningHoursData = [
  { name: 'S1', hours: 12, label: 'Semana 1' },
  { name: 'S2', hours: 28, label: 'Semana 2' },
  { name: 'S3', hours: 45, label: 'Semana 3' },
  { name: 'S4', hours: 62, label: 'Semana 4' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs font-semibold"
        style={{
          background: 'hsl(215 25% 9% / 0.9)',
          color: 'white',
          backdropFilter: 'blur(12px)',
          border: '1px solid hsl(0 0% 100% / 0.1)',
          boxShadow: '0 8px 32px hsl(0 0% 0% / 0.3)',
        }}
      >
        <span className="text-white/60 text-[10px] block">Horas</span>
        <span className="text-white text-sm font-bold">{payload[0].value}h</span>
      </div>
    );
  }
  return null;
};

export const DashboardSidebar = ({ streakDays, userName, isLoading = false }: DashboardSidebarProps) => {
  const streakPercentToGoal = Math.min((streakDays / 30) * 100, 100);

  return (
    <div className="flex flex-col gap-4">
      {/* ════════ STREAK CARD - Dark premium ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, hsl(243 47% 15%) 0%, hsl(239 84% 20%) 40%, hsl(258 60% 22%) 100%)',
          boxShadow: '0 1px 2px hsl(0 0% 0% / 0.1), 0 8px 24px hsl(239 84% 30% / 0.2), 0 20px 48px hsl(239 84% 20% / 0.15)',
        }}
      >
        {/* Subtle gradient orbs */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 120, height: 120,
            background: 'radial-gradient(circle, hsl(239 84% 67% / 0.3), transparent 70%)',
            top: -30, right: -20,
          }}
        />
        <div
          className="absolute rounded-full blur-2xl"
          style={{
            width: 80, height: 80,
            background: 'radial-gradient(circle, hsl(258 90% 66% / 0.2), transparent 70%)',
            bottom: -10, left: 20,
          }}
        />

        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(24 95% 53%) 0%, hsl(16 85% 55%) 100%)',
                  boxShadow: '0 4px 16px hsl(24 95% 53% / 0.4)',
                }}
              >
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'hsl(0 0% 100% / 0.45)' }}>
                  Sequência Ativa
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-white leading-none">{streakDays}</span>
                  <span className="text-xs font-medium" style={{ color: 'hsl(0 0% 100% / 0.4)' }}>dias</span>
                </div>
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{
                background: 'hsl(158 64% 52% / 0.15)',
                color: 'hsl(158 64% 60%)',
                border: '1px solid hsl(158 64% 52% / 0.2)',
              }}
            >
              🔥 Ativo
            </div>
          </div>

          {/* Progress arc / bar toward goal */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium" style={{ color: 'hsl(0 0% 100% / 0.5)' }}>
                Meta: 30 dias
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'hsl(0 0% 100% / 0.7)' }}>
                {Math.round(streakPercentToGoal)}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'hsl(0 0% 100% / 0.08)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(24 95% 53%), hsl(330 81% 60%), hsl(258 90% 66%))',
                  boxShadow: '0 0 12px hsl(24 95% 53% / 0.5)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${streakPercentToGoal}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Motivational text */}
          <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'hsl(0 0% 100% / 0.5)' }}>
            {streakDays > 0
              ? `${userName}, sua consistência está acima de 92% dos usuários.`
              : 'Complete uma aula hoje para iniciar sua sequência.'}
          </p>

          {/* CTA */}
          <button
            className="w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.12), hsl(0 0% 100% / 0.06))',
              color: 'white',
              border: '1px solid hsl(0 0% 100% / 0.1)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Zap className="w-4 h-4" />
            Continuar Aprendendo
            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
          </button>
        </div>
      </motion.div>

      {/* ════════ LEARNING HOURS CHART ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl"
        style={{
          background: 'hsl(0 0% 100%)',
          border: '1px solid hsl(220 13% 91%)',
          boxShadow: '0 1px 2px hsl(0 0% 0% / 0.04), 0 4px 16px hsl(0 0% 0% / 0.03)',
        }}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm" style={{ color: 'hsl(215 25% 9%)' }}>
              Horas de Aprendizado
            </h3>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md"
              style={{
                background: 'hsl(158 64% 52% / 0.08)',
              }}
            >
              <TrendingUp className="w-3 h-3" style={{ color: 'hsl(158 64% 52%)' }} />
              <span className="text-[11px] font-bold" style={{ color: 'hsl(158 64% 48%)' }}>+38%</span>
            </div>
          </div>
          <p className="text-[11px] mb-4" style={{ color: 'hsl(215 16% 47%)' }}>
            Últimas 4 semanas
          </p>

          {/* Chart */}
          <div className="h-40 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={learningHoursData} barCategoryGap="20%">
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)', fontWeight: 500 }}
                  dy={8}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="hours"
                  radius={[10, 10, 6, 6]}
                  barSize={40}
                >
                  {learningHoursData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={`hsl(239 84% ${72 - index * 8}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: '1px solid hsl(220 13% 91% / 0.7)' }}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" style={{ color: 'hsl(215 16% 47%)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'hsl(215 16% 47%)' }}>
              Total: <span style={{ color: 'hsl(215 25% 9%)' }} className="font-bold">147h</span>
            </span>
          </div>
          <button
            className="text-[11px] font-semibold flex items-center gap-0.5 transition-colors hover:opacity-80"
            style={{ color: 'hsl(239 84% 67%)' }}
          >
            Ver detalhes
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* ════════ MISSÕES DIÁRIAS ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl"
        style={{
          background: 'hsl(0 0% 100%)',
          border: '1px solid hsl(220 13% 91%)',
          boxShadow: '0 1px 2px hsl(0 0% 0% / 0.04), 0 4px 16px hsl(0 0% 0% / 0.03)',
        }}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'hsl(215 25% 9%)' }}>
              Missões Diárias
            </h3>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(239 84% 67% / 0.08), hsl(258 90% 66% / 0.08))',
                border: '1px solid hsl(239 84% 67% / 0.1)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'hsl(158 64% 52%)' }}
              />
              <span className="text-[10px] font-bold" style={{ color: 'hsl(239 84% 55%)' }}>
                HOJE
              </span>
            </div>
          </div>
          <MissoesDiarias compact />
        </div>
      </motion.div>
    </div>
  );
};
