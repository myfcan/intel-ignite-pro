import { LucideIcon, Lock, BookOpen, Clock } from 'lucide-react';
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
  estimatedTime?: number; // em minutos
  isNext?: boolean; // Indicador de "próxima trilha"
}

const TrailCard = ({ 
  trail, 
  Icon, 
  progress = 0, 
  completedLessons = 0, 
  totalLessons = 5, 
  status = 'locked', 
  gradient,
  estimatedTime = 45,
  isNext = false
}: TrailCardProps) => {
  const navigate = useNavigate();
  const isLocked = status === 'locked';
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/trail/${trail.id}`);
    }
  };

  // CARD BLOQUEADO - TONS CLAROS PARA INDICAR DESATIVADO
  if (isLocked) {
    return (
      <div className="relative rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col backdrop-blur-sm w-full overflow-hidden"
           style={{
             background: 'linear-gradient(135deg, rgba(250, 250, 250, 0.7) 0%, rgba(245, 245, 245, 0.7) 100%)',
             borderColor: 'rgba(229, 231, 235, 0.8)',
           }}>
        {/* Ícone de Bloqueio */}
        <div className="absolute top-2 xs:top-3 right-2 xs:right-3">
          <Lock className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-400" />
        </div>
        
        {/* Ícone Central */}
        <div className="flex justify-center mb-2 xs:mb-3 flex-shrink-0">
          <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 bg-gray-200/70 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-300/50">
            <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-10 sm:h-10 text-gray-400" />
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-gray-500 font-bold text-xs xs:text-sm sm:text-lg text-center mb-1 leading-tight px-1 break-words">
          {trail.title}
        </h3>
        
        {/* Subtítulo */}
        <p className="text-gray-400 font-semibold text-[10px] xs:text-xs text-center mb-2 xs:mb-3 uppercase tracking-wide">
          Em breve
        </p>
        
        {/* Requisito */}
        <div className="flex-grow flex items-center justify-center min-h-[40px]">
          <p className="text-gray-400 text-[10px] xs:text-xs sm:text-sm text-center px-2 xs:px-4 leading-snug break-words">
            Complete a trilha anterior para desbloquear
          </p>
        </div>
        
        {/* Métricas (preview) */}
        <div className="flex justify-center gap-3 xs:gap-4 mb-2 xs:mb-3 text-gray-400 text-[10px] xs:text-xs sm:text-sm flex-shrink-0">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <BookOpen className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{totalLessons} aulas</span>
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{estimatedTime} min</span>
          </span>
        </div>
        
        {/* Botão Desabilitado */}
        <button disabled className="w-full py-2 xs:py-2.5 sm:py-3 bg-gray-300 text-gray-500 text-[11px] xs:text-xs sm:text-base font-semibold rounded-lg xs:rounded-xl cursor-not-allowed flex-shrink-0">
          Bloqueado
        </button>
      </div>
    );
  }

  // CARD COMPLETO - INVERTIDO: FUNDO PALETA PRINCIPAL, ELEMENTOS BRANCOS
  if (isCompleted) {
    return (
      <div 
        onClick={handleClick}
        className="relative rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border transition-all hover:scale-105 hover:shadow-xl cursor-pointer min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col w-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
        }}
      >
        {/* Textura de Pontos */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0'
          }}
        />

        {/* Badge de Status */}
        <div className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10">
          <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-white/20 text-white text-[10px] xs:text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full" />
            100%
          </span>
        </div>
        
        {/* Ícone Central */}
        <div className="flex justify-center mb-2 xs:mb-3 relative z-10 flex-shrink-0">
          <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
            <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-10 sm:h-10 text-white" />
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-white font-bold text-xs xs:text-sm sm:text-lg text-center mb-1 leading-tight relative z-10 px-1 break-words">
          {trail.title}
        </h3>
        
        {/* Subtítulo */}
        <p className="text-white/90 font-semibold text-[10px] xs:text-xs text-center mb-2 xs:mb-3 uppercase tracking-wide relative z-10">
          Concluído ✓
        </p>
        
        {/* Check Verde */}
        <div className="mb-2 xs:mb-3 flex-grow flex items-center justify-center relative z-10 min-h-[40px]">
          <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white backdrop-blur-sm flex-shrink-0">
            <span className="text-lg xs:text-xl sm:text-2xl text-white">✓</span>
          </div>
        </div>
        
        {/* Métricas */}
        <div className="flex justify-center gap-3 xs:gap-4 mb-2 xs:mb-3 text-white/90 text-[10px] xs:text-xs sm:text-sm relative z-10 flex-shrink-0">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <BookOpen className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{totalLessons}/{totalLessons} aulas</span>
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{estimatedTime} min</span>
          </span>
        </div>
        
      {/* Botão CTA */}
      <button className="w-full py-2 xs:py-2.5 sm:py-3 text-[11px] xs:text-xs sm:text-base font-semibold rounded-lg xs:rounded-xl transition-all relative z-10 flex-shrink-0"
              style={{
                background: '#FFFFFF',
                color: '#8B5CF6',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}>
        Revisar
      </button>
      </div>
    );
  }

  // CARD ATIVO ou PRÓXIMA - INVERTIDO: FUNDO PALETA PRINCIPAL, ELEMENTOS BRANCOS
  const isPulsing = isNext && !isActive;
  
  return (
    <div 
      onClick={handleClick}
      className={`relative rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border hover:scale-105 hover:shadow-xl cursor-pointer min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col transition-all w-full overflow-hidden ${
        isPulsing ? 'animate-pulse' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #5AA0FF 0%, #7162FF 100%)',
        borderColor: isPulsing ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)',
        boxShadow: isPulsing 
          ? '0 8px 30px rgba(131, 123, 255, 0.5)' 
          : '0 4px 20px rgba(131, 123, 255, 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(131, 123, 255, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isPulsing ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)';
        e.currentTarget.style.boxShadow = isPulsing 
          ? '0 8px 30px rgba(131, 123, 255, 0.5)' 
          : '0 4px 20px rgba(131, 123, 255, 0.3)';
      }}
    >
      {/* Textura de Pontos */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0'
        }}
      />

      {/* Badge de Status */}
      <div className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10">
        {isPulsing ? (
          <span className="px-2 xs:px-2.5 py-0.5 xs:py-1 bg-white/20 text-white text-[9px] xs:text-[10px] sm:text-xs font-bold rounded-full backdrop-blur-sm whitespace-nowrap">
            PRÓXIMA
          </span>
        ) : (
          <span className="px-2 xs:px-2.5 py-0.5 xs:py-1 bg-white/20 text-white text-[9px] xs:text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm whitespace-nowrap">
            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full animate-pulse flex-shrink-0" />
            ATIVO
          </span>
        )}
      </div>
      
      {/* Ícone Central */}
      <div className="flex justify-center mb-2 xs:mb-3 relative z-10 flex-shrink-0">
        <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
          <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-10 sm:h-10 text-white" />
        </div>
      </div>
      
      {/* Título */}
      <h3 className="text-white font-bold text-xs xs:text-sm sm:text-lg text-center mb-1 leading-tight relative z-10 px-1 break-words">
        {trail.title}
      </h3>
      
      {/* Subtítulo */}
      <p className="text-white/90 font-semibold text-[10px] xs:text-xs text-center mb-2 xs:mb-3 uppercase tracking-wide relative z-10">
        {isPulsing ? 'Próxima trilha' : 'Em andamento'}
      </p>
      
      {/* Progress Bar */}
      <div className="mb-2 xs:mb-3 flex-grow relative z-10 min-h-[40px] flex flex-col justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-full h-1.5 xs:h-2 overflow-hidden border border-white/30">
          <div 
            className="h-full rounded-full transition-all bg-white"
            style={{width: `${progress}%`}} 
          />
        </div>
        <p className="text-center text-white font-bold mt-1.5 xs:mt-2 text-[10px] xs:text-xs sm:text-sm">{progress}% completo</p>
      </div>
      
      {/* Métricas */}
      <div className="flex justify-center gap-3 xs:gap-4 mb-2 xs:mb-3 text-white/90 text-[10px] xs:text-xs sm:text-sm relative z-10 flex-shrink-0">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <BookOpen className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{completedLessons}/{totalLessons} aulas</span>
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Clock className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{estimatedTime} min</span>
        </span>
      </div>
      
      {/* Botão CTA */}
      <button className="w-full py-2 xs:py-2.5 sm:py-3 text-[11px] xs:text-xs sm:text-base font-semibold rounded-lg xs:rounded-xl transition-all relative z-10 flex-shrink-0"
              style={{
                background: '#FFFFFF',
                color: '#5AA0FF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}>
        Continuar
      </button>
    </div>
  );
};

export default TrailCard;
