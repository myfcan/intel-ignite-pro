import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, FileText, Clipboard, AlignLeft, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}

const CardEffectSupportMaterials: React.FC<CardEffectProps> = ({
  isActive = true,
  duration = 14,
  title = "Materiais de apoio sem sofrimento",
  subtitle = "Roteiros, PDFs e descrições gerados rápido"
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

  const materials = [
    { icon: Video, label: 'Vídeo', color: 'from-red-400 to-red-600' },
    { icon: FileText, label: 'PDF', color: 'from-blue-400 to-blue-600' },
    { icon: Clipboard, label: 'Ficha', color: 'from-green-400 to-green-600' },
    { icon: AlignLeft, label: 'Texto', color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-50 to-pink-50/30 dark:from-slate-950 dark:to-pink-950/20 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
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
      <div className="relative flex-1 w-full max-w-md flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Central orb */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px 10px rgba(236, 72, 153, 0.2)',
                    '0 0 40px 20px rgba(236, 72, 153, 0.4)',
                    '0 0 20px 10px rgba(236, 72, 153, 0.2)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </motion.div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Fonte de conhecimento</p>
            </motion.div>
          )}

          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center"
            >
              {/* Central orb */}
              <motion.div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center z-10"
              >
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              {/* Rays */}
              <div className="absolute inset-0 flex items-center justify-center">
                {materials.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      width: 4,
                      height: 80,
                      background: 'linear-gradient(to bottom, rgba(236, 72, 153, 0.8), transparent)',
                      transformOrigin: 'top',
                      transform: `rotate(${i * 90 - 45}deg) translateY(-40px)`,
                    }}
                    className="rounded-full"
                  />
                ))}
              </div>
              <p className="mt-20 text-sm text-slate-500 dark:text-slate-400">Raios se dividindo...</p>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Central orb */}
              <div className="flex items-center justify-center mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>

              {/* Materials forming */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {materials.map((material, i) => (
                  <motion.div
                    key={material.label}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                    className={`w-24 h-20 sm:w-28 sm:h-24 bg-gradient-to-br ${material.color} rounded-xl shadow-lg flex flex-col items-center justify-center gap-1`}
                  >
                    <material.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    <span className="text-xs font-bold text-white">{material.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center"
            >
              {/* Central orb */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mb-6"
              >
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* Materials around */}
              <div className="relative">
                {materials.map((material, i) => {
                  const angle = (i * 90) * (Math.PI / 180);
                  const radius = 80;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <motion.div
                      key={material.label}
                      initial={{ x: 0, y: 0 }}
                      animate={{ x, y }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -28, marginTop: -28 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${material.color} rounded-xl shadow-lg flex items-center justify-center`}
                    >
                      <material.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </motion.div>
                  );
                })}

                {/* Connecting lines */}
                <svg className="absolute inset-0 w-64 h-64 -ml-32 -mt-32 pointer-events-none" style={{ left: '50%', top: '50%' }}>
                  {materials.map((_, i) => {
                    const angle = (i * 90) * (Math.PI / 180);
                    const x = Math.cos(angle) * 80 + 128;
                    const y = Math.sin(angle) * 80 + 128;
                    return (
                      <motion.line
                        key={i}
                        x1="128"
                        y1="128"
                        x2={x}
                        y2={y}
                        stroke="rgba(236, 72, 153, 0.4)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      />
                    );
                  })}
                </svg>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-24 text-sm text-slate-600 dark:text-slate-300"
              >
                Todos os materiais prontos
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
              i === currentScene ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectSupportMaterials;
