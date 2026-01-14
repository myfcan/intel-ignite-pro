/**
 * V7ExitConfirmModal - Modal de confirmação de saída da aula
 * Exibido quando o usuário tenta sair durante a execução da aula
 */

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              playSound('click-soft');
              onContinue();
            }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[301] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                         rounded-2xl border border-white/10 shadow-2xl p-6 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  playSound('click-soft');
                  onContinue();
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/40 hover:text-white/80 
                           hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <motion.div
                className="flex justify-center mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Sair da aula?
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-center text-white/60 text-sm mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Seu progresso nesta sessão não será salvo.<br />
                Tem certeza que deseja sair?
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {/* Continue button - Primary */}
                <motion.button
                  onClick={() => {
                    playSound('click-confirm');
                    onContinue();
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 
                             text-white font-semibold rounded-xl flex items-center justify-center gap-2
                             shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-5 h-5" />
                  Continuar Aula
                </motion.button>

                {/* Exit button - Secondary */}
                <motion.button
                  onClick={() => {
                    playSound('click-soft');
                    onConfirmExit();
                  }}
                  className="w-full py-3.5 px-4 bg-white/5 border border-white/10 
                             text-white/70 font-medium rounded-xl flex items-center justify-center gap-2
                             hover:bg-white/10 hover:text-white transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
