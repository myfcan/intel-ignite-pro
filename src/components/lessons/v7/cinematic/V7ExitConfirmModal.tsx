/**
 * V7ExitConfirmModal - Modal de confirmação de saída da aula
 * Exibido quando o usuário tenta sair durante a execução da aula
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Play, LogOut } from 'lucide-react';
import { useV7SoundEffects } from './useV7SoundEffects';

interface V7ExitConfirmModalProps {
  isOpen: boolean;
  onConfirmExit: () => void;
  onContinue: () => void;
}

export const V7ExitConfirmModal = ({
  isOpen,
  onConfirmExit,
  onContinue
}: V7ExitConfirmModalProps) => {
  const { playSound } = useV7SoundEffects(0.6, true);
  const [isExiting, setIsExiting] = React.useState(false);

  const handleConfirmExit = () => {
    playSound('click-soft');
    setIsExiting(true);
    // Wait for exit animation to complete before calling onConfirmExit
    setTimeout(() => {
      onConfirmExit();
    }, 600);
  };

  const handleContinue = () => {
    playSound('click-confirm');
    onContinue();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 1 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              if (!isExiting) {
                playSound('click-soft');
                onContinue();
              }
            }}
          />

          {/* Exit transition overlay */}
          <AnimatePresence>
            {isExiting && (
              <motion.div
                className="fixed inset-0 z-[302] bg-black pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
            )}
          </AnimatePresence>

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[301] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                         rounded-2xl border border-white/10 shadow-2xl p-6 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ 
                opacity: isExiting ? 0 : 1, 
                scale: isExiting ? 0.8 : 1, 
                y: isExiting ? 40 : 0 
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                ...(isExiting && { duration: 0.4, ease: [0.4, 0, 0.2, 1] })
              }}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  if (!isExiting) {
                    playSound('click-soft');
                    onContinue();
                  }
                }}
                disabled={isExiting}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/40 hover:text-white/80 
                           hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <motion.div
                className="flex justify-center mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: isExiting ? 0.8 : 1, opacity: isExiting ? 0 : 1 }}
                transition={{ delay: isExiting ? 0 : 0.1, type: 'spring', stiffness: 200 }}
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 
                               flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-xl font-bold text-center text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -10 : 0 }}
                transition={{ delay: isExiting ? 0 : 0.15, duration: 0.3 }}
              >
                Sair da aula?
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-center text-white/60 text-sm mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExiting ? 0 : 1 }}
                transition={{ delay: isExiting ? 0 : 0.2, duration: 0.3 }}
              >
                Seu progresso nesta sessão não será salvo.<br />
                Tem certeza que deseja sair?
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? 20 : 0 }}
                transition={{ delay: isExiting ? 0 : 0.25, duration: 0.3 }}
              >
                {/* Continue button - Primary */}
                <motion.button
                  onClick={handleContinue}
                  disabled={isExiting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 
                             text-white font-semibold rounded-xl flex items-center justify-center gap-2
                             shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isExiting ? { scale: 1.02 } : {}}
                  whileTap={!isExiting ? { scale: 0.98 } : {}}
                >
                  <Play className="w-5 h-5" />
                  Continuar Aula
                </motion.button>

                {/* Exit button - Secondary */}
                <motion.button
                  onClick={handleConfirmExit}
                  disabled={isExiting}
                  className="w-full py-3.5 px-4 bg-white/5 border border-white/10 
                             text-white/70 font-medium rounded-xl flex items-center justify-center gap-2
                             hover:bg-white/10 hover:text-white transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isExiting ? { scale: 1.02 } : {}}
                  whileTap={!isExiting ? { scale: 0.98 } : {}}
                >
                  <LogOut className="w-5 h-5" />
                  Sair da Aula
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default V7ExitConfirmModal;
