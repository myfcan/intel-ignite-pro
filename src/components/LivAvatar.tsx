import { cn } from '@/lib/utils';

interface LivAvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  isPlaying?: boolean;
  showHalo?: boolean;
  animate?: boolean;
  enableHover?: boolean;
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
  enableHover = true,
  className 
}: LivAvatarProps) {
  return (
    <div className={cn(
      "relative inline-block avatar-hover-container group",
      animate && "animate-float",
      className
    )}>
      {/* Halo animado */}
      {showHalo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className={cn(
            "rounded-full bg-primary/20 blur-3xl halo-pulse",
            haloSizeClasses[size]
          )} />
        </div>
      )}

      {/* Ondas de ripple no hover */}
      {enableHover && (
        <>
          <div className="avatar-ripple" style={{ animationDelay: '0s' }} />
          <div className="avatar-ripple" style={{ animationDelay: '0.5s' }} />
          <div className="avatar-ripple" style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Partículas flutuantes */}
      {enableHover && (
        <>
          <div 
            className="avatar-particle bg-primary" 
            style={{ 
              top: '20%', 
              left: '10%',
              animationDelay: '0s',
              '--tx': '-30px',
              '--ty': '-40px'
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle bg-accent" 
            style={{ 
              top: '30%', 
              right: '15%',
              animationDelay: '0.3s',
              '--tx': '40px',
              '--ty': '-50px'
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle bg-primary" 
            style={{ 
              bottom: '25%', 
              left: '20%',
              animationDelay: '0.6s',
              '--tx': '-35px',
              '--ty': '45px'
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle bg-accent" 
            style={{ 
              bottom: '30%', 
              right: '10%',
              animationDelay: '0.9s',
              '--tx': '45px',
              '--ty': '40px'
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle bg-primary/70" 
            style={{ 
              top: '50%', 
              left: '5%',
              animationDelay: '1.2s',
              '--tx': '-25px',
              '--ty': '-30px'
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle bg-accent/70" 
            style={{ 
              top: '50%', 
              right: '5%',
              animationDelay: '1.5s',
              '--tx': '30px',
              '--ty': '-35px'
            } as React.CSSProperties} 
          />
        </>
      )}

      {/* Avatar container */}
      <div className={cn(
        "relative rounded-full overflow-hidden shadow-elegant transition-smooth avatar-glow",
        "bg-gradient-to-br from-primary/10 to-accent/10",
        "border-2 border-primary/30",
        sizeClasses[size],
        isPlaying && "ring-4 ring-primary/40 animate-pulse-glow shadow-glow",
        enableHover && "group-hover:scale-110 group-hover:border-primary/50"
      )}>
        <img 
          src="/liv-avatar.png" 
          alt="Liv - Assistente de IA" 
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            enableHover && "group-hover:scale-105"
          )}
        />
      </div>
    </div>
  );
}
