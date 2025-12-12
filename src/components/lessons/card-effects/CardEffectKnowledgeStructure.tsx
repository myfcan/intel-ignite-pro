import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, StickyNote, FileText, Users, BookOpen } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectKnowledgeStructure({
  isActive = true,
  title = "Do solto ao estruturado",
  subtitle = "Quando o que você sabe vira um projeto único."
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

  const items = [
    { icon: MessageSquare, color: 'from-blue-500 to-cyan-500', label: 'Ideia' },
    { icon: StickyNote, color: 'from-yellow-500 to-amber-500', label: 'Nota' },
    { icon: FileText, color: 'from-purple-500 to-pink-500', label: 'Rascunho' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
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
          {/* Cena 1: Ícones soltos caindo desorganizados */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {[...Array(15)].map((_, i) => {
                const Item = items[i % items.length];
                return (
                  <motion.div
                    key={i}
                    initial={{
                      y: -100,
                      x: Math.random() * 400 - 200,
                      rotate: 0,
                      opacity: 0
                    }}
                    animate={{
                      y: Math.random() * 500,
                      x: Math.random() * 400 - 200,
                      rotate: Math.random() * 360 - 180,
                      opacity: 1
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      ease: 'easeOut'
                    }}
                    className="absolute"
                  >
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${Item.color} p-3 shadow-lg flex flex-col items-center justify-center gap-1`}>
                      <Item.icon className="w-6 h-6 text-white" />
                      <span className="text-xs text-white font-medium">{Item.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Cena 2: Linhas guias organizando em colunas */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Linhas guias verticais */}
              {[0, 1, 2].map((col) => (
                <motion.div
                  key={`guide-${col}`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 0.3 }}
                  transition={{ duration: 0.5, delay: col * 0.2 }}
                  className="absolute w-1 h-3/4 bg-blue-400 dark:bg-blue-600"
                  style={{ left: `${25 + col * 25}%` }}
                />
              ))}

              {/* Ícones sendo organizados em colunas */}
              {[...Array(9)].map((_, i) => {
                const Item = items[i % items.length];
                const col = i % 3;
                const row = Math.floor(i / 3);
                return (
                  <motion.div
                    key={i}
                    initial={{
                      x: Math.random() * 400 - 200,
                      y: Math.random() * 400 - 200,
                      rotate: Math.random() * 360 - 180,
                      scale: 1
                    }}
                    animate={{
                      x: (col - 1) * 150,
                      y: (row - 1) * 120,
                      rotate: 0,
                      scale: 0.9
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      type: 'spring',
                      stiffness: 100
                    }}
                    className="absolute"
                  >
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${Item.color} p-2 shadow-md flex flex-col items-center justify-center`}>
                      <Item.icon className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                );
              })}

              {/* Linhas conectando os itens */}
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 1 }}
                className="absolute inset-0 w-full h-full"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.line
                    key={i}
                    x1={`${30 + (i % 3) * 25}%`}
                    y1="40%"
                    x2={`${30 + (i % 3) * 25}%`}
                    y2="60%"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-300 dark:text-blue-700"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 1.5 + i * 0.1 }}
                  />
                ))}
              </motion.svg>
            </motion.div>
          )}

          {/* Cena 3: Colunas se fundem em retângulo grande */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Colunas fundindo */}
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute flex gap-8"
              >
                {[0, 1, 2].map((col) => (
                  <div key={col} className="w-24 h-48 bg-gradient-to-b from-blue-400/40 to-purple-400/40 rounded-lg" />
                ))}
              </motion.div>

              {/* Retângulo grande surgindo */}
              <motion.div
                initial={{ scale: 0, rotateY: -90 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  delay: 0.5,
                  type: 'spring',
                  duration: 1.2,
                  bounce: 0.3
                }}
                className="relative"
              >
                <div className="w-72 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-2xl p-6 flex flex-col border-4 border-white dark:border-slate-800">
                  {/* Título no topo */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mb-6"
                  >
                    <div className="w-full h-3 bg-white/90 rounded mb-2" />
                    <div className="w-3/4 h-2 bg-white/70 rounded" />
                  </motion.div>

                  {/* Seções */}
                  {[0, 1, 2].map((section) => (
                    <motion.div
                      key={section}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + section * 0.2 }}
                      className="mb-4"
                    >
                      <div className="w-1/2 h-2 bg-white/60 rounded mb-2" />
                      <div className="space-y-1">
                        <div className="w-full h-1 bg-white/40 rounded" />
                        <div className="w-5/6 h-1 bg-white/40 rounded" />
                        <div className="w-4/6 h-1 bg-white/40 rounded" />
                      </div>
                    </motion.div>
                  ))}

                  {/* Ícone central */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2, type: 'spring' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 4: Avatares aparecem ao redor */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Material organizado */}
              <div className="w-72 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-2xl p-6 flex flex-col border-4 border-white dark:border-slate-800">
                <div className="mb-6">
                  <div className="w-full h-3 bg-white/90 rounded mb-2" />
                  <div className="w-3/4 h-2 bg-white/70 rounded" />
                </div>
                {[0, 1, 2].map((section) => (
                  <div key={section} className="mb-4">
                    <div className="w-1/2 h-2 bg-white/60 rounded mb-2" />
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-white/40 rounded" />
                      <div className="w-5/6 h-1 bg-white/40 rounded" />
                      <div className="w-4/6 h-1 bg-white/40 rounded" />
                    </div>
                  </div>
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Avatares ao redor */}
              {[...Array(6)].map((_, i) => {
                const angle = (i * 60) * (Math.PI / 180);
                const radius = 220;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, x, y }}
                    transition={{
                      delay: i * 0.15,
                      type: 'spring',
                      stiffness: 200
                    }}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%'
                    }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      {/* Linha de olhar para o material */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="absolute w-1 bg-emerald-400"
                        style={{
                          height: `${radius - 24}px`,
                          left: '50%',
                          top: '50%',
                          transformOrigin: 'top',
                          transform: `rotate(${180 + i * 60}deg)`
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
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
                ? 'bg-blue-600 dark:bg-blue-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
