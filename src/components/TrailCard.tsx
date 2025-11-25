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

  // CARD BLOQUEADO
  if (isLocked) {
    return (
      <div className="relative bg-gray-800/50 rounded-2xl p-5 border border-gray-700 opacity-60 h-[320px] flex flex-col grayscale">
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
          🔒 Bloqueado
        </button>
      </div>
    );
  }

  // CARD COMPLETO
  if (isCompleted) {
    return (
      <div 
        onClick={handleClick}
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 cursor-pointer h-[320px] flex flex-col"
      >
        {/* Badge de Status */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            100%
          </span>
        </div>
        
        {/* Ícone Central */}
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center backdrop-blur border border-green-500/30">
            <Icon className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        {/* Título */}
        <h3 className="text-white font-bold text-lg text-center mb-3 leading-tight">
          {trail.title}
        </h3>
        
        {/* Check Verde */}
        <div className="mb-3 flex-grow flex items-center justify-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400">
            <span className="text-2xl text-green-400">✓</span>
          </div>
        </div>
        
        {/* Métricas */}
        <div className="flex justify-around mb-3 text-gray-400 text-sm">
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
          Revisar →
        </button>
      </div>
    );
  }

  // CARD ATIVO ou PRÓXIMA
  const isPulsing = isNext && !isActive;
  
  return (
    <div 
      onClick={handleClick}
      className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border hover:scale-105 hover:shadow-xl cursor-pointer h-[320px] flex flex-col ${
        isPulsing 
          ? 'border-2 border-purple-400 animate-pulse shadow-lg shadow-purple-500/30' 
          : 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-purple-500/20'
      } transition-all`}
    >
      {/* Badge de Status */}
      <div className="absolute top-3 right-3">
        {isPulsing ? (
          <span className="px-3 py-1 bg-purple-500/30 text-purple-300 text-xs font-bold rounded-full">
            PRÓXIMA
          </span>
        ) : (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            ATIVO
          </span>
        )}
      </div>
      
      {/* Indicador de Nova (se PRÓXIMA) */}
      {isPulsing && (
        <div className="absolute -top-2 -left-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-xs font-bold text-white">!</span>
          </div>
        </div>
      )}
      
      {/* Ícone Central */}
      <div className="flex justify-center mb-3">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center backdrop-blur border border-purple-500/30">
          <Icon className="w-10 h-10 text-purple-400" />
        </div>
      </div>
      
      {/* Título */}
      <h3 className="text-white font-bold text-lg text-center mb-3 leading-tight">
        {trail.title}
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-3 flex-grow">
        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
            style={{width: `${progress}%`}} 
          />
        </div>
        <p className="text-center text-purple-400 font-bold mt-2 text-sm">{progress}% completo</p>
      </div>
      
      {/* Métricas */}
      <div className="flex justify-around mb-3 text-gray-400 text-sm">
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
      <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
        Continuar →
      </button>
    </div>
  );
};

export default TrailCard;
