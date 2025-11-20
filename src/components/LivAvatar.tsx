import { cn } from '@/lib/utils';

interface LivAvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  isPlaying?: boolean;
  showHalo?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  small: 'w-14 h-14',
  medium: 'w-28 h-28',
  large: 'w-32 h-32',
  xl: 'w-44 h-44'
};

const haloSizeClasses = {
  small: 'w-20 h-20',
  medium: 'w-36 h-36',
  large: 'w-40 h-40',
  xl: 'w-52 h-52'
};

export function LivAvatar({ 
  size = 'medium', 
  isPlaying = false,
  showHalo = false,
  animate = true,
  className 
}: LivAvatarProps) {
  return (
    <div className={cn("relative inline-block", animate && "animate-float", className)}>
      {/* Halo animado */}
      {showHalo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className={cn(
            "rounded-full bg-primary/20 blur-3xl halo-pulse",
            haloSizeClasses[size]
          )} />
        </div>
      )}

      {/* Avatar container */}
      <div className={cn(
        "relative rounded-full overflow-hidden shadow-elegant transition-smooth",
        "bg-gradient-to-br from-primary/10 to-accent/10",
        "border-2 border-primary/30",
        sizeClasses[size],
        isPlaying && "ring-4 ring-primary/40 animate-pulse-glow shadow-glow"
      )}>
        <img 
          src="/liv-avatar.png" 
          alt="Liv - Assistente de IA" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
