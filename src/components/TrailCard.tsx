import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrailCardProps {
  trail: {
    id: string;
    title: string;
    description: string;
    icon: string;
    order_index: number;
  };
  Icon: LucideIcon;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  status?: 'active' | 'completed' | 'locked';
  gradient: string;
}

const TrailCard = ({ trail, Icon, progress = 0, completedLessons = 0, totalLessons = 5, status = 'locked', gradient }: TrailCardProps) => {
  const navigate = useNavigate();
  const isLocked = status === 'locked';
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/trails/${trail.id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        group relative bg-white rounded-2xl overflow-hidden
        border-2 transition-all duration-300
        ${isActive ? 'border-cyan-400 shadow-xl shadow-cyan-100' : 'border-gray-200'}
        ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl cursor-pointer'}
      `}
    >
      
      {/* Header colorido */}
      <div className={`
        h-32 bg-gradient-to-br ${gradient} 
        relative overflow-hidden
      `}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23ffffff' fill-opacity='0.5'/%3E%3C/svg%3E")`
             }}
        />

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          {isCompleted && (
            <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full
                          text-sm font-semibold text-green-600 flex items-center gap-1">
              ✓ Completo
            </div>
          )}
          {isActive && (
            <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full
                          text-sm font-semibold text-cyan-600 flex items-center gap-1">
              ▶ Em andamento
            </div>
          )}
          {isLocked && (
            <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full
                          text-sm font-semibold text-gray-600 flex items-center gap-1">
              🔒 Bloqueado
            </div>
          )}
        </div>

        {/* Ícone minimalista */}
        <div className="absolute bottom-4 left-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md
                        flex items-center justify-center border-2 border-white/30">
            <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
          {trail.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {trail.description}
        </p>

        {/* Progress */}
        {!isLocked && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">{completedLessons}/{totalLessons} aulas</span>
              <span className="font-semibold text-gray-900">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500 shadow-cyan-glow`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <button className={`
          w-full py-3 rounded-xl font-semibold transition-all
          ${isLocked 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r ' + gradient + ' text-white hover:shadow-lg hover:scale-105'
          }
        `}
        disabled={isLocked}>
          {isCompleted && '📚 Revisar'}
          {isActive && '▶️ Continuar'}
          {isLocked && '🔒 Bloqueado'}
        </button>

        {isLocked && trail.order_index > 1 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Complete a trilha anterior primeiro
          </p>
        )}
      </div>
    </div>
  );
};

export default TrailCard;
