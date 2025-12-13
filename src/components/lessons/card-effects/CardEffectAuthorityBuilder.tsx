import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, BookOpen, GraduationCap, Award, User } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectAuthorityBuilder({
  isActive = true,
  title = "Autoridade não nasce em um post",
  subtitle = "Ela é construída em camadas."
}: CardEffectProps) {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, 3500);

    return () => clearInterval(timer);
  }, [isActive]);

  if (!isActive) return null;

  const steps = [
    { icon: Video, label: 'Curso', color: 'from-red-500 to-pink-500' },
    { icon: BookOpen, label: 'eBook', color: 'from-blue-500 to-cyan-500' },
    { icon: GraduationCap, label: 'Série', color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-950 dark:to-amber-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 z-20">
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-slate-600 dark:text-slate-400"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Scene Container */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {/* Cena 1: Escadinha vazia com avatar na base */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Escada */}
              <div className="relative">
                {[0, 1, 2, 3].map((step) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step * 0.2, type: 'spring' }}
                    className="relative"
                    style={{
                      marginLeft: `${step * 60}px`,
                      marginTop: step === 0 ? 0 : '-20px'
                    }}
                  >
                    {/* Degrau */}
                    <div className="w-32 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-md border-2 border-slate-300 dark:border-slate-600" />
                  </motion.div>
                ))}

                {/* Avatar na base */}
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
                  className="absolute -bottom-16 -left-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  {/* Olhar para cima */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ delay: 1.5, duration: 1.5, repeat: Infinity }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2"
                  >
                    <div className="w-1 h-8 bg-gradient-to-t from-emerald-400 to-transparent" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 2: Degraus recebem ícones */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Escada com ícones */}
              <div className="relative">
                {[0, 1, 2, 3].map((step) => {
                  const StepData = steps[step - 1];
                  return (
                    <div
                      key={step}
                      className="relative"
                      style={{
                        marginLeft: `${step * 60}px`,
                        marginTop: step === 0 ? 0 : '-20px'
                      }}
                    >
                      {/* Degrau */}
                      <div className="w-32 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-md border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        {step > 0 && StepData && (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: step * 0.3,
                              type: 'spring',
                              stiffness: 200
                            }}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${StepData.color} flex items-center justify-center shadow-lg`}>
                              <StepData.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {StepData.label}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Avatar na base */}
                <div className="absolute -bottom-16 -left-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cena 3: Avatar subindo com rastro de luz */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Escada */}
              <div className="relative">
                {[0, 1, 2, 3].map((step) => {
                  const StepData = steps[step - 1];
                  return (
                    <div
                      key={step}
                      className="relative"
                      style={{
                        marginLeft: `${step * 60}px`,
                        marginTop: step === 0 ? 0 : '-20px'
                      }}
                    >
                      <div className="w-32 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-md border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        {step > 0 && StepData && (
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${StepData.color} flex items-center justify-center shadow-lg`}>
                              <StepData.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {StepData.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rastro de luz nos degraus já visitados */}
                      {step < 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 0.6, scale: 1 }}
                          transition={{ delay: step * 0.8 }}
                          className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 to-amber-400/40 rounded-lg blur-sm"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Avatar subindo */}
                <motion.div
                  initial={{ x: -8, y: 64 }}
                  animate={{
                    x: [-8, 52, 112, 172],
                    y: [64, 44, 24, 4]
                  }}
                  transition={{
                    duration: 3,
                    times: [0, 0.33, 0.66, 1],
                    ease: 'easeInOut'
                  }}
                  className="absolute bottom-0 left-0"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  {/* Brilho ao redor do avatar */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-emerald-400 rounded-full blur-md -z-10"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 4: Selo de autoridade no topo */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Escada completa */}
              <div className="relative">
                {[0, 1, 2, 3].map((step) => {
                  const StepData = steps[step - 1];
                  return (
                    <div
                      key={step}
                      className="relative"
                      style={{
                        marginLeft: `${step * 60}px`,
                        marginTop: step === 0 ? 0 : '-20px'
                      }}
                    >
                      <div className="w-32 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-md border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        {step > 0 && StepData && (
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${StepData.color} flex items-center justify-center shadow-lg`}>
                              <StepData.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {StepData.label}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Rastro de luz */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 to-amber-400/40 rounded-lg blur-sm" />
                    </div>
                  );
                })}

                {/* Avatar no topo */}
                <div className="absolute top-4 right-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Selo de autoridade */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                  className="absolute -top-24 right-0"
                >
                  <div className="relative">
                    {/* Brilho pulsante */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.6, 0.4]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-amber-400 rounded-full blur-xl"
                    />

                    {/* Selo */}
                    <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                      <Award className="w-12 h-12 text-white" />
                    </div>

                    {/* Raios */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                        transition={{
                          delay: 0.8 + i * 0.1,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute w-1 h-8 bg-amber-400"
                        style={{
                          left: '50%',
                          top: '50%',
                          transformOrigin: 'bottom',
                          transform: `rotate(${i * 45}deg) translateY(-40px)`
                        }}
                      />
                    ))}
                  </div>

                  {/* Texto */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mt-2 text-center"
                  >
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      AUTORIDADE
                    </span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scene indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1, 2, 3].map((scene) => (
          <div
            key={scene}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentScene === scene
                ? 'bg-amber-600 dark:bg-amber-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
