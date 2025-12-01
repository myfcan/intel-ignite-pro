import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function IaBookExperienceCard() {
  const [showBook, setShowBook] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [showExplosion, setShowExplosion] = useState(false);
  const bookControls = useAnimation();

  const chapters = [
    "Introdução: por que a Inteligência Artificial está em todo lugar",
    "Tipos de I.A. e onde eles aparecem no dia a dia",
    "Como conversar com a I.A.: prompts e boas práticas",
    "Aplicações práticas: trabalho, estudos e negócios"
  ];

  useEffect(() => {
    const sequence = async () => {
      // 1. Explosion + Book dramatic entrance
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowExplosion(true);
      setShowBook(true);
      
      // 2. Pages opening animation
      await new Promise(resolve => setTimeout(resolve, 800));
      setPagesOpen(true);
      
      await bookControls.start({
        rotateY: [0, -25, -15, 0],
        scale: [1, 1.05, 1],
        transition: { duration: 1.4, ease: "easeInOut" }
      });
      
      // 3. Start chapters reveal
      await new Promise(resolve => setTimeout(resolve, 300));
      setShowChapters(true);
    };
    
    sequence();
  }, [bookControls]);

  useEffect(() => {
    if (showChapters && typingIndex < chapters.length) {
      const timer = setTimeout(() => {
        setTypingIndex(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showChapters, typingIndex, chapters.length]);

  return (
    <motion.div
      className="relative w-full rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-muted/30 p-8 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Animated gradient background pulse */}
      <motion.div 
        className="pointer-events-none absolute inset-0 opacity-40"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, hsl(var(--primary)/0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 70%, hsl(var(--primary)/0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 30%, hsl(var(--primary)/0.3) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Explosion particles */}
      <AnimatePresence>
        {showExplosion && [...Array(20)].map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const distance = 100 + Math.random() * 150;
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: "25%",
                top: "50%",
                background: i % 2 === 0 
                  ? "hsl(var(--primary))" 
                  : "hsl(var(--accent))"
              }}
              initial={{ 
                x: 0, 
                y: 0,
                scale: 0,
                opacity: 1 
              }}
              animate={{ 
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.2,
                ease: "easeOut"
              }}
            />
          );
        })}
      </AnimatePresence>

      {/* Floating sparkles continuous */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: i % 3 === 0 
              ? "hsl(var(--primary))" 
              : i % 3 === 1 
              ? "hsl(var(--accent))"
              : "hsl(var(--primary)/0.5)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ 
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            delay: Math.random() * 3,
            repeat: Infinity,
            repeatDelay: Math.random() * 2
          }}
        />
      ))}

      {/* Main content grid */}
      <div className="relative z-10 grid md:grid-cols-[320px_1fr] gap-10 items-center">
        
        {/* LEFT: Book with dramatic entrance and page opening */}
        <div className="flex items-center justify-center" style={{ perspective: "1200px" }}>
          <AnimatePresence>
            {showBook && (
              <motion.div
                className="relative"
                initial={{ 
                  scale: 0, 
                  rotateY: -90,
                  opacity: 0,
                  z: -100
                }}
                animate={{ 
                  scale: 1, 
                  rotateY: 0,
                  opacity: 1,
                  z: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.34, 1.56, 0.64, 1],
                  type: "spring",
                  stiffness: 100
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Book glow aura */}
                <motion.div
                  className="absolute inset-0 rounded-2xl blur-2xl"
                  style={{ background: "hsl(var(--primary)/0.4)" }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Main book cover */}
                <motion.div 
                  className="relative w-64 h-[340px] rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 shadow-2xl border-2 border-primary/30 flex flex-col items-center justify-center px-6 py-8 text-center overflow-hidden"
                  animate={bookControls}
                  style={{ 
                    transformStyle: "preserve-3d",
                    boxShadow: "0 25px 50px -12px hsl(var(--primary)/0.5)"
                  }}
                >
                  {/* Animated pages opening effect - Multiple layers */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`page-${i}`}
                      className="absolute inset-2 bg-primary-foreground/10 rounded-xl border-r border-primary-foreground/20"
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={pagesOpen ? { 
                        scaleX: 1 - (i * 0.05),
                        rotateY: [0, -15, -5],
                        x: i * 3
                      } : { scaleX: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.4 + (i * 0.1), 
                        ease: "easeOut" 
                      }}
                      style={{ 
                        transformStyle: "preserve-3d",
                        transformOrigin: "left center",
                        zIndex: 5 - i
                      }}
                    />
                  ))}
                  
                  {/* Energy waves */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{ borderColor: "hsl(var(--primary)/0.3)" }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                  />

                  {/* Book cover content */}
                  <div className="relative z-20 space-y-5">
                    <motion.div 
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/15 border border-primary-foreground/30 backdrop-blur-sm"
                      initial={{ scale: 0, rotateZ: -180 }}
                      animate={{ scale: 1, rotateZ: 0 }}
                      transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                    >
                      <BookOpen className="w-4 h-4 text-primary-foreground" />
                      <span className="text-xs uppercase tracking-wider font-bold text-primary-foreground">
                        I.A. Book
                      </span>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-xl font-black text-primary-foreground leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      Seu Primeiro Livro
                      <br />
                      com Inteligência
                      <br />
                      Artificial
                    </motion.h3>
                    
                    <motion.div 
                      className="text-sm text-primary-foreground/90 leading-relaxed font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      Índice, capítulos e revisão
                      <br />
                      estruturados em minutos
                    </motion.div>

                    {/* Zap icon animation */}
                    <motion.div
                      className="absolute -right-2 -top-2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: [0, 1.2, 1],
                        rotate: [180, 0, 0]
                      }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                    >
                      <Zap className="w-6 h-6 text-accent fill-accent" />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: AI Interface panel */}
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Main headline with stagger animation */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 border-2 border-accent/40 backdrop-blur-sm"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 hsl(var(--accent) / 0)",
                  "0 0 0 6px hsl(var(--accent) / 0.15)",
                  "0 0 0 0 hsl(var(--accent) / 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className="w-2.5 h-2.5 rounded-full bg-accent"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-bold text-accent-foreground uppercase tracking-wide">
                I.A. Trabalhando
              </span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-black text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Livro estruturado em minutos
              <br />
              <span className="text-primary">com Inteligência Artificial</span>
            </motion.h2>
          </motion.div>

          {/* AI Response panel with enhanced UI */}
          <motion.div 
            className="bg-muted/40 border-2 border-primary/20 rounded-2xl p-6 space-y-5 backdrop-blur-sm relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "linear-gradient(45deg, hsl(var(--primary)/0.1), hsl(var(--accent)/0.1))"
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Resposta da I.A.
                </span>
              </div>
              <motion.span 
                className="text-xs text-primary font-semibold px-3 py-1 bg-primary/10 rounded-full border border-primary/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
              >
                Índice gerado
              </motion.span>
            </div>

            {/* Chapter list with enhanced typing effect */}
            <div className="relative z-10 space-y-4">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 group relative"
                  initial={{ opacity: 0, x: -30, height: 0 }}
                  animate={
                    typingIndex > index
                      ? { opacity: 1, x: 0, height: "auto" }
                      : { opacity: 0, x: -30, height: 0 }
                  }
                  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  {/* Chapter number badge with glow */}
                  <motion.div 
                    className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 border-2 border-primary/30 flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={
                      typingIndex > index
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -180 }
                    }
                    transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-primary/30 blur-md"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="relative z-10 text-base font-black text-primary-foreground">{index + 1}</span>
                  </motion.div>

                  {/* Chapter text with typing reveal */}
                  <div className="flex-1 pt-1 overflow-hidden">
                    <motion.p 
                      className="text-base font-semibold text-foreground leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={typingIndex > index ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {chapter}
                    </motion.p>
                  </div>

                  {/* Shine effect on appear */}
                  {typingIndex > index && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Bottom note with enhanced styling */}
            {typingIndex >= chapters.length && (
              <motion.div
                className="relative z-10 pt-4 border-t-2 border-primary/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4 text-accent" />
                  </motion.div>
                  <p className="text-sm text-foreground/80 font-medium italic">
                    De "tenho uma ideia" para "tenho um índice estruturado" em minutos.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
