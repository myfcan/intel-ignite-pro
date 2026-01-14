/**
 * V7NarrativeVisualOverlay - Preenche gaps visuais durante narração
 * 
 * Renderiza visuais cinematográficos congruentes quando não há conteúdo de fase específico.
 * Usa efeitos sutis que complementam a narração sem distrair.
 * 
 * Features:
 * - Gradientes animados baseados no mood da narração
 * - Ícones/emojis temáticos que pulsam suavemente
 * - Texto de destaque sincronizado com palavras-chave
 * - Efeitos de luz dinâmicos
 */

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, Target, Zap, Brain, Star, Trophy, Rocket } from 'lucide-react';

interface V7NarrativeVisualOverlayProps {
  /** Current narration text being spoken */
  currentText?: string;
  /** Word timestamps for sync */
  wordTimestamps?: Array<{ word: string; start: number; end: number }>;
  /** Current audio time */
  currentTime: number;
  /** Whether audio is playing */
  isPlaying: boolean;
  /** Mood of the narrative section */
  mood?: 'dramatic' | 'calm' | 'energetic' | 'mysterious' | 'inspiring';
  /** Whether to show the overlay */
  enabled?: boolean;
}

// Keywords that trigger visual emphasis
const EMPHASIS_KEYWORDS = {
  success: ['sucesso', 'dominar', 'perfeito', 'excelente', 'incrível', 'resultados', 'ganhar', 'vencer', 'conquistar'],
  insight: ['segredo', 'descobrir', 'revelar', 'entender', 'saber', 'aprender', 'conhecer', 'perceber'],
  warning: ['cuidado', 'erro', 'perigo', 'problema', 'falha', 'maioria', '98%', 'brincando'],
  action: ['agora', 'fazer', 'aplicar', 'usar', 'começar', 'criar', 'construir', 'prompt'],
  highlight: ['importante', 'chave', 'essencial', 'fundamental', 'crítico', 'diferença', 'inteligente', '2%'],
};

// Get mood-based visual config
const getMoodConfig = (mood: string) => {
  switch (mood) {
    case 'dramatic':
      return {
        gradient: 'from-red-900/20 via-transparent to-orange-900/20',
        accentColor: 'rgba(239, 68, 68, 0.4)',
        iconColor: 'text-red-400',
        glowColor: 'rgba(239, 68, 68, 0.3)',
      };
    case 'energetic':
      return {
        gradient: 'from-amber-900/20 via-transparent to-yellow-900/20',
        accentColor: 'rgba(251, 191, 36, 0.4)',
        iconColor: 'text-amber-400',
        glowColor: 'rgba(251, 191, 36, 0.3)',
      };
    case 'calm':
      return {
        gradient: 'from-cyan-900/20 via-transparent to-teal-900/20',
        accentColor: 'rgba(34, 211, 238, 0.4)',
        iconColor: 'text-cyan-400',
        glowColor: 'rgba(34, 211, 238, 0.3)',
      };
    case 'inspiring':
      return {
        gradient: 'from-emerald-900/20 via-transparent to-cyan-900/20',
        accentColor: 'rgba(52, 211, 153, 0.4)',
        iconColor: 'text-emerald-400',
        glowColor: 'rgba(52, 211, 153, 0.3)',
      };
    case 'mysterious':
    default:
      return {
        gradient: 'from-purple-900/20 via-transparent to-indigo-900/20',
        accentColor: 'rgba(168, 85, 247, 0.4)',
        iconColor: 'text-purple-400',
        glowColor: 'rgba(168, 85, 247, 0.3)',
      };
  }
};

// Get icon based on detected keyword category
const getEmphasisIcon = (category: string) => {
  switch (category) {
    case 'success':
      return <Trophy className="w-12 h-12 md:w-16 md:h-16" />;
    case 'insight':
      return <Lightbulb className="w-12 h-12 md:w-16 md:h-16" />;
    case 'warning':
      return <Target className="w-12 h-12 md:w-16 md:h-16" />;
    case 'action':
      return <Rocket className="w-12 h-12 md:w-16 md:h-16" />;
    case 'highlight':
      return <Star className="w-12 h-12 md:w-16 md:h-16" />;
    default:
      return <Sparkles className="w-12 h-12 md:w-16 md:h-16" />;
  }
};

export const V7NarrativeVisualOverlay: React.FC<V7NarrativeVisualOverlayProps> = ({
  currentText,
  wordTimestamps = [],
  currentTime,
  isPlaying,
  mood = 'mysterious',
  enabled = true,
}) => {
  const [emphasisCategory, setEmphasisCategory] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  
  const moodConfig = useMemo(() => getMoodConfig(mood), [mood]);
  
  // Detect emphasis keywords in current word
  useEffect(() => {
    if (!wordTimestamps.length) return;
    
    // Find current word based on time
    const currentWord = wordTimestamps.find(
      wt => currentTime >= wt.start && currentTime <= wt.end
    );
    
    if (currentWord) {
      const word = currentWord.word.toLowerCase().replace(/[.,!?]/g, '');
      setActiveWord(word);
      
      // Check for emphasis keywords
      for (const [category, keywords] of Object.entries(EMPHASIS_KEYWORDS)) {
        if (keywords.some(kw => word.includes(kw))) {
          setEmphasisCategory(category);
          // Clear after 2 seconds
          setTimeout(() => setEmphasisCategory(null), 2000);
          break;
        }
      }
    }
  }, [currentTime, wordTimestamps]);
  
  if (!enabled) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Animated gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${moodConfig.gradient}`}
        animate={{
          opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.2,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating orbs / light effects */}
      <div className="absolute inset-0">
        {/* Top-left orb */}
        <motion.div
          className="absolute top-[15%] left-[10%] w-32 h-32 md:w-48 md:h-48 rounded-full blur-3xl"
          style={{ backgroundColor: moodConfig.accentColor }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Bottom-right orb */}
        <motion.div
          className="absolute bottom-[25%] right-[10%] w-40 h-40 md:w-56 md:h-56 rounded-full blur-3xl"
          style={{ backgroundColor: moodConfig.accentColor }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.15, 0.3],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        
        {/* Center subtle glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: moodConfig.glowColor }}
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      
      {/* Emphasis icon on keyword detection */}
      <AnimatePresence>
        {emphasisCategory && (
          <motion.div
            className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Icon with glow */}
            <motion.div
              className={`${moodConfig.iconColor} p-4 rounded-full`}
              style={{
                background: `radial-gradient(circle, ${moodConfig.accentColor} 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
              }}
            >
              {getEmphasisIcon(emphasisCategory)}
            </motion.div>
            
            {/* Active word display */}
            {activeWord && (
              <motion.span
                className="text-white/80 text-lg font-medium px-4 py-2 rounded-lg backdrop-blur-sm"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  textShadow: `0 0 20px ${moodConfig.glowColor}`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {activeWord.toUpperCase()}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle scan lines for cinematic effect */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
};

export default V7NarrativeVisualOverlay;
