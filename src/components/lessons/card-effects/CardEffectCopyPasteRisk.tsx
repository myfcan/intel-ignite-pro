import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, AlertTriangle, Palette, Sparkles, Award } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectCopyPasteRisk({
  isActive = true,
  title = "Risco do copiar e colar",
  subtitle = "Conteúdo genérico não gera autoridade."
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-red-50/30 dark:from-slate-950 dark:to-red-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Documentos idênticos sendo duplicados */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Documento original */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="w-48 h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-xl p-4 border-2 border-slate-300 dark:border-slate-600"
                >
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-slate-400 dark:bg-slate-600 rounded" />
                    <div className="h-3 bg-slate-400 dark:bg-slate-600 rounded w-3/4" />
                  </div>
                  <div className="space-y-1.5">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 bg-slate-400 dark:bg-slate-600 rounded ${
                          i % 3 === 2 ? 'w-2/3' : 'w-full'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Ícone de copy */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="absolute -top-4 -right-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800">
                    <Copy className="w-6 h-6 text-white" />
                  </div>
                </motion.div>

                {/* Duplicatas surgindo */}
                {[1, 2, 3].map((idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      x: idx * 60,
                      y: idx * 20,
                      opacity: 0.8
                    }}
                    transition={{
                      delay: 1.2 + idx * 0.3,
                      type: 'spring',
                      stiffness: 150
                    }}
                    className="absolute top-0 left-0 w-48 h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-xl p-4 border-2 border-slate-300 dark:border-slate-600"
                    style={{ zIndex: -idx }}
                  >
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-slate-400 dark:bg-slate-600 rounded" />
                      <div className="h-3 bg-slate-400 dark:bg-slate-600 rounded w-3/4" />
                    </div>
                    <div className="space-y-1.5">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 bg-slate-400 dark:bg-slate-600 rounded ${
                            i % 3 === 2 ? 'w-2/3' : 'w-full'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 2: Todos ganham ícone de alerta */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.15, type: 'spring' }}
                    className="relative"
                  >
                    <div className="w-32 h-44 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-xl p-3 border-2 border-red-400 dark:border-red-600">
                      <div className="space-y-1.5 mb-3">
                        <div className="h-2 bg-slate-400 dark:bg-slate-600 rounded" />
                        <div className="h-2 bg-slate-400 dark:bg-slate-600 rounded w-3/4" />
                      </div>
                      <div className="space-y-1">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 bg-slate-400 dark:bg-slate-600 rounded ${
                              i % 3 === 2 ? 'w-2/3' : 'w-full'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Alerta */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8 + idx * 0.15, type: 'spring' }}
                      className="absolute -top-3 -right-3"
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800"
                        >
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </motion.div>

                        {/* Pulso de alerta */}
                        <motion.div
                          animate={{
                            scale: [1, 2, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            delay: idx * 0.2,
                            repeat: Infinity
                          }}
                          className="absolute inset-0 bg-red-400 rounded-full"
                        />
                      </div>
                    </motion.div>

                    {/* Badge genérico */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + idx * 0.15 }}
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <div className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full border border-red-400 dark:border-red-600">
                        <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                          Genérico
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cena 3: Um documento é puxado e recebe ajustes */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
            >
              {/* Documentos genéricos ao fundo */}
              <div className="flex gap-2 opacity-30">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="w-24 h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-lg border-2 border-red-400 dark:border-red-600 blur-sm"
                  />
                ))}
              </div>

              {/* Documento sendo customizado */}
              <motion.div
                initial={{ x: -100, scale: 0.8 }}
                animate={{ x: 0, scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 150 }}
                className="relative"
              >
                <div className="w-48 h-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 border-2 border-blue-500 dark:border-blue-600">
                  {/* Ajustes de cores */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-1 mb-3"
                  >
                    {['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500'].map((color, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + idx * 0.1, type: 'spring' }}
                        className={`w-6 h-6 ${color} rounded-full border-2 border-white dark:border-slate-700`}
                      />
                    ))}
                  </motion.div>

                  {/* Títulos personalizados */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="space-y-2 mb-4"
                  >
                    <div className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
                    <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded w-3/4" />
                  </motion.div>

                  {/* Conteúdo personalizado */}
                  <div className="space-y-1.5">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ backgroundColor: 'rgb(226, 232, 240)' }}
                        animate={{
                          backgroundColor: [
                            'rgb(226, 232, 240)',
                            'rgb(191, 219, 254)',
                            'rgb(226, 232, 240)'
                          ]
                        }}
                        transition={{ delay: 1.2 + i * 0.1, duration: 0.8 }}
                        className={`h-1.5 rounded ${
                          i % 3 === 2 ? 'w-2/3' : 'w-full'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Ferramentas de edição */}
                {[
                  { icon: Palette, color: 'from-pink-500 to-rose-600', x: -20, y: -20, delay: 0.3 },
                  { icon: Sparkles, color: 'from-amber-500 to-orange-600', x: 20, y: -20, delay: 0.5 },
                ].map((tool, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, x: tool.x, y: tool.y }}
                    transition={{ delay: tool.delay, type: 'spring' }}
                    className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${tool.color} rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800`}
                  >
                    <tool.icon className="w-6 h-6 text-white" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Cena 4: Documento ganha identidade e selo de original */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Documento final personalizado */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="w-56 h-72 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl shadow-2xl p-5 border-2 border-gradient-to-r from-blue-500 to-purple-500"
                >
                  {/* Palette de cores personalizada */}
                  <div className="flex gap-1.5 mb-4">
                    {['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500'].map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-7 h-7 ${color} rounded-full border-2 border-white dark:border-slate-700 shadow-md`}
                      />
                    ))}
                  </div>

                  {/* Títulos únicos */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded shadow-sm" />
                    <div className="h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded w-3/4 shadow-sm" />
                  </div>

                  {/* Conteúdo personalizado */}
                  <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900/40 dark:to-purple-900/40 rounded ${
                          i % 3 === 2 ? 'w-2/3' : 'w-full'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Brilho de destaque */}
                  <motion.div
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl"
                  />
                </motion.div>

                {/* Selo de ORIGINAL */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                  className="absolute -bottom-8 -right-8"
                >
                  <div className="relative">
                    {/* Brilho pulsante */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl"
                    />

                    {/* Selo */}
                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white dark:border-slate-800">
                      <Award className="w-12 h-12 text-white mb-1" />
                      <span className="text-xs font-bold text-white">ORIGINAL</span>
                    </div>

                    {/* Raios rotativos */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                          delay: 0.5 + i * 0.1,
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 0.5
                        }}
                        className="absolute w-1 h-10 bg-gradient-to-t from-purple-400 to-transparent"
                        style={{
                          left: '50%',
                          top: '50%',
                          transformOrigin: 'bottom',
                          transform: `rotate(${i * 45}deg) translateY(-50px)`
                        }}
                      />
                    ))}
                  </div>

                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  >
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 px-4 py-1.5 rounded-full border border-blue-400 dark:border-blue-600">
                      <span className="text-xs font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                        Identidade Única
                      </span>
                    </div>
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
                ? 'bg-red-600 dark:bg-red-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
