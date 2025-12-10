import { cn } from '@/lib/utils';
import { useAvatarState } from '@/contexts/AvatarStateContext';
import livAvatarImg from '@/assets/liv-avatar.png';

interface LivAvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  isPlaying?: boolean;
  showHalo?: boolean;
  animate?: boolean;
  enableHover?: boolean;
  className?: string;
  theme?: 'fundamentos' | 'dia-a-dia' | 'negocios' | 'renda' | 'criativa' | 'etica' | 'automacoes' | 'default';
  state?: 'idle' | 'thinking' | 'speaking' | 'listening';
}

const sizeClasses = {
  small: 'w-14 h-14',
  medium: 'w-24 h-24',
  large: 'w-28 h-28',
  xl: 'w-40 h-40'
};

const haloSizeClasses = {
  small: 'w-24 h-24',
  medium: 'w-44 h-44',
  large: 'w-52 h-52',
  xl: 'w-64 h-64'
};

export function LivAvatar({ 
  size = 'medium', 
  isPlaying = false,
  showHalo = false,
  animate = true,
  enableHover = true,
  className,
  theme = 'default',
  state
}: LivAvatarProps) {
  const { state: contextState } = useAvatarState();
  
  // Usar state do contexto se não for passado explicitamente
  const effectiveState = state || contextState;

  // Define theme colors based on trail
  const getThemeColors = () => {
    switch(theme) {
      case 'fundamentos':
        return {
          primary: 'hsl(var(--trail-fundamentos-primary))',
          accent: 'hsl(var(--trail-fundamentos-accent))',
          glow: 'hsl(var(--trail-fundamentos-glow))'
        };
      case 'dia-a-dia':
        return {
          primary: 'hsl(var(--trail-dia-a-dia-primary))',
          accent: 'hsl(var(--trail-dia-a-dia-accent))',
          glow: 'hsl(var(--trail-dia-a-dia-glow))'
        };
      case 'negocios':
        return {
          primary: 'hsl(var(--trail-negocios-primary))',
          accent: 'hsl(var(--trail-negocios-accent))',
          glow: 'hsl(var(--trail-negocios-glow))'
        };
      case 'renda':
        return {
          primary: 'hsl(var(--trail-renda-primary))',
          accent: 'hsl(var(--trail-renda-accent))',
          glow: 'hsl(var(--trail-renda-glow))'
        };
      case 'criativa':
        return {
          primary: 'hsl(var(--trail-criativa-primary))',
          accent: 'hsl(var(--trail-criativa-accent))',
          glow: 'hsl(var(--trail-criativa-glow))'
        };
      case 'etica':
        return {
          primary: 'hsl(var(--trail-etica-primary))',
          accent: 'hsl(var(--trail-etica-accent))',
          glow: 'hsl(var(--trail-etica-glow))'
        };
      case 'automacoes':
        return {
          primary: 'hsl(var(--trail-automacoes-primary))',
          accent: 'hsl(var(--trail-automacoes-accent))',
          glow: 'hsl(var(--trail-automacoes-glow))'
        };
      default:
        return {
          primary: 'hsl(var(--primary))',
          accent: 'hsl(var(--accent))',
          glow: 'hsl(var(--primary))'
        };
    }
  };

  const themeColors = getThemeColors();
  
  // Animações baseadas no estado
  const getStateAnimation = () => {
    switch(effectiveState) {
      case 'thinking':
        return 'animate-[avatar-thinking_2s_ease-in-out_infinite]';
      case 'speaking':
        return 'animate-[avatar-speaking-glow_1.5s_ease-in-out_infinite]';
      case 'listening':
        return 'animate-[avatar-breathe_4s_ease-in-out_infinite]';
      case 'idle':
      default:
        return 'animate-[avatar-idle-glow_3s_ease-in-out_infinite]';
    }
  };

  return (
    <div className={cn(
      "relative inline-block avatar-hover-container group transition-all duration-500 pt-2",
      animate && "animate-float",
      className
    )}>
      {/* Halo animado */}
      {showHalo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div 
            className={cn("rounded-full blur-3xl halo-pulse", haloSizeClasses[size])}
            style={{ backgroundColor: `${themeColors.primary}33` }}
          />
        </div>
      )}

      {/* Ondas de ripple no hover */}
      {enableHover && (
        <>
          <div className="avatar-ripple" style={{ animationDelay: '0s', borderColor: themeColors.primary }} />
          <div className="avatar-ripple" style={{ animationDelay: '0.5s', borderColor: themeColors.primary }} />
          <div className="avatar-ripple" style={{ animationDelay: '1s', borderColor: themeColors.primary }} />
        </>
      )}

      {/* Partículas flutuantes */}
      {enableHover && (
        <>
          <div 
            className="avatar-particle" 
            style={{ 
              top: '20%', 
              left: '10%',
              animationDelay: '0s',
              '--tx': '-30px',
              '--ty': '-40px',
              backgroundColor: themeColors.primary
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle" 
            style={{ 
              top: '30%', 
              right: '15%',
              animationDelay: '0.3s',
              '--tx': '40px',
              '--ty': '-50px',
              backgroundColor: themeColors.accent
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle" 
            style={{ 
              bottom: '25%', 
              left: '20%',
              animationDelay: '0.6s',
              '--tx': '-35px',
              '--ty': '45px',
              backgroundColor: themeColors.primary
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle" 
            style={{ 
              bottom: '30%', 
              right: '10%',
              animationDelay: '0.9s',
              '--tx': '45px',
              '--ty': '40px',
              backgroundColor: themeColors.accent
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle" 
            style={{ 
              top: '50%', 
              left: '5%',
              animationDelay: '1.2s',
              '--tx': '-25px',
              '--ty': '-30px',
              backgroundColor: themeColors.primary,
              opacity: 0.7
            } as React.CSSProperties} 
          />
          <div 
            className="avatar-particle" 
            style={{ 
              top: '50%', 
              right: '5%',
              animationDelay: '1.5s',
              '--tx': '30px',
              '--ty': '-35px',
              backgroundColor: themeColors.accent,
              opacity: 0.7
            } as React.CSSProperties} 
          />
        </>
      )}

      {/* Avatar container */}
      <div 
        className={cn(
          "relative rounded-full overflow-hidden transition-all duration-700",
          sizeClasses[size],
          getStateAnimation(),
          enableHover && "group-hover:scale-110",
          effectiveState === 'thinking' && "scale-[1.02]",
          effectiveState === 'speaking' && "scale-[1.05]"
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 255, 0.95) 100%)',
          borderWidth: '3px',
          borderStyle: 'solid',
          borderColor: effectiveState === 'thinking' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : effectiveState === 'speaking'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.85)',
          boxShadow: effectiveState === 'thinking'
            ? `0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.5)`
            : effectiveState === 'speaking'
            ? `0 0 50px rgba(139, 92, 246, 0.7), 0 0 100px rgba(139, 92, 246, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.6)`
            : `0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.4)`,
          transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(isPlaying && {
            boxShadow: `0 0 0 4px rgba(255, 255, 255, 0.8), 0 0 60px rgba(139, 92, 246, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.5)`
          })
        }}
      >
        <img 
          src={livAvatarImg} 
          alt="Liv - Assistente de IA" 
          loading="eager"
          decoding="async"
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            enableHover && "group-hover:scale-105",
            effectiveState === 'thinking' && "brightness-110",
            effectiveState === 'speaking' && "brightness-105 saturate-110"
          )}
        />
      </div>
    </div>
  );
}
