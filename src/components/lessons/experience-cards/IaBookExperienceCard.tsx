import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BookOpen, Sparkles, Zap } from 'lucide-react';

/**
 * 🎬 I.A. BOOK EXPERIENCE CARD
 *
 * Card animado que mostra como a IA pode estruturar um livro inteiro em minutos.
 *
 * Animações:
 * 1. Card entrance (fade + slide up)
 * 2. Book cover appearance (zoom + glow)
 * 3. Title line-by-line
 * 4. Right panel "opens" (scaleX from left)
 * 5. Chapter lines stagger
 * 6. Subtle idle glow pulse
 */

export interface IaBookCardConfig {
  bookTitle: string;
  bookSubtitle?: string;
  coverGradient?: string;
  chapters: Array<{
    number: number;
    title: string;
    description?: string;
  }>;
  aiResponseTitle?: string;
}

interface IaBookExperienceCardProps {
  config: IaBookCardConfig;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

// ===========================================
// ANIMATION VARIANTS
// ===========================================

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom ease
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.4,
    },
  },
};

const bookCoverVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateY: -15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const titleLineVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const panelVariants: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
    originX: 0,
  },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const chapterVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// ===========================================
// COMPONENT
// ===========================================

export function IaBookExperienceCard({
  config,
  isVisible,
  onAnimationComplete,
}: IaBookExperienceCardProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'cover' | 'panel' | 'complete'>('cover');

  const {
    bookTitle,
    bookSubtitle,
    coverGradient = 'from-purple-600 via-violet-600 to-indigo-700',
    chapters,
    aiResponseTitle = 'Estrutura gerada pela I.A.',
  } = config;

  // Control animation phases
  useEffect(() => {
    if (!isVisible) {
      setShowPanel(false);
      setAnimationPhase('cover');
      return;
    }

    // After cover animation, show panel
    const panelTimer = setTimeout(() => {
      setShowPanel(true);
      setAnimationPhase('panel');
    }, 1000);

    // Mark complete after all animations
    const completeTimer = setTimeout(() => {
      setAnimationPhase('complete');
      onAnimationComplete?.();
    }, 2500);

    return () => {
      clearTimeout(panelTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, onAnimationComplete]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="w-full max-w-4xl mx-auto my-8"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Main Card Container */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700/50 overflow-hidden">
            {/* Background Glow Effect */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(600px circle at 0% 0%, rgba(139, 92, 246, 0.15), transparent 50%)',
                  'radial-gradient(600px circle at 100% 100%, rgba(139, 92, 246, 0.15), transparent 50%)',
                  'radial-gradient(600px circle at 0% 0%, rgba(139, 92, 246, 0.15), transparent 50%)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Header */}
            <motion.div
              className="flex items-center gap-2 mb-6"
              variants={titleLineVariants}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-300">Experiência I.A.</span>
            </motion.div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Left: Book Cover */}
              <motion.div
                className="relative"
                variants={bookCoverVariants}
              >
                {/* Book 3D Effect */}
                <div className="relative perspective-1000">
                  <motion.div
                    className={`relative bg-gradient-to-br ${coverGradient} rounded-lg p-6 md:p-8 shadow-2xl min-h-[280px] md:min-h-[320px] flex flex-col justify-between`}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                    animate={animationPhase === 'complete' ? {
                      boxShadow: [
                        '0 20px 60px rgba(139, 92, 246, 0.3)',
                        '0 20px 80px rgba(139, 92, 246, 0.5)',
                        '0 20px 60px rgba(139, 92, 246, 0.3)',
                      ],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Book Spine Effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 rounded-l-lg" />

                    {/* Book Icon */}
                    <motion.div
                      className="flex justify-center mb-4"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>

                    {/* Title */}
                    <div className="text-center space-y-2">
                      <motion.h3
                        className="text-xl md:text-2xl font-bold text-white leading-tight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        {bookTitle}
                      </motion.h3>
                      {bookSubtitle && (
                        <motion.p
                          className="text-sm text-white/70"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                        >
                          {bookSubtitle}
                        </motion.p>
                      )}
                    </div>

                    {/* AI Badge */}
                    <motion.div
                      className="flex justify-center mt-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                        <Zap className="w-3 h-3 text-yellow-300" />
                        <span className="text-xs font-medium text-white/90">Criado com I.A.</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right: AI Response Panel */}
              <AnimatePresence>
                {showPanel && (
                  <motion.div
                    className="relative"
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 h-full">
                      {/* Panel Header */}
                      <motion.div
                        className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50"
                        variants={chapterVariants}
                      >
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-slate-300">{aiResponseTitle}</span>
                      </motion.div>

                      {/* Chapters List */}
                      <div className="space-y-3">
                        {chapters.map((chapter, index) => (
                          <motion.div
                            key={chapter.number}
                            className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                            variants={chapterVariants}
                            custom={index}
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-purple-300">{chapter.number}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">{chapter.title}</h4>
                              {chapter.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{chapter.description}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Typing Indicator */}
                      <motion.div
                        className="mt-4 pt-3 border-t border-slate-700/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="flex gap-1">
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-purple-400"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-purple-400"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-purple-400"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                          <span>Estrutura completa em segundos</span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Glow Line */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IaBookExperienceCard;
