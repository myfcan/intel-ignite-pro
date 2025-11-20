// src/components/MiniMaia.tsx
// Componente da Liv com animações vivas e interativas

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { LivAvatar } from "./LivAvatar";


interface MiniMaiaProps {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showConfetti?: boolean;
  variant?: 'default' | 'celebration' | 'encouragement';
}

export const MiniMaia = ({ 
  message, 
  onClose, 
  autoClose = false,
  autoCloseDelay = 5000,
  showConfetti = false,
  variant = 'default'
}: MiniMaiaProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 800);

    if (autoClose) {
      const closeTimer = setTimeout(handleClose, autoCloseDelay);
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDelay]);

  if (!isVisible) return null;

  const getAnimationClass = () => {
    switch (variant) {
      case 'celebration':
        return 'animate-bounceIn';
      case 'encouragement':
        return 'animate-slideInUp';
      default:
        return 'animate-scaleIn';
    }
  };

  return (
    <div className="mini-maia-container animate-fadeIn">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">🎉</div>
          <div className="sparkle sparkle-3">⭐</div>
          <div className="sparkle sparkle-4">💫</div>
          <div className="sparkle sparkle-5">🌟</div>
        </div>
      )}

      <div className="mini-maia-card">
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center gap-4 p-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse" />
            
            {variant === 'celebration' && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl opacity-40 animate-spin-slow" />
            )}
            
            <div className={`relative ${isAnimating ? getAnimationClass() : 'animate-float'}`}>
              <LivAvatar 
                size="xl"
                showHalo={variant === 'celebration'}
                animate={true}
              />
              
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 animate-bounce">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className={`relative bg-white rounded-2xl shadow-lg p-5 max-w-md ${isAnimating ? 'animate-slideUp' : ''}`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-wave">💬</span>
                <p className="text-sm font-semibold text-gray-700">
                  {variant === 'celebration' ? 'Oiee...' : 'Olá! Sou a Liv'}
                </p>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                {message}
              </p>

              <div className="flex gap-2 justify-center pt-2">
                {variant === 'celebration' && (
                  <div className="flex gap-1 animate-bounce">
                    <span>🎉</span>
                    <span className="animation-delay-100">🎊</span>
                    <span className="animation-delay-200">✨</span>
                  </div>
                )}
                {variant === 'encouragement' && (
                  <div className="flex gap-1">
                    <span className="animate-pulse">💪</span>
                    <span className="animate-pulse animation-delay-100">🌟</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleClose}
            className={`
              bg-gradient-to-r from-cyan-500 to-pink-500 
              hover:from-cyan-600 hover:to-pink-600 
              text-white px-8 py-3 rounded-full shadow-lg 
              transition-all duration-300 
              hover:scale-105 hover:shadow-xl
              ${isAnimating ? 'animate-slideUp animation-delay-300' : ''}
            `}
          >
            {variant === 'celebration' ? '🎉 Incrível, vamos lá! →' : 'Entendi, vamos lá! →'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const MiniMaiaFloating = ({ 
  message, 
  onClose 
}: { 
  message: string; 
  onClose: () => void;
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideInRight">
      <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs relative">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 hover:bg-gray-200"
        >
          <X size={16} />
        </button>
        
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 flex-shrink-0">
            <LivAvatar 
              size="small"
              animate={false}
              className="animate-float"
            />
          </div>
          
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-700 mb-1">
              💬 Liv diz:
            </p>
            <p className="text-xs text-gray-600">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
