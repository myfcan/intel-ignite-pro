import { cn } from '@/lib/utils';

interface LivAvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  isPlaying?: boolean;
  showHalo?: boolean;
  animate?: boolean;
  enableHover?: boolean;
  className?: string;
  theme?: 'fundamentos' | 'dia-a-dia' | 'negocios' | 'renda' | 'criativa' | 'etica' | 'automacoes' | 'default';
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
  className,
  theme = 'default'
}: LivAvatarProps) {
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
  return (
    <div className={cn(
      "relative inline-block avatar-hover-container group",
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
          "relative rounded-full overflow-hidden shadow-elegant transition-smooth avatar-glow",
          sizeClasses[size],
          enableHover && "group-hover:scale-110"
        )}
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}1A 0%, ${themeColors.accent}1A 100%)`,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: `${themeColors.primary}4D`,
          ...(isPlaying && {
            boxShadow: `0 0 0 4px ${themeColors.primary}66, 0 0 40px ${themeColors.glow}66`
          })
        }}
      >
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
