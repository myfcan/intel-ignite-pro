import { LucideIcon, Lock, BookOpen, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    icon: string | null;
    order_index: number;
  };
  Icon: LucideIcon;
  completedLessons: number;
  totalLessons: number;
  status: 'active' | 'completed' | 'locked';
  accentColor?: string;
  index?: number;
}

const CourseCard = ({
  course,
  Icon,
  completedLessons,
  totalLessons,
  status,
  accentColor = '#6366F1',
  index = 0,
}: CourseCardProps) => {
  const navigate = useNavigate();
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/course/${course.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={!isLocked ? { y: -4, scale: 1.01 } : undefined}
      onClick={handleClick}
      className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
        isLocked
          ? 'opacity-50 cursor-not-allowed border-gray-200'
          : isCompleted
            ? 'cursor-pointer border-emerald-200 hover:shadow-lg hover:border-emerald-300'
            : 'cursor-pointer border-gray-200 hover:shadow-lg hover:border-primary'
      }`}
      style={{
        boxShadow: isLocked
          ? '0 2px 8px rgba(0,0,0,0.03)'
          : '0 4px 16px -4px rgba(0,0,0,0.08)',
      }}
    >
      <div className="p-5 flex items-center gap-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isLocked
              ? '#F1F5F9'
              : isCompleted
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`,
            boxShadow: isLocked
              ? 'none'
              : `0 4px 12px ${isCompleted ? 'rgba(16,185,129,0.25)' : `${accentColor}30`}`,
          }}
        >
          {isLocked ? (
            <Lock className="w-6 h-6 text-slate-400" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-white" />
          ) : (
            <Icon className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Completo
              </span>
            )}
          </div>

          {course.description && (
            <p className="text-xs text-gray-500 line-clamp-1 mb-2">
              {course.description}
            </p>
          )}

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{completedLessons}/{totalLessons} aulas</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[120px]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isCompleted
                    ? 'linear-gradient(90deg, #10B981, #14B8A6)'
                    : `linear-gradient(90deg, ${accentColor}, ${accentColor}CC)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </div>
            <span className="text-[11px] font-bold text-gray-500">{progress}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
