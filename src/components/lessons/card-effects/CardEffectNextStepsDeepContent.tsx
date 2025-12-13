import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, User, Lightbulb, Heart, BookOpen, Rocket } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectNextStepsDeepContent({
  isActive = true,
  title = "Próximos passos para conteúdo profundo",
  subtitle = "Da versão inicial ao produto final."
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Rascunho com etiqueta versão 1 */}
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
                className="relative"
              >
                {/* Documento rascunho */}
                <div className="w-80 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border-2 border-slate-300 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Rascunho Inicial
                      </span>
                    </div>

                    {/* Etiqueta versão 1 */}
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full border border-blue-300 dark:border-blue-700"
                    >
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                        Versão 1
                      </span>
                    </motion.div>
                  </div>

                  {/* Conteúdo básico */}
                  <div className="space-y-3">
                    {[...Array(10)].map((_, idx) => (
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

          {/* Cena 2: Setas levam para etapa de edição humana */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
            >
              {/* Rascunho */}
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: -50 }}
                transition={{ duration: 0.6 }}
                className="w-64 h-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 border-2 border-slate-300 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Rascunho
                    </span>
                  </div>
                  <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                      V1
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 bg-slate-200 dark:bg-slate-700 rounded ${
                        i % 3 === 2 ? 'w-2/3' : 'w-full'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Setas animadas */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                {[0, 1, 2].map((idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.2 }}
                    className="flex items-center"
                  >
                    <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    <div className="w-0 h-0 border-l-6 border-l-indigo-500 border-y-4 border-y-transparent" />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                  className="mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"
                >
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                    Edição Humana
                  </span>
                </motion.div>
              </motion.div>

              {/* Área de edição */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="relative"
              >
                <div className="w-64 h-80 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl shadow-xl p-4 border-2 border-indigo-400 dark:border-indigo-600">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                      Em Edição
                    </span>
                  </div>

                  {/* Ferramentas */}
                  <div className="flex gap-2 mb-3">
                    {[Lightbulb, Heart, BookOpen].map((Icon, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 1.2 + idx * 0.15, type: 'spring' }}
                        className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md"
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 3: Conteúdo ganha novas camadas */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-96 h-96 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-950/20 rounded-2xl shadow-2xl p-6 border-2 border-indigo-500 dark:border-indigo-600">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Conteúdo Enriquecido
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      V2
                    </span>
                  </div>
                </div>

                {/* Camadas de conteúdo */}
                <div className="space-y-4">
                  {[
                    { icon: Lightbulb, label: 'Exemplos pessoais', color: 'from-amber-500 to-orange-500', delay: 0.3 },
                    { icon: Heart, label: 'Histórias reais', color: 'from-pink-500 to-rose-500', delay: 0.6 },
                    { icon: BookOpen, label: 'Tom ajustado', color: 'from-blue-500 to-cyan-500', delay: 0.9 },
                  ].map((layer, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -50, opacity: 0, scale: 0.9 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      transition={{ delay: layer.delay, type: 'spring' }}
                      className="bg-white dark:bg-slate-900/50 rounded-lg p-4 border-2 border-indigo-200 dark:border-indigo-800"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 bg-gradient-to-br ${layer.color} rounded-lg flex items-center justify-center shadow-lg`}>
                          <layer.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {layer.label}
                        </span>
                      </div>
                      <div className="space-y-1.5 ml-13">
                        <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded" />
                        <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded w-5/6" />
                        <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded w-4/6" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Efeito de brilho */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl"
                />
              </div>
            </motion.div>
          )}

          {/* Cena 4: Versão final e seta para publicar */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-8"
            >
              {/* Documento final */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="w-80 h-96 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl shadow-2xl p-6 border-2 border-green-500 dark:border-green-600"
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Versão Final
                      </span>
                    </div>

                    {/* Etiqueta versão final */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full border border-green-400 dark:border-green-700"
                    >
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">
                        Versão Final
                      </span>
                    </motion.div>
                  </div>

                  {/* Camadas visíveis */}
                  <div className="space-y-3">
                    {[
                      { icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
                      { icon: Heart, color: 'from-pink-500 to-rose-500' },
                      { icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
                    ].map((layer, idx) => (
                      <div
                        key={idx}
                        className="bg-white/60 dark:bg-slate-900/30 rounded-lg p-3 border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-7 h-7 bg-gradient-to-br ${layer.color} rounded-lg flex items-center justify-center shadow-md`}>
                            <layer.icon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="space-y-1 ml-9">
                          <div className="h-1 bg-green-200 dark:bg-green-900/30 rounded" />
                          <div className="h-1 bg-green-200 dark:bg-green-900/30 rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Brilho de fundo */}
                  <motion.div
                    animate={{
                      opacity: [0.1, 0.2, 0.1],
                      scale: [1, 1.01, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl"
                  />
                </motion.div>
              </div>

              {/* Seta para publicar */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center"
                >
                  <div className="w-16 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                  <div className="w-0 h-0 border-l-8 border-l-green-500 border-y-6 border-y-transparent" />
                </motion.div>

                {/* Botão publicar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 10px 30px rgba(34, 197, 94, 0.3)',
                        '0 15px 40px rgba(34, 197, 94, 0.5)',
                        '0 10px 30px rgba(34, 197, 94, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center gap-2"
                  >
                    <Rocket className="w-6 h-6 text-white" />
                    <span className="text-sm font-bold text-white">
                      Publicar
                    </span>
                  </motion.div>

                  {/* Partículas */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: Math.cos(i * 60 * Math.PI / 180) * 30,
                        y: Math.sin(i * 60 * Math.PI / 180) * 30
                      }}
                      transition={{
                        duration: 2,
                        delay: 1 + i * 0.15,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full"
                    />
                  ))}
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
                ? 'bg-indigo-600 dark:bg-indigo-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
