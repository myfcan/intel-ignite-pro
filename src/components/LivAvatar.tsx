import { cn } from '@/lib/utils';

interface LivAvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  useVideo?: boolean;
  isPlaying?: boolean;
  showHalo?: boolean;
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
  useVideo = true,
  isPlaying = false,
  showHalo = false,
  className 
}: LivAvatarProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      {/* Halo animado */}
      {showHalo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className={cn(
            "rounded-full bg-cyan-300/30 blur-3xl halo-pulse",
            haloSizeClasses[size]
          )} />
        </div>
      )}

      {/* Avatar container */}
      <div className={cn(
        "relative rounded-full overflow-hidden border-2 border-white/40 shadow-xl",
        "bg-gradient-to-br from-sky-400/20 to-purple-500/20",
        sizeClasses[size],
        isPlaying && "ring-4 ring-cyan-400/50 animate-pulse-glow"
      )}>
        {useVideo ? (
          <video
            src="/liv-avatar.mp4"
            poster="/liv-avatar.png"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src="/liv-avatar.png" 
            alt="Liv" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
