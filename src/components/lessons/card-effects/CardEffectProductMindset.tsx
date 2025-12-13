import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Package, Laptop, Tablet, Smartphone } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectProductMindset: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Pensar como criador de produto",
  subtitle = "Não é só conteúdo, é um ativo"
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

  const papers = Array(8).fill(0);
  const devices = [
    { icon: Laptop, label: 'Desktop' },
    { icon: Tablet, label: 'Tablet' },
    { icon: Smartphone, label: 'Mobile' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-950 dark:to-orange-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
              className="relative w-48 h-48 sm:w-56 sm:h-56"
            >
              {/* Scattered papers */}
              {papers.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    rotate: Math.random() * 40 - 20,
                    opacity: 0
                  }}
                  animate={{ 
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    rotate: Math.random() * 40 - 20,
                    opacity: 1
                  }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute w-12 h-16 sm:w-14 sm:h-18 bg-white dark:bg-slate-800 rounded shadow-md flex items-center justify-center"
                  style={{ left: '50%', top: '50%' }}
                >
                  <FileText className="w-6 h-6 text-slate-400" />
                </motion.div>
              ))}
              <p className="absolute -bottom-8 w-full text-center text-sm text-slate-500 dark:text-slate-400">
                Notas desorganizadas
              </p>
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
              {/* Organizing into box */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                {/* Papers flying into box */}
                {papers.slice(0, 4).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: (i - 1.5) * 40,
                      y: -60,
                      rotate: (i - 2) * 15,
                      opacity: 1
                    }}
                    animate={{ 
                      x: 0,
                      y: 0,
                      rotate: 0,
                      opacity: 0
                    }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="absolute w-10 h-12 bg-white dark:bg-slate-800 rounded shadow-md flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                  </motion.div>
                ))}

                {/* Box */}
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="w-36 h-28 sm:w-44 sm:h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-xl flex flex-col items-center justify-center"
                >
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-1" />
                  <span className="text-xs sm:text-sm font-bold text-white">Curso Completo</span>
                </motion.div>
              </motion.div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Organizando em produto</p>
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
              {/* Box duplicating */}
              <div className="relative">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, opacity: i === 0 ? 1 : 0 }}
                    animate={{ 
                      x: (i - 1) * 50,
                      opacity: 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="absolute w-28 h-22 sm:w-32 sm:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-xl flex flex-col items-center justify-center"
                    style={{ left: '50%', marginLeft: -56 }}
                  >
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-28 text-sm text-slate-500 dark:text-slate-400">Duplicando digitalmente</p>
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
              {/* Devices showing the product */}
              <div className="flex items-end gap-3 sm:gap-4">
                {devices.map((device, i) => (
                  <motion.div
                    key={device.label}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ 
                        boxShadow: ['0 0 0 0 rgba(251, 146, 60, 0)', '0 0 15px 5px rgba(251, 146, 60, 0.3)', '0 0 0 0 rgba(251, 146, 60, 0)']
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className={`bg-slate-800 dark:bg-slate-900 rounded-lg shadow-xl flex items-center justify-center ${
                        i === 0 ? 'w-24 h-16 sm:w-28 sm:h-20' : 
                        i === 1 ? 'w-18 h-24 sm:w-22 sm:h-28' : 
                        'w-12 h-20 sm:w-14 sm:h-24'
                      }`}
                    >
                      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded p-1">
                        <Package className={`text-white ${i === 2 ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'}`} />
                      </div>
                    </motion.div>
                    <device.icon className="w-4 h-4 mt-2 text-slate-500" />
                  </motion.div>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-sm text-slate-600 dark:text-slate-300"
              >
                Escala em múltiplos dispositivos
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
              i === currentScene ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectProductMindset;
