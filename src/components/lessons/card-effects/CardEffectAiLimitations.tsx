import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, AlertCircle, User, Edit3, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectAiLimitations({
  isActive = true,
  title = "Limitações da IA",
  subtitle = "A IA cria, você aprimora."
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
          {/* Cena 1: Texto longo gerado por IA */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="relative w-96 h-96"
              >
                {/* Documento */}
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
                  {/* Header do documento */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Texto Gerado
                      </span>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        IA
                      </span>
                    </motion.div>
                  </div>

                  {/* Conteúdo do texto */}
                  <div className="space-y-3">
                    {[...Array(12)].map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '100%', opacity: 1 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        className="overflow-hidden"
                      >
                        <div
                          className={`h-2 bg-slate-200 dark:bg-slate-700 rounded ${
                            idx % 4 === 3 ? 'w-2/3' : 'w-full'
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 2: Lupa destaca erros */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-96 h-96">
                {/* Documento */}
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Texto Gerado
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        IA
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo com erros destacados */}
                  <div className="space-y-3 relative">
                    {[...Array(12)].map((_, idx) => {
                      const hasError = [2, 5, 8].includes(idx);
                      return (
                        <div
                          key={idx}
                          className={`h-2 rounded ${
                            hasError
                              ? 'bg-amber-200 dark:bg-amber-900/40 border-2 border-amber-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          } ${idx % 4 === 3 ? 'w-2/3' : 'w-full'}`}
                        >
                          {hasError && (
                            <motion.div
                              initial={{ scale: 0, x: -10 }}
                              animate={{ scale: 1, x: 0 }}
                              transition={{ delay: 0.3 * (idx / 3), type: 'spring' }}
                              className="absolute -right-8"
                            >
                              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lupa */}
                <motion.div
                  initial={{ scale: 0, x: -50, y: -50 }}
                  animate={{ scale: 1, x: 0, y: 0 }}
                  transition={{ type: 'spring', stiffness: 150 }}
                  className="absolute top-1/3 right-0"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-slate-800"
                  >
                    <Search className="w-12 h-12 text-white" />
                  </motion.div>

                  {/* Raios de busca */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.6, 0] }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity
                      }}
                      className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-amber-400"
                      style={{
                        transformOrigin: 'left',
                        transform: `rotate(${-30 + i * 30}deg)`
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 3: Humano corrige o texto */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
            >
              {/* Avatar humano */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring' }}
                className="relative"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800">
                  <User className="w-12 h-12 text-white" />
                </div>

                {/* Lápis digital */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                </motion.div>

                {/* Linhas de edição */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, opacity: 0 }}
                    animate={{ x: 60, opacity: [0, 1, 0] }}
                    transition={{
                      delay: 1 + i * 0.4,
                      duration: 1.5
                    }}
                    className="absolute top-1/2 right-0 w-16 h-0.5 bg-blue-500"
                  />
                ))}
              </motion.div>

              {/* Documento sendo editado */}
              <div className="relative w-80 h-80">
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-blue-400 dark:border-blue-600 p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Em Revisão
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Edit3 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        Editando
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[...Array(10)].map((_, idx) => {
                      const isEdited = [2, 5, 8].includes(idx);
                      return (
                        <motion.div
                          key={idx}
                          animate={isEdited ? {
                            backgroundColor: ['rgb(226, 232, 240)', 'rgb(191, 219, 254)', 'rgb(226, 232, 240)']
                          } : {}}
                          transition={isEdited ? {
                            duration: 1.5,
                            delay: 0.5 * (idx / 3)
                          } : {}}
                          className={`h-2 rounded ${
                            isEdited
                              ? 'bg-blue-200 dark:bg-blue-900/40'
                              : 'bg-slate-200 dark:bg-slate-700'
                          } ${idx % 4 === 3 ? 'w-2/3' : 'w-full'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cena 4: Selo de revisado */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Documento final */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="w-96 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-green-500 dark:border-green-600 p-6"
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Texto Final
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        Revisado
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[...Array(10)].map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 bg-green-100 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-900/40 ${
                          idx % 4 === 3 ? 'w-2/3' : 'w-full'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Brilho de fundo */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl"
                  />
                </motion.div>

                {/* Selo grande */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                  className="absolute -bottom-6 -right-6"
                >
                  <div className="relative">
                    {/* Brilho pulsante */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-green-400 rounded-full blur-xl"
                    />

                    {/* Selo */}
                    <div className="relative w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white dark:border-slate-800">
                      <CheckCircle className="w-14 h-14 text-white mb-1" />
                      <span className="text-xs font-bold text-white">REVISADO</span>
                    </div>

                    {/* Texto abaixo */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <div className="bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full border border-green-400 dark:border-green-600">
                        <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                          Por Você
                        </span>
                      </div>
                    </motion.div>

                    {/* Raios */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          delay: 0.5 + i * 0.1,
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute w-1 h-8 bg-green-400"
                        style={{
                          left: '50%',
                          top: '50%',
                          transformOrigin: 'bottom',
                          transform: `rotate(${i * 45}deg) translateY(-50px)`
                        }}
                      />
                    ))}
                  </div>
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
