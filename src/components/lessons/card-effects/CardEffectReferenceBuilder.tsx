'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Users, TrendingUp, Crown, MessageCircle } from 'lucide-react';

interface CardEffectReferenceBuilderProps {
  isActive?: boolean;
}

export const CardEffectReferenceBuilder: React.FC<CardEffectReferenceBuilderProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [reputation, setReputation] = useState(0);
  const [followers, setFollowers] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => setScene(2), 1200),
    ];

    // Animação do contador
    if (scene >= 2) {
      const repInterval = setInterval(() => {
        setReputation(prev => {
          if (prev >= 100) {
            clearInterval(repInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      const followInterval = setInterval(() => {
        setFollowers(prev => {
          if (prev >= 50) {
            clearInterval(followInterval);
            return 50;
          }
          return prev + 1;
        });
      }, 60);

      return () => {
        clearInterval(repInterval);
        clearInterval(followInterval);
      };
    }

    const timer2 = setTimeout(() => setScene(3), 4500);
    timers.push(timer2);

    return () => timers.forEach(clearTimeout);
  }, [isActive, scene]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900 border border-yellow-500/30">
      {/* Estrelas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Star className="w-2 h-2 text-yellow-400/30" fill="currentColor" />
          </motion.div>
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <h3 className="text-base font-bold text-white mb-1">Construtor de Autoridade</h3>
          <p className="text-[10px] text-yellow-300">Vire referência no mercado</p>
        </motion.div>

        {/* Avatar central com coroa */}
        <motion.div
          className="relative mb-4"
          animate={{
            scale: scene >= 2 ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 flex items-center justify-center">
            <Users className="w-8 h-8 text-yellow-300" />
          </div>
          
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="absolute -top-3 left-1/2 -translate-x-1/2"
              >
                <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: scene >= 2 
                ? ['0 0 20px rgba(234, 179, 8, 0.3)', '0 0 40px rgba(234, 179, 8, 0.5)', '0 0 20px rgba(234, 179, 8, 0.3)']
                : 'none'
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-2 text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
              <span className="text-lg font-bold text-yellow-300">{reputation}%</span>
            </div>
            <p className="text-[8px] text-yellow-400/70">Reputação</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-2 text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="w-3 h-3 text-orange-400" />
              <span className="text-lg font-bold text-orange-300">{followers}</span>
            </div>
            <p className="text-[8px] text-orange-400/70">Indicações</p>
          </motion.div>
        </div>

        {/* Benefícios */}
        <div className="w-full max-w-xs space-y-1">
          {[
            'Clientes procuram você',
            'Preços mais altos',
            'Menos esforço de venda'
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: scene >= 2 ? 1 : 0.3,
                x: 0 
              }}
              transition={{ delay: index * 0.2 + 0.5 }}
              className="flex items-center gap-2 text-[10px] text-slate-300"
            >
              <Award className={`w-3 h-3 ${scene >= 2 ? 'text-yellow-400' : 'text-slate-600'}`} />
              <span>{benefit}</span>
            </motion.div>
          ))}
        </div>

        {/* Mensagem final */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-3 py-1.5"
            >
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-300 font-medium">
                Autoridade construída!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#eab308' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500/20 border border-yellow-400/30 rounded-full px-2 py-0.5"
      >
        <Crown className="w-3 h-3 text-yellow-400" />
        <span className="text-[9px] text-yellow-300 font-medium">Expert</span>
      </motion.div>
    </div>
  );
};

export default CardEffectReferenceBuilder;
