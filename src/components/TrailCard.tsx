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

  // CARD COMPLETO - PALETA PRINCIPAL
  if (isCompleted) {
    return (
      <div 
        onClick={handleClick}
        className="relative rounded-2xl p-5 border transition-all hover:scale-105 hover:shadow-xl cursor-pointer h-[320px] flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
          backgroundImage: `
            linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
            radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: 'cover, 16px 16px',
          backgroundPosition: 'center, 0 0',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.6)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.1)';
        }}
      >
        {/* Badge de Status */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-green-500/20 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-green-600 rounded-full" />
            100%
          </span>
        </div>
        
        {/* Ícone Central */}
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
               style={{background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)'}}>
            <Icon className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-gray-800 font-bold text-lg text-center mb-3 leading-tight">
          {trail.title}
        </h3>
        
        {/* Check Verde */}
        <div className="mb-3 flex-grow flex items-center justify-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-600">
            <span className="text-2xl text-green-600">✓</span>
          </div>
        </div>
        
        {/* Métricas */}
        <div className="flex justify-around mb-3 text-gray-600 text-sm">
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
        <button className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all">
          Revisar
        </button>
      </div>
    );
  }

  // CARD ATIVO ou PRÓXIMA - PALETA PRINCIPAL
  const isPulsing = isNext && !isActive;
  
  return (
    <div 
      onClick={handleClick}
      className={`relative rounded-2xl p-5 border hover:scale-105 hover:shadow-xl cursor-pointer h-[320px] flex flex-col transition-all ${
        isPulsing ? 'animate-pulse' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        backgroundImage: `
          linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
          radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: 'cover, 16px 16px',
        backgroundPosition: 'center, 0 0',
        borderColor: isPulsing ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.2)',
        boxShadow: isPulsing 
          ? '0 4px 20px rgba(139, 92, 246, 0.3)' 
          : '0 2px 8px rgba(139, 92, 246, 0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isPulsing ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.2)';
        e.currentTarget.style.boxShadow = isPulsing 
          ? '0 4px 20px rgba(139, 92, 246, 0.3)' 
          : '0 2px 8px rgba(139, 92, 246, 0.05)';
      }}
    >
      {/* Badge de Status */}
      <div className="absolute top-3 right-3">
        {isPulsing ? (
          <span className="px-3 py-1 bg-purple-500/20 text-purple-600 text-xs font-bold rounded-full">
            PRÓXIMA
          </span>
        ) : (
          <span className="px-3 py-1 bg-green-500/20 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            ATIVO
          </span>
        )}
      </div>
      
      {/* Ícone Central */}
      <div className="flex justify-center mb-3">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
             style={{background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)'}}>
          <Icon className="w-10 h-10 text-primary" />
        </div>
      </div>
      
      {/* Título */}
      <h3 className="text-gray-800 font-bold text-lg text-center mb-3 leading-tight">
        {trail.title}
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-3 flex-grow">
        <div className="bg-gray-300 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
            }} 
          />
        </div>
        <p className="text-center text-primary font-bold mt-2 text-sm">{progress}% completo</p>
      </div>
      
      {/* Métricas */}
      <div className="flex justify-around mb-3 text-gray-600 text-sm">
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
      <button className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition-all">
        Continuar
      </button>
    </div>
  );
};

export default TrailCard;
