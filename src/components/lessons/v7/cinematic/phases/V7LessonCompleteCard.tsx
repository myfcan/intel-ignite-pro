/**
 * V7LessonCompleteCard - Card de conclusão de aula V7-vv
 * Exibe parabéns ao aluno e botão para continuar para exercícios
 */

import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface V7LessonCompleteCardProps {
  onContinue: () => void;
  avatarUrl?: string;
}

export const V7LessonCompleteCard = ({
  onContinue,
  avatarUrl = '/placeholder.svg'
}: V7LessonCompleteCardProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <motion.div
        className="relative max-w-md w-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Glow border effect */}
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-purple-500/30 blur-sm -z-10" />

        {/* Avatar with glow ring */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute -inset-3 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)'
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            {/* Avatar container */}
            <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Title with confetti emoji */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <span className="text-cyan-600">◼</span>
            Aula completa! Parabéns!
            <span className="text-2xl">🎉</span>
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-center text-slate-600 mb-8 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Você concluiu todo o conteúdo!<br />
          Agora vamos praticar com a IA e fixar o conhecimento.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={onContinue}
          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 10px 30px rgba(56, 189, 248, 0.4)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Rocket className="w-5 h-5" />
          Continuar
        </motion.button>
      </motion.div>
    </div>
  );
};

export default V7LessonCompleteCard;
