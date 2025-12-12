import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Instagram, Twitter, Linkedin, BookOpen } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
}

export function CardEffectDeepContentVsRapido({
  isActive = true,
  title = "Por que conteúdo profundo importa?",
  subtitle = "Da atenção rápida à confiança duradoura."
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

  const socialPosts = [
    { icon: Instagram, color: 'from-pink-500 to-purple-500', text: 'Post rápido' },
    { icon: Twitter, color: 'from-blue-400 to-blue-600', text: 'Tweet' },
    { icon: Linkedin, color: 'from-blue-600 to-blue-800', text: 'Update' },
    { icon: FileText, color: 'from-slate-400 to-slate-600', text: 'Story' },
  ];

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
          {/* Cena 1: Timeline de posts rápidos passando */}
          {currentScene === 0 && (
            <motion.div
              key="scene1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-full h-full overflow-hidden">
                {[...Array(12)].map((_, i) => {
                  const Post = socialPosts[i % socialPosts.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: '100%', opacity: 0.8 }}
                      animate={{ x: '-100%', opacity: 0.8 }}
                      transition={{
                        duration: 2,
                        delay: i * 0.15,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      className="absolute"
                      style={{ top: `${(i % 4) * 25}%` }}
                    >
                      <div className={`w-32 h-20 rounded-lg bg-gradient-to-br ${Post.color} p-3 shadow-lg flex flex-col items-center justify-center gap-1`}>
                        <Post.icon className="w-5 h-5 text-white" />
                        <span className="text-xs text-white font-medium">{Post.text}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Cena 2: Timeline desacelera e fica desfocada */}
          {currentScene === 1 && (
            <motion.div
              key="scene2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-full h-full overflow-hidden">
                {[...Array(8)].map((_, i) => {
                  const Post = socialPosts[i % socialPosts.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: 0, opacity: 0.8, filter: 'blur(0px)' }}
                      animate={{
                        x: [0, -50, -100],
                        opacity: [0.8, 0.5, 0.2],
                        filter: ['blur(0px)', 'blur(2px)', 'blur(4px)']
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.1,
                        ease: 'easeOut'
                      }}
                      className="absolute"
                      style={{
                        left: `${20 + (i % 3) * 30}%`,
                        top: `${(i % 4) * 25}%`
                      }}
                    >
                      <div className={`w-28 h-18 rounded-lg bg-gradient-to-br ${Post.color} p-2 shadow-md flex flex-col items-center justify-center gap-1 opacity-60`}>
                        <Post.icon className="w-4 h-4 text-white" />
                        <span className="text-xs text-white">{Post.text}</span>
                      </div>
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                />
              </div>
            </motion.div>
          )}

          {/* Cena 3: Surge bloco grande de livro/curso */}
          {currentScene === 2 && (
            <motion.div
              key="scene3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Posts desfocados ao fundo */}
              <div className="absolute inset-0 blur-md opacity-20">
                {[...Array(6)].map((_, i) => {
                  const Post = socialPosts[i % socialPosts.length];
                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${10 + (i % 3) * 35}%`,
                        top: `${(i % 3) * 30}%`
                      }}
                    >
                      <div className={`w-24 h-16 rounded-lg bg-gradient-to-br ${Post.color} opacity-40`} />
                    </div>
                  );
                })}
              </div>

              {/* Livro/Curso aparecendo */}
              <motion.div
                initial={{ scale: 0, rotateY: -90 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', duration: 1.2, bounce: 0.4 }}
                className="relative z-10"
              >
                <div className="relative">
                  {/* Páginas empilhadas */}
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-2 -top-2 w-48 h-64 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg shadow-xl"
                  />
                  <motion.div
                    animate={{ y: [0, -1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                    className="absolute -right-1 -top-1 w-48 h-64 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-700 rounded-lg shadow-xl"
                  />

                  {/* Livro principal */}
                  <div className="relative w-48 h-64 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-2xl p-6 flex flex-col items-center justify-center border-4 border-white dark:border-slate-800">
                    <BookOpen className="w-16 h-16 text-white mb-4" />
                    <div className="w-full h-1 bg-white/30 mb-2" />
                    <div className="w-3/4 h-1 bg-white/30 mb-2" />
                    <div className="w-full h-1 bg-white/30 mb-4" />
                    <span className="text-xs text-white/80 text-center font-semibold">CONTEÚDO PROFUNDO</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cena 4: Luz foca no bloco, posts desaparecem */}
          {currentScene === 3 && (
            <motion.div
              key="scene4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Posts desaparecendo */}
              {[...Array(6)].map((_, i) => {
                const Post = socialPosts[i % socialPosts.length];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3, scale: 1 }}
                    animate={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 1.5, delay: i * 0.1 }}
                    className="absolute blur-sm"
                    style={{
                      left: `${10 + (i % 3) * 35}%`,
                      top: `${(i % 3) * 30}%`
                    }}
                  >
                    <div className={`w-24 h-16 rounded-lg bg-gradient-to-br ${Post.color}`} />
                  </motion.div>
                );
              })}

              {/* Spotlight no livro */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/40 to-slate-900/80"
              />

              {/* Livro em destaque */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 1 }}
                className="relative z-10"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 40px rgba(99, 102, 241, 0.5)',
                      '0 0 60px rgba(139, 92, 246, 0.7)',
                      '0 0 40px rgba(99, 102, 241, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative"
                >
                  <div className="relative w-48 h-64 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-2xl p-6 flex flex-col items-center justify-center border-4 border-white dark:border-slate-800">
                    <BookOpen className="w-16 h-16 text-white mb-4" />
                    <div className="w-full h-1 bg-white/30 mb-2" />
                    <div className="w-3/4 h-1 bg-white/30 mb-2" />
                    <div className="w-full h-1 bg-white/30 mb-4" />
                    <span className="text-xs text-white/80 text-center font-semibold">CONTEÚDO PROFUNDO</span>
                  </div>

                  {/* Raios de luz */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.25
                      }}
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(${i * 45}deg, transparent, rgba(139, 92, 246, 0.2), transparent)`,
                        transform: `rotate(${i * 45}deg)`
                      }}
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
