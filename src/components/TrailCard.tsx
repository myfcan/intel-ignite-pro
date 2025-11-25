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
      navigate(`/trails/${trail.id}`);
    }
  };

  // CARD BLOQUEADO - TONS CLAROS PARA INDICAR DESATIVADO
  if (isLocked) {
    return (
      <div className="relative rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border min-h-[280px] xs:min-h-[300px] sm:h-[320px] flex flex-col backdrop-blur-sm"
           style={{
             background: 'linear-gradient(135deg, rgba(250, 250, 250, 0.7) 0%, rgba(245, 245, 245, 0.7) 100%)',
             borderColor: 'rgba(229, 231, 235, 0.8)',
           }}>
        {/* Ícone de Bloqueio */}
        <div className="absolute top-2 xs:top-3 right-2 xs:right-3">
          <Lock className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-gray-400" />
        </div>
        
        {/* Ícone Central */}
        <div className="flex justify-center mb-2 xs:mb-3">
          <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 bg-gray-200/70 rounded-xl xs:rounded-2xl flex items-center justify-center border border-gray-300/50">
            <Icon className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-gray-500 font-bold text-sm xs:text-base sm:text-lg text-center mb-2 xs:mb-3 leading-tight px-1">
          {trail.title}
        </h3>
        
        {/* Requisito */}
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-400 text-xs xs:text-sm text-center px-2 xs:px-4 leading-snug">
            Complete a trilha anterior para desbloquear
          </p>
        </div>
        
        {/* Métricas (preview) */}
        <div className="flex justify-around mb-2 xs:mb-3 text-gray-400 text-xs xs:text-sm gap-2">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
            <span className="truncate">{totalLessons} aulas</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
            <span className="truncate">{estimatedTime} min</span>
          </span>
        </div>
        
        {/* Botão Desabilitado */}
        <button disabled className="w-full py-2 xs:py-2.5 sm:py-3 bg-gray-300 text-gray-500 text-xs xs:text-sm sm:text-base font-semibold rounded-lg xs:rounded-xl cursor-not-allowed">
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
        className="relative rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border transition-all hover:scale-105 hover:shadow-xl cursor-pointer min-h-[280px] xs:min-h-[300px] sm:h-[320px] flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(34, 197, 94, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.3)';
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
        <div className="flex justify-center mb-2 xs:mb-3 relative z-10">
          <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-xl xs:rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
            <Icon className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white" />
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-white font-bold text-sm xs:text-base sm:text-lg text-center mb-2 xs:mb-3 leading-tight relative z-10 px-1">
          {trail.title}
        </h3>
        
        {/* Check Verde */}
        <div className="mb-2 xs:mb-3 flex-grow flex items-center justify-center relative z-10">
          <div className="w-10 h-10 xs:w-12 xs:h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white backdrop-blur-sm">
            <span className="text-xl xs:text-2xl text-white">✓</span>
          </div>
        </div>
        
        {/* Métricas */}
        <div className="flex justify-around mb-2 xs:mb-3 text-white/90 text-xs xs:text-sm relative z-10 gap-2">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
            <span className="truncate">{totalLessons}/{totalLessons} aulas</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
            <span className="truncate">{estimatedTime} min</span>
          </span>
        </div>
        
      {/* Botão CTA */}
      <button className="w-full py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm sm:text-base font-semibold rounded-lg xs:rounded-xl transition-all relative z-10 text-white"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #0891B2 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)';
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
      className={`relative rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border hover:scale-105 hover:shadow-xl cursor-pointer min-h-[280px] xs:min-h-[300px] sm:h-[320px] flex flex-col transition-all ${
        isPulsing ? 'animate-pulse' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)',
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
          <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-white/20 text-white text-[10px] xs:text-xs font-bold rounded-full backdrop-blur-sm">
            PRÓXIMA
          </span>
        ) : (
          <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-white/20 text-white text-[10px] xs:text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full animate-pulse" />
            ATIVO
          </span>
        )}
      </div>
      
      {/* Ícone Central */}
      <div className="flex justify-center mb-2 xs:mb-3 relative z-10">
        <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-xl xs:rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
          <Icon className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white" />
        </div>
      </div>
      
      {/* Título */}
      <h3 className="text-white font-bold text-sm xs:text-base sm:text-lg text-center mb-2 xs:mb-3 leading-tight relative z-10 px-1">
        {trail.title}
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-2 xs:mb-3 flex-grow relative z-10">
        <div className="bg-white/20 backdrop-blur-sm rounded-full h-1.5 xs:h-2 overflow-hidden border border-white/30">
          <div 
            className="h-full rounded-full transition-all bg-white"
            style={{width: `${progress}%`}} 
          />
        </div>
        <p className="text-center text-white font-bold mt-1.5 xs:mt-2 text-xs xs:text-sm">{progress}% completo</p>
      </div>
      
      {/* Métricas */}
      <div className="flex justify-around mb-2 xs:mb-3 text-white/90 text-xs xs:text-sm relative z-10 gap-2">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
          <span className="truncate">{completedLessons}/{totalLessons} aulas</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
          <span className="truncate">{estimatedTime} min</span>
        </span>
      </div>
      
      {/* Botão CTA */}
      <button className="w-full py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm sm:text-base font-semibold rounded-lg xs:rounded-xl transition-all relative z-10 text-white"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #0891B2 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)';
              }}>
        Continuar
      </button>
    </div>
  );
};

export default TrailCard;
