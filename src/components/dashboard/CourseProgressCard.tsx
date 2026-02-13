import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CourseProgressCardProps {
  trailName: string;
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  onContinue: () => void;
}

// Fake sparkline data based on progress
const generateSparklineData = (progress: number) => {
  const points = 7;
  const data = [];
  for (let i = 0; i < points; i++) {
    const base = (progress / 100) * (i / (points - 1));
    const noise = Math.random() * 0.15;
    data.push({ value: Math.min(1, base + noise) * 100 });
  }
  return data;
};

export const CourseProgressCard = ({
  trailName,
  category,
  progress,
  completedLessons,
  totalLessons,
  onContinue,
}: CourseProgressCardProps) => {
  const sparklineData = generateSparklineData(progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onContinue}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide"
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#6366F1',
          }}
        >
          {category}
        </span>
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #818CF8)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>

      {/* Trail name */}
      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 leading-tight">
        {trailName}
      </h3>
      <p className="text-gray-400 text-xs sm:text-sm mb-4">
        {completedLessons} de {totalLessons} aulas concluídas
      </p>

      {/* Sparkline + Progress */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-right">
          <span className="text-3xl sm:text-4xl font-bold" style={{ color: '#6366F1' }}>
            {progress}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};
