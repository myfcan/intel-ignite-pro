import { LucideIcon, Lock, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
  estimatedTime?: number;
  isNext?: boolean;
}

// Sparkle component for hover effects
const Sparkle = ({ delay, size, x, y }: { delay: number; size: number; x: number; y: number }) => (
  <motion.div
    className="absolute rounded-full bg-white/80"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: 1.2,
      delay,
      repeat: Infinity,
      repeatDelay: 0.3,
    }}
  />
);

const sparkles = [
  { delay: 0, size: 4, x: 8, y: 15 },
  { delay: 0.15, size: 3, x: 88, y: 12 },
  { delay: 0.3, size: 5, x: 92, y: 65 },
  { delay: 0.45, size: 3, x: 12, y: 75 },
  { delay: 0.6, size: 4, x: 50, y: 8 },
  { delay: 0.75, size: 3, x: 6, y: 45 },
];

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
  const [isHovered, setIsHovered] = useState(false);
  const isLocked = status === 'locked';
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/trail/${trail.id}`);
    }
  };

  // CARD BLOQUEADO
  if (isLocked) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col backdrop-blur-sm w-full overflow-hidden bg-gradient-to-br from-gray-100/90 to-gray-50/80"
        style={{
          borderColor: 'rgba(229, 231, 235, 0.8)',
        }}
      >
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
      </motion.div>
    );
  }

  // CARD COMPLETO
  if (isCompleted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border cursor-pointer min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col w-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Sparkles on hover */}
        {isHovered && sparkles.map((sparkle, i) => (
          <Sparkle key={i} {...sparkle} />
        ))}

        {/* Glow effect on hover */}
        <motion.div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
          }}
        />

        {/* Shine Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.08) 100%)',
          }}
        />
        
        {/* Textura de Pontos */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Badge de Status */}
        <div className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10">
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="px-2 xs:px-3 py-0.5 xs:py-1 bg-white/20 text-white text-[10px] xs:text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm"
          >
            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full" />
            100%
          </motion.span>
        </div>
        
        {/* Ícone Central com glow */}
        <div className="flex justify-center mb-2 xs:mb-3 relative z-10 flex-shrink-0">
          <div className="relative">
            {/* Icon glow */}
            <motion.div 
              className="absolute inset-0 rounded-lg xs:rounded-xl sm:rounded-2xl blur-lg"
              style={{ background: 'rgba(255, 255, 255, 0.4)' }}
              animate={{ 
                opacity: isHovered ? [0.4, 0.7, 0.4] : 0.3,
                scale: isHovered ? [1, 1.15, 1] : 1
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div 
              className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30"
              animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-10 sm:h-10 text-white drop-shadow-md" />
            </motion.div>
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
          <motion.div 
            className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white backdrop-blur-sm flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <span className="text-lg xs:text-xl sm:text-2xl text-white">✓</span>
          </motion.div>
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
        <motion.button 
          className="w-full py-2 xs:py-2.5 sm:py-3 text-[11px] xs:text-xs sm:text-base font-semibold rounded-lg xs:rounded-xl relative z-10 flex-shrink-0 overflow-hidden bg-white/95 text-indigo-600 border border-indigo-100"
          whileHover={{ y: -2 }}
          style={{
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
          }}
        >
          Revisar
        </motion.button>
      </motion.div>
    );
  }

  // CARD ATIVO ou PRÓXIMA
  const isPulsing = isNext && !isActive;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 border cursor-pointer min-h-[260px] xs:min-h-[280px] sm:h-[320px] flex flex-col w-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #5AA0FF 0%, #7162FF 100%)',
        borderColor: isPulsing ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)',
        boxShadow: isPulsing 
          ? '0 8px 30px rgba(131, 123, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)' 
          : '0 4px 20px rgba(131, 123, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Sparkles on hover */}
      {isHovered && sparkles.map((sparkle, i) => (
        <Sparkle key={i} {...sparkle} />
      ))}

      {/* Glow effect on hover */}
      <motion.div 
        className="absolute inset-0 pointer-events-none rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
        }}
      />

      {/* Pulsing ring for PRÓXIMA */}
      {isPulsing && (
        <motion.div 
          className="absolute inset-0 rounded-lg xs:rounded-xl sm:rounded-2xl border-2 border-white/40 pointer-events-none"
          animate={{ 
            scale: [1, 1.02, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Badge de Status */}
      <div className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10">
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="px-2 xs:px-2.5 py-0.5 xs:py-1 bg-white/20 text-white text-[9px] xs:text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm whitespace-nowrap"
        >
          {isPulsing ? (
            'PRÓXIMA'
          ) : (
            <>
              <motion.div 
                className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full flex-shrink-0"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              ATIVO
            </>
          )}
        </motion.span>
      </div>
      
      {/* Ícone Central com glow */}
      <div className="flex justify-center mb-2 xs:mb-3 relative z-10 flex-shrink-0">
        <div className="relative">
          {/* Icon glow */}
          <motion.div 
            className="absolute inset-0 rounded-lg xs:rounded-xl sm:rounded-2xl blur-lg"
            style={{ background: 'rgba(255, 255, 255, 0.4)' }}
            animate={{ 
              opacity: isHovered ? [0.4, 0.7, 0.4] : 0.3,
              scale: isHovered ? [1, 1.15, 1] : 1
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30"
            animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-10 sm:h-10 text-white drop-shadow-md" />
          </motion.div>
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
      
      {/* Progress Bar Animada */}
      <div className="mb-2 xs:mb-3 flex-grow relative z-10 min-h-[40px] flex flex-col justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-full h-1.5 xs:h-2 overflow-hidden border border-white/30">
          <motion.div 
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
        </div>
        <motion.p 
          className="text-center text-white font-bold mt-1.5 xs:mt-2 text-[10px] xs:text-xs sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {progress}% completo
        </motion.p>
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
      <motion.button 
        className="w-full py-2 xs:py-2.5 sm:py-3 text-[11px] xs:text-xs sm:text-base font-semibold rounded-lg xs:rounded-xl relative z-10 flex-shrink-0 overflow-hidden bg-white/95 text-indigo-600 border border-indigo-100"
        whileHover={{ y: -2 }}
        style={{
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
        }}
      >
        Continuar
      </motion.button>
    </motion.div>
  );
};

export default TrailCard;
