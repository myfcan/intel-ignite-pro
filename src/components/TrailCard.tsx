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

  // CARD BLOQUEADO - DARK MODE PARA UPSELL
  if (isLocked) {
    return (
      <div className="relative rounded-2xl p-5 border h-[320px] flex flex-col grayscale"
           style={{
             background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
             borderColor: 'rgba(107, 114, 128, 0.3)',
             opacity: 0.7
           }}>
        {/* Ícone de Bloqueio */}
        <div className="absolute top-3 right-3">
          <Lock className="w-6 h-6 text-gray-500" />
        </div>
        
        {/* Ícone Central */}
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center">
            <Icon className="w-10 h-10 text-gray-600" />
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-gray-400 font-bold text-lg text-center mb-3 leading-tight">
          {trail.title}
        </h3>
        
        {/* Requisito */}
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 text-sm text-center px-4">
            Complete a trilha anterior para desbloquear
          </p>
        </div>
        
        {/* Métricas (preview) */}
        <div className="flex justify-around mb-3 text-gray-600 text-sm">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {totalLessons} aulas
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {estimatedTime} min
          </span>
        </div>
        
        {/* Botão Desabilitado */}
        <button disabled className="w-full py-3 bg-gray-700 text-gray-500 font-semibold rounded-xl cursor-not-allowed">
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
        className="relative rounded-2xl p-5 border transition-all hover:scale-105 hover:shadow-xl cursor-pointer h-[320px] flex flex-col"
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
        <div className="absolute top-3 right-3 z-10">
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm">
            <div className="w-2 h-2 bg-white rounded-full" />
            100%
          </span>
        </div>
        
        {/* Ícone Central */}
        <div className="flex justify-center mb-3 relative z-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
            <Icon className="w-10 h-10 text-white" />
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-white font-bold text-lg text-center mb-3 leading-tight relative z-10">
          {trail.title}
        </h3>
        
        {/* Check Verde */}
        <div className="mb-3 flex-grow flex items-center justify-center relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white backdrop-blur-sm">
            <span className="text-2xl text-white">✓</span>
          </div>
        </div>
        
        {/* Métricas */}
        <div className="flex justify-around mb-3 text-white/90 text-sm relative z-10">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {totalLessons}/{totalLessons} aulas
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {estimatedTime} min
          </span>
        </div>
        
      {/* Botão CTA */}
      <button className="w-full py-3 font-semibold rounded-xl transition-all relative z-10 text-white"
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
      className={`relative rounded-2xl p-5 border hover:scale-105 hover:shadow-xl cursor-pointer h-[320px] flex flex-col transition-all ${
        isPulsing ? 'animate-pulse' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        borderColor: isPulsing ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)',
        boxShadow: isPulsing 
          ? '0 8px 30px rgba(139, 92, 246, 0.5)' 
          : '0 4px 20px rgba(139, 92, 246, 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isPulsing ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)';
        e.currentTarget.style.boxShadow = isPulsing 
          ? '0 8px 30px rgba(139, 92, 246, 0.5)' 
          : '0 4px 20px rgba(139, 92, 246, 0.3)';
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
      <div className="absolute top-3 right-3 z-10">
        {isPulsing ? (
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm">
            PRÓXIMA
          </span>
        ) : (
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            ATIVO
          </span>
        )}
      </div>
      
      {/* Ícone Central */}
      <div className="flex justify-center mb-3 relative z-10">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>
      
      {/* Título */}
      <h3 className="text-white font-bold text-lg text-center mb-3 leading-tight relative z-10">
        {trail.title}
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-3 flex-grow relative z-10">
        <div className="bg-white/20 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/30">
          <div 
            className="h-full rounded-full transition-all bg-white"
            style={{width: `${progress}%`}} 
          />
        </div>
        <p className="text-center text-white font-bold mt-2 text-sm">{progress}% completo</p>
      </div>
      
      {/* Métricas */}
      <div className="flex justify-around mb-3 text-white/90 text-sm relative z-10">
        <span className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {completedLessons}/{totalLessons} aulas
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {estimatedTime} min
        </span>
      </div>
      
      {/* Botão CTA */}
      <button className="w-full py-3 font-semibold rounded-xl transition-all relative z-10 text-white"
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
