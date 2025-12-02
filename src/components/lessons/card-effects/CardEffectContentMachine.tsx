'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Video, MessageSquare, Share2 } from 'lucide-react';

/**
 * CardEffectContentMachine
 *
 * Animação cinematográfica: Máquina de conteúdo/Content factory
 *
 * Sequência de animação (2-3 segundos):
 * 1. Esteira transportadora aparece com movimento contínuo
 * 2. Ícones de diferentes tipos de conteúdo passam pela esteira
 * 3. Engrenagens giram mostrando produção
 * 4. Posts/cards saem do outro lado prontos para publicação
 */
export const CardEffectContentMachine: React.FC = () => {
  // Tipos de conteúdo na esteira
  const contentTypes = [
    { icon: FileText, color: 'from-blue-400 to-blue-500' },
    { icon: Image, color: 'from-pink-400 to-rose-500' },
    { icon: Video, color: 'from-red-400 to-orange-500' },
    { icon: MessageSquare, color: 'from-purple-400 to-indigo-500' },
    { icon: Share2, color: 'from-green-400 to-teal-500' },
  ];

  // Variantes para a esteira
  const conveyorVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Variantes para os itens na esteira
  const contentItemVariants = {
    initial: { x: -80, opacity: 0, scale: 0.5 },
    animate: (i: number) => ({
      x: [null, 280],
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 1, 0.8],
      transition: {
        delay: 0.5 + (i * 0.5),
        duration: 2.5,
        ease: 'linear' as const,
        repeat: Infinity,
        repeatDelay: contentTypes.length * 0.5 - 0.5
      }
    })
  };

  // Variantes para as engrenagens
  const gearVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.2, duration: 0.3 }
    },
    rotate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'linear' as const
      }
    }
  };

  // Componente de engrenagem
  const Gear: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"
      />
    </svg>
  );

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-orange-900/10 to-slate-900 rounded-xl">
      {/* Factory background effect */}
      <div className="absolute inset-0">
        {/* Smoke/steam effect */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-slate-400/10 rounded-full blur-md"
            style={{
              left: `${20 + i * 15}%`,
              bottom: '70%',
            }}
            animate={{
              y: [0, -40, -80],
              opacity: [0, 0.5, 0],
              scale: [0.5, 1.5, 2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>

      {/* Machine housing */}
      <motion.div
        className="relative z-10"
        variants={conveyorVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top of machine */}
        <div className="relative w-72 h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-2xl border-2 border-slate-600">
          {/* Gears */}
          <motion.div
            className="absolute top-2 left-4 text-orange-400"
            variants={gearVariants}
            initial="hidden"
            animate={["visible", "rotate"]}
          >
            <Gear size={28} />
          </motion.div>
          <motion.div
            className="absolute top-6 left-8 text-orange-300"
            variants={gearVariants}
            initial="hidden"
            animate={["visible", "rotate"]}
            style={{ animationDirection: 'reverse' }}
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Gear size={20} />
            </motion.div>
          </motion.div>
          <motion.div
            className="absolute top-2 right-4 text-orange-400"
            variants={gearVariants}
            initial="hidden"
            animate={["visible", "rotate"]}
          >
            <Gear size={28} />
          </motion.div>
          <motion.div
            className="absolute top-6 right-8 text-orange-300"
            variants={gearVariants}
            initial="hidden"
            animate={["visible", "rotate"]}
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Gear size={20} />
            </motion.div>
          </motion.div>

          {/* "IA" label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="px-4 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-white font-bold text-lg shadow-lg"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(249, 115, 22, 0.3)',
                  '0 0 20px rgba(249, 115, 22, 0.5)',
                  '0 0 10px rgba(249, 115, 22, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              I.A.
            </motion.div>
          </div>
        </div>

        {/* Conveyor belt */}
        <div className="relative w-72 h-16 bg-gradient-to-b from-slate-800 to-slate-900 border-x-2 border-b-2 border-slate-600 overflow-hidden">
          {/* Belt track lines */}
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundPositionX: '40px' }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 15px, rgba(100,116,139,0.3) 15px, rgba(100,116,139,0.3) 25px, transparent 25px, transparent 40px)',
              backgroundSize: '40px 100%'
            }}
          />

          {/* Belt surface */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-700 to-slate-600 border-t border-slate-500" />

          {/* Content items moving on belt */}
          {contentTypes.map((content, i) => {
            const Icon = content.icon;
            return (
              <motion.div
                key={i}
                className="absolute top-2"
                custom={i}
                variants={contentItemVariants}
                initial="initial"
                animate="animate"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${content.color} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Output chute */}
        <div className="absolute -right-8 bottom-4 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center transform rotate-12">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Share2 className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Output indicators */}
      <motion.div
        className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        {['Post', 'Story', 'Reel'].map((label, i) => (
          <motion.div
            key={label}
            className="px-2 py-1 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-400"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + (i * 0.2) }}
          >
            ✓ {label}
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom label */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-orange-300/70 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
      >
        Produzindo conteúdo...
      </motion.div>
    </div>
  );
};

export default CardEffectContentMachine;
