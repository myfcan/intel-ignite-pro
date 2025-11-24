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
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${!isLocked ? 'hover:-translate-y-0.5 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
      style={{
        background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: `
          0 0 40px rgba(139, 92, 246, 0.1),
          0 0 80px rgba(139, 92, 246, 0.05),
          inset 0 0 60px rgba(139, 92, 246, 0.03)
        `
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.3)';
      }}
    >
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center backdrop-blur flex-shrink-0"
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)'
            }}
          >
            <Icon className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-100 truncate">{trail.title}</h3>
              {isCompleted && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
                  ✓ Completo
                </span>
              )}
              {isActive && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
                  ▶ Ativo
                </span>
              )}
              {isLocked && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 flex-shrink-0">
                  🔒 Bloqueado
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{trail.description}</p>
          </div>
        </div>
        
        {!isLocked && (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progresso</span>
                <span className="text-purple-400 font-semibold">{completedLessons}/{totalLessons} aulas • {progress}%</span>
              </div>
              <div 
                className="w-full rounded-full h-2 overflow-hidden"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
              >
                <div 
                  className="h-full rounded-full relative transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #6366F1 0%, #A78BFA 50%, #EC4899 100%)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                  }}
                />
              </div>
            </div>
          </>
        )}
        
        {/* Botão Continue ou Ver Trilha */}
        <button 
          className="w-full py-3 rounded-xl font-semibold transition-all"
          disabled={isLocked}
          style={{
            background: isLocked ? 'rgba(75, 85, 99, 0.1)' : 'rgba(139, 92, 246, 0.1)',
            border: isLocked ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)',
            color: isLocked ? '#6B7280' : '#A78BFA'
          }}
          onMouseEnter={(e) => {
            if (!isLocked) {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLocked) {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
            }
          }}
        >
          {isCompleted && '📚 Revisar Trilha →'}
          {isActive && '▶️ Continuar Aprendendo →'}
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
