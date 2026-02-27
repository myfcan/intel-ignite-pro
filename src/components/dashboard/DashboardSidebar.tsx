import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, Zap } from 'lucide-react';
import { MissoesDiarias } from '@/components/gamification/MissoesDiarias';

interface DashboardSidebarProps {
  streakDays: number;
  userName: string;
  isLoading?: boolean;
}

const cardStyle = {
  background: 'hsl(0 0% 100%)',
  border: '1px solid hsl(220 13% 91%)',
  boxShadow: '0 1px 2px hsl(0 0% 0% / 0.04), 0 4px 16px hsl(0 0% 0% / 0.03)',
};

export const DashboardSidebar = ({ streakDays, userName, isLoading = false }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const streakPercentToGoal = Math.min((streakDays / 30) * 100, 100);

  return (
    <div className="flex flex-col gap-4">
      {/* ════════ STREAK CARD - Light premium ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl relative overflow-hidden"
        style={cardStyle}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, hsl(239 84% 67%), hsl(258 90% 66%), hsl(330 81% 60%))' }}
        />

        <div className="p-5 pt-6">
        {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, hsl(24 95% 53%), hsl(16 85% 55%))',
                    boxShadow: '0 4px 12px hsl(24 95% 53% / 0.3)',
                  }}
                >
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'hsl(215 16% 47%)' }}>
                    Sequência Ativa
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold leading-none" style={{ color: 'hsl(215 25% 9%)' }}>{streakDays}</span>
                    <span className="text-xs font-medium" style={{ color: 'hsl(215 16% 47%)' }}>dias</span>
                  </div>
                </div>
              </div>
              <div
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                style={{
                  background: 'hsl(158 64% 52% / 0.1)',
                  color: 'hsl(158 64% 42%)',
                  border: '1px solid hsl(158 64% 52% / 0.15)',
                }}
              >
                🔥 Ativo
              </div>
            </div>

          {/* Descrição do card */}
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'hsl(215 16% 47%)' }}>
            Manter uma sequência diária acelera seu aprendizado e desbloqueia recompensas.
          </p>

          {/* Progress toward goal */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium" style={{ color: 'hsl(215 16% 47%)' }}>
                Meta: 30 dias
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'hsl(215 25% 9%)' }}>
                {Math.round(streakPercentToGoal)}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'hsl(220 14% 96%)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(239 84% 67%), hsl(258 90% 66%))',
                  boxShadow: '0 0 8px hsl(239 84% 67% / 0.3)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${streakPercentToGoal}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Motivational */}
          <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'hsl(215 16% 47%)' }}>
            {streakDays > 0
              ? `${userName}, sua consistência está acima de 92% dos usuários. Continue assim!`
              : 'Complete uma aula hoje para iniciar sua sequência e ganhar XP bônus.'}
          </p>

          {/* CTA */}
          <button
            onClick={() => {
              const trailsSection = document.getElementById('suas-trilhas');
              trailsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-3 px-4 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, hsl(239 84% 67%), hsl(258 90% 66%))',
              color: 'white',
              boxShadow: '0 4px 12px hsl(239 84% 67% / 0.25)',
            }}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">Continue sua Jornada</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
          </button>
        </div>
      </motion.div>

      {/* ════════ LEARNING HOURS CHART ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl"
        style={cardStyle}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm" style={{ color: 'hsl(215 25% 9%)' }}>
              Horas de Aprendizado
            </h3>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md"
              style={{ background: 'hsl(158 64% 52% / 0.08)' }}
            >
              <TrendingUp className="w-3 h-3" style={{ color: 'hsl(158 64% 52%)' }} />
              <span className="text-[11px] font-bold" style={{ color: 'hsl(158 64% 48%)' }}>+38%</span>
            </div>
          </div>
          <p className="text-[11px] mb-4" style={{ color: 'hsl(215 16% 47%)' }}>
            Últimas 4 semanas
          </p>

          <div className="h-40 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={learningHoursData} barCategoryGap="20%">
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)', fontWeight: 500 }}
                  dy={8}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="hours" radius={[10, 10, 6, 6]} barSize={40}>
                  {learningHoursData.map((_, index) => (
                    <Cell key={index} fill={`hsl(239, 84%, ${72 - index * 8}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
            className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-80"
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
        style={cardStyle}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'hsl(215 25% 9%)' }}>
              Missões Diárias
            </h3>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: 'hsl(239 84% 67% / 0.06)',
                border: '1px solid hsl(239 84% 67% / 0.1)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'hsl(158 64% 52%)' }}
              />
              <span className="text-[10px] font-bold" style={{ color: 'hsl(239 84% 55%)' }}>HOJE</span>
            </div>
          </div>
          <MissoesDiarias compact />
        </div>
      </motion.div>
    </div>
  );
};
