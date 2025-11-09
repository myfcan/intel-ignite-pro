import { useEffect, useState } from 'react';
import { Trophy, Star, Award, Crown, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementBadgeProps {
  milestone: number;
  onClose: () => void;
}

const MILESTONE_CONFIG = {
  1: {
    icon: Star,
    title: "Primeira Vitória! 🎉",
    description: "Você completou sua primeira aula!",
    color: "from-yellow-400 to-amber-500",
    bgColor: "from-yellow-50 to-amber-50",
    iconColor: "text-yellow-500"
  },
  5: {
    icon: Trophy,
    title: "Em Chamas! 🔥",
    description: "5 aulas completadas com sucesso!",
    color: "from-orange-400 to-red-500",
    bgColor: "from-orange-50 to-red-50",
    iconColor: "text-orange-500"
  },
  10: {
    icon: Award,
    title: "Imparável! ⚡",
    description: "Incrível! 10 aulas completadas!",
    color: "from-purple-400 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
    iconColor: "text-purple-500"
  },
  25: {
    icon: Crown,
    title: "Mestre em Ascensão! 👑",
    description: "25 aulas! Você está dominando a IA!",
    color: "from-cyan-400 to-blue-500",
    bgColor: "from-cyan-50 to-blue-50",
    iconColor: "text-cyan-500"
  },
  50: {
    icon: Sparkles,
    title: "Lenda da IA! ✨",
    description: "50 aulas completadas! Você é uma inspiração!",
    color: "from-indigo-400 to-purple-600",
    bgColor: "from-indigo-50 to-purple-50",
    iconColor: "text-indigo-500"
  }
};

export function AchievementBadge({ milestone, onClose }: AchievementBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = MILESTONE_CONFIG[milestone as keyof typeof MILESTONE_CONFIG];

  if (!config) return null;

  const Icon = config.icon;

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 100);

    // Confetti celebração
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
      });
    }, 250);

    // Auto-close após 5 segundos
    const timeout = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [milestone]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Badge Card */}
      <div 
        className={`relative bg-gradient-to-br ${config.bgColor} border-2 border-white/50 rounded-3xl shadow-2xl p-8 max-w-md w-full transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600" />
        </button>

        {/* Badge Icon */}
        <div className={`mx-auto w-32 h-32 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center mb-6 shadow-lg animate-[scale-in_0.5s_ease-out] relative`}>
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
          <Icon size={64} className="text-white relative z-10" strokeWidth={2.5} />
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-3 animate-[fade-in_0.6s_ease-out_0.2s_both]">
          <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${config.color}`}>
            {config.title}
          </h2>
          <p className="text-lg text-slate-700 font-medium">
            {config.description}
          </p>
          
          {/* Milestone badge */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${config.color} text-white rounded-full font-bold text-xl shadow-lg mt-4`}>
            <Trophy size={24} />
            <span>{milestone} Aulas</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
          <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${config.color} rounded-full opacity-20 blur-3xl`} />
          <div className={`absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br ${config.color} rounded-full opacity-20 blur-3xl`} />
        </div>
      </div>
    </div>
  );
}
