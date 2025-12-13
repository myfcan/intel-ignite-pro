import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, Award, DoorOpen } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectBeyondSelling: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Muito além de vender",
  subtitle = "Impacto, clareza e novas possibilidades"
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneDuration = ((duration || 14) * 1000) / 4;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, sceneDuration);
    return () => clearInterval(timer);
  }, [isActive, sceneDuration]);

  const impactIcons = [
    { icon: Users, label: 'Aprendizado', color: 'from-blue-400 to-blue-600' },
    { icon: Award, label: 'Certificado', color: 'from-amber-400 to-amber-600' },
    { icon: DoorOpen, label: 'Oportunidades', color: 'from-green-400 to-green-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-yellow-50/30 dark:from-slate-950 dark:to-yellow-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 z-10"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{subtitle}</p>
      </motion.div>

      {/* Main Content */}
      <div className="relative flex-1 w-full max-w-lg flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Big money symbol */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl flex items-center justify-center"
              >
                <DollarSign className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Foco inicial no dinheiro</p>
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Money shrinking, icons appearing */}
              <div className="relative flex items-center justify-center gap-4 sm:gap-6">
                {/* Shrinking money */}
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 0.6 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center"
                >
                  <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>

                {/* Growing icons */}
                {impactIcons.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.color} rounded-full shadow-lg flex items-center justify-center`}
                  >
                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Novos valores surgindo</p>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Icons bigger than money */}
              <div className="relative flex items-center justify-center gap-3 sm:gap-4">
                {/* Small money */}
                <motion.div
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.5 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg flex items-center justify-center"
                >
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>

                {/* Larger impact icons */}
                {impactIcons.map((item, i) => (
                  <motion.div
                    key={item.label}
                    animate={{ 
                      boxShadow: ['0 0 0 0 rgba(251, 191, 36, 0)', '0 0 15px 5px rgba(251, 191, 36, 0.3)', '0 0 0 0 rgba(251, 191, 36, 0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${item.color} rounded-full shadow-xl flex items-center justify-center`}>
                      <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <span className="text-xs mt-1 text-slate-600 dark:text-slate-400">{item.label}</span>
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Valor além da venda</p>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Focus on the door/opportunity */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                {/* Open door with light */}
                <motion.div
                  animate={{ 
                    boxShadow: ['0 0 20px 10px rgba(251, 191, 36, 0.2)', '0 0 40px 20px rgba(251, 191, 36, 0.4)', '0 0 20px 10px rgba(251, 191, 36, 0.2)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-44 sm:w-40 sm:h-52 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-t-full rounded-b-lg shadow-2xl flex flex-col items-center justify-center relative overflow-hidden"
                >
                  {/* Light rays */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="absolute w-1 bg-white/50"
                      style={{
                        height: '100%',
                        transform: `rotate(${(i - 2) * 15}deg)`,
                        transformOrigin: 'bottom center'
                      }}
                    />
                  ))}
                  
                  <DoorOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white z-10" />
                  <span className="text-sm font-bold text-white mt-2 z-10">Novas</span>
                  <span className="text-sm font-bold text-white z-10">Oportunidades</span>
                </motion.div>

                {/* Small icons around */}
                {impactIcons.slice(0, 2).map((item, i) => (
                  <motion.div
                    key={item.label}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className={`absolute w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${item.color} rounded-full shadow-lg flex items-center justify-center`}
                    style={{
                      top: 20 + i * 60,
                      left: i === 0 ? -30 : 'auto',
                      right: i === 1 ? -30 : 'auto'
                    }}
                  >
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-sm text-slate-600 dark:text-slate-300"
              >
                Impacto duradouro
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentScene ? 'bg-yellow-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectBeyondSelling;
