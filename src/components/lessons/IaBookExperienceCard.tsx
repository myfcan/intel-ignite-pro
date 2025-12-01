import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function IaBookExperienceCard() {
  const [showBook, setShowBook] = useState(false);
  const [pageFlips, setPageFlips] = useState<number[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [chaptersVisible, setChaptersVisible] = useState(0);

  const chapters = [
    "Introdução: por que a Inteligência Artificial está em todo lugar",
    "Tipos de I.A. e onde eles aparecem no dia a dia",
    "Como conversar com a I.A.: prompts e boas práticas",
    "Aplicações práticas: trabalho, estudos e negócios"
  ];

  useEffect(() => {
    const sequence = async () => {
      // 1. Show book dramatically
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowBook(true);
      
      // 2. Flip pages one by one - SLOWER for drama
      await new Promise(resolve => setTimeout(resolve, 1000));
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 250));
        setPageFlips(prev => [...prev, i]);
      }
      
      // 3. Show content after pages opened
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowContent(true);
      
      // 4. Reveal chapters
      for (let i = 0; i < chapters.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 350));
        setChaptersVisible(i + 1);
      }
    };
    
    sequence();
  }, [chapters.length]);

  return (
    <motion.div
      className="relative w-full rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card via-muted/20 to-card p-8 md:p-12 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_hsl(var(--primary)/0.15)_0%,_transparent_50%)] pointer-events-none" />
      
      {/* Main content grid */}
      <div className="relative z-10 grid md:grid-cols-[340px_1fr] gap-12 items-center">
        
        {/* LEFT: 3D Book with dramatic page flipping */}
        <div className="flex items-center justify-center" style={{ perspective: "2000px" }}>
          <AnimatePresence>
            {showBook && (
              <motion.div
                className="relative w-72 h-96"
                initial={{ 
                  scale: 0.2, 
                  rotateY: -120,
                  rotateX: 60,
                  z: -500,
                  opacity: 0
                }}
                animate={{ 
                  scale: 1, 
                  rotateY: 0,
                  rotateX: 0,
                  z: 0,
                  opacity: 1
                }}
                transition={{ 
                  duration: 1.6,
                  ease: [0.16, 1, 0.3, 1],
                  scale: { type: "spring", stiffness: 80, damping: 12 }
                }}
                style={{ 
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Dramatic glow pulse */}
                <motion.div
                  className="absolute inset-0 rounded-2xl blur-3xl"
                  style={{ background: "hsl(var(--primary)/0.5)" }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Book cover base */}
                <div 
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-2xl border-2 border-primary/30 overflow-visible"
                  style={{ 
                    transformStyle: "preserve-3d",
                    boxShadow: "0 30px 60px -15px hsl(var(--primary)/0.6), 0 0 100px hsl(var(--primary)/0.3)"
                  }}
                >
                  {/* Pages that flip open - ULTRA DRAMATIC 3D rotation */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`page-${i}`}
                      className="absolute inset-y-2 left-2 right-2 rounded-l-xl border-r-2"
                      initial={{ 
                        rotateY: 0,
                        x: 0,
                        scale: 1,
                        z: 0,
                        originX: 0
                      }}
                      animate={pageFlips.includes(i) ? { 
                        rotateY: [0, -45, -90, -135, -175, -180],
                        x: [0, -20, -40, -50, -(i + 1) * 8, -(i + 1) * 8],
                        scale: [1, 1.02, 1.04, 1.02, 1, 1],
                        z: [0, 50, 100, 50, 0, 0],
                        transition: {
                          duration: 1.4,
                          ease: [0.43, 0.13, 0.23, 0.96],
                          times: [0, 0.2, 0.4, 0.6, 0.85, 1]
                        }
                      } : {}}
                      style={{ 
                        transformStyle: "preserve-3d",
                        transformOrigin: "left center",
                        zIndex: 10 - i,
                        backfaceVisibility: "hidden",
                        background: `linear-gradient(to right, 
                          hsl(var(--primary-foreground) / ${0.25 - i * 0.03}), 
                          hsl(var(--primary-foreground) / ${0.18 - i * 0.03}), 
                          hsl(var(--primary-foreground) / ${0.12 - i * 0.03}))`,
                        borderColor: `hsl(var(--primary-foreground) / ${0.3 - i * 0.05})`
                      }}
                    >
                      {/* Dynamic shadow based on rotation */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent"
                        animate={pageFlips.includes(i) ? {
                          opacity: [0, 0.4, 0.6, 0.4, 0.2, 0]
                        } : {}}
                        transition={{ duration: 1.4 }}
                      />
                      
                      {/* Page edge highlight */}
                      <motion.div 
                        className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-foreground/40 via-primary-foreground/20 to-primary-foreground/40"
                        animate={pageFlips.includes(i) ? {
                          opacity: [0, 1, 1, 0.5, 0]
                        } : {}}
                        transition={{ duration: 1.4 }}
                      />
                    </motion.div>
                  ))}

                  {/* Book content - appears after pages flip */}
                  <AnimatePresence>
                    {showContent && (
                      <motion.div 
                        className="relative z-20 h-full flex flex-col items-center justify-center px-8 py-10 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <motion.div 
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/15 border border-primary-foreground/30 backdrop-blur-sm mb-6"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <BookOpen className="w-4 h-4 text-primary-foreground" />
                          <span className="text-xs uppercase tracking-wider font-bold text-primary-foreground">
                            I.A. Book
                          </span>
                        </motion.div>
                        
                        <motion.h3 
                          className="text-xl font-black text-primary-foreground leading-tight mb-5"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          Seu Primeiro Livro
                          <br />
                          com Inteligência
                          <br />
                          Artificial
                        </motion.h3>
                        
                        <motion.p 
                          className="text-sm text-primary-foreground/90 leading-relaxed font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          Índice, capítulos e revisão
                          <br />
                          estruturados em minutos
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: AI Interface */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border-2 border-primary/30"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0)",
                  "0 0 0 4px hsl(var(--primary) / 0.1)",
                  "0 0 0 0 hsl(var(--primary) / 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className="w-2.5 h-2.5 rounded-full bg-primary"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-bold text-primary uppercase tracking-wide">
                I.A. Trabalhando
              </span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Main title */}
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-2">
              Livro estruturado em minutos
            </h2>
            <h2 className="text-3xl md:text-4xl font-black text-primary leading-tight">
              com Inteligência Artificial
            </h2>
          </div>

          {/* AI Response panel */}
          <div className="bg-muted/40 border-2 border-primary/20 rounded-2xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Resposta da I.A.
                </span>
              </div>
              <span className="text-xs text-primary font-semibold px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                Índice gerado
              </span>
            </div>

            {/* Chapters list */}
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <AnimatePresence key={index}>
                  {chaptersVisible > index && (
                    <motion.div
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -30, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ 
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                    >
                      {/* Chapter number */}
                      <motion.div 
                        className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 border-2 border-primary/40 flex items-center justify-center shadow-lg"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 0.1,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <span className="text-base font-black text-primary-foreground">
                          {index + 1}
                        </span>
                      </motion.div>

                      {/* Chapter text */}
                      <motion.p 
                        className="flex-1 text-base font-semibold text-foreground leading-relaxed pt-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        {chapter}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>

            {/* Bottom note */}
            {chaptersVisible >= chapters.length && (
              <motion.div
                className="pt-4 border-t-2 border-primary/20 flex items-start gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground font-medium italic">
                  De "tenho uma ideia" para "tenho um índice estruturado" em minutos.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
