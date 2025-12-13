import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Sparkles, Monitor, BookOpen } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectVisualAiHelper({
  isActive = true,
  title = "Assistente Visual IA",
  subtitle = "Crie designs profissionais em segundos."
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-pink-50/30 dark:from-slate-950 dark:to-pink-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Barra com descrição sendo digitada */}
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
                className="w-full max-w-lg"
              >
                {/* Input bar */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Gerador de Imagens IA
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Descreva o que você precisa
                      </span>
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border-2 border-pink-200 dark:border-pink-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.5, duration: 2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Capa para eBook de produtividade moderna
                      </p>
                    </motion.div>

                    {/* Cursor */}
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-pink-500 ml-1"
                    />
                  </div>

                  {/* Generate button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 }}
                    className="mt-4 w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Gerar Imagens
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 2: Três miniaturas aparecem */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex flex-col gap-6">
                {/* Barra de pesquisa menor */}
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 0.7, y: -80 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Capa para eBook de produtividade moderna
                    </p>
                  </div>
                </motion.div>

                {/* Três opções */}
                <div className="flex gap-4">
                  {[
                    { color: 'from-blue-500 to-cyan-500', icon: BookOpen },
                    { color: 'from-purple-500 to-pink-500', icon: Image },
                    { color: 'from-amber-500 to-orange-500', icon: Monitor },
                  ].map((option, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0, y: 50 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.3 + idx * 0.2,
                        type: 'spring',
                        stiffness: 150
                      }}
                      className="relative"
                    >
                      {/* Miniatura */}
                      <div className="w-32 h-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-3 flex flex-col items-center justify-center">
                        <div className={`w-20 h-28 bg-gradient-to-br ${option.color} rounded-lg flex items-center justify-center mb-2`}>
                          <option.icon className="w-10 h-10 text-white" />
                        </div>
                        <div className="w-full space-y-1">
                          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        </div>
                      </div>

                      {/* Badge de opção */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-700 dark:bg-slate-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <span className="text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Cena 3: Uma é selecionada e ampliada */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Opções não selecionadas ao fundo */}
                {[
                  { x: -160, opacity: 0.3, color: 'from-blue-500 to-cyan-500', icon: BookOpen },
                  { x: 160, opacity: 0.3, color: 'from-amber-500 to-orange-500', icon: Monitor },
                ].map((bg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: 0, opacity: 1 }}
                    animate={{ x: bg.x, opacity: bg.opacity, scale: 0.8 }}
                    transition={{ duration: 0.6 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-32 h-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-700 p-3 blur-sm">
                      <div className={`w-20 h-28 bg-gradient-to-br ${bg.color} rounded-lg flex items-center justify-center`}>
                        <bg.icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Opção selecionada */}
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.5 }}
                  transition={{ type: 'spring', stiffness: 150 }}
                  className="relative z-10"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 10px 30px rgba(236, 72, 153, 0.3)',
                        '0 20px 50px rgba(236, 72, 153, 0.5)',
                        '0 10px 30px rgba(236, 72, 153, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-32 h-44 bg-white dark:bg-slate-800 rounded-xl border-4 border-pink-500 dark:border-pink-600 p-3 flex flex-col items-center justify-center"
                  >
                    <div className="w-20 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-2">
                      <Image className="w-10 h-10 text-white" />
                    </div>
                    <div className="w-full space-y-1">
                      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    </div>
                  </motion.div>

                  {/* Selo de selecionado */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="absolute -top-3 -right-3"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-800">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Cena 4: Capa encaixada em mockup */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, rotateY: -20 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', duration: 1 }}
                className="relative"
              >
                {/* Mockup de livro em 3D */}
                <div className="relative" style={{ perspective: '1000px' }}>
                  {/* Páginas atrás */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotateY: [0, 2, 0] }}
                      transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                      className="absolute w-56 h-80 bg-white dark:bg-slate-700 rounded-r-lg shadow-2xl"
                      style={{
                        right: -8 - i * 3,
                        top: -4 - i * 2,
                        transformStyle: 'preserve-3d',
                        zIndex: -i
                      }}
                    />
                  ))}

                  {/* Capa principal */}
                  <motion.div
                    animate={{ rotateY: [0, 3, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative w-56 h-80 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-2xl border-4 border-white dark:border-slate-800 p-6 flex flex-col items-center justify-center"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Image className="w-16 h-16 text-white mb-4" />
                    <div className="space-y-2 mb-4">
                      <div className="h-3 w-40 bg-white/90 rounded" />
                      <div className="h-3 w-32 bg-white/90 rounded" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-28 bg-white/70 rounded" />
                      <div className="h-1.5 w-24 bg-white/70 rounded" />
                    </div>

                    {/* Borda decorativa */}
                    <div className="absolute inset-4 border-2 border-white/30 rounded" />
                  </motion.div>
                </div>

                {/* Brilho ao redor */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-2xl -z-10"
                />

                {/* Sparkles ao redor */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: Math.cos(i * 60 * Math.PI / 180) * 80,
                      y: Math.sin(i * 60 * Math.PI / 180) * 80
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.5 + i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute top-1/2 left-1/2"
                  >
                    <Sparkles className="w-6 h-6 text-pink-400" />
                  </motion.div>
                ))}

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                >
                  <div className="bg-pink-100 dark:bg-pink-900/40 px-4 py-2 rounded-full border border-pink-400 dark:border-pink-600">
                    <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">
                      Design Pronto
                    </span>
                  </div>
                </motion.div>
              </motion.div>
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
                ? 'bg-pink-600 dark:bg-pink-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
